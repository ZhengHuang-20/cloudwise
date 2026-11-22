/**
 * 生产构建完成后，把有变化的页面推送给搜索引擎（package.json 的 build 最后一步）：
 * - IndexNow（api.indexnow.org，转发给 Bing、Yandex、Seznam 等；Bing 的索引也供 ChatGPT 搜索与 Copilot 使用）
 * - 百度普通收录 API（配置了 BAIDU_PUSH_TOKEN 时）
 *
 * 只推送新增、更新与删除的地址（IndexNow 官方说明：只提交有变化的 URL，不要反复提交未变化的页面）：
 * 构建时线上仍是上一次生产部署，读取线上的 sitemap.xml，和本次构建的 lastmod 比较，
 * 新出现的、lastmod 变了的、以及线上有而本次没有的（已删除或已跳转）地址才推送。
 * 读不到线上 sitemap 时，退而推送 lastmod 在最近 7 天内的地址。
 *
 * 只在 VERCEL_ENV=production 时执行；SKIP_INDEXNOW=1 跳过；INDEXNOW_ALL=1 推送全部地址（改版、迁移域名后用一次）。
 * 推送失败只打日志，不影响部署。
 */
import nextEnv from '@next/env';
import { INDEXNOW_KEY, SITE_URL, absoluteUrl } from '../src/lib/site';
import { allRoutes, hasEnglish, isIndexable, localizePath, routeModified, routePath } from '../src/site/routes';

nextEnv.loadEnvConfig(process.cwd());

const FALLBACK_DAYS = 7;

/** 本次构建的全部可索引地址 → lastmod（YYYY-MM-DD） */
const current = new Map(
  allRoutes()
    .filter(isIndexable)
    .flatMap((route) => {
      const path = routePath(route);
      const modified = routeModified(route);
      return (hasEnglish(route) ? (['zh', 'en'] as const) : (['zh'] as const)).map(
        (lang) => [absoluteUrl(localizePath(path, lang)), modified] as const
      );
    })
);

/** 线上 sitemap 的地址 → lastmod；读不到时返回 null */
async function liveSitemap(): Promise<Map<string, string> | null> {
  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`, { signal: AbortSignal.timeout(10_000), cache: 'no-store' });
    if (!res.ok) return null;
    const xml = await res.text();
    const live = new Map<string, string>();
    for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = /<loc>([^<]+)<\/loc>/.exec(block)?.[1]?.trim();
      const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(block)?.[1]?.trim().slice(0, 10) ?? '';
      if (loc) live.set(loc, lastmod);
    }
    return live.size ? live : null;
  } catch {
    return null;
  }
}

async function changedUrls(): Promise<string[]> {
  if (process.env.INDEXNOW_ALL === '1') {
    console.log('INDEXNOW_ALL=1，推送全部地址');
    return [...current.keys()];
  }
  const live = await liveSitemap();
  if (!live) {
    const since = new Date(Date.now() - FALLBACK_DAYS * 86_400_000).toISOString().slice(0, 10);
    console.log(`读不到线上 sitemap，改为推送最近 ${FALLBACK_DAYS} 天（${since} 起）更新的地址`);
    return [...current].filter(([, modified]) => modified >= since).map(([url]) => url);
  }
  const updated = [...current].filter(([url, modified]) => live.get(url) !== modified).map(([url]) => url);
  const removed = [...live.keys()].filter((url) => !current.has(url));
  console.log(`与线上 sitemap 比较：新增或更新 ${updated.length} 个，删除或跳转 ${removed.length} 个`);
  return [...updated, ...removed];
}

async function indexNow(urls: string[]) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: urls }),
    signal: AbortSignal.timeout(15_000),
  });
  console.log(`IndexNow：推送 ${urls.length} 个地址，状态 ${res.status}`);
}

async function baidu(token: string, urls: string[]) {
  const res = await fetch(`http://data.zz.baidu.com/urls?site=${encodeURIComponent(SITE_URL)}&token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: urls.join('\n'),
    signal: AbortSignal.timeout(15_000),
  });
  // 返回 { success, remain } 或 { error, message }，不含敏感信息
  console.log(`百度普通收录：状态 ${res.status}，${(await res.text()).slice(0, 200)}`);
}

async function main() {
  if (process.env.SKIP_INDEXNOW === '1') return console.log('SKIP_INDEXNOW=1，跳过主动推送');
  if (process.env.VERCEL_ENV !== 'production') return console.log('非生产构建，跳过主动推送');
  const urls = await changedUrls();
  if (!urls.length) return console.log('没有新增、更新或删除的页面，不推送');
  for (const url of urls) console.log(`  ${url}`);
  const jobs = [indexNow(urls)];
  // 百度普通收录有每日配额，删除的地址推了也没用，只推本次构建里存在的
  const baiduUrls = urls.filter((url) => current.has(url));
  if (process.env.BAIDU_PUSH_TOKEN && baiduUrls.length) jobs.push(baidu(process.env.BAIDU_PUSH_TOKEN, baiduUrls));
  for (const result of await Promise.allSettled(jobs)) {
    if (result.status === 'rejected') console.warn('主动推送失败（不影响部署）：', result.reason instanceof Error ? result.reason.message : result.reason);
  }
}

main().catch((err) => console.warn('主动推送失败（不影响部署）：', err instanceof Error ? err.message : err));
