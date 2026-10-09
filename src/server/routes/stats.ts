/**
 * 客户后台的访问分析：核心指标（含上一周期对比）、每日趋势与按维度拆分。全部经 withSite 校验站点权限。
 *
 * 数据来源：站点关联了 Vercel 项目且能读到数据时，访客、浏览量、每日趋势、AI 访客，以及来源 / 国家 / 页面 / 设备 / UTM 维度
 * 以 Vercel Web Analytics 为准（网站一直托管在 Vercel，数据最全）；线索、会话、跳出率、参与时长、入口 / 退出页、浏览器语言
 * 只有采集脚本（cw.js）有，始终用脚本的数据。读不到 Vercel 时整体回退到脚本数据，响应里的 source 标明实际来源。
 *
 * 脚本口径：访客按 visitor_id 去重；会话 30 分钟无操作即结束；跳出 = 只看 1 页、参与时长不到 10 秒且没有留资的会话；
 * 留资转化率 = 留下线索的访客 ÷ 访客。升级前的访问没有会话，只计入访客与浏览量。
 */
import { classify } from '../channels';
import { query, queryOne } from '../db';
import { apiError, json } from '../http';
import { config } from '../config';
import { OTHERS, vercelCovers, vercelProbe, vercelEnabled, vercelSeries, vercelGroups, vercelTotals, type VercelGroup, type VercelSite } from '../vercel';
import { CN_OFFSET_MS, originAllowed, withSite } from './analytics';

const DAY_MS = 24 * 3600 * 1000;
const HOUR_MS = 3600 * 1000;
/** 按北京时间分桶：天为 YYYY-MM-DD，小时为 YYYY-MM-DD HH */
const CN_BUCKET = (col: string, unit: 'day' | 'hour') =>
  `to_char(${col} AT TIME ZONE 'Asia/Shanghai', '${unit === 'hour' ? 'YYYY-MM-DD HH24' : 'YYYY-MM-DD'}')`;
/** 分桶起点（北京时间按 UTC 表示的毫秒）→ 分桶键，与 CN_BUCKET 一致 */
const bucketKey = (cn: number, unit: 'day' | 'hour') =>
  unit === 'hour' ? new Date(cn).toISOString().slice(0, 13).replace('T', ' ') : new Date(cn).toISOString().slice(0, 10);
const BOUNCE = `pageviews = 1 AND engaged_ms < 10000 AND NOT has_lead`;

interface Range {
  /** 1 表示近 24 小时（按小时分桶），7 / 30 / 90 按天分桶 */
  days: number;
  unit: 'day' | 'hour';
  /** 分桶数与每桶时长 */
  buckets: number;
  step: number;
  /** 当前周期起点（北京时间的零点或整点，换成 UTC） */
  from: Date;
  to: Date;
  /** 上一周期：紧挨着当前周期、等长 */
  prevFrom: Date;
  /** 当前周期第一个分桶的北京时间起点（毫秒，按 UTC 表示），用于生成序列 */
  startCN: number;
}

function rangeOf(req: Request): Range {
  const d = Number(new URL(req.url).searchParams.get('days'));
  const days = d === 1 || d === 7 || d === 30 || d === 90 ? d : 7;
  const unit = days === 1 ? 'hour' : 'day';
  const step = unit === 'hour' ? HOUR_MS : DAY_MS;
  const buckets = unit === 'hour' ? 24 : days;
  const nowCN = Date.now() + CN_OFFSET_MS;
  const startCN = Math.floor(nowCN / step) * step - (buckets - 1) * step;
  const from = new Date(startCN - CN_OFFSET_MS);
  const span = buckets * step;
  return { days, unit, buckets, step, from, to: new Date(Date.now() + 60_000), prevFrom: new Date(from.getTime() - span), startCN };
}

const rate = (n: number, d: number) => (d > 0 ? n / d : null);

