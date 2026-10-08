/**
 * 客户后台的访问分析：核心指标（含上一周期对比）、每日趋势与按维度拆分。全部经 withSite 校验站点权限。
 *
 * 口径：访客按 visitor_id 去重；会话 30 分钟无操作即结束；跳出 = 只看 1 页、参与时长不到 10 秒且没有留资的会话；
 * 留资转化率 = 留下线索的访客 ÷ 访客。升级前的访问没有会话，只计入访客与浏览量。
 */
import { query, queryOne } from '../db';
import { apiError, json } from '../http';
import { CN_OFFSET_MS, withSite } from './analytics';

const DAY_MS = 24 * 3600 * 1000;
const CN_DAY = (col: string) => `to_char(${col} AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')`;
const BOUNCE = `pageviews = 1 AND engaged_ms < 10000 AND NOT has_lead`;

interface Range {
  days: number;
  /** 当前周期起点（北京时间的零点，换成 UTC） */
  from: Date;
  to: Date;
  /** 上一周期：紧挨着当前周期、等长 */
  prevFrom: Date;
  /** 当前周期第一天的北京时间零点（毫秒，按 UTC 表示），用于生成日期序列 */
  startCN: number;
}

function rangeOf(req: Request): Range {
  const d = Number(new URL(req.url).searchParams.get('days'));
  const days = d === 7 || d === 30 || d === 90 ? d : 7;
  const nowCN = Date.now() + CN_OFFSET_MS;
  const startCN = Math.floor(nowCN / DAY_MS) * DAY_MS - (days - 1) * DAY_MS;
  const from = new Date(startCN - CN_OFFSET_MS);
  return { days, from, to: new Date(Date.now() + 60_000), prevFrom: new Date(from.getTime() - days * DAY_MS), startCN };
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
    conversionRate: uv > 0 ? Math.min(1, (l?.lead_visitors ?? 0) / uv) : null,
  };
}

/** GET /api/sites/{id}/stats?days=7|30|90：核心指标（当前与上一周期）与每日序列。 */
export const siteStats = withSite(async (req, _u, siteId) => {
  const r = rangeOf(req);
  const args = [siteId, r.prevFrom, r.to];
  const [current, previous, visitDays, sessionDays, leadDays] = await Promise.all([
    kpis(siteId, r.from, r.to),
    kpis(siteId, r.prevFrom, r.from),
    query(
      `SELECT ${CN_DAY('created_at')} AS d, COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv FROM visits
       WHERE site_id = $1 AND created_at >= $2 AND created_at < $3 GROUP BY d`,
      args,
    ),
    query(
      `SELECT ${CN_DAY('started_at')} AS d, COUNT(*) AS sessions, COUNT(*) FILTER (WHERE ${BOUNCE}) AS bounces,
         COALESCE(SUM(engaged_ms), 0)::float8 AS engaged
       FROM visit_sessions WHERE site_id = $1 AND started_at >= $2 AND started_at < $3 GROUP BY d`,
      args,
    ),
    query(
      `SELECT ${CN_DAY('created_at')} AS d, COUNT(*) AS n FROM leads WHERE site_id = $1 AND created_at >= $2 AND created_at < $3 GROUP BY d`,
      args,
    ),
  ]);

  const vm = new Map(visitDays.map((x) => [x.d, x]));
  const sm = new Map(sessionDays.map((x) => [x.d, x]));
  const lm = new Map(leadDays.map((x) => [x.d, x.n]));
  const series = (startCN: number) =>
    Array.from({ length: r.days }, (_, i) => {
      const date = new Date(startCN + i * DAY_MS).toISOString().slice(0, 10);
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

  return json({
    days: r.days,
    current,
    previous,
    daily: series(r.startCN),
    prevDaily: series(r.startCN - r.days * DAY_MS),
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
 * GET /api/sites/{id}/stats/breakdown?days=&dim=&limit=
 * 会话维度返回访客、会话、跳出率、平均参与时长与留资会话数；dim=page 按浏览记录返回访客、浏览量与平均参与时长。
 * 每行都带上一周期的访客数（prevVisitors；上一周期含升级前的访问、数据不完整时为 null），
 * total 是该维度范围内的去重访客数（用于算占比）。
 */
export const siteBreakdown = withSite(async (req, _u, siteId) => {
  const r = rangeOf(req);
  const sp = new URL(req.url).searchParams;
  const dim = sp.get('dim') ?? '';
  const limit = Math.min(50, Math.max(1, Number.parseInt(sp.get('limit') ?? '', 10) || 10));

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
