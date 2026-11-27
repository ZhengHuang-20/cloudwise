/**
 * SEO / GEO 基线检查。静态模式不联网、不需要构建，直接读 src/site 下的路由、metadata、JSON-LD、sitemap、
 * llms.txt 等生成逻辑，把「改版 / 加页面」时最容易悄悄坏掉的规范逐条验一遍；--live 模式再抓线上实际输出。
 *
 *   npx tsx scripts/seo-audit.ts                 # 静态检查
 *   npx tsx scripts/seo-audit.ts --live          # 额外检查线上 https://chingeo.com（或 NEXT_PUBLIC_SITE_URL）
 *   npx tsx scripts/seo-audit.ts --live=http://localhost:3000
 *   npx tsx scripts/seo-audit.ts --json          # 机器可读输出，供 CI 使用
 *
 * 退出码：存在 error 时为 1（warn 不影响退出码）。加 --strict 时 warn 也算失败。
 *
 * 检查覆盖：
 * - 路由表自洽：routePath ↔ resolveRoute 往返、URL 唯一
 * - 标题 / 描述：缺失、放不下被截断、重复
 * - JSON-LD：@type 齐全、@id 引用不悬空、URL 都是绝对地址、dateModified 与 sitemap 一致
 * - Markdown 镜像：存在、非空、链接已绝对化
 * - sitemap.xml：覆盖全部可索引页、无 noindex 泄漏、hreflang 互指、lastmod 合法
 * - robots.txt：AI 爬虫显式放行、通配规则、sitemap 声明、预览环境整站屏蔽
 * - llms.txt / llms-full.txt：覆盖全部可索引页、无 noindex 泄漏
 * - IndexNow：public/ 下的密钥文件与 src/lib/site.ts 一致
 * - --live：robots.txt / sitemap.xml / llms.txt / 抽样页面的标题、canonical、hreflang、robots meta、JSON-LD、.md 镜像
 *
 * 与项目里其它模块的分工：本脚本只读不写，规范本身写在 src/site/{meta,schema,routes,llms}.ts 与 app/{sitemap,robots}.ts，
 * 修复规范请改那几个文件，不要在这里加特例。
 */
import { createSign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import sitemapRoute from '../app/sitemap';
import robotsRoute from '../app/robots';
import type { Lang } from '../src/lib/i18n';
import { BRAND, INDEXNOW_KEY, SITE_URL, absoluteUrl } from '../src/lib/site';
import { llmsFullTxt, llmsTxt } from '../src/site/llms';
import { hasMarkdown, markdownPath, pageMarkdown } from '../src/site/markdown';
import { routeMeta } from '../src/site/meta';
import { pageSchema } from '../src/site/schema';
import {
  allRoutes,
  hasEnglish,
  isIndexable,
  localizePath,
  resolveRoute,
  routeModified,
  routePath,
  type Route,
} from '../src/site/routes';

// ---------------------------------------------------------------------------
// 报告
// ---------------------------------------------------------------------------

type Level = 'error' | 'warn';

interface Issue {
  level: Level;
  rule: string;
  detail: string;
}

const issues: Issue[] = [];
const error = (rule: string, detail: string) => issues.push({ level: 'error', rule, detail });
const warn = (rule: string, detail: string) => issues.push({ level: 'warn', rule, detail });

// ---------------------------------------------------------------------------
// 参数
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const jsonOutput = argv.includes('--json');
const strict = argv.includes('--strict');
const liveArg = argv.find((arg) => arg === '--live' || arg.startsWith('--live='));
const liveBase = liveArg ? (liveArg.includes('=') ? liveArg.slice('--live='.length) : SITE_URL).replace(/\/+$/, '') : null;
const gscEnabled = argv.includes('--gsc');

/** 进度行：--json 时静默，避免污染 JSON 输出 */
const note = (message: string) => {
  if (!jsonOutput) console.log(message);
};

// ---------------------------------------------------------------------------
// 基础工具
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>;

const isObj = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);
const asArray = <T,>(value: T[] | undefined | null): T[] => (Array.isArray(value) ? value : []);
const graphOf = (schema: unknown): Json[] => {
  if (!isObj(schema)) return [];
  const graph = schema['@graph'];
  return Array.isArray(graph) ? graph.filter(isObj) : [];
};
const typeOf = (node: Json): string => String(node['@type'] ?? '');
const today = new Date().toISOString().slice(0, 10);
const isAbsoluteOnSite = (url: string) =>
  url === SITE_URL || url.startsWith(`${SITE_URL}/`) || url.startsWith(`${SITE_URL}#`);

/** 收集 {@id} 这种纯引用节点，用来验证引用目标真的存在于同一个 @graph 里 */
const collectRefs = (value: unknown, out: string[] = []): string[] => {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, out);
    return out;
  }
  if (!isObj(value)) return out;
  const keys = Object.keys(value);
  if (keys.length === 1 && typeof value['@id'] === 'string') {
    out.push(value['@id']);
    return out;
  }
  for (const item of Object.values(value)) collectRefs(item, out);
  return out;
};