async function kpis(siteId: number, from: Date, to: Date) {
  const args = [siteId, from, to];
  const [v, s, l] = await Promise.all([
    queryOne(
      `SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv, COUNT(*) FILTER (WHERE session_id = '') AS legacy
       FROM visits WHERE site_id = $1 AND created_at >= $2 AND created_at < $3`,
      args,
    ),
    queryOne(
      `SELECT COUNT(*) AS sessions, COUNT(*) FILTER (WHERE ${BOUNCE}) AS bounces, AVG(engaged_ms)::int AS avg_engaged,
         COUNT(DISTINCT visitor_id) FILTER (WHERE channel = 'ai') AS ai_visitors,
         COUNT(DISTINCT visitor_id) FILTER (WHERE is_new_visitor) AS new_visitors
       FROM visit_sessions WHERE site_id = $1 AND started_at >= $2 AND started_at < $3`,
      args,
    ),
    queryOne(
      `SELECT COUNT(*) AS leads, COUNT(*) FILTER (WHERE status = 'new') AS new_leads,
         COUNT(DISTINCT visitor_id) FILTER (WHERE visitor_id <> '') AS lead_visitors
       FROM leads WHERE site_id = $1 AND created_at >= $2 AND created_at < $3`,
      args,
    ),
  ]);
  const uv = v?.uv ?? 0;
  const sessions = s?.sessions ?? 0;
  return {
    pv: v?.pv ?? 0,
    uv,
    legacyPv: v?.legacy ?? 0,
    sessions,
    bounceRate: rate(s?.bounces ?? 0, sessions),
    avgEngagedMs: sessions > 0 ? (s?.avg_engaged ?? 0) : null,
    aiVisitors: s?.ai_visitors ?? 0,
    newVisitors: s?.new_visitors ?? 0,
    leads: l?.leads ?? 0,
    newLeads: l?.new_leads ?? 0,
    leadVisitors: l?.lead_visitors ?? 0,
    conversionRate: uv > 0 ? Math.min(1, (l?.lead_visitors ?? 0) / uv) : null,
  };
}

type Kpis = Awaited<ReturnType<typeof kpis>>;

// ---------- Vercel ----------

interface SiteInfo extends VercelSite {
  domain: string;
}

async function siteInfo(siteId: number): Promise<SiteInfo> {
  const site = await queryOne(`SELECT domain, vercel_team_id, vercel_project_id FROM sites WHERE id = $1`, [siteId]);
  return { domain: site?.domain ?? '', vercelTeamId: site?.vercel_team_id ?? '', vercelProjectId: site?.vercel_project_id ?? '' };
}

/**
 * 渠道归类用的分组：来源主机名 × utm_source（与脚本共用 classify 规则；Vercel 没有 utm_medium 与广告点击 ID，付费流量识别不到）。
 * UTM 维度需要 Web Analytics Plus 或 Enterprise，其他套餐返回 402，这时只按来源主机名归类（只带 utm_source、没有来源的访问算直接访问）。
 */
const ATTR_BY = ['referrerHostname', 'utmSource'];
const ATTR_BY_NO_UTM = ['referrerHostname'];
const ATTR_LIMIT = 100;

interface Attributed {
  channel: string;
  source: string;
  pv: number;
  uv: number;
}

/** 把 Vercel 的来源分组归到渠道；站内跳转（来源是本站域名）算直接访问，"Others" 无法归类，跳过 */
function attribute(rows: VercelGroup[], domain: string): Attributed[] {
  const out: Attributed[] = [];
  for (const r of rows) {
    const host = r.keys.referrerHostname ?? '';
    const utmSource = r.keys.utmSource ?? '';
    if (host === OTHERS || utmSource === OTHERS) continue;
    const ref = host && !originAllowed(`https://${host}`, domain) ? host : '';
    const attr = classify(ref, { source: utmSource, medium: '', campaign: '', term: '', content: '' });
    out.push({ channel: attr.channel, source: attr.source, pv: r.pv, uv: r.uv });
  }
  return out;
}

/** 按名称合并（同一渠道的多个来源相加；同一访客从多个来源进入时会重复计数，这是分组数据能做到的近似） */
function sumBy<T extends { pv: number; uv: number }>(rows: T[], name: (r: T) => string | null) {
  const m = new Map<string, { pv: number; uv: number }>();
  for (const r of rows) {
    const k = name(r);
    if (k === null) continue;
    const cur = m.get(k) ?? { pv: 0, uv: 0 };
    m.set(k, { pv: cur.pv + r.pv, uv: cur.uv + r.uv });
  }
  return m;
}

