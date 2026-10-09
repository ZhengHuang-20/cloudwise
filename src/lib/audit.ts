/**
 * AI 可见性测评的接口封装与类型，与服务端 src/server/audit.ts 的 AuditReport 对应。
 * 测评是异步任务：startAudit 创建，getAudit 轮询。提交必须带联系人姓名与手机号（服务端会入库）。
 */
import { api } from './api';

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

/** 返回任务 id；24 小时内测过的目标返回 cached，仍需轮询一次拿到报告。 */
export const startAudit = (input: { target: string; contactName: string; contactPhone: string }) =>
  api<{ id: string; cached?: boolean }>('/api/public/audits', {
    method: 'POST',
    body: { ...input, website: '' },
  });

export const getAudit = (id: string) => api<AuditJob>(`/api/public/audits/${id}`);

