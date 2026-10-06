/**
 * AI 可见性测评的探测平台：以普通用户身份提问（开启联网搜索），返回回答原文与引用来源。
 * 品牌识别、问题生成与结果分析仍统一由 Gemini 完成。
 */
import { config } from './config';
import { gemini, sleep, type Gemini, type WebSource } from './gemini';

export interface ProbeEngine {
  /** 稳定标识，写入报告与缓存签名 */
  id: string;
  /** 页面展示名 */
  name: string;
  ask(prompt: string, signal: AbortSignal): Promise<{ text: string; sources: WebSource[] }>;
}

/** 链接的主机名（去掉 www.），用于展示来源与判断是否引用了官网 */
export function hostOfURL(raw: string): string {
  try {
    return new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** 发送 JSON 请求并解析响应；429/503 时等待后重试一次。 */
async function postJSON<T>(endpoint: string, bearer: string, body: unknown, signal: AbortSignal): Promise<T> {
  const buf = JSON.stringify(body);
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
      body: buf,
      signal,
    });
    const raw = await res.text();
    if ((res.status === 429 || res.status === 503) && attempt === 0) {
      await sleep(2000, signal);
      continue;
    }
    if (res.status !== 200) throw new Error(`http ${res.status}: ${raw.slice(0, 300)}`);
    return JSON.parse(raw) as T;
  }
}

/** 单次提问最长 90 秒 */
const withTimeout = (signal: AbortSignal) => AbortSignal.any([signal, AbortSignal.timeout(90_000)]);

// ---------- Gemini（Google 搜索 grounding） ----------

function geminiEngine(g: Gemini): ProbeEngine {
  return {
    id: 'gemini',
    name: 'Gemini',
    async ask(prompt, signal) {
      const { text, sources } = await g.askWithSearch(prompt, signal);
      // Gemini 的 URI 是 Google 的跳转链接，Title 才是来源域名。
      return { text, sources: sources.map((s) => ({ ...s, domain: s.title.toLowerCase().replace(/^www\./, '') })) };
    },
  };
}

// ---------- OpenAI（Responses API + web_search 工具） ----------

function openaiEngine(key: string, model: string, base: string, effort: string): ProbeEngine {
  base = base.replace(/\/+$/, '');
  return {
    id: 'openai',
    name: 'ChatGPT',
    async ask(prompt, signal) {
      const body: Record<string, unknown> = { model, input: prompt, tools: [{ type: 'web_search' }] };
      if (effort) body.reasoning = { effort };
      type Out = {
        output?: {
          type: string;
          content?: { type: string; text?: string; annotations?: { type: string; url?: string; title?: string }[] }[];
        }[];
      };
      let out: Out;
      try {
        out = await postJSON<Out>(`${base}/v1/responses`, key, body, withTimeout(signal));
      } catch (err) {
        throw new Error(`openai: ${(err as Error).message}`);
      }
      let text = '';
      const sources: WebSource[] = [];
      for (const item of out.output ?? []) {
        if (item.type !== 'message') continue;
        for (const c of item.content ?? []) {
          if (c.type !== 'output_text') continue;
          text += c.text ?? '';
          for (const an of c.annotations ?? []) {
            if (an.type === 'url_citation' && an.url) sources.push({ title: an.title ?? '', uri: an.url, domain: hostOfURL(an.url) });
          }
        }
      }
      if (!text) throw new Error('openai: empty answer');
      return { text, sources };
    },
  };
}

// ---------- OpenAI 兼容的 /chat/completions（Perplexity 直连、OpenRouter） ----------

type ChatOut = {
  choices?: {
    message?: {
      content?: string;
      annotations?: { type: string; url_citation?: { url?: string; title?: string } }[];
    };
  }[];
  citations?: string[];
  search_results?: { title?: string; url?: string }[];
  error?: { message?: string };
};

function chatSources(out: ChatOut): WebSource[] {
  const sources: WebSource[] = [];
  for (const an of out.choices?.[0]?.message?.annotations ?? []) {
    const u = an.url_citation;
    if (an.type === 'url_citation' && u?.url) sources.push({ title: u.title ?? '', uri: u.url, domain: hostOfURL(u.url) });
  }
  if (sources.length === 0) {
    for (const r of out.search_results ?? []) {
      if (r.url) sources.push({ title: r.title ?? '', uri: r.url, domain: hostOfURL(r.url) });
    }
  }
  if (sources.length === 0) {
    for (const u of out.citations ?? []) sources.push({ title: '', uri: u, domain: hostOfURL(u) });
  }
  return sources;
}

