/**
 * 文本模型：品牌识别、出题、事实抽取与 AI 售前顾问的回答。
 * 配置了 OPENROUTER_API_KEY 时经 OpenRouter 调用 Claude Haiku 5.5（anthropic/claude-haiku-5.5）；
 * 未配置时回退到 Gemini（删掉 OPENROUTER_API_KEY 即可回滚）。
 * 联网搜索（域名查找、测评的 Gemini 探测）仍然只走 Gemini，不经过这里。
 */
import { config } from './config';
import { gemini } from './gemini';

export interface TextOptions {
  /** 输出长度上限（token） */
  maxTokens: number;
  /** 推理强度：经 OpenRouter 的 reasoning.effort 传给 Claude；Gemini 忽略 */
  effort: 'low' | 'medium';
  /** 采样温度：仅 Gemini 使用。Haiku 5.5 不接受非默认值，所以 Claude 路径不发送 */
  temperature: number;
  signal: AbortSignal;
}

export interface TextModel {
  /** 模型标识，写入测评报告的签名，换模型后不复用旧缓存 */
  id: string;
  /** 调用模型，返回模型输出的文本（提示词要求只返回 JSON） */
  generate(system: string, prompt: string, opts: TextOptions): Promise<string>;
}

/** 经 OpenRouter 调用 Claude。失败时抛错，由调用方走 fallback。 */
async function claudeViaOpenRouter(system: string, prompt: string, opts: TextOptions): Promise<string> {
  const cfg = config();
  const base = cfg.openrouterBase.replace(/\/+$/, '');
  const messages = [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: prompt }];
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.openrouterKey}` },
    body: JSON.stringify({
      model: cfg.openrouterTextModel,
      max_tokens: opts.maxTokens,
      messages,
      reasoning: { effort: opts.effort },
    }),
    signal: AbortSignal.any([opts.signal, AbortSignal.timeout(60_000)]),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`openrouter/claude http ${res.status}: ${raw.slice(0, 300)}`);
  const out = JSON.parse(raw) as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
  // OpenRouter 有时以 200 返回上游错误
  if (out.error) throw new Error(`openrouter/claude: ${out.error.message ?? 'error'}`);
  const text = out.choices?.[0]?.message?.content ?? '';
  if (!text.trim()) throw new Error('openrouter/claude: empty answer');
  return text;
}

const claude: TextModel = {
  get id() {
    return `openrouter:${config().openrouterTextModel}`;
  },
  generate: claudeViaOpenRouter,
};

function geminiModel(g: NonNullable<ReturnType<typeof gemini>>): TextModel {
  return {
    id: 'gemini',
    generate: (system, prompt, opts) => g.generateJSON(system, prompt, opts.temperature, opts.signal),
  };
}

/** 没有可用的文本模型（OpenRouter 与 Gemini 的 key 都没配）时返回 null，调用方走确定性 fallback 或示例 */
export function textModel(): TextModel | null {
  if (config().openrouterKey) return claude;
  const g = gemini();
  return g ? geminiModel(g) : null;
}
