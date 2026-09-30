/**
 * AI 可见性测评的接口封装与类型，与 Go 后端 server/audit.go 的 AuditReport 对应。
 * 测评是异步任务：startAudit 创建，getAudit 轮询。接口只存在于 Go 后端；
 * 用 Node 版 server.ts 开发时接口不存在，前端改用 sampleReport 并标注「示例数据」。
 */
import { api, ApiError } from './api';

export interface WebSource {
  title: string;
  uri: string;
}

export interface AuditEvidence {
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

export interface AuditReport {
  id: string;
  domain: string;
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
  engine: string;
  questions: number;
  samples: number;
  answers: number;
  shareOfVoice: { name: string; mentions: number; isSelf: boolean }[];
  evidence: AuditEvidence[];
  site: SiteCheck | null;
  findings: string[];
  recommendation: string;
}

export interface AuditJob {
  id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  step: number;
  done: number;
  total: number;
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

/** 后端不可用（Node 开发服务器或网络异常）时返回 true，调用方改用示例报告。 */
export const isBackendMissing = (err: unknown) =>
  err instanceof ApiError && (err.status === 0 || (err.status === 404 && err.code === 'http'));

export const startAudit = (target: string) =>
  api<{ id: string; cached?: boolean }>('/api/public/audits', { method: 'POST', body: { target, website: '' } });

export const getAudit = (id: string) => api<AuditJob>(`/api/public/audits/${id}`);

/** 后端不可用时的本地示例，数值固定，页面会标注「示例数据」。 */
export const sampleReport = (domain: string): AuditReport => {
  const label = domain.replace(/^www\./, '').split('.')[0];
  const brand = label.charAt(0).toUpperCase() + label.slice(1);
  return {
    id: 'sample',
    domain,
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
    metrics: { mentionRate: 17, citationRate: 6, brandKnowledge: 50, readability: 58, avgPosition: 5 },
    engine: 'Gemini（Google 搜索）',
    questions: 8,
    samples: 2,
    answers: 16,
    shareOfVoice: [
      { name: '国际头部品牌 A', mentions: 10, isSelf: false },
      { name: '欧洲品牌 B', mentions: 8, isSelf: false },
      { name: '区域品牌 C', mentions: 5, isSelf: false },
      { name: brand, mentions: 2, isSelf: true },
    ],
    evidence: [
      {
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
      `GEO：以海外买家身份提出 6 个不带品牌名的采购问题，12 次回答中有 17% 提到了 ${brand}，平均排在第 5.0 位`,
      '引用：AI 回答引用的网页里很少出现官网，AI 的判断依据主要来自第三方网站',
      `品牌认知：直接询问 ${brand} 时，AI 只能给出笼统介绍`,
    ],
    recommendation:
      '官网基础尚可，但 AI 推荐供应商时很少提到你。建议从 GEO 优化入手：围绕买家问题发布英文技术资料，并在行业媒体与目录建立第三方信源，每月复测。',
  };
};
