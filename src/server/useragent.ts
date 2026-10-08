/** 从 User-Agent 粗分设备、浏览器与操作系统，并识别爬虫和自动化工具（这类请求不计入访问统计）。 */

const BOT_RE =
  /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview|python|curl\/|wget|httpclient|okhttp|java\/|go-http|axios|node-fetch|undici|phantomjs|puppeteer|playwright|selenium|scrapy|facebookexternalhit|embedly|feedfetcher|whatsapp\//i;

export function isBot(ua: string): boolean {
  return !ua || BOT_RE.test(ua);
}

export function deviceOf(ua: string): 'desktop' | 'mobile' | 'tablet' {
  const s = ua.toLowerCase();
  if (s.includes('ipad') || s.includes('tablet')) return 'tablet';
  if (s.includes('mobi') || s.includes('android') || s.includes('iphone')) return 'mobile';
  return 'desktop';
}

// 顺序有意义：Edge、Opera、国内浏览器的 UA 里都带 Chrome / Safari 字样，要先判断
const BROWSERS: [RegExp, string][] = [
  [/MicroMessenger/i, '微信'],
  [/\bEdg(e|A|iOS)?\//, 'Edge'],
  [/\bOPR\/|Opera/, 'Opera'],
  [/SamsungBrowser/, 'Samsung Internet'],
  [/QQBrowser/, 'QQ 浏览器'],
  [/UCBrowser/, 'UC 浏览器'],
  [/YaBrowser/, 'Yandex'],
  [/HuaweiBrowser/, '华为浏览器'],
  [/Firefox|FxiOS/, 'Firefox'],
  [/CriOS|Chrome\//, 'Chrome'],
  [/Version\/[\d.]+.*Safari/, 'Safari'],
  [/MSIE|Trident\//, 'IE'],
];

const SYSTEMS: [RegExp, string][] = [
  [/HarmonyOS|OpenHarmony/, 'HarmonyOS'],
  [/Windows NT/, 'Windows'],
  [/iPhone|iPod/, 'iOS'],
  [/iPad/, 'iPadOS'],
  [/Android/, 'Android'],
  [/CrOS/, 'ChromeOS'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/Linux/, 'Linux'],
];

export function browserOf(ua: string): string {
  return BROWSERS.find(([re]) => re.test(ua))?.[1] ?? '其他';
}

export function osOf(ua: string): string {
  return SYSTEMS.find(([re]) => re.test(ua))?.[1] ?? '其他';
}

/** 规范化浏览器语言：en-us → en-US；格式不对时返回空字符串 */
export function normalizeLang(raw: string): string {
  const m = /^([a-zA-Z]{2,3})(?:[-_]([a-zA-Z]{2}|\d{3}))?/.exec(raw.trim());
  if (!m) return '';
  return m[2] ? `${m[1].toLowerCase()}-${m[2].toUpperCase()}` : m[1].toLowerCase();
}