/** 后台维度 → Vercel 维度。channel / source / ai 由来源分组归类得到；entry、exit、lang 只有脚本有 */
const VERCEL_BY: Record<string, string> = {
  referrer: 'referrerHostname',
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  country: 'country',
  device: 'deviceType',
  browser: 'browserName',
  os: 'osName',
  page: 'requestPath',
  // 路由（如 /blog/[slug]）只有 Vercel 有
  route: 'route',
};
const ATTRIBUTED_DIMS = new Set(['channel', 'source', 'ai']);

/** 一个维度在 [from, to) 内的 Vercel 分组（名称 → 浏览量与访客）；读取失败返回 null */
async function vercelDim(site: SiteInfo, dim: string, from: Date, to: Date): Promise<Map<string, { pv: number; uv: number }> | null> {
  if (ATTRIBUTED_DIMS.has(dim)) {
    let g = await vercelGroups(site, from, to, ATTR_BY, ATTR_LIMIT);
    if (!g.available && g.status === 402) g = await vercelGroups(site, from, to, ATTR_BY_NO_UTM, ATTR_LIMIT);
    if (!g.available) return null;
    const rows = attribute(g.rows, site.domain);
    if (dim === 'channel') return sumBy(rows, (r) => r.channel);
    if (dim === 'source') return sumBy(rows, (r) => (r.source ? r.source : null));
    return sumBy(rows, (r) => (r.channel === 'ai' ? r.source : null));
  }
  const by = VERCEL_BY[dim];
  const g = await vercelGroups(site, from, to, [by], 50);
  if (!g.available) return null;
  return sumBy(g.rows, (r) => {
    const v = r.keys[by];
    if (v === OTHERS) return null;
    if (dim === 'device') return v.toLowerCase();
    if (dim === 'referrer') return v && !originAllowed(`https://${v}`, site.domain) ? v : null;
    if (dim.startsWith('utm_')) return v || null;
    return v;
  });
}

/** AI 助手带来的访客（按来源分组归类后相加） */
async function vercelAiVisitors(site: SiteInfo, from: Date, to: Date): Promise<number | null> {
  const m = await vercelDim(site, 'channel', from, to);
  return m ? (m.get('ai')?.uv ?? 0) : null;
}

/**
 * Vercel 的核心数据：当前周期的总数、每日序列（键为 UTC 日期，与北京时间的日期标签对齐）与 AI 访客，以及上一周期的同类数据。
 * 当前周期超出 Vercel 的查询范围、或总数与序列任一读不到时整体回退到脚本数据，避免两种口径混在一张图里；
 * 上一周期超出范围或读不到时只是不做环比（prev 为 null）。
 */
async function vercelCore(site: SiteInfo, r: Range) {
  if (!vercelEnabled(site)) return { ok: false as const, reason: site.vercelProjectId ? 'no_token' : 'not_configured', detail: null };
  if (!vercelCovers(r.from)) return { ok: false as const, reason: 'out_of_window', detail: null };
  const span = r.buckets * r.step;
  const withPrev = vercelCovers(r.prevFrom);
  // 按天时 Vercel 按 UTC 分天，起点取第一个日期标签的 UTC 零点；按小时时整点在两个时区一致，直接用 from
  const seriesFrom = r.unit === 'day' ? new Date(r.startCN) : r.from;
  const [cur, daily, ai, prev, prevDaily, prevAi] = await Promise.all([
    vercelTotals(site, r.from, r.to),
    vercelSeries(site, seriesFrom, r.to, r.unit),
    vercelAiVisitors(site, r.from, r.to),
    withPrev ? vercelTotals(site, r.prevFrom, r.from) : null,
    withPrev ? vercelSeries(site, new Date(seriesFrom.getTime() - span), new Date(seriesFrom.getTime() - 1), r.unit) : null,
    withPrev ? vercelAiVisitors(site, r.prevFrom, r.from) : null,
  ]);
  if (!cur.available) return { ok: false as const, reason: cur.reason, detail: cur.detail ?? null };
  if (!daily.available) return { ok: false as const, reason: daily.reason, detail: daily.detail ?? null };
  const prevOk = !!prev?.available && !!prevDaily?.available;
  // 分桶键：按天用 UTC 日期（与北京时间的日期标签同名），按小时换成北京时间的整点
  const keyed = (points: { t: number; pv: number; uv: number }[]) =>
    new Map(points.map((x) => [r.unit === 'day' ? bucketKey(x.t, 'day') : bucketKey(x.t + CN_OFFSET_MS, 'hour'), x]));
  return {
    ok: true as const,
    cur,
    daily: keyed(daily.points),
    ai,
    prev: prevOk && prev.available ? prev : null,
    prevDaily: prevOk && prevDaily.available ? keyed(prevDaily.points) : null,
    prevAi,
  };
}

