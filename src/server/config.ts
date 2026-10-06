/**
 * 服务端配置：全部来自环境变量（Vercel 项目的 Environment Variables，本地用 .env.local）。
 * 缺省值保证「不配 key、不配数据库」也能运行：AI 接口走确定性 fallback，账号/后台接口返回 503。
 */
import { SHOW_FDE } from '../lib/features';

const env = (key: string, def = '') => {
  const v = process.env[key];
  return v && v.trim() !== '' ? v.trim() : def;
};

/** 与 env 不同：显式设为空字符串时返回空（用于关闭某个可选参数） */
const envAllowEmpty = (key: string, def: string) => {
  const v = process.env[key];
  return v === undefined ? def : v.trim();
};

const envInt = (key: string, def: number) => {
  const n = Number.parseInt(process.env[key] ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : def;
};

function geminiKey() {
  const key = env('GEMINI_API_KEY');
  return key === 'MY_GEMINI_API_KEY' ? '' : key;
}

/** SHOW_FDE 环境变量优先，否则用前端 src/lib/features.ts 的开关（单一事实来源） */
function showFDE() {
  const v = env('SHOW_FDE');
  if (v) return v === 'true' || v === '1';
  return SHOW_FDE;
}

export interface Config {
  geminiKey: string;
  geminiModel: string;
  /** 运行时连接串（Neon 的 pooled 地址）；为空表示未配置数据库 */
  databaseUrl: string;
  cookieSecure: boolean;
  showFDE: boolean;
  /** AI 可见性测评每日真实探测次数上限（控制模型费用） */
  auditDailyLimit: number;

  openaiKey: string;
  openaiModel: string;
  openaiEffort: string;
  openaiBase: string;
  perplexityKey: string;
  perplexityModel: string;
  perplexityBase: string;

  openrouterKey: string;
  openrouterBase: string;
  openrouterChatGPT: string;
  openrouterPerplexity: string;
  openrouterGemini: string;
  openrouterEffort: string;
}

let cached: Config | null = null;

export function config(): Config {
  if (cached) return cached;
  cached = {
    geminiKey: geminiKey(),
    geminiModel: env('GEMINI_MODEL', 'gemini-3.1-flash-lite'),
    databaseUrl: env('DATABASE_URL') || env('POSTGRES_URL'),
    cookieSecure: env('COOKIE_SECURE') === 'true',
    showFDE: showFDE(),
    auditDailyLimit: envInt('GEMINI_AUDIT_DAILY_LIMIT', 100),

    openaiKey: env('OPENAI_API_KEY'),
    openaiModel: env('OPENAI_MODEL', 'gpt-6-luna'),
    openaiEffort: envAllowEmpty('OPENAI_REASONING_EFFORT', 'low'),
    openaiBase: env('OPENAI_BASE_URL', 'https://api.openai.com'),
    perplexityKey: env('PERPLEXITY_API_KEY'),
    perplexityModel: env('PERPLEXITY_MODEL', 'sonar'),
    perplexityBase: env('PERPLEXITY_BASE_URL', 'https://api.perplexity.ai'),

    openrouterKey: env('OPENROUTER_API_KEY'),
    openrouterBase: env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    openrouterChatGPT: env('OPENROUTER_CHATGPT_MODEL', 'openai/gpt-6-luna'),
    openrouterPerplexity: env('OPENROUTER_PERPLEXITY_MODEL', 'perplexity/sonar'),
    openrouterGemini: env('OPENROUTER_GEMINI_MODEL', 'google/gemini-3.1-flash-lite'),
    openrouterEffort: envAllowEmpty('OPENROUTER_REASONING_EFFORT', 'low'),
  };
  return cached;
}
