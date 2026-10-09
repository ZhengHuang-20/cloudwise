/**
 * AI 可见性测评：抓取官网做确定性检查 → 模型识别品牌与行业 → 生成海外买家问题 →
 * 向各探测平台（ChatGPT、Perplexity、Gemini，均开启联网搜索）真实提问 → 统计提及、排位与引用，
 * 分数由代码按公式计算。品牌识别、问题生成与结果分析统一用文本模型（llm.ts：OpenRouter 上的 Claude Haiku 5.5，未配置时为 Gemini），所以未配置文本模型时只有示例。
 * 一次测评要调用几十次模型，所以做成异步任务：POST 创建（after() 在响应后继续执行），GET 轮询进度与结果。
 */
import { config } from './config';
import { asciiRatio, checkSite, resolveDomain, type SiteCheck } from './auditSite';
import { auditStore } from './auditStore';
import { engineSignature, type ProbeEngine } from './engines';
import { parseModelJSON, type WebSource } from './gemini';
import { clip } from './http';
import { textModel } from './llm';

const AUDIT_UNBRANDED = 6; // 不带品牌名的买家问题数
const AUDIT_BRANDED = 2; // 带品牌名的问题数（固定模板）
const AUDIT_CONCURRENCY = 8; // 单个任务内每个平台同时提问数
/** 每个问题问几次（AI 回答有随机性，多问几次更稳，但每次都是付费的联网提问；默认 1，AUDIT_SAMPLES 可调） */
const auditSamples = () => config().auditSamples;

/** 一次测评要发出的联网提问数：平台 × 问题 × 采样。用于每日额度计数。 */
export const auditProbeCount = (engineCount: number) => engineCount * (AUDIT_UNBRANDED + AUDIT_BRANDED) * auditSamples();

// Vercel 函数的最长执行时间是 300 秒（Hobby 与 Pro 默认上限），整个任务要在此之前写完结果：
// 提问最晚在开始后 210 秒截止（未完成的记为超时），其余时间留给分析与写库。
const JOB_BUDGET_MS = 280_000;
const PROBE_DEADLINE_MS = 210_000;

// ---------- 报告结构（前端 src/lib/audit.ts 的 AuditReport 与之对应） ----------

export interface AuditEntity {
  brand: string;
  aliases: string[];
  industry: string;
  categoryEn: string;
  products: string[];
  market: string;
  marketEn: string;
}

interface AuditEvidence {
  engine: string;
  question: string;
  branded: boolean;
  answer: string;
  mentioned: boolean;
  position: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  ownCited: boolean;
  sources: WebSource[];
}

/** 单个平台的统计，口径与 metrics 相同 */
interface AuditEngineResult {
  id: string;
  name: string;
  answers: number;
  failed: number;
  mentionRate: number;
  citationRate: number;
  brandKnowledge: number;
  avgPosition: number;
}

interface AuditVoice {
  name: string;
  mentions: number;
  isSelf: boolean;
}

/** 第④步一次提问的记录，供前端展示「提问日志」。detail 是脱敏、截断后的原始错误。 */
export interface ProbeLogEntry {
  engine: string;
  question: number;
  text: string;
  sample: number;
  branded: boolean;
  ok: boolean;
  reason?: string;
  detail?: string;
  ms: number;
  sources: number;
}

export interface AuditReport {
  id: string;
  /** 用户输入的原文（域名或品牌名） */
  target: string;
  /** 官网域名；只输入品牌名且没找到官网时为空 */
  domain: string;
  /** input：用户输入；resolved：AI 根据品牌名找到；none：没有官网 */
  domainSource: 'input' | 'resolved' | 'none';
  /** live：真实探测；sample：未配置模型，AI 部分为示例；site_only：AI 探测失败，只有官网检查 */
  mode: 'live' | 'sample' | 'site_only';
  createdAt: string;
  entity: AuditEntity;
  totalScore: number;
  level: string;
  metrics: { mentionRate: number; citationRate: number; brandKnowledge: number; readability: number; avgPosition: number };
  /** 平台名，顿号分隔 */
  engine: string;
  /** 平台签名，平台变化后不复用旧缓存 */
  engineSet: string;
  engines: AuditEngineResult[];
  questions: number;
  samples: number;
  answers: number;
  shareOfVoice: AuditVoice[];
  evidence: AuditEvidence[];
  site: SiteCheck | null;
  findings: string[];
  recommendation: string;
  /** 第④步每一次提问的记录，按完成顺序 */
  probeLog: ProbeLogEntry[];
}

// ---------- 执行 ----------

