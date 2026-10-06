/**
 * 客户数据：其他网站经公开接口写入的访问记录与线索，以及客户后台的统计、线索查看与导出。
 * 公开接口靠公开的 site_key 识别站点；客户接口全部经 withSite 校验（管理员或 site_members），越权一律 404。
 */
import type { NextRequest } from 'next/server';
import { db, exec, query, queryOne } from '../db';
import { apiError, clientIP, clip, dbUnavailable, json, pathID, readJSON, route, str, userAgent } from '../http';
import { limits } from '../ratelimit';
import { authed, normalizeEmail, siteAccess, type AuthedUser } from '../auth';

// ---------- 站点识别与跨域 ----------

const SITE_KEY_RE = /^sk_[0-9a-f]{24}$/;
const VISITOR_RE = /^[A-Za-z0-9_-]{8,40}$/;
const PHONE_RE = /^[0-9+\-() ]{6,32}$/;

async function siteByKey(key: string): Promise<{ id: number; domain: string } | null> {
  if (!SITE_KEY_RE.test(key)) return null;
  return queryOne(`SELECT id, domain FROM sites WHERE site_key = $1`, [key]);
}

function hostnameOf(raw: string): string {
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/** Origin 的主机必须是站点域名本身、其子域名，或 www 与裸域互换。 */
export function originAllowed(origin: string, domain: string): boolean {
  const h = hostnameOf(origin);
  if (!h) return false;
  const bare = domain.replace(/^www\./, '');
  return h === domain || h === bare || h.endsWith('.' + bare);
}

/**
 * 公开接口的跨域：有 Origin 时必须匹配站点域名（服务端到服务端调用没有 Origin，放行）。
 * 返回要附加的响应头；来源不匹配时返回 null。
 */
function publicCORS(req: Request, domain: string): Record<string, string> | null {
  const origin = req.headers.get('origin');
  if (!origin) return {};
  if (!originAllowed(origin, domain)) return null;
  return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' };
}

/** 预检请求不带站点信息，只声明允许的方法与头；真正的请求仍会校验来源。 */
export async function publicPreflight(req: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': req.headers.get('origin') ?? '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  });
}

function deviceOf(ua: string): 'desktop' | 'mobile' | 'tablet' {
  const s = ua.toLowerCase();
  if (s.includes('ipad') || s.includes('tablet')) return 'tablet';
  if (s.includes('mobi') || s.includes('android') || s.includes('iphone')) return 'mobile';
  return 'desktop';
}

// ---------- 公开接口：访问采集 ----------

/** 接收浏览器脚本上报的页面浏览。用 text/plain 也能解析，方便 sendBeacon 免预检。 */
export const collect = route(async (req) => {
  if (!db()) return dbUnavailable();
  const body = await readJSON(req);
  const site = await siteByKey(str(body.siteKey));
  if (!site) return apiError(404, 'unknown_site', '站点标识无效');
  const cors = publicCORS(req, site.domain);
  if (!cors) return apiError(403, 'origin_not_allowed', '来源域名与站点不匹配');
  if (!(await limits.collect(clientIP(req)))) return apiError(429, 'rate_limited', '请求过于频繁', cors);
  const visitor = str(body.visitorId);
  if (!VISITOR_RE.test(visitor)) return apiError(400, 'bad_request', 'visitorId 格式不正确', cors);

  let path = clip(str(body.path), 512);
  if (!path.startsWith('/')) path = clip('/' + path, 512);
  const referrer = str(body.referrer);
  const refHost = hostnameOf(referrer);
  // 站外来源只存主机名；站内跳转不算来源
  const ref = refHost && !originAllowed(referrer, site.domain) ? clip(refHost, 255) : '';
  await exec(`INSERT INTO visits (site_id, visitor_id, path, referrer, device) VALUES ($1, $2, $3, $4, $5)`, [
    site.id,
    visitor,
    path,
    ref,
    deviceOf(userAgent(req)),
  ]);
  return new Response(null, { status: 204, headers: cors });
});

// ---------- 公开接口：提交线索 ----------

