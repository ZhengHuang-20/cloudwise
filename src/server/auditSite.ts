/**
 * AI 可见性测评第①步：解析输入、查找官网、抓取官网做确定性检查（不经过模型，可以复现）。
 * 抓取只连接公网 IP 的 80 / 443 端口，防 SSRF。
 */
import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import zlib from 'node:zlib';
import { clip, runeLen } from './http';
import { gemini } from './gemini';

// ---------- 安全抓取：只访问公网地址 ----------

class PrivateAddrError extends Error {
  constructor() {
    super('目标地址不是公网地址');
  }
}

const blocked = new net.BlockList();
for (const [ip, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10], // 运营商级 NAT
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['224.0.0.0', 4], // 组播
  ['240.0.0.0', 4],
] as const) {
  blocked.addSubnet(ip, prefix, 'ipv4');
}
for (const [ip, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  blocked.addSubnet(ip, prefix, 'ipv6');
}

export function isPublicIP(ip: string): boolean {
  const fam = net.isIP(ip);
  if (fam === 4) return !blocked.check(ip, 'ipv4');
  if (fam === 6) {
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
    if (mapped) return !blocked.check(mapped[1], 'ipv4');
    return !blocked.check(ip, 'ipv6');
  }
  return false;
}

/** 在建立连接前校验解析结果：任何一个地址不是公网地址就拒绝（DNS 重绑定也绕不过实际连接的地址）。 */
const safeLookup: net.LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addrs) => {
    if (err) return callback(err, '', 0);
    const list = addrs as dns.LookupAddress[];
    if (list.length === 0 || list.some((a) => !isPublicIP(a.address))) {
      return callback(new PrivateAddrError() as NodeJS.ErrnoException, '', 0);
    }
    if ((options as dns.LookupOptions).all) (callback as any)(null, list);
    else callback(null, list[0].address, list[0].family);
  });
};

// 部分站点会拒绝空 UA，这里如实标明是测评程序。
const AUDIT_UA = 'Mozilla/5.0 (compatible; ChinGEOAudit/1.0; +https://chingeo.com)';

interface Fetched {
  status: number;
  finalURL: URL;
  body: string;
  ttfbMs: number;
}

function requestOnce(url: URL, limit: number, signal: AbortSignal): Promise<{ status: number; location: string; body: string; headersAt: number }> {
  return new Promise((resolve, reject) => {
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    if (port !== '80' && port !== '443') return reject(new PrivateAddrError());
    if (net.isIP(url.hostname.replace(/^\[|\]$/g, '')) && !isPublicIP(url.hostname.replace(/^\[|\]$/g, ''))) {
      return reject(new PrivateAddrError());
    }
    const mod = url.protocol === 'https:' ? https : http;
    // 直连，不经代理，避免绕过地址校验
    const req = mod.request(
      url,
      {
        method: 'GET',
        lookup: safeLookup,
        signal,
        headers: {
          'User-Agent': AUDIT_UA,
          Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      },
      (res) => {
        const headersAt = Date.now();
        const status = res.statusCode ?? 0;
        const location = typeof res.headers.location === 'string' ? res.headers.location : '';
        if (status >= 300 && status < 400 && location) {
          res.resume();
          return resolve({ status, location, body: '', headersAt });
        }
        const enc = String(res.headers['content-encoding'] ?? '').toLowerCase();
        let stream: NodeJS.ReadableStream = res;
        if (enc === 'gzip' || enc === 'x-gzip') stream = res.pipe(zlib.createGunzip());
        else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());
        else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());
        const chunks: Buffer[] = [];
        let size = 0;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          resolve({ status, location: '', body: Buffer.concat(chunks).subarray(0, limit).toString('utf8'), headersAt });
        };
        stream.on('data', (c: Buffer) => {
          chunks.push(c);
          size += c.length;
          if (size >= limit) {
            finish();
            res.destroy();
          }
        });
        stream.on('end', finish);
        stream.on('error', (e) => (done ? undefined : size > 0 ? finish() : reject(e)));
      },
    );
    req.on('error', reject);
    req.end();
  });
}

