/** Gemini Generative Language REST 接口的最小封装，key 只在服务端使用。 */
import { config } from './config';

/**
 * 联网搜索回答引用的网页。Gemini 的 title 是来源域名、uri 是 Google 的跳转链接；
 * 其他平台的 uri 是原始链接。domain 统一为来源域名（不含 www.），用于展示与判断是否引用了官网。
 */
export interface WebSource {
  title: string;
  uri: string;
  domain: string;
}

interface GenResult {
  text: string;
  sources: WebSource[];
}

export class Gemini {
  constructor(
    private key: string,
    private model: string,
    private base = 'https://generativelanguage.googleapis.com',
  ) {}

  /** 调用模型并要求返回 JSON，返回模型输出的原始文本。 */
  async generateJSON(system: string, prompt: string, temperature: number, signal?: AbortSignal): Promise<string> {
    const body: Record<string, unknown> = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, responseMimeType: 'application/json' },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    return (await this.generate(body, signal)).text;
  }

  /**
   * 以普通用户的方式提问，开启 Google 搜索 grounding，返回回答原文与引用来源。
   * 用于 AI 可见性测评：模拟海外买家向 AI 搜索提问时看到的答案。
   */
  async askWithSearch(prompt: string, signal?: AbortSignal): Promise<GenResult> {
    return this.generate({ contents: [{ role: 'user', parts: [{ text: prompt }] }], tools: [{ google_search: {} }] }, signal);
  }

  private async generate(body: unknown, signal?: AbortSignal): Promise<GenResult> {
    const buf = JSON.stringify(body);
    try {
      return await this.call(buf, signal);
    } catch (err) {
      // 模型偶发 429/503（高峰限流），短暂等待后重试一次。
      const status = (err as { status?: number }).status;
      if (status !== 429 && status !== 503) throw err;
      await sleep(1500, signal);
      return this.call(buf, signal);
    }
  }

  private async call(buf: string, signal?: AbortSignal): Promise<GenResult> {
    const res = await fetch(`${this.base}/v1beta/models/${this.model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.key },
      body: buf,
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000),
    });
    const raw = await res.text();
    if (!res.ok) throw Object.assign(new Error(`gemini http ${res.status}: ${raw.slice(0, 300)}`), { status: res.status });
    const out = JSON.parse(raw) as {
      candidates?: {
        content?: { parts?: { text?: string; thought?: boolean }[] };
        groundingMetadata?: { groundingChunks?: { web?: { title?: string; uri?: string } }[] };
      }[];
    };
    const c = out.candidates?.[0];
    if (!c) throw new Error('gemini: empty candidates');
    const text = (c.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? '')
      .join('');
    const sources: WebSource[] = [];
    for (const ch of c.groundingMetadata?.groundingChunks ?? []) {
      if (ch.web?.uri || ch.web?.title) sources.push({ title: ch.web.title ?? '', uri: ch.web.uri ?? '', domain: '' });
    }
    return { text, sources };
  }
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

let instance: Gemini | null | undefined;

/** 未配置 GEMINI_API_KEY 时返回 null，调用方走确定性 fallback */
export function gemini(): Gemini | null {
  if (instance === undefined) {
    const cfg = config();
    instance = cfg.geminiKey ? new Gemini(cfg.geminiKey, cfg.geminiModel) : null;
  }
  return instance;
}

/** 解析模型的 JSON 输出，兼容偶尔带 ``` 代码块的情况；失败返回 null。 */
export function parseModelJSON<T>(text: string): T | null {
  const t = text
    .trim()
    .replace(/^```json/, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(t) as T;
  } catch {
    return null;
  }
}