export const submitLead = route(async (req) => {
  if (!db()) return dbUnavailable();
  const body = await readJSON(req);
  const site = await siteByKey(str(body.siteKey));
  if (!site) return apiError(404, 'unknown_site', '站点标识无效');
  const cors = publicCORS(req, site.domain);
  if (!cors) return apiError(403, 'origin_not_allowed', '来源域名与站点不匹配');
  if (!(await limits.lead(clientIP(req)))) return apiError(429, 'rate_limited', '提交过于频繁，请稍后再试', cors);
  // 蜜罐：真人看不见，机器人会填。命中时假装成功，不入库
  if (str(body.website)) return json({ ok: true }, 201, cors);

  const phone = str(body.phone).trim();
  const email = str(body.email).trim().toLowerCase();
  if (!phone && !email) return apiError(400, 'bad_request', '请至少留下手机号或邮箱', cors);
  if (phone && !PHONE_RE.test(phone)) return apiError(400, 'bad_request', '手机号格式不正确', cors);
  if (email && normalizeEmail(email) !== email) return apiError(400, 'bad_request', '邮箱格式不正确', cors);
  const visitor = VISITOR_RE.test(str(body.visitorId)) ? str(body.visitorId) : '';

  const row = await queryOne(
    `INSERT INTO leads (site_id, name, phone, email, company, message, source_page, visitor_id, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [
      site.id,
      clip(str(body.name), 64),
      phone,
      email,
      clip(str(body.company), 128),
      clip(str(body.message), 2000),
      clip(str(body.sourcePage), 512),
      visitor,
      clientIP(req),
      clip(userAgent(req), 255),
    ],
  );
  return json({ ok: true, id: row.id }, 201, cors);
});

// ---------- 客户接口：统计与线索（均经 site_members 隔离） ----------

type SiteHandler = (req: NextRequest, user: AuthedUser, siteId: number, params: Record<string, string>) => Promise<Response>;

/** 包装 /api/sites/{id}/...：统一做站点权限检查（无权限一律 404，不泄露站点是否存在）。 */
function withSite(fn: SiteHandler) {
  return authed({}, async (req, user, params) => {
    const id = pathID(params.id);
    if (!id || !(await siteAccess(user, id))) return apiError(404, 'not_found', '站点不存在');
    return fn(req, user, id, params);
  });
}

// 统计按北京时间（UTC+8）分天。
const CN_OFFSET_MS = 8 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;
const CN_DAY = `to_char(created_at AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')`;

export const siteStats = withSite(async (req, _u, siteId) => {
  const d = Number(req.nextUrl.searchParams.get('days'));
  const days = d === 7 || d === 30 || d === 90 ? d : 7;
  const nowCN = Date.now() + CN_OFFSET_MS;
  const startCN = Math.floor(nowCN / DAY_MS) * DAY_MS - (days - 1) * DAY_MS;
  const since = new Date(startCN - CN_OFFSET_MS); // 换回 UTC 用于查询
  const args = [siteId, since];

  const [totals, leadTotals, visitDays, leadDays, topPages, topReferrers, devices] = await Promise.all([
    queryOne(`SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv FROM visits WHERE site_id = $1 AND created_at >= $2`, args),
    queryOne(
      `SELECT COUNT(*) AS leads, COUNT(*) FILTER (WHERE status = 'new') AS new_leads FROM leads WHERE site_id = $1 AND created_at >= $2`,
      args,
    ),
    query(
      `SELECT ${CN_DAY} AS d, COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv FROM visits
       WHERE site_id = $1 AND created_at >= $2 GROUP BY d`,
      args,
    ),
    query(`SELECT ${CN_DAY} AS d, COUNT(*) AS n FROM leads WHERE site_id = $1 AND created_at >= $2 GROUP BY d`, args),
    query(
      `SELECT path AS name, COUNT(*) AS count FROM visits WHERE site_id = $1 AND created_at >= $2
       GROUP BY path ORDER BY count DESC LIMIT 8`,
      args,
    ),
    query(
      `SELECT referrer AS name, COUNT(*) AS count FROM visits WHERE site_id = $1 AND created_at >= $2 AND referrer <> ''
       GROUP BY referrer ORDER BY count DESC LIMIT 8`,
      args,
    ),
    query(
      `SELECT device AS name, COUNT(*) AS count FROM visits WHERE site_id = $1 AND created_at >= $2
       GROUP BY device ORDER BY count DESC`,
      args,
    ),
  ]);

  const visitMap = new Map(visitDays.map((r) => [r.d, r]));
  const leadMap = new Map(leadDays.map((r) => [r.d, r.n]));
  const daily = Array.from({ length: days }, (_, i) => {
    const date = new Date(startCN + i * DAY_MS).toISOString().slice(0, 10);
    const v = visitMap.get(date);
    return { date, pv: v?.pv ?? 0, uv: v?.uv ?? 0, leads: leadMap.get(date) ?? 0 };
  });

  return json({
    days,
    pv: totals?.pv ?? 0,
    uv: totals?.uv ?? 0,
    leads: leadTotals?.leads ?? 0,
    newLeads: leadTotals?.new_leads ?? 0,
    daily,
    topPages,
    topReferrers,
    devices,
  });
});

const LEAD_STATUSES = new Set(['new', 'contacted', 'qualified', 'closed', 'invalid']);
const LEAD_COLS = `id, name, phone, email, company, message, source_page, status, note, created_at`;

const leadJSON = (r: any) => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  email: r.email,
  company: r.company,
  message: r.message,
  sourcePage: r.source_page,
  status: r.status,
  note: r.note,
  createdAt: r.created_at,
});

export const siteLeads = withSite(async (req, _u, siteId) => {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number.parseInt(sp.get('page') ?? '', 10) || 1);
  const size = 20;
  let where = `site_id = $1`;
  const args: unknown[] = [siteId];
  const status = sp.get('status');
  if (status) {
    if (!LEAD_STATUSES.has(status)) return apiError(400, 'bad_request', '无效的状态');
    where += ` AND status = $2`;
    args.push(status);
  }
  const total = await queryOne(`SELECT COUNT(*) AS n FROM leads WHERE ${where}`, args);
  const rows = await query(
    `SELECT ${LEAD_COLS} FROM leads WHERE ${where} ORDER BY id DESC LIMIT ${size} OFFSET $${args.length + 1}`,
    [...args, (page - 1) * size],
  );
  return json({ leads: rows.map(leadJSON), total: total?.n ?? 0, page, pageSize: size });
});

export const updateLead = withSite(async (req, _u, siteId, params) => {
  const leadId = pathID(params.leadId);
  if (!leadId) return apiError(404, 'not_found', '线索不存在');
  const body = await readJSON(req);
  const status = typeof body.status === 'string' ? body.status : undefined;
  const note = typeof body.note === 'string' ? body.note : undefined;
  if (status !== undefined && !LEAD_STATUSES.has(status)) return apiError(400, 'bad_request', '无效的状态');
  if (status === undefined && note === undefined) return apiError(400, 'bad_request', '没有要修改的内容');

  const sets = ['updated_at = now()'];
  const args: unknown[] = [];
  if (status !== undefined) {
    args.push(status);
    sets.push(`status = $${args.length}`);
  }
  if (note !== undefined) {
    args.push(clip(note, 1000));
    sets.push(`note = $${args.length}`);
  }
  // site_id 条件保证只能改本站点的线索
  args.push(leadId, siteId);
  const n = await exec(
    `UPDATE leads SET ${sets.join(', ')} WHERE id = $${args.length - 1} AND site_id = $${args.length}`,
    args,
  );
  if (n === 0) return apiError(404, 'not_found', '线索不存在');
  return json({ ok: true });
});

/** 防 CSV 公式注入：访客可控的文本以 = + - @ 开头时加前缀单引号。 */
const csvSafe = (s: string) => (s && '=+-@\t\r'.includes(s[0]) ? "'" + s : s);

function csvField(s: string) {
  return /[",\r\n]/.test(s) || /^[ \t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const cnTime = (d: Date) => new Date(d.getTime() + CN_OFFSET_MS).toISOString().slice(0, 19).replace('T', ' ');

/** 导出全部线索为 CSV（UTF-8 带 BOM，Excel 直接打开不乱码）。 */
export const exportLeads = withSite(async (_req, _u, siteId) => {
  const rows = await query(`SELECT ${LEAD_COLS} FROM leads WHERE site_id = $1 ORDER BY id DESC LIMIT 50000`, [siteId]);
  const lines = [['时间(北京)', '姓名', '手机', '邮箱', '公司', '留言', '来源页面', '状态', '备注']];
  for (const r of rows) {
    lines.push([
      cnTime(r.created_at),
      csvSafe(r.name),
      csvSafe(r.phone),
      csvSafe(r.email),
      csvSafe(r.company),
      csvSafe(r.message),
      csvSafe(r.source_page),
      r.status,
      csvSafe(r.note),
    ]);
  }
  const body = '﻿' + lines.map((l) => l.map(csvField).join(',')).join('\n') + '\n';
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="leads.csv"',
    },
  });
});