/**
 * 用 Vercel 的访客与浏览量替换脚本的数据；转化率的分母随之换成 Vercel 的访客。
 * 上一周期没有 Vercel 数据时（t 为 null）访客、浏览量、AI 访客与转化率记为 null，页面不做这几项的环比。
 */
function withVercel<T extends Kpis>(k: T, t: { pv: number; uv: number } | null, ai: number | null) {
  if (!t) return { ...k, pv: null, uv: null, aiVisitors: null, conversionRate: null };
  return {
    ...k,
    pv: t.pv,
    uv: t.uv,
    aiVisitors: ai ?? k.aiVisitors,
    conversionRate: t.uv > 0 ? Math.min(1, k.leadVisitors / t.uv) : null,
  };
}

/** GET /api/sites/{id}/stats?days=1|7|30|90：核心指标（当前与上一周期）与趋势序列（days=1 为近 24 小时、按小时）。 */
export const siteStats = withSite(async (req, _u, siteId) => {
  const r = rangeOf(req);
  const args = [siteId, r.prevFrom, r.to];
  const [site, current, previous, visitDays, sessionDays, leadDays] = await Promise.all([
    siteInfo(siteId),
    kpis(siteId, r.from, r.to),
    kpis(siteId, r.prevFrom, r.from),
    query(
      `SELECT ${CN_BUCKET('created_at', r.unit)} AS d, COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv FROM visits
       WHERE site_id = $1 AND created_at >= $2 AND created_at < $3 GROUP BY d`,
      args,
    ),
    query(
      `SELECT ${CN_BUCKET('started_at', r.unit)} AS d, COUNT(*) AS sessions, COUNT(*) FILTER (WHERE ${BOUNCE}) AS bounces,
         COALESCE(SUM(engaged_ms), 0)::float8 AS engaged
       FROM visit_sessions WHERE site_id = $1 AND started_at >= $2 AND started_at < $3 GROUP BY d`,
      args,
    ),
    query(
      `SELECT ${CN_BUCKET('created_at', r.unit)} AS d, COUNT(*) AS n FROM leads WHERE site_id = $1 AND created_at >= $2 AND created_at < $3 GROUP BY d`,
      args,
    ),
  ]);

  const v = await vercelCore(site, r);

  const sm = new Map(sessionDays.map((x) => [x.d, x]));
  const lm = new Map(leadDays.map((x) => [x.d, x.n]));
  const series = (startCN: number, vm: Map<string, { pv: number; uv: number }>) =>
    Array.from({ length: r.buckets }, (_, i) => {
      const date = bucketKey(startCN + i * r.step, r.unit);
      const v = vm.get(date);
      const s = sm.get(date);
      const sessions = s?.sessions ?? 0;
      return {
        date,
        pv: v?.pv ?? 0,
        uv: v?.uv ?? 0,
        leads: lm.get(date) ?? 0,
        sessions,
        bounceRate: rate(s?.bounces ?? 0, sessions),
        avgEngagedMs: sessions > 0 ? Math.round((s?.engaged ?? 0) / sessions) : null,
      };
    });

  const scriptDays = new Map(visitDays.map((x) => [x.d, x]));
  const base = {
    days: r.days,
    // 脚本自己统计的访客与浏览量，Vercel 为准时作对照
    script: { pv: current.pv, uv: current.uv },
    vercelWindowDays: config().vercelWindowDays,
  };
  if (!v.ok) {
    return json({
      ...base,
      source: 'script',
      // 站点关联了 Vercel 却读不到时给出原因（超出查询范围、请求失败等），页面据此提示
      vercelIssue: site.vercelProjectId ? v.reason : null,
      vercelDetail: site.vercelProjectId ? v.detail : null,
      current,
      previous,
      daily: series(r.startCN, scriptDays),
      prevDaily: series(r.startCN - r.buckets * r.step, scriptDays),
    });
  }
  return json({
    ...base,
    source: 'vercel',
    vercelIssue: null,
    vercelDetail: null,
    current: withVercel(current, v.cur, v.ai),
    previous: withVercel(previous, v.prev, v.prevAi),
    daily: series(r.startCN, v.daily),
    // 上一周期没有 Vercel 数据时不给序列，趋势图不叠加上一周期
    prevDaily: v.prevDaily ? series(r.startCN - r.buckets * r.step, v.prevDaily) : [],
  });
});

