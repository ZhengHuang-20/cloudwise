/**
 * 访问来源归类：按 UTM 参数、广告点击 ID 与来源主机名，把一次会话归到一个渠道，并给出归一后的来源名。
 * 会话同时保存原始的来源主机名与 UTM，规则调整后可以重新计算。
 */

export type Channel = 'direct' | 'search' | 'ai' | 'social' | 'referral' | 'paid' | 'email';

interface Rule {
  channel: Exclude<Channel, 'direct' | 'referral' | 'paid'>;
  name: string;
  /** 主机名本身或其子域名匹配 */
  hosts: string[];
  /** 额外的主机名规则（如 google.co.jp 这类国家域名） */
  re?: RegExp;
  /** utm_source 写成名称（不是域名）时用于匹配的关键词，小写 */
  keys?: string[];
}

// 顺序有意义：AI 与邮箱排在搜索前面（gemini.google.com、mail.google.com 不能算成 Google 搜索）。
const RULES: Rule[] = [
  { channel: 'ai', name: 'ChatGPT', hosts: ['chatgpt.com', 'chat.openai.com', 'openai.com'], keys: ['chatgpt', 'openai'] },
  { channel: 'ai', name: 'Perplexity', hosts: ['perplexity.ai'], keys: ['perplexity'] },
  { channel: 'ai', name: 'Gemini', hosts: ['gemini.google.com', 'bard.google.com'], keys: ['gemini', 'bard'] },
  { channel: 'ai', name: 'Copilot', hosts: ['copilot.microsoft.com', 'copilot.cloud.microsoft'], keys: ['copilot'] },
  { channel: 'ai', name: 'Claude', hosts: ['claude.ai'], keys: ['claude'] },
  { channel: 'ai', name: 'DeepSeek', hosts: ['deepseek.com'], keys: ['deepseek'] },
  { channel: 'ai', name: 'Grok', hosts: ['grok.com'], keys: ['grok'] },
  { channel: 'ai', name: 'Meta AI', hosts: ['meta.ai'], keys: ['meta.ai', 'metaai'] },
  { channel: 'ai', name: 'Mistral', hosts: ['chat.mistral.ai'], keys: ['mistral'] },
  { channel: 'ai', name: 'Kimi', hosts: ['kimi.com', 'kimi.moonshot.cn'], keys: ['kimi'] },
  { channel: 'ai', name: '豆包', hosts: ['doubao.com'], keys: ['doubao'] },
  { channel: 'ai', name: '腾讯元宝', hosts: ['yuanbao.tencent.com'], keys: ['yuanbao'] },
  { channel: 'ai', name: '通义千问', hosts: ['tongyi.aliyun.com', 'qianwen.aliyun.com', 'tongyi.com', 'chat.qwen.ai'], keys: ['tongyi', 'qianwen', 'qwen'] },
  { channel: 'ai', name: '文心一言', hosts: ['yiyan.baidu.com'], keys: ['yiyan', 'ernie'] },
  { channel: 'ai', name: '秘塔 AI 搜索', hosts: ['metaso.cn'], keys: ['metaso'] },
  { channel: 'ai', name: 'Poe', hosts: ['poe.com'], keys: ['poe'] },
  { channel: 'ai', name: 'You.com', hosts: ['you.com'], keys: ['you.com'] },
  { channel: 'ai', name: 'Phind', hosts: ['phind.com'], keys: ['phind'] },

  { channel: 'email', name: 'Gmail', hosts: ['mail.google.com'], keys: ['gmail'] },
  { channel: 'email', name: 'Outlook', hosts: ['outlook.live.com', 'outlook.office.com', 'outlook.office365.com'], keys: ['outlook'] },
  { channel: 'email', name: 'Yahoo Mail', hosts: ['mail.yahoo.com'] },
  { channel: 'email', name: 'QQ 邮箱', hosts: ['mail.qq.com', 'exmail.qq.com'] },
  { channel: 'email', name: '网易邮箱', hosts: ['mail.163.com', 'mail.126.com'] },

  { channel: 'search', name: 'Google', hosts: [], re: /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/, keys: ['google'] },
  { channel: 'search', name: 'Bing', hosts: ['bing.com', 'cn.bing.com'], keys: ['bing'] },
  { channel: 'search', name: '百度', hosts: ['baidu.com', 'm.baidu.com'], keys: ['baidu'] },
  { channel: 'search', name: 'Yandex', hosts: [], re: /(^|\.)yandex\.[a-z]{2,3}$/, keys: ['yandex'] },
  { channel: 'search', name: 'DuckDuckGo', hosts: ['duckduckgo.com'], keys: ['duckduckgo'] },
  { channel: 'search', name: 'Yahoo', hosts: [], re: /(^|\.)yahoo\.(com|co\.jp|[a-z]{2})$/, keys: ['yahoo'] },
  { channel: 'search', name: 'Naver', hosts: ['naver.com'], keys: ['naver'] },
  { channel: 'search', name: 'Ecosia', hosts: ['ecosia.org'], keys: ['ecosia'] },
  { channel: 'search', name: 'Brave Search', hosts: ['search.brave.com'] },
  { channel: 'search', name: '搜狗', hosts: ['sogou.com'], keys: ['sogou'] },
  { channel: 'search', name: '360 搜索', hosts: ['so.com'], keys: ['so.com', '360'] },
  { channel: 'search', name: '神马', hosts: ['sm.cn'], keys: ['shenma'] },
  { channel: 'search', name: 'Seznam', hosts: ['seznam.cz'], keys: ['seznam'] },
  { channel: 'search', name: 'Daum', hosts: ['daum.net'], keys: ['daum'] },

  { channel: 'social', name: 'Facebook', hosts: ['facebook.com', 'fb.com', 'fb.me'], keys: ['facebook', 'fb'] },
  { channel: 'social', name: 'Instagram', hosts: ['instagram.com'], keys: ['instagram', 'ig'] },
  { channel: 'social', name: 'LinkedIn', hosts: ['linkedin.com', 'lnkd.in'], keys: ['linkedin'] },
  { channel: 'social', name: 'X (Twitter)', hosts: ['x.com', 'twitter.com', 't.co'], keys: ['twitter', 'x'] },
  { channel: 'social', name: 'YouTube', hosts: ['youtube.com', 'youtu.be'], keys: ['youtube'] },
  { channel: 'social', name: 'TikTok', hosts: ['tiktok.com'], keys: ['tiktok'] },
  { channel: 'social', name: 'Reddit', hosts: ['reddit.com'], keys: ['reddit'] },
  { channel: 'social', name: 'Pinterest', hosts: [], re: /(^|\.)pinterest\.[a-z.]+$/, keys: ['pinterest'] },
  { channel: 'social', name: 'Quora', hosts: ['quora.com'], keys: ['quora'] },
  { channel: 'social', name: 'Threads', hosts: ['threads.net', 'threads.com'], keys: ['threads'] },
  { channel: 'social', name: 'WhatsApp', hosts: ['whatsapp.com', 'wa.me'], keys: ['whatsapp'] },
  { channel: 'social', name: 'Telegram', hosts: ['t.me', 'telegram.org'], keys: ['telegram'] },
  { channel: 'social', name: 'Discord', hosts: ['discord.com'], keys: ['discord'] },
  { channel: 'social', name: 'VK', hosts: ['vk.com'], keys: ['vk'] },
  { channel: 'social', name: 'LINE', hosts: ['line.me'], keys: ['line'] },
  { channel: 'social', name: '微信', hosts: ['weixin.qq.com', 'wechat.com'], keys: ['wechat', 'weixin'] },
  { channel: 'social', name: '微博', hosts: ['weibo.com', 'weibo.cn'], keys: ['weibo'] },
  { channel: 'social', name: '知乎', hosts: ['zhihu.com'], keys: ['zhihu'] },
  { channel: 'social', name: '小红书', hosts: ['xiaohongshu.com', 'xhslink.com'], keys: ['xiaohongshu', 'xhs'] },
  { channel: 'social', name: '抖音', hosts: ['douyin.com'], keys: ['douyin'] },
  { channel: 'social', name: '哔哩哔哩', hosts: ['bilibili.com', 'b23.tv'], keys: ['bilibili'] },
];