/** 执行一次测评。domain 与 brand 二选一：只给品牌名时先让 AI 联网查找官网。 */
export async function runAudit(id: string, domainIn: string, brand: string, engines: ProbeEngine[]): Promise<void> {
  const store = auditStore();
  const started = Date.now();
  const jobSignal = AbortSignal.timeout(JOB_BUDGET_MS);
  try {
    // ① 官网检查（只给品牌名时先查找官网，找不到就跳过官网检查）
    await store.setStep(id, 1);
    let domain = domainIn;
    let target = domainIn;
    let source: AuditReport['domainSource'] = 'input';
    if (!domain) {
      target = brand;
      source = 'none';
      domain = await resolveDomain(brand, jobSignal);
      if (domain) source = 'resolved';
    }
    let site: SiteCheck | null = null;
    let siteText = '';
    if (domain) ({ site, text: siteText } = await checkSite(domain, jobSignal));

    // ② 识别品牌、行业与市场
    await store.setStep(id, 2);
    const entity = await identifyEntity(domain, brand, site, siteText, jobSignal);

    const names = engines.map((e) => e.name);
    const rep: AuditReport = {
      id,
      target,
      domain,
      domainSource: source,
      mode: 'sample',
      createdAt: new Date().toISOString(),
      entity,
      totalScore: 0,
      level: '',
      metrics: { mentionRate: 0, citationRate: 0, brandKnowledge: 0, readability: 0, avgPosition: 0 },
      engine: names.join('、'),
      engineSet: engineSignature(engines),
      engines: [],
      questions: 0,
      samples: auditSamples(),
      answers: 0,
      shareOfVoice: [],
      evidence: [],
      site,
      findings: [],
      recommendation: '',
      probeLog: [],
    };

    let unbrandedAnswers = 0;
    if (engines.length === 0) {
      await store.setStep(id, 5);
      unbrandedAnswers = fillSampleAI(rep);
    } else {
      // ③ 生成买家问题
      await store.setStep(id, 3);
      const questions = await buildQuestions(entity, domain, jobSignal);
      rep.questions = questions.length;

      // ④ 真实提问
      await store.setStep(id, 4, { engines: names, total: engines.length * questions.length * auditSamples() });
      const probeSignal = AbortSignal.any([jobSignal, AbortSignal.timeout(Math.max(0, started + PROBE_DEADLINE_MS - Date.now()))]);
      const { answers, log } = await probe(id, engines, questions, probeSignal);

      // ⑤ 分析与评分
      await store.setStep(id, 5);
      rep.probeLog = log;
      const ok = answers.filter((a) => !a.error).length;
      if (ok === 0 && !site) {
        // 没有官网、提问又全部失败：没有任何可展示的结果
        await store.fail(id, 'AI 平台暂时无法访问，请稍后重试');
        return;
      }
      if (ok === 0) {
        rep.mode = 'site_only';
      } else {
        rep.mode = 'live';
        unbrandedAnswers = await analyze(rep, engines, answers, domain, jobSignal);
      }
    }
    finishReport(rep, unbrandedAnswers);
    await store.finish(id, rep);
  } catch (err) {
    console.error('测评任务异常:', err);
    await store.fail(id, '测评失败，请稍后重试').catch(() => {});
  }
}

// ---------- ② 品牌识别 ----------

const INDUSTRY_RULES: { re: RegExp; zh: string; en: string }[] = [
  { re: /medical|health|ortho|implant|pharma|dental|surgical|bio/, zh: '医疗器械与生物耗材', en: 'medical devices' },
  { re: /solar|energy|battery|inverter|power|pv/, zh: '新能源与光伏储能', en: 'solar and energy storage equipment' },
  { re: /water|pump|valve|drain|rain|environ|filter/, zh: '环保工程与水务装备', en: 'water treatment and drainage equipment' },
  { re: /auto|vehicle|truck|machinery|excavat|crane|motor/, zh: '汽车零部件与工程机械', en: 'auto parts and machinery' },
  { re: /hardware|fastener|screw|bolt|metal|cnc|mould|mold|tool/, zh: '精密五金与离散工业', en: 'precision hardware and metal parts' },
];

function guessMarket(domain: string): [string, string] {
  const tld = domain.slice(domain.lastIndexOf('.') + 1);
  if (['de', 'fr', 'it', 'es', 'nl', 'eu', 'uk', 'pl', 'se', 'ch', 'at', 'be', 'dk', 'no', 'fi'].includes(tld)) {
    return ['欧洲市场', 'Europe'];
  }
  if (['us', 'ca'].includes(tld)) return ['北美市场', 'North America'];
  if (['sg', 'my', 'th', 'vn', 'id', 'ph', 'ae', 'sa', 'qa'].includes(tld)) {
    return ['东南亚及中东市场', 'Southeast Asia and the Middle East'];
  }
  return ['欧美核心市场（北美 + 欧洲）', 'the US and Europe'];
}