// ---------- 按维度拆分 ----------

/** 会话维度：白名单映射到列名（SQL 里只拼这些常量），where 是该维度的附加条件 */
const SESSION_DIMS: Record<string, { col: string; where?: string }> = {
  channel: { col: 'channel' },
  source: { col: 'source', where: `source <> ''` },
  ai: { col: 'source', where: `channel = 'ai'` },
  referrer: { col: 'ref_host', where: `ref_host <> ''` },
  utm_source: { col: 'utm_source', where: `utm_source <> ''` },
  utm_medium: { col: 'utm_medium', where: `utm_medium <> ''` },
  utm_campaign: { col: 'utm_campaign', where: `utm_campaign <> ''` },
  country: { col: 'country' },
  device: { col: 'device' },
  browser: { col: 'browser' },
  os: { col: 'os' },
  lang: { col: 'lang' },
  entry: { col: 'entry_path' },
  exit: { col: 'exit_path' },
};

/**
 * 用 Vercel 的分组回答一个维度：访客、浏览量与上一周期访客；dim=page 时再合并脚本统计的平均参与时长。
 * total 是同期 Vercel 的访客总数（用于算占比）。当前周期超出 Vercel 的查询范围或读不到时返回 null，由调用方回退到脚本数据。
 */
async function vercelBreakdown(siteId: number, site: SiteInfo, dim: string, r: Range, limit: number) {
  if (!vercelCovers(r.from)) return null;
  const [cur, prev, totals] = await Promise.all([
    vercelDim(site, dim, r.from, r.to),
    // 上一周期超出 Vercel 的查询范围时不做环比
    vercelCovers(r.prevFrom) ? vercelDim(site, dim, r.prevFrom, r.from) : null,
    vercelTotals(site, r.from, r.to),
  ]);
  if (!cur) return null;
  const top = [...cur.entries()].sort((a, b) => b[1].uv - a[1].uv || b[1].pv - a[1].pv).slice(0, limit);
  const engaged =
    dim === 'page' && top.length
      ? await query(
          `SELECT path, AVG(engaged_ms)::int AS ms FROM visits
           WHERE site_id = $1 AND created_at >= $2 AND created_at < $3 AND session_id <> '' AND path = ANY($4) GROUP BY path`,
          [siteId, r.from, r.to, top.map(([name]) => name)],
        )
      : [];
  const em = new Map(engaged.map((x) => [x.path, x.ms]));
  return {
    dim,
    source: 'vercel',
    total: totals.available ? totals.uv : Math.max(0, ...top.map(([, x]) => x.uv)),
    rows: top.map(([name, x]) => ({
      name,
      visitors: x.uv,
      pageviews: x.pv,
      prevVisitors: prev ? (prev.get(name)?.uv ?? 0) : null,
      avgEngagedMs: dim === 'page' ? (em.get(name) ?? null) : null,
    })),
  };
}

/**
 * GET /api/sites/{id}/stats/breakdown?days=&dim=&limit=
 * Vercel 可用时，来源、国家、页面、设备、UTM 等维度用 Vercel 的分组（source: 'vercel'，只有访客、浏览量与环比）；
 * 否则（以及 entry、exit、lang）用脚本数据：会话维度返回访客、会话、跳出率、平均参与时长与留资会话数；
 * dim=page 按浏览记录返回访客、浏览量与平均参与时长。
 * 每行都带上一周期的访客数（prevVisitors；上一周期含升级前的访问、数据不完整时为 null），
 * total 是该维度范围内的去重访客数（用于算占比）。
 */
