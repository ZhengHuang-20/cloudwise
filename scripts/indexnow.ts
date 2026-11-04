/**
 * 生产构建完成后，把全部可索引页面推送给搜索引擎（package.json 的 build 最后一步）：
 * - IndexNow（api.indexnow.org，转发给 Bing、Yandex、Seznam 等；Bing 的索引也供 ChatGPT 搜索与 Copilot 使用）
 * - 百度普通收录 API（配置了 BAIDU_PUSH_TOKEN 时）
 * 只在 VERCEL_ENV=production 时执行；SKIP_INDEXNOW=1 跳过。推送失败只打日志，不影响部署。
 */
import nextEnv from '@next/env';
import { INDEXNOW_KEY, SITE_URL, absoluteUrl } from '../src/lib/site';
import { allRoutes, hasEnglish, isIndexable, localizePath, routePath } from '../src/site/routes';

nextEnv.loadEnvConfig(process.cwd());

const urls = allRoutes()
  .filter(isIndexable)
  .flatMap((route) => {
    const path = routePath(route);
    return (hasEnglish(route) ? (['zh', 'en'] as const) : (['zh'] as const)).map((lang) => absoluteUrl(localizePath(path, lang)));
  });

async function indexNow() {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: urls }),
    signal: AbortSignal.timeout(15_000),
  });
  console.log(`IndexNow：推送 ${urls.length} 个地址，状态 ${res.status}`);
}

async function baidu(token: string) {
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
  const jobs = [indexNow()];
  if (process.env.BAIDU_PUSH_TOKEN) jobs.push(baidu(process.env.BAIDU_PUSH_TOKEN));
  for (const result of await Promise.allSettled(jobs)) {
    if (result.status === 'rejected') console.warn('主动推送失败（不影响部署）：', result.reason instanceof Error ? result.reason.message : result.reason);
  }
}

main().catch((err) => console.warn('主动推送失败（不影响部署）：', err instanceof Error ? err.message : err));
