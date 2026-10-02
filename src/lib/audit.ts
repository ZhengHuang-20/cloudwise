/**
 * AI 可见性测评的接口封装与类型，与 Go 后端 server/audit.go 的 AuditReport 对应。
 * 测评是异步任务：startAudit 创建，getAudit 轮询。接口只存在于 Go 后端；
 * 用 Node 版 server.ts 开发时接口不存在，前端改用 sampleReport 并标注「示例数据」。
 */
import { api, ApiError } from './api';

export interface WebSource {
  title: string;
  uri: string;
  /** 来源域名；P0 时期缓存的报告没有这个字段 */
  domain?: string;
}

export interface AuditEvidence {
  /** 平台名（ChatGPT / Perplexity / Gemini）；P0 时期的报告没有，均为 Gemini */
  engine?: string;
  question: string;
  branded: boolean;
  answer: string;
  mentioned: boolean;
  position: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  ownCited: boolean;
  sources: WebSource[];
}

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

export interface AuditEngineResult {
  id: string;
  name: string;
  answers: number;
  failed: number;
  mentionRate: number;
  citationRate: number;
  brandKnowledge: number;
  avgPosition: number;
}

/** 第④步一次提问的记录（后端 probeLogEntry） */
export interface ProbeLogEntry {
  engine: string;
  /** 第几题，从 1 开始 */
  question: number;
  text: string;
  /** 同一题的第几次 */
  sample: number;
  branded: boolean;
  ok: boolean;
  /** 失败原因（中文归类） */
  reason?: string;
  /** 脱敏后的原始错误 */
  detail?: string;
  ms: number;
  sources: number;
}

export interface AuditReport {
  id: string;
  /** 用户输入的原文（域名或品牌名）；早期报告没有 */
  target?: string;
  /** 官网域名；只输入品牌名且没找到官网时为空 */
  domain: string;
  /** input：用户输入；resolved：AI 根据品牌名找到；none：没有官网。早期报告没有，视为 input */
  domainSource?: 'input' | 'resolved' | 'none';
  /** live：真实探测；sample：示例数据；site_only：AI 探测失败，只有官网检查 */
  mode: 'live' | 'sample' | 'site_only';
  createdAt: string;
  entity: {
    brand: string;
    aliases: string[];
    industry: string;
    categoryEn: string;
    products: string[];
    market: string;
    marketEn: string;
  };
  totalScore: number;
  level: string;
  metrics: {
    mentionRate: number;
    citationRate: number;
    brandKnowledge: number;
    readability: number;
    avgPosition: number;
  };
  /** 平台名，顿号分隔 */
  engine: string;
  /** 各平台的统计；P0 时期的报告没有 */
  engines?: AuditEngineResult[];
  questions: number;
  samples: number;
  answers: number;
  shareOfVoice: { name: string; mentions: number; isSelf: boolean }[];
  evidence: AuditEvidence[];
  site: SiteCheck | null;
  findings: string[];
  recommendation: string;
  /** 提问日志；早期报告没有 */
  probeLog?: ProbeLogEntry[] | null;
}

export interface AuditJob {
  id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  step: number;
  done: number;
  total: number;
  engines: string[] | null;
  /** 第④步的实时提问日志 */
  log?: ProbeLogEntry[] | null;
  error: string;
  report: AuditReport | null;
}

/** 与后端 parseAuditTarget 一致：只接受域名（可带协议与路径），不接受品牌名。 */
export const parseDomain = (input: string): string | null => {
  const raw = input.trim();
  if (!raw || /\s/.test(raw)) return null;
  try {
    const host = new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.toLowerCase();
    return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(host) ? host : null;
  } catch {
    return null;
  }
};