async function fetchPage(rawURL: string, limit: number, outer: AbortSignal): Promise<Fetched> {
  const signal = AbortSignal.any([outer, AbortSignal.timeout(12_000)]);
  const start = Date.now();
  let url = new URL(rawURL);
  for (let redirects = 0; ; redirects++) {
    const res = await requestOnce(url, limit, signal);
    if (!res.location) return { status: res.status, finalURL: url, body: res.body, ttfbMs: res.headersAt - start };
    if (redirects >= 5) throw new Error('重定向次数过多');
    url = new URL(res.location, url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('不支持的协议');
  }
}

// ---------- 输入解析 ----------

const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/i;

/** 判断输入是不是官网域名。是域名时返回小写主机名（不含端口与路径）。 */
export function parseAuditTarget(input: string): string | null {
  const s = input.trim();
  // 只认 ASCII 域名；含中文等字符的当作品牌名（避免被 URL 解析成 punycode）
  if (!s || /[ \t]/.test(s) || /[^\x21-\x7e]/.test(s)) return null;
  let host: string;
  try {
    host = new URL(s.includes('://') ? s : 'https://' + s).hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return null;
  }
  if (!host || net.isIP(host.replace(/^\[|\]$/g, '')) || !HOSTNAME_RE.test(host)) return null;
  return host;
}

/** 测评输入：像域名的按域名处理，否则当作品牌名（2～60 个字符）。 */
export function parseAuditInput(input: string): { domain: string; brand: string } | null {
  const domain = parseAuditTarget(input);
  if (domain) return { domain, brand: '' };
  const brand = input.trim().split(/\s+/).filter(Boolean).join(' ');
  const n = runeLen(brand);
  if (n < 2 || n > 60 || /[<>{}\\/@]/.test(brand) || /\p{Cc}/u.test(brand)) return null;
  return { domain: '', brand };
}

// 这些是平台、目录与社交网站，不会是企业官网。
const NOT_OFFICIAL = [
  'alibaba.com', 'aliexpress.com', 'made-in-china.com', 'globalsources.com', 'amazon.', 'linkedin.com',
  'facebook.com', 'instagram.com', 'youtube.com', 'wikipedia.org', 'baidu.com', '1688.com', 'zhihu.com', 'qcc.com',
  'tianyancha.com', 'crunchbase.com', 'example.com', 'bloomberg.com', 'thomasnet.com', 'x.com', 'twitter.com', 'tiktok.com',
];

const DOMAIN_IN_TEXT_RE = /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24})\b/gi;

/** 让 AI 联网查找品牌官网，找不到或不确定时返回空。 */
export async function resolveDomain(brand: string, signal: AbortSignal): Promise<string> {
  const g = gemini();
  if (!g) return '';
  const prompt = `What is the official company website of the brand or company "${brand}"? It is most likely a Chinese manufacturer or exporter.
Answer with the bare domain only (for example example.com). If you cannot identify the official website with confidence, answer NONE.
Do not answer with marketplaces, directories, social media or news sites.`;
  let text: string;
  try {
    text = (await g.askWithSearch(prompt, AbortSignal.any([signal, AbortSignal.timeout(45_000)]))).text;
  } catch (err) {
    console.warn('测评查找官网失败:', err);
    return '';
  }
  if (text.trim().toUpperCase().startsWith('NONE')) return '';
  for (const m of (text.match(DOMAIN_IN_TEXT_RE) ?? []).slice(0, 5)) {
    const d = parseAuditTarget(m);
    if (d && !NOT_OFFICIAL.some((s) => d.includes(s))) return d;
  }
  return '';
}

// ---------- 官网检查 ----------

/** 主流 AI 搜索与训练所用的爬虫。robots.txt 屏蔽它们，AI 就读不到官网内容。 */
const AI_CRAWLERS = [
  { agent: 'OAI-SearchBot', product: 'ChatGPT 搜索' },
  { agent: 'GPTBot', product: 'OpenAI 训练' },
  { agent: 'PerplexityBot', product: 'Perplexity' },
  { agent: 'ClaudeBot', product: 'Claude' },
  { agent: 'Google-Extended', product: 'Gemini' },
];

/** 对官网的确定性检查结果（前端 src/lib/audit.ts 的 SiteCheck 与之对应） */
export interface SiteCheck {
  reachable: boolean;
  error?: string;
  finalUrl: string;
  https: boolean;
  ttfbMs: number;
  title: string;
  description: string;
  lang: string;
  english: boolean;
  hreflangs: number;
  textChars: number;
  schemaTypes: string[];
  hasRobots: boolean;
  crawlers: { agent: string; product: string; allowed: boolean }[];
  hasSitemap: boolean;
  hasLlmsTxt: boolean;
  score: number;
}