/** 域名的第一段作为品牌的粗略写法，如 www.ak-medical.com → ak-medical */
function domainLabel(domain: string): string {
  const root = domain.replace(/^www\./, '');
  const i = root.indexOf('.');
  return i > 0 ? root.slice(0, i) : root;
}

/** 没有模型或模型失败时，根据品牌名、域名与页面标题做粗略判断 */
function heuristicEntity(domain: string, brand: string, site: SiteCheck | null): AuditEntity {
  if (!brand) {
    const label = domainLabel(domain);
    brand = label.charAt(0).toUpperCase() + label.slice(1);
  }
  let hay = `${brand} ${domain}`.toLowerCase();
  if (site) hay += ` ${site.title} ${site.description}`.toLowerCase();
  const rule = INDUSTRY_RULES.find((r) => r.re.test(hay));
  const [market, marketEn] = guessMarket(domain);
  return {
    brand,
    aliases: [],
    industry: rule?.zh ?? '工业制造出海',
    categoryEn: rule?.en ?? 'industrial products',
    products: [],
    market,
    marketEn,
  };
}

const orDefault = (s: string, def: string) => (s ? s : def);

function cleanList(input: unknown, max: number, n: number): string[] {
  const out: string[] = [];
  if (!Array.isArray(input)) return out;
  for (const v of input) {
    if (typeof v !== 'string') continue;
    const s = clip(v, n);
    if (s && out.length < max) out.push(s);
  }
  return out;
}

const timeout = (signal: AbortSignal, ms: number) => AbortSignal.any([signal, AbortSignal.timeout(ms)]);

async function identifyEntity(
  domain: string,
  brand: string,
  site: SiteCheck | null,
  siteText: string,
  signal: AbortSignal,
): Promise<AuditEntity> {
  const fb = heuristicEntity(domain, brand, site);
  const m = textModel();
  if (!m) return fb;
  const info: string[] = [];
  if (brand) info.push('用户输入的品牌名：' + brand);
  if (site?.reachable) {
    info.push('域名：' + domain, `标题：${site.title}\n描述：${site.description}\n正文节选：${clip(siteText, 3000)}`);
  } else if (domain) {
    info.push('域名：' + domain, '（官网无法访问，只能根据域名判断）');
  } else {
    info.push('（没有找到官网，请根据品牌名与你掌握的公开信息判断）');
  }
  const prompt = `你是 B2B 出海行业分析师。根据下面的信息，识别企业品牌与业务。
${info.join('\n')}

只返回 JSON：
{
  "brand": "官网上使用的品牌名（优先英文）",
  "aliases": ["其他写法、中文名、缩写，最多 4 个，不含与 brand 相同的写法"],
  "industry": "所属行业（简体中文，10 字以内）",
  "categoryEn": "主营品类的英文说法，海外采购商会这样称呼（2~6 个词）",
  "products": ["核心产品的英文名，最多 4 个"],
  "market": "主要目标市场（简体中文，如 欧洲市场、北美市场）",
  "marketEn": "主要目标市场的英文（如 Europe、the US）"
}`;
  let e: Record<string, unknown> | null = null;
  try {
    e = parseModelJSON<Record<string, unknown>>(
      await m.generate('', prompt, { maxTokens: 1024, effort: 'low', temperature: 0.2, signal: timeout(signal, 40_000) }),
    );
  } catch (err) {
    console.warn('测评品牌识别失败:', err);
  }
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  if (!e || !s(e.brand).trim() || !s(e.categoryEn).trim()) return fb;
  const out: AuditEntity = {
    brand: clip(s(e.brand), 60),
    industry: orDefault(clip(s(e.industry), 30), fb.industry),
    categoryEn: clip(s(e.categoryEn), 80),
    market: orDefault(clip(s(e.market), 30), fb.market),
    marketEn: orDefault(clip(s(e.marketEn), 40), fb.marketEn),
    aliases: cleanList(e.aliases, 4, 60),
    products: cleanList(e.products, 4, 80),
  };
  // 用户输入的品牌名（常是中文名）也要能在回答里匹配到
  if (brand && brand.toLowerCase() !== out.brand.toLowerCase() && !out.aliases.some((a) => a.toLowerCase() === brand.toLowerCase())) {
    out.aliases.unshift(brand);
  }
  return out;
}

// ---------- ③ 买家问题 ----------

interface AuditQuestion {
  text: string;
  branded: boolean;
}