/**
 * Perplexity（Sonar，自带联网搜索）。可以直连，也可以经 OpenRouter 调用
 * （PERPLEXITY_BASE_URL=https://openrouter.ai/api/v1，key 填 OpenRouter 的）。
 */
function perplexityEngine(key: string, model: string, base: string): ProbeEngine {
  base = base.replace(/\/+$/, '');
  // OpenRouter 的模型名带厂商前缀（perplexity/sonar），这里自动补上，省得多配一个变量。
  if (base.includes('openrouter.ai') && !model.includes('/')) model = 'perplexity/' + model;
  return {
    id: 'perplexity',
    name: 'Perplexity',
    async ask(prompt, signal) {
      let out: ChatOut;
      try {
        out = await postJSON<ChatOut>(
          `${base}/chat/completions`,
          key,
          { model, messages: [{ role: 'user', content: prompt }] },
          withTimeout(signal),
        );
      } catch (err) {
        throw new Error(`perplexity: ${(err as Error).message}`);
      }
      const text = out.choices?.[0]?.message?.content ?? '';
      if (!text.trim()) throw new Error('perplexity: empty answer');
      return { text, sources: chatSources(out) };
    },
  };
}

/**
 * OpenRouter 统一网关：ChatGPT、Perplexity、Gemini 三个平台都经它提问。联网搜索：Perplexity 的 Sonar 自带，
 * 其余模型名加 :online 后缀由 OpenRouter 注入搜索结果。回答里的来源在 message.annotations（url_citation）。
 */
function openrouterEngine(id: string, name: string, model: string, key: string, base: string, effort: string): ProbeEngine {
  return {
    id,
    name,
    async ask(prompt, signal) {
      const body: Record<string, unknown> = { model, messages: [{ role: 'user', content: prompt }] };
      if (effort) body.reasoning = { effort };
      let out: ChatOut;
      try {
        out = await postJSON<ChatOut>(`${base}/chat/completions`, key, body, withTimeout(signal));
      } catch (err) {
        throw new Error(`openrouter/${id}: ${(err as Error).message}`);
      }
      // OpenRouter 有时以 200 返回上游错误
      if (out.error) throw new Error(`openrouter/${id}: ${out.error.message ?? 'error'}`);
      const text = out.choices?.[0]?.message?.content ?? '';
      if (!text.trim()) throw new Error(`openrouter/${id}: empty answer`);
      const sources: WebSource[] = [];
      for (const an of out.choices?.[0]?.message?.annotations ?? []) {
        const u = an.url_citation;
        if (an.type === 'url_citation' && u?.url) sources.push({ title: u.title ?? '', uri: u.url, domain: hostOfURL(u.url) });
      }
      if (sources.length === 0) {
        for (const u of out.citations ?? []) sources.push({ title: '', uri: u, domain: hostOfURL(u) });
      }
      return { text, sources };
    },
  };
}

const withOnline = (model: string) => (model.endsWith(':online') ? model : model + ':online');

/**
 * 测评实际提问的平台，展示顺序 ChatGPT → Perplexity → Gemini。
 * 配了 OpenRouter 时三个平台统一经它提问（一把 key、一个出口），否则各走各的直连配置。
 * 分析依赖 Gemini，未配置 Gemini 时返回空（只出示例）。
 */
export function activeEngines(): ProbeEngine[] {
  const g = gemini();
  if (!g) return [];
  const cfg = config();
  if (cfg.openrouterKey) {
    const base = cfg.openrouterBase.replace(/\/+$/, '');
    return [
      openrouterEngine('openai', 'ChatGPT', withOnline(cfg.openrouterChatGPT), cfg.openrouterKey, base, cfg.openrouterEffort),
      openrouterEngine('perplexity', 'Perplexity', cfg.openrouterPerplexity, cfg.openrouterKey, base, ''),
      openrouterEngine('gemini', 'Gemini', withOnline(cfg.openrouterGemini), cfg.openrouterKey, base, ''),
    ];
  }
  const out: ProbeEngine[] = [];
  if (cfg.openaiKey) out.push(openaiEngine(cfg.openaiKey, cfg.openaiModel, cfg.openaiBase, cfg.openaiEffort));
  if (cfg.perplexityKey) out.push(perplexityEngine(cfg.perplexityKey, cfg.perplexityModel, cfg.perplexityBase));
  out.push(geminiEngine(g));
  return out;
}

export const engineSignature = (engines: ProbeEngine[]) => engines.map((e) => e.id).join(',');