const RE_SCRIPT_STYLE = /<(script|style|noscript|svg|template)\b.*?<\/(script|style|noscript|svg|template)>/gis;
const RE_TAG = /<[^>]+>/gs;
const RE_SPACES = /\s+/g;
const RE_TITLE = /<title[^>]*>(.*?)<\/title>/is;
const RE_HTML_LANG = /<html[^>]*\blang\s*=\s*["']?([a-zA-Z-]+)/is;
const RE_META = /<meta\b[^>]*>/gis;
const RE_ATTR = /([a-z-]+)\s*=\s*("([^"]*)"|'([^']*)')/gis;
const RE_HREFLANG = /<link\b[^>]*\bhreflang\s*=/gis;
const RE_JSONLD = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
const RE_SITEMAP_LINE = /^\s*sitemap\s*:/im;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

function unescapeHTML(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? Number.parseInt(e.slice(2), 16) : Number.parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function attrs(tag: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const a of tag.matchAll(RE_ATTR)) m[a[1].toLowerCase()] = unescapeHTML(a[3] ?? a[4] ?? '');
  return m;
}

function visibleText(page: string): string {
  const s = page.replace(RE_SCRIPT_STYLE, ' ').replace(RE_TAG, ' ');
  return unescapeHTML(s).replace(RE_SPACES, ' ').trim();
}

/** 递归收集 JSON-LD 中的 @type（含 @graph） */
function collectSchemaTypes(v: unknown, seen: Set<string>) {
  if (Array.isArray(v)) {
    for (const x of v) collectSchemaTypes(x, seen);
    return;
  }
  if (!v || typeof v !== 'object') return;
  const obj = v as Record<string, unknown>;
  const t = obj['@type'];
  if (typeof t === 'string') seen.add(t);
  else if (Array.isArray(t)) for (const x of t) if (typeof x === 'string') seen.add(x);
  for (const [k, x] of Object.entries(obj)) if (k !== '@type' && k !== '@context') collectSchemaTypes(x, seen);
}

/**
 * robots.txt 是否整站屏蔽了某个爬虫。只看 Disallow: / 这种整站屏蔽，
 * 规则匹配按「专属分组优先，否则用 *」处理，足够判断 AI 能不能读官网。
 */
export function robotsBlocks(robots: string, agent: string): boolean {
  type Group = { agents: string[]; disallow: boolean; allowAll: boolean };
  const groups: Group[] = [];
  let cur: Group | null = null;
  let lastWasAgent = false;
  for (let line of robots.split('\n')) {
    const hash = line.indexOf('#');
    if (hash >= 0) line = line.slice(0, hash);
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const k = line.slice(0, colon).trim().toLowerCase();
    const v = line.slice(colon + 1).trim();
    if (k === 'user-agent') {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], disallow: false, allowAll: false };
        groups.push(cur);
      }
      cur.agents.push(v.toLowerCase());
      lastWasAgent = true;
    } else if (k === 'disallow' || k === 'allow') {
      lastWasAgent = false;
      if (!cur) continue;
      if (v === '/' || v === '/*') {
        if (k === 'disallow') cur.disallow = true;
        else cur.allowAll = true;
      }
    } else {
      lastWasAgent = false;
    }
  }
  const find = (name: string) => groups.find((g) => g.agents.includes(name));
  const g = find(agent.toLowerCase()) ?? find('*');
  return Boolean(g && g.disallow && !g.allowAll);
}

/** 粗略判断正文是否以英文为主 */
export function asciiRatio(s: string): number {
  let ascii = 0;
  let total = 0;
  for (const ch of s) {
    if (ch === ' ') continue;
    total++;
    if (ch.codePointAt(0)! < 128) ascii++;
  }
  return total === 0 ? 0 : ascii / total;
}

const looksLikeHTML = (s: string) => {
  const head = s.trim().slice(0, 200).toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
};

function siteErrText(err: unknown): string {
  if (!err) return '无法访问';
  if (err instanceof PrivateAddrError || (err as Error).message === '目标地址不是公网地址') return '域名解析到了非公网地址';
  const e = err as { name?: string; code?: string; message?: string };
  const msg = e.message ?? '';
  if (e.name === 'TimeoutError' || e.name === 'AbortError' || /timeout|timed out/i.test(msg)) return '访问超时';
  if (e.code === 'ENOTFOUND' || e.code === 'EAI_AGAIN') return '域名无法解析';
  if (msg.startsWith('HTTP ')) return '官网返回 ' + msg;
  return '无法访问';
}