export const siteBreakdown = withSite(async (req, _u, siteId) => {
  const r = rangeOf(req);
  const sp = new URL(req.url).searchParams;
  const dim = sp.get('dim') ?? '';
  const limit = Math.min(50, Math.max(1, Number.parseInt(sp.get('limit') ?? '', 10) || 10));

  if (VERCEL_BY[dim] || ATTRIBUTED_DIMS.has(dim)) {
    const site = await siteInfo(siteId);
    if (vercelEnabled(site)) {
      const res = await vercelBreakdown(siteId, site, dim, r, limit);
      if (res) return json(res);
    }
  }

  // 路由只有 Vercel 有：读不到时返回空列表，页面提示原因
  if (dim === 'route') return json({ dim, source: 'script', total: 0, rows: [] });

  if (dim === 'page') {
    const base = `FROM visits WHERE site_id = $1 AND created_at >= $2 AND created_at < $3`;
    const [rows, total] = await Promise.all([
      query(
        `SELECT path AS name, COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS pageviews,
           AVG(engaged_ms) FILTER (WHERE session_id <> '')::int AS avg_engaged
         ${base} GROUP BY path ORDER BY visitors DESC, pageviews DESC LIMIT $4`,
        [siteId, r.from, r.to, limit],
      ),
      queryOne(`SELECT COUNT(DISTINCT visitor_id) AS n ${base}`, [siteId, r.from, r.to]),
    ]);
    const prev = rows.length
      ? await query(
          `SELECT path AS name, COUNT(DISTINCT visitor_id) AS visitors ${base} AND path = ANY($4) GROUP BY path`,
          [siteId, r.prevFrom, r.from, rows.map((x) => x.name)],
        )
      : [];
    const pm = new Map(prev.map((x) => [x.name, x.visitors]));
    return json({
      dim,
      source: 'script',
      total: total?.n ?? 0,
      rows: rows.map((x) => ({
        name: x.name,
        visitors: x.visitors,
        prevVisitors: pm.get(x.name) ?? 0,
        pageviews: x.pageviews,
        avgEngagedMs: x.avg_engaged ?? null,
      })),
    });
  }

  const d = SESSION_DIMS[dim];
  if (!d) return apiError(400, 'bad_request', '不支持的维度');
  const base = `FROM visit_sessions WHERE site_id = $1 AND started_at >= $2 AND started_at < $3${d.where ? ` AND ${d.where}` : ''}`;
  const [rows, total, legacy] = await Promise.all([
    query(
      `SELECT ${d.col} AS name, COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS sessions,
         COUNT(*) FILTER (WHERE ${BOUNCE}) AS bounces, AVG(engaged_ms)::int AS avg_engaged,
         COUNT(*) FILTER (WHERE has_lead) AS leads
       ${base} GROUP BY 1 ORDER BY visitors DESC, sessions DESC LIMIT $4`,
      [siteId, r.from, r.to, limit],
    ),
    queryOne(`SELECT COUNT(DISTINCT visitor_id) AS n ${base}`, [siteId, r.from, r.to]),
    // 上一周期里有升级前（没有会话）的访问时，会话维度的上期数据不完整，不做比较
    queryOne(
      `SELECT EXISTS (SELECT 1 FROM visits WHERE site_id = $1 AND created_at >= $2 AND created_at < $3 AND session_id = '') AS partial`,
      [siteId, r.prevFrom, r.from],
    ),
  ]);
  const prevPartial = !!legacy?.partial;
  const prev = rows.length && !prevPartial
    ? await query(
        `SELECT ${d.col} AS name, COUNT(DISTINCT visitor_id) AS visitors ${base} AND ${d.col} = ANY($4) GROUP BY 1`,
        [siteId, r.prevFrom, r.from, rows.map((x) => x.name)],
      )
    : [];
  const pm = new Map(prev.map((x) => [x.name, x.visitors]));
  return json({
    dim,
    source: 'script',
    total: total?.n ?? 0,
    rows: rows.map((x) => ({
      name: x.name,
      visitors: x.visitors,
      prevVisitors: prevPartial ? null : (pm.get(x.name) ?? 0),
      sessions: x.sessions,
      bounceRate: rate(x.bounces, x.sessions),
      avgEngagedMs: x.avg_engaged ?? 0,
      leads: x.leads,
    })),
  });
});