function fallbackQuestions(e: AuditEntity): string[] {
  const c = e.categoryEn;
  const m = e.marketEn;
  return [
    `Who are the leading manufacturers of ${c}?`,
    `Recommend reliable ${c} suppliers from China for buyers in ${m}.`,
    `Which ${c} manufacturers have international certifications such as ISO and CE?`,
    `Best ${c} suppliers for B2B wholesale and OEM orders`,
    `Compare the top ${c} brands on quality, price and lead time.`,
    `I need a ${c} supplier for a project in ${m}. Which companies should I shortlist?`,
  ];
}

async function buildQuestions(e: AuditEntity, domain: string, signal: AbortSignal): Promise<AuditQuestion[]> {
  let unbranded = fallbackQuestions(e);
  const prompt = `Write ${AUDIT_UNBRANDED} questions that a B2B buyer (procurement manager or engineer) in ${e.marketEn} would type into an AI assistant such as ChatGPT or Perplexity when looking for suppliers of ${e.categoryEn} (products: ${e.products.join(', ')}).
Rules:
- Natural English, one sentence each, varied intent: supplier recommendations, comparisons, certifications and compliance, technical specs, sourcing from China.
- Never mention any specific company or brand name.
Return JSON only: {"questions": ["..."]}`;
  try {
    const out = parseModelJSON<{ questions?: unknown }>(
      await textModel()!.generate('', prompt, { maxTokens: 1024, effort: 'low', temperature: 0.4, signal: timeout(signal, 40_000) }),
    );
    const qs = cleanList(out?.questions, AUDIT_UNBRANDED, 300);
    if (qs.length === AUDIT_UNBRANDED) unbranded = qs;
  } catch (err) {
    console.warn('测评问题生成失败:', err);
  }
  const withDomain = domain ? ` (${domain})` : '';
  return [
    ...unbranded.map((text) => ({ text, branded: false })),
    // 带品牌名的问题用固定模板，测的是 AI 对品牌本身的认知（AUDIT_BRANDED 条，改模板时同步改这个数）。
    { text: `What do you know about ${e.brand}${withDomain}? What products do they make?`, branded: true },
    { text: `Is ${e.brand} a reliable supplier of ${e.categoryEn}? What are its strengths and weaknesses?`, branded: true },
  ];
}

// ---------- ④ 提问 ----------

interface AuditAnswer {
  engine: ProbeEngine;
  q: AuditQuestion;
  text: string;
  sources: WebSource[];
  error: unknown;
}

const SECRET_RE = /(bearer\s+|sk-)[a-z0-9._-]{8,}/gi;

/** 带上底层原因（fetch failed 的 cause） */
function errorMessage(err: unknown): string {
  const e = err as { name?: string; message?: string; cause?: { code?: string; message?: string } };
  let msg = e?.message ?? String(err);
  if (e?.name === 'TimeoutError') msg = 'timeout: ' + msg;
  if (e?.cause) msg += `: ${e.cause.code ?? ''} ${e.cause.message ?? ''}`.trimEnd();
  return msg;
}

/** 把调用错误归成一句中文原因，并返回去掉密钥、截断后的原始信息。 */
function probeErrorReason(err: unknown, deadlineHit: boolean): { reason: string; detail: string } {
  const msg = errorMessage(err);
  let detail = msg.replace(SECRET_RE, '$1***');
  if (Array.from(detail).length > 240) detail = Array.from(detail).slice(0, 240).join('') + '…';
  const lower = msg.toLowerCase();
  const has = (...subs: string[]) => subs.some((s) => lower.includes(s));
  let reason = '调用失败';
  if (deadlineHit) reason = '超时：测评总时长已到，未完成的提问提前结束';
  else if (has('deadline exceeded', 'timeout', 'aborted')) reason = '超时：90 秒内没有返回';
  else if (has('http 401', 'http 403')) reason = '鉴权失败，或账号无权使用该模型';
  else if (has('http 402', 'insufficient credits', 'requires more credits')) reason = '账户余额不足';
  else if (has('http 404', 'no endpoints', 'not a valid model', 'model not found')) reason = '模型不存在或当前不可用，请检查模型 ID';
  else if (has('http 400')) reason = '请求参数不被接受（模型可能不支持联网搜索或推理参数）';
  else if (has('http 429')) reason = '触发限流，请稍后重试';
  else if (has('http 5')) reason = '平台服务异常';
  else if (has('empty answer')) reason = '返回了空回答';
  else if (has('fetch failed', 'enotfound', 'econnrefused', 'econnreset', 'certificate', 'tls', 'socket')) reason = '网络无法连接到平台';
  return { reason, detail };
}