/** 收集所有以 URL 语义出现的字符串（sameAs、embedUrl（B 站播放器）这类外链不在其中） */
const URL_KEYS = new Set(['@id', 'url', 'item', 'thumbnailUrl', 'contentUrl', 'mainEntityOfPage', 'image']);
const collectUrls = (value: unknown, out: string[] = [], key = ''): string[] => {
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, out, key);
    return out;
  }
  if (isObj(value)) {
    for (const [k, v] of Object.entries(value)) collectUrls(v, out, k);
    return out;
  }
  if (typeof value === 'string' && URL_KEYS.has(key) && /^https?:\/\//.test(value)) out.push(value);
  return out;
};

// ---------------------------------------------------------------------------
// 标题宽度：与 src/site/page.tsx 的 fitTitle 保持一致（那边在 React 组件里，无法直接 import）
// ---------------------------------------------------------------------------

const TITLE_LIMIT: Record<Lang, number> = { zh: 30, en: 60 };
const titleWidth = (text: string, lang: Lang) =>
  lang === 'en' ? text.length : [...text].reduce((n, ch) => n + (/[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.5), 0);

/** 与 src/site/page.tsx 的 shortenEnglish 一致：英文放不下时按词截断，不出现半截词 */
const TRAILING_WORDS = /\s+(a|an|the|and|or|of|to|for|from|with|on|in|at|by|how|what|when|is|are|vs)$/i;
function shortenEnglish(text: string, limit: number) {
  if (text.length <= limit) return text;
  let cut = text.slice(0, limit + 1).replace(/\s+\S*$/, '').replace(/[,;:\s]+$/, '');
  while (TRAILING_WORDS.test(cut)) cut = cut.replace(TRAILING_WORDS, '');
  return cut;
}

/** 返回最终会写进 <title> 的文本，以及它是不是「放得下」的候选（false 表示被截断兜底） */
function resolveTitle(meta: { title: string; shortTitles?: string[]; absoluteTitle?: boolean }, lang: Lang) {
  const candidates = [meta.title, ...asArray(meta.shortTitles)];
  const suffix = ` - ${lang === 'en' ? BRAND.en : BRAND.zh}`;

  if (meta.absoluteTitle) {
    const chosen = candidates.find((text) => titleWidth(text, lang) <= TITLE_LIMIT[lang]);
    return { text: chosen ?? candidates[candidates.length - 1], fitted: chosen !== undefined };
  }
  for (const text of candidates) {
    if (titleWidth(`${text}${suffix}`, lang) <= TITLE_LIMIT[lang]) return { text: `${text}${suffix}`, fitted: true };
    if (titleWidth(text, lang) <= TITLE_LIMIT[lang]) return { text, fitted: true };
  }
  const shortest = candidates.reduce((a, b) => (titleWidth(b, lang) < titleWidth(a, lang) ? b : a));
  return { text: lang === 'en' ? shortenEnglish(shortest, TITLE_LIMIT.en) : shortest, fitted: false };
}

// ---------------------------------------------------------------------------
// 期望的结构化数据类型（按页面 kind）
// ---------------------------------------------------------------------------

const EXPECTED_TYPES: Partial<Record<Route['kind'], string[]>> = {
  home: ['WebPage', 'ItemList', 'FAQPage'],
  services: ['CollectionPage', 'ItemList', 'BreadcrumbList'],
  service: ['WebPage', 'Service', 'FAQPage', 'BreadcrumbList'],
  cases: ['CollectionPage', 'ItemList', 'BreadcrumbList'],
  case: ['WebPage', 'Article', 'BreadcrumbList'],
  solution: ['WebPage', 'Article', 'BreadcrumbList'],
  academy: ['CollectionPage', 'ItemList', 'BreadcrumbList'],
  course: ['WebPage', 'Course', 'BreadcrumbList'],
  lesson: ['WebPage', 'LearningResource', 'BreadcrumbList'],
  insights: ['CollectionPage', 'ItemList', 'BreadcrumbList'],
  insight: ['WebPage', 'Article', 'Person', 'FAQPage', 'BreadcrumbList'],
  glossary: ['CollectionPage', 'DefinedTermSet', 'BreadcrumbList'],
  term: ['WebPage', 'DefinedTerm', 'FAQPage', 'BreadcrumbList'],
  about: ['AboutPage', 'Person', 'BreadcrumbList'],
  audit: ['WebPage', 'WebApplication', 'BreadcrumbList'],
  configurator: ['WebPage', 'BreadcrumbList'],
};

/** 页面类型节点（WebPage / CollectionPage / AboutPage）必须带上的 @id 后缀 */
const PAGE_NODE_TYPES = ['WebPage', 'CollectionPage', 'AboutPage'];

/**
 * llms.txt 是「网站导读」而不是站点地图：首页与各列表页只在需要时出现，正文页要逐条列出。
 * 中文段覆盖以下正文页类型（课时列在 Optional 段，同样算覆盖）；English 段不含课时与方案规划。
 */
const LLMS_ZH_KINDS: Route['kind'][] = [
  'service',
  'case',
  'solution',
  'course',
  'lesson',
  'insight',
  'term',
  'audit',
  'about',
  'configurator',
];
const LLMS_EN_KINDS: Route['kind'][] = ['home', 'service', 'insight', 'case', 'solution', 'course', 'term', 'audit', 'about'];

/** 真正的站内相对链接：排除正文里举例的「- [页面名称](网址)」这类写法 */
const relativeLinks = (text: string) =>
  [...text.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((match) => match[1])
    .filter((target) => !/^[a-z][a-z0-9+.-]*:/i.test(target) && !target.startsWith('#'))
    .filter(
      (target) =>
        target.startsWith('/') || target.startsWith('./') || target.startsWith('../') || /\.(md|html|xml)$/i.test(target)
    );

// ---------------------------------------------------------------------------
// 页面清单
// ---------------------------------------------------------------------------

const LANGS: Lang[] = ['zh', 'en'];

interface Page {
  route: Route;
  kind: Route['kind'];
  path: string;
  lang: Lang;
  url: string;
}

const pages: Page[] = allRoutes().flatMap((route) => {
  const path = routePath(route);
  const langs = hasEnglish(route) ? LANGS : (['zh'] as Lang[]);
  return langs.map((lang) => ({ route, kind: route.kind, path, lang, url: absoluteUrl(localizePath(path, lang)) }));
});
const indexable = pages.filter((page) => isIndexable(page.route));

// ---------------------------------------------------------------------------
// 1. 路由表自洽
// ---------------------------------------------------------------------------

function checkRoutes() {
  const seenZh = new Map<string, Route>();
  for (const route of allRoutes()) {
    const path = routePath(route);
    const resolved = resolveRoute(path.split('/').filter(Boolean));
    if (!resolved || JSON.stringify(resolved) !== JSON.stringify(route)) {
      error('route/roundtrip', `${path} 反解析得到 ${JSON.stringify(resolved)}，与原始 ${JSON.stringify(route)} 不一致`);
    }
    if (!path.startsWith('/') || (path !== '/' && path.endsWith('/'))) {
      error('route/shape', `${path} 不是规范路径（应以 / 开头且不以 / 结尾）`);
    }
    const previous = seenZh.get(path);
    if (previous) error('route/duplicate', `${path} 同时对应 ${JSON.stringify(previous)} 与 ${JSON.stringify(route)}`);
    seenZh.set(path, route);
  }
}

// ---------------------------------------------------------------------------
// 2. 标题与描述
// ---------------------------------------------------------------------------

function checkMeta() {
  const byTitle = new Map<string, string[]>();
  const byDescription = new Map<string, string[]>();
  const overflow = new Set<string>();

  for (const page of indexable) {
    const meta = routeMeta(page.route, page.lang);
    const label = `${page.path}${page.lang === 'en' ? ' (en)' : ''}`;

    if (!meta.title?.trim()) error('meta/title-missing', `${label} 没有标题`);
    if (!meta.description?.trim()) error('meta/description-missing', `${label} 没有描述`);

    if (meta.title) {
      const { text, fitted } = resolveTitle(meta, page.lang);
      if (!fitted) {
        overflow.add(label);
        warn('meta/title-overflow', `${label} 的所有标题候选都超出 ${TITLE_LIMIT[page.lang]} 宽度，最终会被截断：「${text}」`);
      }
      byTitle.set(`${page.lang}|${text}`, [...(byTitle.get(`${page.lang}|${text}`) ?? []), label]);
    }

    if (meta.description) {
      const length = meta.description.length;
      const [min, max] = page.lang === 'en' ? [60, 180] : [40, 160];
      if (length < min || length > max) {
        warn('meta/description-length', `${label} 描述 ${length} 字（建议 ${min}–${max}）`);
      }
      byDescription.set(`${page.lang}|${meta.description}`, [
        ...(byDescription.get(`${page.lang}|${meta.description}`) ?? []),
        label,
      ]);
    }
  }

  for (const [key, labels] of byTitle) {
    if (labels.length > 1) warn('meta/title-duplicate', `${labels.join(' / ')} 共用标题「${key.split('|')[1]}」`);
  }
  for (const [key, labels] of byDescription) {
    if (labels.length > 1) warn('meta/description-duplicate', `${labels.join(' / ')} 共用描述「${key.split('|')[1].slice(0, 40)}…」`);
  }

  // 进度输出：被截断的标题最影响点击率，单独汇总一行
  if (overflow.size) note(`· 标题会被截断的页面：${overflow.size} 个（详见 warn）`);
}

// ---------------------------------------------------------------------------
// 3. JSON-LD
// ---------------------------------------------------------------------------

function checkSchema() {
  for (const page of indexable) {
    const label = `${page.path}${page.lang === 'en' ? ' (en)' : ''}`;
    const schema = pageSchema(page.route, page.lang);

    if (!isObj(schema) || schema['@context'] !== 'https://schema.org') {
      error('schema/context', `${label} 的 @context 不是 https://schema.org`);
      continue;
    }
    const graph = graphOf(schema);
    if (graph.length === 0) {
      error('schema/empty', `${label} 的 @graph 为空`);
      continue;
    }

    const types = graph.map(typeOf);
    for (const required of ['Organization', 'WebSite']) {
      if (!types.includes(required)) error('schema/base-type', `${label} 缺少 ${required}`);
    }
    for (const required of EXPECTED_TYPES[page.kind] ?? []) {
      if (!types.includes(required)) error('schema/expected-type', `${label}（${page.kind}）缺少 ${required}，实际：${types.join(',')}`);
    }

    const ids = graph.map((node) => node['@id']).filter((id): id is string => typeof id === 'string');
    const idSet = new Set(ids);
    if (idSet.size !== ids.length) {
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      error('schema/duplicate-id', `${label} 的 @id 重复：${[...new Set(dupes)].join(', ')}`);
    }

    const refs = [...new Set(collectRefs(schema))];
    for (const ref of refs) {
      if (!idSet.has(ref)) error('schema/dangling-ref', `${label} 引用了不存在的 @id：${ref}`);
    }

    for (const url of new Set(collectUrls(schema))) {
      if (!isAbsoluteOnSite(url)) error('schema/url-not-absolute', `${label} 的 URL 不是本站绝对地址：${url}`);
    }

    // 页面类型节点：@id、url、dateModified 都要和路由表对得上
    const pageNode = graph.find((node) => PAGE_NODE_TYPES.includes(typeOf(node)));
    if (!pageNode) {
      error('schema/page-node', `${label} 找不到 WebPage / CollectionPage / AboutPage 节点`);
    } else {
      if (pageNode['@id'] !== `${page.url}#webpage`) error('schema/page-id', `${label} 页面节点 @id 应为 ${page.url}#webpage，实际 ${String(pageNode['@id'])}`);
      if (pageNode['url'] !== page.url) error('schema/page-url', `${label} 页面节点 url 应为 ${page.url}，实际 ${String(pageNode['url'])}`);
      const expected = routeModified(page.route);
      if (pageNode['dateModified'] !== expected) {
        error('schema/date-modified', `${label} dateModified=${String(pageNode['dateModified'])}，路由表给出 ${expected}`);
      }
    }

    // 面包屑：位置必须从 1 连续
    const breadcrumb = graph.find((node) => typeOf(node) === 'BreadcrumbList');
    if (breadcrumb) {
      const items = asArray(breadcrumb['itemListElement'] as Json[] | undefined).filter(isObj);
      items.forEach((item, i) => {
        if (item['position'] !== i + 1) error('schema/breadcrumb-position', `${label} 面包屑第 ${i + 1} 项 position=${String(item['position'])}`);
      });
      if (items.length < 2) warn('schema/breadcrumb-short', `${label} 面包屑只有 ${items.length} 项`);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Markdown 镜像
// ---------------------------------------------------------------------------

function checkMarkdown() {
  let mirrors = 0;
  for (const page of indexable) {
    if (!hasMarkdown(page.route)) continue;
    mirrors += 1;
    const label = `${page.path}${page.lang === 'en' ? ' (en)' : ''}`;
    const body = pageMarkdown(page.route, page.lang);
    const path = markdownPath(page.route, page.lang);

    if (!path.endsWith('.md')) error('md/path', `${label} 的 Markdown 地址不是 .md：${path}`);
    if (!body) {
      error('md/missing', `${label} 声明了 Markdown 镜像但 pageMarkdown 返回 null`);
      continue;
    }
    if (body.length < 400) warn('md/too-short', `${label} 的 Markdown 只有 ${body.length} 字符`);
    if (!body.startsWith('# ')) error('md/heading', `${label} 的 Markdown 第一行不是一级标题`);
    const relative = relativeLinks(body);
    if (relative.length) warn('md/relative-link', `${label} 的 Markdown 有相对链接：${relative.slice(0, 3).join('、')}`);
  }
  note(`· Markdown 镜像：${mirrors} 个可索引页面有 .md 版本`);
}

// ---------------------------------------------------------------------------
// 5. sitemap.xml
// ---------------------------------------------------------------------------

function checkSitemap() {
  const entries = asArray(
    sitemapRoute() as unknown as {
      url: string;
      lastModified?: unknown;
      alternates?: { languages?: Record<string, string> };
      videos?: unknown;
    }[]
  );
  const expected = new Map(indexable.map((page) => [page.url, page]));
  const seen = new Set<string>();

  for (const entry of entries) {
    if (typeof entry.url !== 'string') {
      error('sitemap/url', '存在没有 url 的条目');
      continue;
    }
    if (seen.has(entry.url)) error('sitemap/duplicate', `${entry.url} 重复出现`);
    seen.add(entry.url);

    const page = expected.get(entry.url);
    if (!page) {
      error('sitemap/extra-url', `${entry.url} 不在可索引路由表里（noindex 泄漏或路由表不一致）`);
      continue;
    }
    if (!isAbsoluteOnSite(entry.url)) error('sitemap/url-absolute', `${entry.url} 不是本站绝对地址`);

    const lastmod = typeof entry.lastModified === 'string' ? entry.lastModified : String(entry.lastModified ?? '');
    if (!/^\d{4}-\d{2}-\d{2}/.test(lastmod)) error('sitemap/lastmod-format', `${entry.url} 的 lastModified 不是 YYYY-MM-DD：${lastmod}`);
    else if (lastmod.slice(0, 10) > today) error('sitemap/lastmod-future', `${entry.url} 的 lastModified 在未来：${lastmod}`);

    const languages = entry.alternates?.languages;
    if (hasEnglish(page.route)) {
      const path = page.path;
      const want: Record<string, string> = {
        'zh-CN': absoluteUrl(localizePath(path, 'zh')),
        en: absoluteUrl(localizePath(path, 'en')),
        'x-default': absoluteUrl(localizePath(path, 'zh')),
      };
      if (!languages) error('sitemap/alternates-missing', `${entry.url} 缺少 hreflang 互指`);
      else {
        for (const [code, url] of Object.entries(want)) {
          if (languages[code] !== url) error('sitemap/alternates-wrong', `${entry.url} 的 hreflang ${code}=${String(languages[code])}，应为 ${url}`);
        }
      }
    } else if (languages) {
      warn('sitemap/alternates-extra', `${entry.url} 不该有 hreflang，因为该页面没有英文版`);
    }

    if (entry.videos) {
      if (page.lang !== 'zh') error('sitemap/video-lang', `${entry.url} 是英文页却带视频信息（视频只有中文）`);
      if (page.kind !== 'lesson') error('sitemap/video-kind', `${entry.url} 不是课时页却带视频信息`);
    }
  }

  for (const url of expected.keys()) {
    if (!seen.has(url)) error('sitemap/missing-url', `${url} 可索引但不在 sitemap 里`);
  }

  note(`· sitemap：${entries.length} 条 URL（期望 ${expected.size}）`);
}

// ---------------------------------------------------------------------------
// 6. robots.txt
// ---------------------------------------------------------------------------

const REQUIRED_BOTS = ['Googlebot', 'Bingbot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'OAI-SearchBot', 'Google-Extended'];

interface RobotsRule {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
}

function flattenRules(result: { rules?: unknown }) {
  const rules = Array.isArray(result.rules) ? (result.rules as RobotsRule[]) : [];
  const agents = new Map<string, RobotsRule[]>();
  for (const rule of rules) {
    const list = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
    for (const agent of list) {
      if (!agent) continue;
      agents.set(agent, [...(agents.get(agent) ?? []), rule]);
    }
  }
  return agents;
}

function checkRobots() {
  const agents = flattenRules(robotsRoute());

  for (const bot of REQUIRED_BOTS) {
    if (!agents.has(bot)) error('robots/missing-bot', `没有显式声明 ${bot}`);
    else {
      const rules = agents.get(bot)!;
      if (!rules.some((rule) => rule.allow === '/')) warn('robots/bot-not-allowed', `${bot} 没有 allow: /`);
    }
  }
  if (!agents.has('*')) error('robots/missing-wildcard', '缺少 * 通配规则');

  const wildcard = agents.get('*') ?? [];
  const disallow = wildcard.flatMap((rule) => (Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow ?? '']));
  if (disallow.some((value) => value === '/')) error('robots/wildcard-blocked', '* 规则屏蔽了整站');
  for (const path of ['/api/', '/md-pages/']) {
    if (!disallow.includes(path)) warn('robots/internal-path', `* 规则没有屏蔽 ${path}（内部路径不该被索引）`);
  }

  const result = robotsRoute();
  if (result.sitemap !== absoluteUrl('/sitemap.xml')) {
    error('robots/sitemap', `sitemap 声明应为 ${absoluteUrl('/sitemap.xml')}，实际 ${String(result.sitemap)}`);
  }

  // 预览部署必须整站屏蔽，否则 *.vercel.app 会被当成重复站点
  const previous = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'preview';
  try {
    const preview = flattenRules(robotsRoute());
    const previewRules = preview.get('*') ?? [];
    const blocked = previewRules.some((rule) => {
      const value = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow ?? ''];
      return value.includes('/');
    });
    if (!blocked) error('robots/preview', 'VERCEL_ENV=preview 时没有整站屏蔽');
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
}

// ---------------------------------------------------------------------------
// 7. llms.txt
// ---------------------------------------------------------------------------

const linkPattern = /\]\((https?:\/\/[^)\s]+)\)/g;

function checkLlms() {
  const text = llmsTxt();
  const links = new Set([...text.matchAll(linkPattern)].map((match) => match[1]));

  for (const page of indexable) {
    const kinds = page.lang === 'zh' ? LLMS_ZH_KINDS : LLMS_EN_KINDS;
    if (!kinds.includes(page.kind)) continue;
    if (links.has(page.url)) continue;
    if (page.lang === 'zh') error('llms/missing-page', `${page.url} 可索引但没写进 llms.txt`);
    else warn('llms/missing-page-en', `${page.url} 属于 English 段落覆盖的类型，但没写进 llms.txt`);
  }
  for (const leak of ['/login', '/console', '/deal-room']) {
    if ([...links].some((url) => url === absoluteUrl(leak) || url.startsWith(`${absoluteUrl(leak)}/`))) {
      error('llms/noindex-leak', `llms.txt 收录了 noindex 页面 ${leak}`);
    }
  }

  for (const lang of LANGS) {
    const full = llmsFullTxt(lang);
    if (full.length < 5000) error('llms-full/too-short', `llms-full.txt（${lang}）只有 ${full.length} 字符`);
    const relative = relativeLinks(full);
    if (relative.length) warn('llms-full/relative-link', `llms-full.txt（${lang}）有相对链接：${relative.slice(0, 3).join('、')}`);
  }
  note(`· llms.txt：${links.size} 条链接；llms-full 中文 ${llmsFullTxt('zh').length} 字符 / 英文 ${llmsFullTxt('en').length} 字符`);
}

// ---------------------------------------------------------------------------
// 8. IndexNow 密钥文件
// ---------------------------------------------------------------------------

function checkIndexNow() {
  const file = join(process.cwd(), 'public', `${INDEXNOW_KEY}.txt`);
  if (!existsSync(file)) {
    error('indexnow/key-file', `缺少 public/${INDEXNOW_KEY}.txt，IndexNow 会校验失败`);
    return;
  }
  const content = readFileSync(file, 'utf8').trim();
  if (content !== INDEXNOW_KEY) error('indexnow/key-mismatch', `public/${INDEXNOW_KEY}.txt 的内容与 src/lib/site.ts 的 INDEXNOW_KEY 不一致`);
}

// ---------------------------------------------------------------------------
// 9. --live：抓取实际输出
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT = 15_000;

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string; type: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT), redirect: 'follow' });
    return { ok: res.ok, status: res.status, text: await res.text(), type: res.headers.get('content-type') ?? '' };
  } catch (cause) {
    error('live/network', `${url} 请求失败：${(cause as Error).message}`);
    return null;
  }
}