const hostIs = (host: string, d: string) => host === d || host.endsWith('.' + d);

function ruleByHost(host: string): Rule | undefined {
  return RULES.find((r) => r.hosts.some((d) => hostIs(host, d)) || r.re?.test(host));
}

function ruleByName(raw: string): Rule | undefined {
  const s = raw.trim().toLowerCase().replace(/^www\./, '');
  if (!s) return undefined;
  if (s.includes('.')) {
    const byHost = ruleByHost(s);
    if (byHost) return byHost;
  }
  return RULES.find((r) => r.keys?.includes(s));
}

const PAID_MEDIUM = /^(cpc|ppc|cpm|cpv|cpa|paid|paid[-_ ]?(search|social|media)|display|banner|retargeting|remarketing|ads?|sem)$/;
const EMAIL_MEDIUM = /^(e-?mail|newsletter|edm|mail)$/;
const SOCIAL_MEDIUM = /^(social|social[-_ ]?(network|media)|sm|sns)$/;

/** 广告平台的点击 ID：带上就算付费流量 */
const CLICK_IDS: [string, string][] = [
  ['gclid', 'Google Ads'],
  ['gbraid', 'Google Ads'],
  ['wbraid', 'Google Ads'],
  ['dclid', 'Google Ads'],
  ['msclkid', 'Microsoft Ads'],
  ['ttclid', 'TikTok Ads'],
  ['li_fat_id', 'LinkedIn Ads'],
  ['twclid', 'X Ads'],
];