/** 向每个平台提出全部问题，每题问 AUDIT_SAMPLES 次。各平台单独限制并发，互不拖累。 */
async function probe(
  id: string,
  engines: ProbeEngine[],
  qs: AuditQuestion[],
  signal: AbortSignal,
): Promise<{ answers: AuditAnswer[]; log: ProbeLogEntry[] }> {
  const store = auditStore();
  const log: ProbeLogEntry[] = [];
  const answers: AuditAnswer[] = [];

  await Promise.all(
    engines.map(async (engine) => {
      const tasks: { q: AuditQuestion; qi: number; sample: number; slot: number }[] = [];
      qs.forEach((q, qi) => {
        for (let s = 0; s < auditSamples(); s++) {
          tasks.push({ q, qi, sample: s, slot: answers.length });
          answers.push({ engine, q, text: '', sources: [], error: new Error('not run') });
        }
      });
      let next = 0;
      const worker = async () => {
        while (next < tasks.length) {
          const t = tasks[next++];
          const start = Date.now();
          let text = '';
          let sources: WebSource[] = [];
          let error: unknown = null;
          try {
            if (signal.aborted) throw signal.reason;
            ({ text, sources } = await engine.ask(t.q.text, signal));
            if (!text.trim()) throw new Error('empty answer');
          } catch (err) {
            error = err;
            console.warn(`测评提问失败（${engine.id}）:`, errorMessage(err));
          }
          const entry: ProbeLogEntry = {
            engine: engine.name,
            question: t.qi + 1,
            text: t.q.text,
            sample: t.sample + 1,
            branded: t.q.branded,
            ok: !error,
            ms: Date.now() - start,
            sources: sources.length,
          };
          if (error) Object.assign(entry, probeErrorReason(error, signal.aborted));
          answers[t.slot] = { engine, q: t.q, text, sources, error };
          log.push(entry);
          await store.addLog(id, entry).catch((err) => console.warn('写入提问日志失败:', err));
        }
      };
      await Promise.all(Array.from({ length: Math.min(AUDIT_CONCURRENCY, tasks.length) }, worker));
    }),
  );
  return { answers, log };
}

// ---------- ⑤ 分析 ----------

interface AnswerFacts {
  i: number;
  mentioned?: boolean;
  position?: number;
  sentiment?: string;
  knowsBrand?: boolean;
  brands?: unknown;
}

/** 在回答里做字符串匹配用的品牌写法 */
function brandTerms(e: AuditEntity, domain: string): string[] {
  const terms = [domain.replace(/^www\./, '')];
  for (let t of [domainLabel(domain), e.brand, ...e.aliases]) {
    t = t.trim();
    const n = Array.from(t).length;
    // 英文写法至少 3 个字符，中文名至少 2 个字，避免短缩写误匹配。
    if (n >= 3 || (n === 2 && asciiRatio(t) === 0)) terms.push(t);
  }
  return terms;
}

const containsAnyFold = (s: string, terms: string[]) => {
  const ls = s.toLowerCase();
  return terms.some((t) => t !== '' && ls.includes(t.toLowerCase()));
};

/** 让模型从一组回答里抽取事实（不打分）。idx 是 answers 中要分析的下标，结果按下标返回。 */
async function extractFacts(
  e: AuditEntity,
  domain: string,
  answers: AuditAnswer[],
  idx: number[],
  signal: AbortSignal,
): Promise<Map<number, AnswerFacts>> {
  const out = new Map<number, AnswerFacts>();
  let sb = '';
  for (const i of idx) {
    if (!answers[i].error) sb += `\n### ANSWER ${i}\nQuestion: ${answers[i].q.text}\nAnswer:\n${clip(answers[i].text, 2500)}\n`;
  }
  if (!sb) return out;
  const prompt = `You are auditing how AI assistants talk about a company.
Target company: ${e.brand} (website ${domain}; other names: ${e.aliases.join(', ')})

For every answer below, extract facts. Return JSON only:
{"results": [{"i": <answer number>, "mentioned": <true if the target company is mentioned>, "position": <1-based position of the target company among the companies the answer recommends or lists, 0 if not listed>, "sentiment": "positive|neutral|negative (how the answer describes the target company; neutral if not mentioned)", "knowsBrand": <true only if the answer gives specific, concrete information about the target company itself rather than saying it has no information or talking generically>, "brands": ["company or brand names the answer recommends or lists, in order, at most 10; exclude marketplaces, directories and media such as Alibaba, Made-in-China, Thomasnet, Wikipedia"]}]}
${sb}`;
  try {
    const parsed = parseModelJSON<{ results?: AnswerFacts[] }>(
      await textModel()!.generate('', prompt, { maxTokens: 4096, effort: 'low', temperature: 0, signal: timeout(signal, 60_000) }),
    );
    for (const f of parsed?.results ?? []) if (f && typeof f.i === 'number') out.set(f.i, f);
  } catch (err) {
    console.warn('测评结果分析失败:', err);
  }
  return out;
}