/**
 * GET /api/sites/{id}/stats/online：当前在线的访客数（采集脚本 5 分钟内有浏览的访客；Vercel 的查询接口不提供实时数据）。
 */
export const siteOnline = withSite(async (_req, _u, siteId) => {
  const row = await queryOne(
    `SELECT COUNT(DISTINCT visitor_id) AS n FROM visit_sessions WHERE site_id = $1 AND started_at > now() - interval '1 day' AND last_at > now() - interval '5 minutes'`,
    [siteId],
  );
  return json({ online: row?.n ?? 0 });
});

/**
 * GET /api/sites/{id}/stats/vercel?days=：Vercel Web Analytics 的同期总数，用于确认 Vercel 是否接通（失败时 available: false 并给出原因）。
 */
export const siteVercel = withSite(async (req, _u, siteId) => {
  const r = rangeOf(req);
  const result = await vercelTotals(await siteInfo(siteId), r.from, r.to);
  return json({ days: r.days, ...result });
});

/**
 * GET /api/sites/{id}/stats/vercel/check：诊断 Vercel 接入（仅管理员）。把数据概览会发出的各类请求不走缓存地逐一发一次，
 * 返回每个请求的状态码与 Vercel 的错误说明（成功时只给行数与字段名），用来定位是令牌、ID、查询范围还是某个参数被拒。
 */
export const siteVercelCheck = withSite(async (_req, user, siteId) => {
  if (user.role !== 'admin') return apiError(404, 'not_found', '接口不存在');
  const site = await siteInfo(siteId);
  if (!site.vercelProjectId) return json({ configured: false, results: [] });
  const now = Date.now();
  const to = new Date(now + 60_000);
  const ago = (ms: number) => new Date(now - ms);
  const h24 = new Date(Math.floor((now - 23 * HOUR_MS) / HOUR_MS) * HOUR_MS);
  const d7 = ago(7 * DAY_MS);
  const probes = [
    vercelProbe(site, '总数 · 近 24 小时', 'count', h24, to),
    vercelProbe(site, '总数 · 近 7 天', 'count', d7, to),
    vercelProbe(site, '总数 · 近 29 天', 'count', ago(29 * DAY_MS), to),
    vercelProbe(site, '总数 · 35 天前起（超出 Hobby 查询范围）', 'count', ago(35 * DAY_MS), to),
    vercelProbe(site, '按天 · 近 7 天（不带 limit）', 'aggregate', d7, to, [['by', 'day']]),
    vercelProbe(site, '按天 · 近 7 天（limit=8）', 'aggregate', d7, to, [['by', 'day'], ['limit', '8']]),
    vercelProbe(site, '按小时 · 近 24 小时（不带 limit）', 'aggregate', h24, to, [['by', 'hour']]),
    vercelProbe(site, '按小时 · 近 24 小时（limit=25）', 'aggregate', h24, to, [['by', 'hour'], ['limit', '25']]),
    vercelProbe(site, '国家 · 近 7 天', 'aggregate', d7, to, [['by', 'country'], ['limit', '50']]),
    vercelProbe(site, '来源 × UTM 来源 · 近 7 天（需 Web Analytics Plus）', 'aggregate', d7, to, [['by', 'referrerHostname'], ['by', 'utmSource'], ['limit', '100']]),
    vercelProbe(site, '来源 · 近 7 天（没有 Plus 时用它归类渠道）', 'aggregate', d7, to, [['by', 'referrerHostname'], ['limit', '100']]),
    vercelProbe(site, 'UTM 活动 · 近 7 天（需 Web Analytics Plus）', 'aggregate', d7, to, [['by', 'utmCampaign'], ['limit', '50']]),
    vercelProbe(site, '页面 · 近 7 天', 'aggregate', d7, to, [['by', 'requestPath'], ['limit', '50']]),
    vercelProbe(site, '路由 · 近 7 天', 'aggregate', d7, to, [['by', 'route'], ['limit', '50']]),
  ];
  return json({
    configured: true,
    teamId: site.vercelTeamId,
    projectId: site.vercelProjectId,
    windowDays: config().vercelWindowDays,
    results: await Promise.all(probes),
  });
});