/** 抽样页面：每种页面类型取一个，覆盖中英、可索引与 noindex */
function samplePages(): Page[] {
  const picked: Page[] = [];
  const kinds = new Set<Route['kind']>();
  for (const page of pages) {
    if (kinds.has(page.kind)) continue;
    kinds.add(page.kind);
    picked.push(page);
  }
  return picked.filter((page) => page.kind !== 'console');
}

async function checkLive(base: string) {
  const [robotsTxt, sitemapXml, llmsTxtFile] = await Promise.all([
    fetchText(`${base}/robots.txt`),
    fetchText(`${base}/sitemap.xml`),
    fetchText(`${base}/llms.txt`),
  ]);

  if (robotsTxt) {
    if (!robotsTxt.ok) error('live/robots-status', `/robots.txt 返回 ${robotsTxt.status}`);
    if (!/GPTBot/.test(robotsTxt.text)) error('live/robots-ai', '/robots.txt 里没有 GPTBot，AI 爬虫放行规则可能没生效');
    if (!/Sitemap:/i.test(robotsTxt.text)) error('live/robots-sitemap', '/robots.txt 没有 Sitemap 声明');
  }

  if (sitemapXml) {
    if (!sitemapXml.ok) error('live/sitemap-status', `/sitemap.xml 返回 ${sitemapXml.status}`);
    const locs = [...sitemapXml.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
    const generated = new Set(indexable.map((page) => page.url));
    const missing = [...generated].filter((url) => !locs.includes(url));
    const extra = locs.filter((url) => !generated.has(url));
    if (missing.length) error('live/sitemap-missing', `线上 sitemap 缺 ${missing.length} 条，例如 ${missing[0]}`);
    if (extra.length) warn('live/sitemap-extra', `线上 sitemap 多 ${extra.length} 条，例如 ${extra[0]}（部署的是旧版本？）`);
    note(`· 线上 sitemap：${locs.length} 条 URL`);
  }

  if (llmsTxtFile) {
    if (!llmsTxtFile.ok) error('live/llms-status', `/llms.txt 返回 ${llmsTxtFile.status}`);
    if (!llmsTxtFile.text.includes(absoluteUrl('/audit'))) warn('live/llms-content', '/llms.txt 里没有测评页链接，可能不是最新版本');
  }

  const samples = samplePages();
  note(`· 抽样检查 ${samples.length} 个页面`);

  for (const page of samples) {
    const label = `${page.path}${page.lang === 'en' ? ' (en)' : ''}`;
    const res = await fetchText(page.url);
    if (!res) continue;
    if (!res.ok) {
      error('live/page-status', `${label} 返回 ${res.status}`);
      continue;
    }

    const title = /<title>([^<]*)<\/title>/.exec(res.text)?.[1]?.trim() ?? '';
    if (!title) error('live/title', `${label} 没有 <title>`);
    else if (title.length > 70) warn('live/title-long', `${label} 的 <title> 长 ${title.length} 字符`);

    const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/.exec(res.text)?.[1] ?? '';
    if (canonical !== page.url) error('live/canonical', `${label} 的 canonical 为 ${canonical || '(缺失)'}，应为 ${page.url}`);

    if (hasEnglish(page.route)) {
      // Next 序列化出来的是 hrefLang（HTML 属性名不区分大小写，爬虫照样能读）
      for (const code of ['zh-CN', 'en', 'x-default']) {
        const found = new RegExp(`hreflang="${code}"`, 'i').test(res.text);
        if (!found) error('live/hreflang', `${label} 缺少 hreflang=${code}`);
      }
    }

    if (!isIndexable(page.route) && !/name="robots"[^>]*noindex/.test(res.text)) {
      error('live/noindex', `${label} 是 noindex 页面，但 HTML 里没有 robots noindex`);
    }

    // noindex 页面（登录、后台、方案空间）按设计不输出 JSON-LD，只检查可索引页面
    const blocks = [...res.text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    if (isIndexable(page.route) && blocks.length === 0) error('live/jsonld-missing', `${label} 没有 JSON-LD`);
    for (const [i, raw] of blocks.entries()) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (graphOf(parsed).length < 3) warn('live/jsonld-thin', `${label} 第 ${i + 1} 段 JSON-LD 的 @graph 少于 3 个节点`);
      } catch {
        error('live/jsonld-invalid', `${label} 第 ${i + 1} 段 JSON-LD 不是合法 JSON`);
      }
    }

    if (hasMarkdown(page.route)) {
      const mdPath = markdownPath(page.route, page.lang);
      const md = await fetchText(mdPath.startsWith('http') ? mdPath : `${base}${mdPath}`);
      if (!md) continue;
      if (!md.ok) error('live/md-status', `${label} 的 .md 镜像返回 ${md.status}`);
      else {
        if (!/markdown/i.test(md.type)) warn('live/md-type', `${label} 的 .md 镜像 Content-Type 为 ${md.type || '(空)'}`);
        if (!md.text.startsWith('# ')) error('live/md-body', `${label} 的 .md 镜像不是以一级标题开头`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 10. --gsc：用 Search Console 的真实收录数据核对线上表现（需要服务账号 key）
// ---------------------------------------------------------------------------

const GSC_HOST = new URL(SITE_URL).hostname.replace(/^www\./, '');
/** 默认查域名属性（sc-domain:），可用 GSC_SITE 覆盖成 URL 前缀属性 */
const GSC_PROPERTY = process.env.GSC_SITE ?? `sc-domain:${GSC_HOST}`;
/** 服务账号 JSON：默认用 DSH 里那份；不存在时跳过而不是报错 */
const GSC_KEY = process.env.GSC_SERVICE_ACCOUNT ?? join(homedir(), '.dsh', 'credentials', 'gsc-service-account.json');

const b64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

/** 用服务账号私钥签一个 JWT，换 Google 的 access token（不引第三方依赖） */
async function gscToken(keyPath: string): Promise<string> {
  const key = JSON.parse(readFileSync(keyPath, 'utf8')) as { client_email?: string; private_key?: string };
  if (!key.client_email || !key.private_key) throw new Error('服务账号 JSON 缺少 client_email / private_key');

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(key.private_key, 'base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });
  if (!res.ok) throw new Error(`取 token 失败 ${res.status}：${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('token 响应里没有 access_token');
  return data.access_token;
}

async function gscJson<T>(token: string, url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });
  if (!res.ok) throw new Error(`${url} 返回 ${res.status}：${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

interface GscSitemap {
  path: string;
  errors?: string;
  warnings?: string;
  lastDownloaded?: string;
  contents?: { type: string; submitted?: string; indexed?: string }[];
}

interface GscIndexStatus {
  verdict?: string;
  coverageState?: string;
  robotsTxtState?: string;
  indexingState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  lastCrawlTime?: string;
}

/** 抽查的页面：首页 + 每类内容取一个，覆盖中文与英文 */
function gscSample(): Page[] {
  const wanted: Route['kind'][] = ['home', 'service', 'insight', 'term', 'lesson'];
  const picked: Page[] = [];
  for (const kind of wanted) {
    const page = indexable.find((item) => item.kind === kind && item.lang === 'zh');
    if (page) picked.push(page);
  }
  return picked;
}

async function checkGsc() {
  if (!existsSync(GSC_KEY)) {
    warn('gsc/skipped', `找不到服务账号 ${GSC_KEY}，跳过 GSC 检查（可用 GSC_SERVICE_ACCOUNT 指定路径）`);
    return;
  }

  let token: string;
  try {
    token = await gscToken(GSC_KEY);
  } catch (cause) {
    warn('gsc/auth', `服务账号认证失败：${(cause as Error).message}`);
    return;
  }

  // 1) 属性：优先用 GSC_PROPERTY，其次接受带斜杠的 URL 前缀属性
  const sites = await gscJson<{ siteEntry?: { siteUrl: string; permissionLevel?: string }[] }>(
    token,
    'https://www.googleapis.com/webmasters/v3/sites'
  ).catch((cause: Error) => {
    warn('gsc/sites', `读取属性列表失败：${cause.message}`);
    return { siteEntry: [] };
  });
  const entries = asArray<{ siteUrl: string; permissionLevel?: string }>(sites.siteEntry);
  const property =
    entries.find((entry) => entry.siteUrl === GSC_PROPERTY)?.siteUrl ??
    entries.find((entry) => entry.siteUrl === `${SITE_URL}/`)?.siteUrl;
  if (!property) {
    error('gsc/property', `服务账号看不到属性 ${GSC_PROPERTY}（可见：${entries.map((e) => e.siteUrl).join('、') || '无'}），先去 Search Console 加用户`);
    return;
  }
  const encoded = encodeURIComponent(property);

  // 2) sitemap：必须已提交、无错误，且收录数与代码生成数对得上
  const sitemapData = await gscJson<{ sitemap?: GscSitemap[] }>(
    token,
    `https://www.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`
  ).catch((cause: Error) => {
    error('gsc/sitemaps', `读取 sitemap 失败：${cause.message}`);
    return { sitemap: [] };
  });
  const sitemaps = asArray<GscSitemap>(sitemapData.sitemap);
  const ours = sitemaps.find((item) => item.path === absoluteUrl('/sitemap.xml'));
  if (!ours) {
    error('gsc/sitemap-missing', `${absoluteUrl('/sitemap.xml')} 没有提交到 Search Console（已提交：${sitemaps.map((s) => s.path).join('、') || '无'}）`);
  } else {
    const errorCount = Number(ours.errors ?? 0);
    const warnCount = Number(ours.warnings ?? 0);
    if (errorCount > 0) error('gsc/sitemap-errors', `sitemap 有 ${errorCount} 个错误`);
    if (warnCount > 0) warn('gsc/sitemap-warnings', `sitemap 有 ${warnCount} 个警告`);

    // sitemap 接口的 contents.submitted 是「提交条数」，indexed 只在部分属性里才有值，
    // 所以这里只核对提交条数；真实收录情况看下面的 URL Inspection 抽查。
    const web = ours.contents?.find((content) => content.type === 'web');
    const submitted = Number(web?.submitted ?? 0);
    const indexed = Number(web?.indexed ?? 0);
    const expectedCount = indexable.length;
    if (submitted > 0 && submitted !== expectedCount) {
      warn('gsc/sitemap-count', `sitemap 提交 ${submitted} 条，代码侧可索引 ${expectedCount} 页（上一次构建或已过期缓存？）`);
    }
    if (indexed > 0) {
      if (indexed < expectedCount * 0.7) {
        error('gsc/indexed-low', `GSC 显示已收录 ${indexed} 页，代码侧可索引 ${expectedCount} 页（低于 70%）`);
      } else if (indexed < expectedCount) {
        warn('gsc/indexed-partial', `GSC 显示已收录 ${indexed} / ${expectedCount} 页，其余可能还在抓取队列`);
      }
    }
    note(
      `· GSC sitemap：提交 ${submitted || '未知'} 条 / 期望 ${expectedCount}，错误 ${errorCount}、警告 ${warnCount}，最近下载 ${ours.lastDownloaded ?? '未知'}`
    );
  }

  // 3) 抽查索引状态：URL Inspection API 偶发超时，重试一次、两路并发，避免整轮检查被拖到几分钟
  const samples = gscSample();
  note(`· GSC 抽查 ${samples.length} 个页面的索引状态`);

  const inspectOne = async (page: Page, attempt = 1): Promise<{ page: Page; data: unknown } | null> => {
    try {
      const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: page.url, siteUrl: property }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`${res.status}：${(await res.text()).slice(0, 160)}`);
      return { page, data: await res.json() };
    } catch (cause) {
      if (attempt < 2) return inspectOne(page, attempt + 1);
      warn('gsc/inspect-unavailable', `${page.url} 查询失败（已重试）：${(cause as Error).message}`);
      return null;
    }
  };

  const inspected: (({ page: Page; data: unknown }) | null)[] = [];
  for (let i = 0; i < samples.length; i += 2) {
    inspected.push(...(await Promise.all(samples.slice(i, i + 2).map((page) => inspectOne(page)))));
  }

  for (const item of inspected) {
    if (!item) continue;
    const { page } = item;
    const data = item.data as { inspectionResult?: { indexStatusResult?: GscIndexStatus } };

    const result = data.inspectionResult?.indexStatusResult;
    if (!result) {
      warn('gsc/inspect-empty', `${page.url} 没有返回索引状态`);
      continue;
    }
    const state = result.coverageState ?? '状态未知';
    if (result.verdict === 'FAIL') {
      error('gsc/not-indexed', `${page.url} verdict=FAIL，${state}`);
    } else if (result.verdict === 'NEUTRAL') {
      // 最常见的是 "Discovered - currently not indexed"：已知地址但还没抓，属于新站正常阶段
      warn('gsc/pending-index', `${page.url} 还没被收录：${state}`);
    } else if (!/indexed/i.test(state)) {
      warn('gsc/coverage', `${page.url} 收录状态：${state}`);
    }
    if (result.googleCanonical && result.googleCanonical !== page.url) {
      error('gsc/canonical-mismatch', `${page.url} 的 Google canonical 是 ${result.googleCanonical}`);
    }
  }
}


// ---------------------------------------------------------------------------
// 运行
// ---------------------------------------------------------------------------

const started = Date.now();
checkRoutes();
checkMeta();
checkSchema();
checkMarkdown();
checkSitemap();
checkRobots();
checkLlms();
checkIndexNow();
if (liveBase) await checkLive(liveBase);
if (gscEnabled) await checkGsc();

const errors = issues.filter((issue) => issue.level === 'error');
const warnings = issues.filter((issue) => issue.level === 'warn');

if (jsonOutput) {
  console.log(JSON.stringify({ base: SITE_URL, pages: pages.length, indexablePages: indexable.length, issues, errors: errors.length, warnings: warnings.length }, null, 2));
} else {
  const grouped = new Map<string, Issue[]>();
  for (const issue of issues) grouped.set(issue.rule, [...(grouped.get(issue.rule) ?? []), issue]);
  const ordered = [...grouped.entries()].sort(([a], [b]) => {
    const levelA = grouped.get(a)![0].level === 'error' ? 0 : 1;
    const levelB = grouped.get(b)![0].level === 'error' ? 0 : 1;
    return levelA - levelB || a.localeCompare(b);
  });

  for (const [rule, list] of ordered) {
    const mark = list[0].level === 'error' ? '✗' : '⚠';
    console.log(`\n${mark} ${rule}（${list.length}）`);
    for (const issue of list.slice(0, 20)) console.log(`   ${issue.detail}`);
    if (list.length > 20) console.log(`   …还有 ${list.length - 20} 条同类问题`);
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\n${errors.length ? '✗' : '✓'} ${errors.length} 个错误、${warnings.length} 个提醒；检查了 ${pages.length} 个页面（可索引 ${indexable.length}），用时 ${seconds}s`
  );
  if (errors.length) console.log('  错误会直接影响收录 / 富结果 / AI 引用，请修复后再发布。');
}

process.exitCode = errors.length > 0 || (strict && warnings.length > 0) ? 1 : 0;