interface Tally {
  unbranded: number;
  mentionedU: number;
  all: number;
  cited: number;
  branded: number;
  knows: number;
  posCount: number;
  posSum: number;
  failed: number;
}

const newTally = (): Tally => ({ unbranded: 0, mentionedU: 0, all: 0, cited: 0, branded: 0, knows: 0, posCount: 0, posSum: 0, failed: 0 });
const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((100 * n) / d));
const avgPos = (sum: number, n: number) => (n === 0 ? 0 : Math.round((sum / n) * 10) / 10);

/** 统计各平台指标与声量，返回不带品牌名问题的有效回答数（用于生成文案）。 */
async function analyze(
  rep: AuditReport,
  engines: ProbeEngine[],
  answers: AuditAnswer[],
  domain: string,
  signal: AbortSignal,
): Promise<number> {
  const e = rep.entity;
  const terms = brandTerms(e, domain);
  const root = domain.replace(/^www\./, '').toLowerCase();

  // 按平台分组，各平台的分析并行进行，单次提示词不会过长。
  const groups = new Map<string, number[]>();
  answers.forEach((a, i) => groups.set(a.engine.id, [...(groups.get(a.engine.id) ?? []), i]));
  const facts = new Map<number, AnswerFacts>();
  for (const got of await Promise.all([...groups.values()].map((idx) => extractFacts(e, domain, answers, idx, signal)))) {
    for (const [k, v] of got) facts.set(k, v);
  }

  const tallies = new Map(engines.map((eng) => [eng.id, newTally()]));
  const total = newTally();
  const voice = new Map<string, AuditVoice>();

  answers.forEach((ans, i) => {
    const t = tallies.get(ans.engine.id)!;
    if (ans.error) {
      t.failed++;
      return;
    }
    const f = facts.get(i);
    const analyzed = f !== undefined;
    const mentioned = containsAnyFold(ans.text, terms) || Boolean(f?.mentioned);
    let ownCited = false;
    const sources: WebSource[] = [];
    const seenSrc = new Set<string>();
    for (const src of ans.sources) {
      if (root && `${src.domain} ${src.title} ${src.uri}`.toLowerCase().includes(root)) ownCited = true;
      const k = orDefault(src.domain, src.title).toLowerCase();
      if (!seenSrc.has(k) && sources.length < 6) {
        seenSrc.add(k);
        sources.push(src);
      }
    }
    const pos = mentioned && typeof f?.position === 'number' && f.position > 0 ? Math.round(f.position) : 0;
    for (const x of [t, total]) {
      x.all++;
      if (ownCited) x.cited++;
      if (ans.q.branded) {
        x.branded++;
        // 模型分析失败时，退化为「回答里出现了品牌名」。
        if ((analyzed && f.knowsBrand) || (!analyzed && mentioned)) x.knows++;
      } else {
        x.unbranded++;
        if (mentioned) {
          x.mentionedU++;
          if (pos > 0) {
            x.posSum += pos;
            x.posCount++;
          }
        }
      }
    }
    if (!ans.q.branded && Array.isArray(f?.brands)) {
      const seenBrand = new Set<string>();
      for (const raw of f.brands) {
        if (typeof raw !== 'string') continue;
        const b = clip(raw, 60);
        const k = b.toLowerCase();
        if (!b || seenBrand.has(k) || containsAnyFold(b, terms)) continue;
        seenBrand.add(k);
        const v = voice.get(k) ?? { name: b, mentions: 0, isSelf: false };
        v.mentions++;
        voice.set(k, v);
      }
    }
    const sentiment = f?.sentiment === 'positive' || f?.sentiment === 'negative' ? f.sentiment : 'neutral';
    rep.evidence.push({
      engine: ans.engine.name,
      question: ans.q.text,
      branded: ans.q.branded,
      answer: clip(ans.text, 1500),
      mentioned,
      position: pos,
      sentiment,
      ownCited,
      sources,
    });
  });

  // 各平台分别计算；总体指标取有效平台的平均值，让每个平台权重相同。
  let sumM = 0;
  let sumC = 0;
  let sumK = 0;
  let n = 0;
  for (const eng of engines) {
    const t = tallies.get(eng.id)!;
    const r: AuditEngineResult = {
      id: eng.id,
      name: eng.name,
      answers: t.all,
      failed: t.failed,
      mentionRate: 0,
      citationRate: 0,
      brandKnowledge: 0,
      avgPosition: 0,
    };
    if (t.all > 0) {
      r.mentionRate = pct(t.mentionedU, t.unbranded);
      r.citationRate = pct(t.cited, t.all);
      r.brandKnowledge = pct(t.knows, t.branded);
      r.avgPosition = avgPos(t.posSum, t.posCount);
      sumM += r.mentionRate;
      sumC += r.citationRate;
      sumK += r.brandKnowledge;
      n++;
    }
    rep.engines.push(r);
  }
  if (n > 0) {
    rep.metrics.mentionRate = Math.round(sumM / n);
    rep.metrics.citationRate = Math.round(sumC / n);
    rep.metrics.brandKnowledge = Math.round(sumK / n);
  }
  rep.metrics.avgPosition = avgPos(total.posSum, total.posCount);
  rep.answers = total.all;

  // 声量：只统计不带品牌名的问题，取被提及最多的竞品与自身对比。
  const list = [...voice.values()]
    .sort((a, b) => b.mentions - a.mentions || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .slice(0, 6);
  list.push({ name: e.brand, mentions: total.mentionedU, isSelf: true });
  rep.shareOfVoice = list.sort((a, b) => b.mentions - a.mentions); // 稳定排序

  // 证据排序：先放提到品牌的回答，再放不带品牌名的问题；同类保持平台顺序。
  rep.evidence.sort((x, y) => {
    if (x.mentioned !== y.mentioned) return x.mentioned ? -1 : 1;
    if (x.branded !== y.branded) return x.branded ? 1 : -1;
    return 0;
  });
  return total.unbranded;
}

/** 未配置模型时的确定性示例，前端会明确标注「示例数据」。返回不带品牌名问题的回答数。 */
function fillSampleAI(rep: AuditReport): number {
  rep.mode = 'sample';
  rep.questions = AUDIT_UNBRANDED + 2;
  rep.engines = [
    { id: 'openai', name: 'ChatGPT', answers: 16, failed: 0, mentionRate: 17, citationRate: 6, brandKnowledge: 50, avgPosition: 5 },
    { id: 'perplexity', name: 'Perplexity', answers: 16, failed: 0, mentionRate: 33, citationRate: 13, brandKnowledge: 50, avgPosition: 4 },
    { id: 'gemini', name: 'Gemini', answers: 16, failed: 0, mentionRate: 0, citationRate: 0, brandKnowledge: 50, avgPosition: 0 },
  ];
  rep.engine = 'ChatGPT、Perplexity、Gemini';
  rep.answers = 48;
  rep.metrics = { mentionRate: 17, citationRate: 6, brandKnowledge: 50, readability: 0, avgPosition: 4.5 };
  rep.shareOfVoice = [
    { name: '国际头部品牌 A', mentions: 28, isSelf: false },
    { name: '欧洲品牌 B', mentions: 21, isSelf: false },
    { name: '区域品牌 C', mentions: 12, isSelf: false },
    { name: rep.entity.brand, mentions: 6, isSelf: true },
  ];
  rep.evidence = [
    {
      engine: 'ChatGPT',
      question: fallbackQuestions(rep.entity)[0],
      branded: false,
      answer:
        '（示例）Leading manufacturers include several established global brands. Some Chinese suppliers are also active in export markets, but detailed technical documentation for them is limited in public sources.',
      mentioned: false,
      position: 0,
      sentiment: 'neutral',
      ownCited: false,
      sources: [],
    },
  ];
  return 36;
}

// ---------- 汇总、发现与建议 ----------

function finishReport(rep: AuditReport, unbrandedAnswers: number) {
  const m = rep.metrics;
  const site = rep.site;
  const ai = 0.5 * m.mentionRate + 0.2 * m.citationRate + 0.3 * m.brandKnowledge;
  if (!site) {
    // 只有品牌名且没找到官网：总分只看 AI 部分
    rep.totalScore = Math.round(ai);
  } else if (rep.mode === 'site_only') {
    m.readability = site.score;
    rep.totalScore = site.score;
  } else {
    m.readability = site.score;
    rep.totalScore = Math.round(0.7 * ai + 0.3 * site.score);
  }
  rep.level = rep.totalScore >= 75 ? '表现良好' : rep.totalScore >= 50 ? '有基础，仍有明显短板' : '待改进';

  const issues: string[] = [];
  const goods: string[] = [];
  const brand = rep.entity.brand;

  if (rep.mode !== 'site_only') {
    let line = `GEO：以海外买家身份向 ${rep.engine} 提出 ${AUDIT_UNBRANDED} 个不带品牌名的采购问题（共 ${unbrandedAnswers} 次回答），平均 ${m.mentionRate}% 的回答提到了 ${brand}`;
    if (rep.engines.length > 1) {
      const parts = rep.engines.filter((e) => e.answers > 0).map((e) => `${e.name} ${e.mentionRate}%`);
      line += '（' + parts.join('、') + '）';
    }
    if (m.avgPosition > 0) line += `，平均排在第 ${m.avgPosition.toFixed(1)} 位`;
    const top = rep.shareOfVoice
      .filter((v) => !v.isSelf)
      .slice(0, 3)
      .map((v) => v.name);
    if (m.mentionRate < 50 && top.length > 0) line += '；被推荐最多的是 ' + top.join('、');
    (m.mentionRate >= 50 ? goods : issues).push(line);
    if (m.citationRate === 0) issues.push('引用：AI 回答引用的网页里没有出现官网，AI 的判断依据来自第三方网站');
    else goods.push(`引用：${m.citationRate}% 的回答把官网列为引用来源`);
    if (m.brandKnowledge < 50) issues.push(`品牌认知：直接询问 ${brand} 时，AI 大多给不出具体的产品与资质信息`);
    else goods.push(`品牌认知：直接询问 ${brand} 时，AI 能给出具体介绍`);
  }

  if (!site && rep.mode === 'sample') {
    // 未配置模型，没有真的去查官网
    issues.push('官网：只输入了品牌名，本次未做官网检查；输入官网域名可获得完整测评');
  } else if (!site) {
    issues.push(`官网：AI 联网搜索没有找到 ${brand} 的官网，本次未做官网检查；输入官网域名可获得完整测评`);
  } else if (!site.reachable) {
    issues.push('官网：' + orDefault(site.error ?? '', '无法访问') + '，AI 爬虫同样无法读取');
  } else {
    const blockedBots = site.crawlers.filter((c) => !c.allowed).map((c) => c.agent);
    if (blockedBots.length > 0) {
      issues.push('爬虫权限：robots.txt 屏蔽了 ' + blockedBots.join('、') + '，对应的 AI 读不到官网内容');
    } else {
      goods.push('爬虫权限：robots.txt 没有屏蔽主流 AI 爬虫');
    }
    if (site.textChars < 500) {
      issues.push(
        `页面内容：首页不执行 JavaScript 时只有约 ${site.textChars} 字正文，多数 AI 爬虫不执行 JavaScript，读到的内容很少`,
      );
    }
    if (!site.english) issues.push('语言：首页不是英文，海外买家用英文提问时难以匹配到官网');
    if (site.schemaTypes.length === 0) {
      issues.push('结构化数据：未发现 Organization、Product 等 Schema 标记，AI 难以准确识别企业与产品');
    }
    if (!site.hasLlmsTxt) issues.push('llms.txt：官网没有提供给 AI 阅读的内容索引');
    if (site.ttfbMs >= 2000) issues.push(`速度：从测评服务器访问首页，首字节耗时约 ${(site.ttfbMs / 1000).toFixed(1)} 秒`);
  }

  rep.findings = [...issues, ...goods].slice(0, 7);

  if (!site && rep.mode === 'sample') {
    rep.recommendation = '建议输入官网域名重新测评，同时检查官网能否被 AI 读取。';
  } else if (!site) {
    rep.recommendation =
      'AI 没能找到你的官网，这本身就是问题：海外买家向 AI 提问时，AI 也很难把你和官网对应起来。建议先建设或完善英文官网，再做 GEO 信源建设。';
  } else if (!site.reachable || site.score < 50) {
    rep.recommendation =
      '先把官网改造成 AI 读得懂的样子：放开 AI 爬虫、服务端输出英文正文、补齐结构化数据；再做 GEO 信源建设，提高被 AI 推荐的机会。';
  } else if (rep.mode !== 'site_only' && m.mentionRate < 30) {
    rep.recommendation =
      '官网基础尚可，但 AI 推荐供应商时很少提到你。建议从 GEO 优化入手：围绕买家问题发布英文技术资料，并在行业媒体与目录建立第三方信源，每月复测。';
  } else if (rep.mode !== 'site_only' && m.citationRate < 20) {
    rep.recommendation =
      'AI 已经知道你，但很少引用官网。建议补充可被引用的英文技术页面（参数表、认证、应用案例），让 AI 的回答以官网为依据。';
  } else {
    rep.recommendation = '整体表现不错。建议持续扩展多语种内容与问题覆盖面，并定期复测，跟踪竞品变化。';
  }
}