/** 抓取官网首页、robots.txt、sitemap.xml、llms.txt，并按固定规则打分（满分 100）。text 是交给模型识别品牌用的正文节选。 */
export async function checkSite(domain: string, signal: AbortSignal): Promise<{ site: SiteCheck; text: string }> {
  const sc: SiteCheck = {
    reachable: false,
    finalUrl: '',
    https: false,
    ttfbMs: 0,
    title: '',
    description: '',
    lang: '',
    english: false,
    hreflangs: 0,
    textChars: 0,
    schemaTypes: [],
    hasRobots: false,
    crawlers: [],
    hasSitemap: false,
    hasLlmsTxt: false,
    score: 0,
  };

  let page: Fetched | null = null;
  let lastErr: unknown = null;
  for (const scheme of ['https://', 'http://']) {
    try {
      const p = await fetchPage(`${scheme}${domain}/`, 2 << 20, signal);
      if (p.status < 400) {
        page = p;
        break;
      }
      lastErr = new Error(`HTTP ${p.status}`);
    } catch (err) {
      lastErr = err;
    }
  }
  if (!page) {
    sc.error = siteErrText(lastErr);
    return { site: sc, text: '' };
  }
  sc.reachable = true;
  sc.finalUrl = page.finalURL.toString();
  sc.https = page.finalURL.protocol === 'https:';
  sc.ttfbMs = page.ttfbMs;
  const base = page.finalURL.origin;

  const body = page.body;
  const title = RE_TITLE.exec(body);
  if (title) sc.title = clip(visibleText(title[1]), 200);
  const lang = RE_HTML_LANG.exec(body);
  if (lang) sc.lang = lang[1].toLowerCase();
  for (const tag of body.match(RE_META) ?? []) {
    const a = attrs(tag);
    if ((a.name ?? '').toLowerCase() === 'description' || (a.property ?? '').toLowerCase() === 'og:description') {
      if (!sc.description) sc.description = clip(a.content ?? '', 300);
    }
  }
  sc.hreflangs = (body.match(RE_HREFLANG) ?? []).length;
  const seen = new Set<string>();
  for (const m of body.matchAll(RE_JSONLD)) {
    try {
      collectSchemaTypes(JSON.parse(m[1].trim()), seen);
    } catch {
      // 忽略无效的 JSON-LD
    }
  }
  sc.schemaTypes = [...seen].sort();

  const text = visibleText(body);
  sc.textChars = runeLen(text);
  sc.english = sc.lang.startsWith('en') || (sc.lang === '' && asciiRatio(text) > 0.9);

  // robots.txt
  let robots = '';
  try {
    const r = await fetchPage(base + '/robots.txt', 256 << 10, signal);
    if (r.status === 200 && !looksLikeHTML(r.body)) {
      sc.hasRobots = true;
      robots = r.body;
    }
  } catch {
    // 没有 robots.txt 视为不屏蔽
  }
  sc.crawlers = AI_CRAWLERS.map((c) => ({ ...c, allowed: !robotsBlocks(robots, c.agent) }));
  sc.hasSitemap = RE_SITEMAP_LINE.test(robots);
  if (!sc.hasSitemap) {
    try {
      const r = await fetchPage(base + '/sitemap.xml', 64 << 10, signal);
      sc.hasSitemap = r.status === 200 && (r.body.includes('<urlset') || r.body.includes('<sitemapindex'));
    } catch {
      // 忽略
    }
  }
  try {
    const r = await fetchPage(base + '/llms.txt', 64 << 10, signal);
    sc.hasLlmsTxt = r.status === 200 && !looksLikeHTML(r.body) && r.body.trim() !== '';
  } catch {
    // 忽略
  }

  sc.score = scoreSite(sc);
  return { site: sc, text: clip(text, 4000) };
}

/** AI 可读取性评分。权重按对 AI 检索影响的大小分配，合计 100。 */
function scoreSite(sc: SiteCheck): number {
  if (!sc.reachable) return 0;
  let score = sc.https ? 10 : 5;
  const allowed = sc.crawlers.filter((c) => c.allowed).length;
  score += Math.floor((25 * allowed) / AI_CRAWLERS.length);
  if (sc.textChars >= 1500) score += 20;
  else if (sc.textChars >= 500) score += 10;
  else if (sc.textChars >= 150) score += 4;
  if (sc.english) score += 10;
  const has = (...names: string[]) => sc.schemaTypes.some((t) => names.includes(t));
  if (has('Organization', 'Corporation', 'LocalBusiness', 'MedicalOrganization')) score += 8;
  if (has('Product', 'FAQPage', 'ProductGroup', 'Service', 'Offer')) score += 5;
  if (sc.hasSitemap) score += 5;
  if (sc.hasLlmsTxt) score += 4;
  if (sc.title && sc.description) score += 5;
  if (sc.hreflangs > 0) score += 3;
  if (sc.ttfbMs > 0 && sc.ttfbMs < 800) score += 5;
  else if (sc.ttfbMs < 2000) score += 2;
  return Math.min(score, 100);
}