export interface Utm {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

export interface Attribution {
  channel: Channel;
  source: string;
}

/** 从页面地址的查询串里取 UTM 与广告点击 ID。 */
export function parseCampaign(search: URLSearchParams): { utm: Utm; clickSource: string } {
  const get = (k: string) => (search.get(k) ?? '').trim().slice(0, 128);
  const utm = {
    source: get('utm_source'),
    medium: get('utm_medium'),
    campaign: get('utm_campaign'),
    term: get('utm_term'),
    content: get('utm_content'),
  };
  const click = CLICK_IDS.find(([k]) => search.has(k));
  return { utm, clickSource: click?.[1] ?? '' };
}

/**
 * 归类规则（依次判断）：点击 ID / 付费 medium → 付费；邮件 medium → 邮件；
 * 来源（utm_source 或来源主机名）是 AI 助手 → AI；社交 medium → 社交；
 * 来源主机名命中搜索 / 社交 / 邮箱 → 对应渠道，其他站外主机 → 外部链接；只有 utm_source → 按名称归类；都没有 → 直接访问。
 */
export function classify(refHost: string, utm: Utm, clickSource = ''): Attribution {
  const host = refHost.toLowerCase().replace(/^www\./, '');
  const medium = utm.medium.toLowerCase();
  const byUtm = utm.source ? ruleByName(utm.source) : undefined;
  const byRef = host ? ruleByHost(host) : undefined;
  const named = byUtm?.name || byRef?.name || utm.source || host;

  if (clickSource || PAID_MEDIUM.test(medium)) return { channel: 'paid', source: utm.source ? named : clickSource || named };
  if (EMAIL_MEDIUM.test(medium)) return { channel: 'email', source: named || 'Email' };
  if (byUtm?.channel === 'ai') return { channel: 'ai', source: byUtm.name };
  if (byRef?.channel === 'ai') return { channel: 'ai', source: byRef.name };
  if (SOCIAL_MEDIUM.test(medium)) return { channel: 'social', source: named };
  if (byRef) return { channel: byRef.channel, source: byRef.name };
  if (host) return { channel: 'referral', source: host };
  if (byUtm) return { channel: byUtm.channel, source: byUtm.name };
  if (utm.source) return { channel: 'referral', source: utm.source };
  return { channel: 'direct', source: '' };
}