/** 测评输入：像域名的按域名处理，否则当作品牌名（2～60 个字符），与后端 parseAuditInput 一致。 */
export const parseAuditInput = (input: string): { domain: string } | { brand: string } | null => {
  const domain = parseDomain(input);
  if (domain) return { domain };
  const brand = input.trim().split(/\s+/).join(' ');
  const length = [...brand].length;
  if (length < 2 || length > 60 || /[<>{}\\/@]/.test(brand)) return null;
  return { brand };
};

/** 后端不可用（Node 开发服务器或网络异常）时返回 true，调用方改用示例报告。 */
export const isBackendMissing = (err: unknown) =>
  err instanceof ApiError && (err.status === 0 || (err.status === 404 && err.code === 'http'));

export const startAudit = (target: string) =>
  api<{ id: string; cached?: boolean }>('/api/public/audits', { method: 'POST', body: { target, website: '' } });

export const getAudit = (id: string) => api<AuditJob>(`/api/public/audits/${id}`);

/** 后端不可用时的本地示例，数值固定，页面会标注「示例数据」。 */
export const sampleReport = (target: string): AuditReport => {
  const domain = parseDomain(target) ?? '';
  const label = domain ? domain.replace(/^www\./, '').split('.')[0] : target;
  const brand = label.charAt(0).toUpperCase() + label.slice(1);
  return {
    id: 'sample',
    target,
    domain,
    domainSource: domain ? 'input' : 'none',
    mode: 'sample',
    createdAt: new Date().toISOString(),
    entity: {
      brand,
      aliases: [],
      industry: '工业制造出海',
      categoryEn: 'industrial products',
      products: [],
      market: '欧美核心市场（北美 + 欧洲）',
      marketEn: 'the US and Europe',
    },
    totalScore: 34,
    level: '待改进',
    metrics: { mentionRate: 17, citationRate: 6, brandKnowledge: 50, readability: 0, avgPosition: 4.5 },
    engine: 'ChatGPT、Perplexity、Gemini',
    engines: [
      { id: 'openai', name: 'ChatGPT', answers: 16, failed: 0, mentionRate: 17, citationRate: 6, brandKnowledge: 50, avgPosition: 5 },
      { id: 'perplexity', name: 'Perplexity', answers: 16, failed: 0, mentionRate: 33, citationRate: 13, brandKnowledge: 50, avgPosition: 4 },
      { id: 'gemini', name: 'Gemini', answers: 16, failed: 0, mentionRate: 0, citationRate: 0, brandKnowledge: 50, avgPosition: 0 },
    ],
    questions: 8,
    samples: 2,
    answers: 48,
    shareOfVoice: [
      { name: '国际头部品牌 A', mentions: 28, isSelf: false },
      { name: '欧洲品牌 B', mentions: 21, isSelf: false },
      { name: '区域品牌 C', mentions: 12, isSelf: false },
      { name: brand, mentions: 6, isSelf: true },
    ],
    evidence: [
      {
        engine: 'ChatGPT',
        question: 'Who are the leading manufacturers of industrial products?',
        branded: false,
        answer:
          '（示例）Leading manufacturers include several established global brands. Some Chinese suppliers are also active in export markets, but detailed technical documentation for them is limited in public sources.',
        mentioned: false,
        position: 0,
        sentiment: 'neutral',
        ownCited: false,
        sources: [],
      },
    ],
    site: null,
    findings: [
      `GEO：以海外买家身份向 ChatGPT、Perplexity、Gemini 提出 6 个不带品牌名的采购问题（共 36 次回答），平均 17% 的回答提到了 ${brand}（ChatGPT 17%、Perplexity 33%、Gemini 0%），平均排在第 4.5 位`,
      '引用：AI 回答引用的网页里很少出现官网，AI 的判断依据主要来自第三方网站',
      `品牌认知：直接询问 ${brand} 时，AI 只能给出笼统介绍`,
    ],
    recommendation:
      '官网基础尚可，但 AI 推荐供应商时很少提到你。建议从 GEO 优化入手：围绕买家问题发布英文技术资料，并在行业媒体与目录建立第三方信源，每月复测。',
  };
};
