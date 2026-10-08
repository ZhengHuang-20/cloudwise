/**
 * 客户数据：其他网站经公开接口写入的访问记录与线索，以及客户后台的统计、线索查看与导出。
 * 公开接口靠公开的 site_key 识别站点；客户接口全部经 withSite 校验（管理员或 site_members），越权一律 404。
 */
import { randomBytes } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { CHANNEL_LABEL } from '../../lib/channels';
import { classify, parseCampaign } from '../channels';
import { db, exec, query, queryOne } from '../db';
import { apiError, clientIP, clip, json, pathID, readJSON, route, str, userAgent } from '../http';
import { limits } from '../ratelimit';
import { authed, normalizeEmail, siteAccess, type AuthedUser } from '../auth';
import { browserOf, deviceOf, isBot, normalizeLang, osOf } from '../useragent';

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

/** 来源校验前就失败的错误响应也带上跨域头，嵌入脚本才能读到原因（只是一段错误说明，不涉及凭据）。 */
function errorCORS(req: Request): Record<string, string> {
  return { 'Access-Control-Allow-Origin': req.headers.get('origin') ?? '*', Vary: 'Origin' };
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

/** 访客所在国家与省 / 州代码：Vercel 按 IP 写入的请求头（客户端无法伪造），本地开发时为空。只存代码，不存 IP。 */
function geoOf(req: Request): { country: string; region: string } {
  const c = (req.headers.get('x-vercel-ip-country') ?? '').toUpperCase();
  const r = (req.headers.get('x-vercel-ip-country-region') ?? '').toUpperCase();
  const country = /^[A-Z]{2}$/.test(c) && c !== 'XX' ? c : '';
  return { country, region: country && /^[A-Z0-9]{1,3}$/.test(r) ? r : '' };
}

/** 拆分上报的页面地址：入库的路径去掉查询串与锚点（同一页面不被参数拆散，也不记下地址里的敏感参数），查询串只用来取 UTM。 */
function splitPath(raw: string): { path: string; search: URLSearchParams } {
  let url: URL;
  try {
    url = new URL(raw.startsWith('/') ? raw : '/' + raw, 'http://x');
  } catch {
    return { path: '/', search: new URLSearchParams() };
  }
  return { path: clip(url.pathname, 512) || '/', search: url.searchParams };
}

const MAX_ENGAGED_MS = 30 * 60 * 1000;

// ---------- 公开接口：访问采集 ----------

/**
 * 接收浏览器脚本上报的页面浏览（type 缺省）与参与时长补报（type: 'engage'）。
 * 用 text/plain 也能解析，方便 sendBeacon 免预检。爬虫与自动化工具的请求照常返回 204，但不入库。
 */
export const collect = route(async (req) => {
  if (!db()) return apiError(503, 'db_unavailable', '数据库未配置', errorCORS(req));
  const body = await readJSON(req);
  const site = await siteByKey(str(body.siteKey));
  if (!site) return apiError(404, 'unknown_site', '站点标识无效', errorCORS(req));
  const cors = publicCORS(req, site.domain);
  if (!cors) return apiError(403, 'origin_not_allowed', `来源域名与站点不匹配（站点登记的域名是 ${site.domain}）`, errorCORS(req));
  if (!(await limits.collect(clientIP(req)))) return apiError(429, 'rate_limited', '请求过于频繁', cors);
  const visitor = str(body.visitorId);
  if (!VISITOR_RE.test(visitor)) return apiError(400, 'bad_request', 'visitorId 格式不正确', cors);

  const done = () => new Response(null, { status: 204, headers: cors });
  const ua = userAgent(req);
  if (isBot(ua) || body.webdriver === true) return done();
  const { path, search } = splitPath(str(body.path));
  let session = VISITOR_RE.test(str(body.sessionId)) ? str(body.sessionId) : '';

  if (body.type === 'engage') {
    if (!session) return done();
    const ms = Math.min(MAX_ENGAGED_MS, Math.max(0, Math.round(Number(body.engagedMs) || 0)));
    const scroll = Math.min(100, Math.max(0, Math.round(Number(body.scroll) || 0)));
    await exec(
      `WITH v AS (
         UPDATE visits SET engaged_ms = engaged_ms + $5, scroll_pct = GREATEST(scroll_pct, $6)
         WHERE id = (SELECT id FROM visits WHERE site_id = $1 AND session_id = $2 AND visitor_id = $3 AND path = $4 ORDER BY id DESC LIMIT 1)
       )
       UPDATE visit_sessions SET engaged_ms = engaged_ms + $5, last_at = now() WHERE site_id = $1 AND session_id = $2 AND visitor_id = $3`,
      [site.id, session, visitor, path, ms, scroll],
    );
    return done();
  }

  // 旧版脚本不带会话 ID：沿用该访客 30 分钟内的会话，没有就新开一个
  if (!session) {
    const recent = await queryOne(
      `SELECT session_id FROM visit_sessions WHERE site_id = $1 AND visitor_id = $2 AND last_at > now() - interval '30 minutes'
       ORDER BY last_at DESC LIMIT 1`,
      [site.id, visitor],
    );
    session = recent?.session_id ?? 'sv' + randomBytes(12).toString('hex');
  }

  const referrer = str(body.referrer);
  const refHost = hostnameOf(referrer);
  // 站外来源只存主机名；站内跳转不算来源
  const ref = refHost && !originAllowed(referrer, site.domain) ? clip(refHost, 255) : '';
  const { utm, clickSource } = parseCampaign(search);
  const attr = classify(ref, utm, clickSource);
  const geo = geoOf(req);
  const device = deviceOf(ua);
  // 浏览记录与会话一起写：会话已存在时只累加页数、更新退出页（来源、地区、设备以会话的第一个页面为准）
  await exec(
    `WITH v AS (
       INSERT INTO visits (site_id, visitor_id, path, referrer, device, session_id) VALUES ($1, $2, $3, $4, $5, $6)
     )
     INSERT INTO visit_sessions (site_id, session_id, visitor_id, is_new_visitor, entry_path, exit_path, channel, source, ref_host,
       utm_source, utm_medium, utm_campaign, utm_term, utm_content, country, region, device, browser, os, lang)
     VALUES ($1, $6, $2, $7, $3, $3, $8, $9, $4, $10, $11, $12, $13, $14, $15, $16, $5, $17, $18, $19)
     ON CONFLICT (site_id, session_id) DO UPDATE SET
       pageviews = visit_sessions.pageviews + 1, exit_path = EXCLUDED.exit_path, last_at = now()`,
    [
      site.id,
      visitor,
      path,
      ref,
      device,
      session,
      body.newVisitor === true,
      attr.channel,
      clip(attr.source, 128),
      utm.source,
      utm.medium,
      utm.campaign,
      utm.term,
      utm.content,
      geo.country,
      geo.region,
      browserOf(ua),
      osOf(ua),
      normalizeLang(str(body.lang)),
    ],
  );
  return done();
});

// ---------- 公开接口：提交线索 ----------

export const submitLead = route(async (req) => {
  if (!db()) return apiError(503, 'db_unavailable', '数据库未配置', errorCORS(req));
  const body = await readJSON(req);
  const site = await siteByKey(str(body.siteKey));
  if (!site) return apiError(404, 'unknown_site', '站点标识无效', errorCORS(req));
  const cors = publicCORS(req, site.domain);
  if (!cors) return apiError(403, 'origin_not_allowed', `来源域名与站点不匹配（站点登记的域名是 ${site.domain}）`, errorCORS(req));
  if (!(await limits.lead(clientIP(req)))) return apiError(429, 'rate_limited', '提交过于频繁，请稍后再试', cors);
  // 蜜罐：真人看不见，机器人会填。命中时假装成功，不入库
  if (str(body.website)) return json({ ok: true }, 201, cors);

  const phone = str(body.phone).trim();
  const email = str(body.email).trim().toLowerCase();
  if (!phone && !email) return apiError(400, 'bad_request', '请至少留下手机号或邮箱', cors);
  if (phone && !PHONE_RE.test(phone)) return apiError(400, 'bad_request', '手机号格式不正确', cors);
  if (email && normalizeEmail(email) !== email) return apiError(400, 'bad_request', '邮箱格式不正确', cors);
  const visitor = VISITOR_RE.test(str(body.visitorId)) ? str(body.visitorId) : '';
  const session = VISITOR_RE.test(str(body.sessionId)) ? str(body.sessionId) : '';

  // 来源归因：留资所在的会话不是直接访问时就用它；否则取最近 90 天内最近一次非直接访问的会话，都没有时取最近一次会话
  const attr = visitor
    ? await queryOne(
        `SELECT channel, source, utm_campaign, entry_path, country FROM visit_sessions
         WHERE site_id = $1 AND visitor_id = $2 AND started_at > now() - interval '90 days'
         ORDER BY (session_id = $3 AND channel <> 'direct') DESC, (channel <> 'direct') DESC, started_at DESC LIMIT 1`,
        [site.id, visitor, session],
      )
    : null;
  // 国家优先按本次请求判断；服务端调用（没有 Origin）的 IP 是对方服务器的，不能用
  const country = (req.headers.get('origin') ? geoOf(req).country : '') || attr?.country || '';

  const row = await queryOne(
    `INSERT INTO leads (site_id, name, phone, email, company, message, source_page, visitor_id, ip, user_agent,
       channel, source, utm_campaign, landing_path, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
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
      attr?.channel ?? '',
      attr?.source ?? '',
      attr?.utm_campaign ?? '',
      attr?.entry_path ?? '',
      country,
    ],
  );
  // 标记留资的会话（脚本带了会话 ID 就用它，否则取该访客最近一次会话），用于按渠道、页面统计转化
  if (visitor) {
    await exec(
      session
        ? `UPDATE visit_sessions SET has_lead = true WHERE site_id = $1 AND visitor_id = $2 AND session_id = $3`
        : `UPDATE visit_sessions SET has_lead = true
           WHERE id = (SELECT id FROM visit_sessions WHERE site_id = $1 AND visitor_id = $2 ORDER BY last_at DESC LIMIT 1)`,
      session ? [site.id, visitor, session] : [site.id, visitor],
    );
  }
  return json({ ok: true, id: row.id }, 201, cors);
});

// ---------- 客户接口：统计与线索（均经 site_members 隔离） ----------

type SiteHandler = (req: NextRequest, user: AuthedUser, siteId: number, params: Record<string, string>) => Promise<Response>;

/** 包装 /api/sites/{id}/...：统一做站点权限检查（无权限一律 404，不泄露站点是否存在）。 */
export function withSite(fn: SiteHandler) {
  return authed({}, async (req, user, params) => {
    const id = pathID(params.id);
    if (!id || !(await siteAccess(user, id))) return apiError(404, 'not_found', '站点不存在');
    return fn(req, user, id, params);
  });
}

// 统计按北京时间（UTC+8）分天，分析接口见 stats.ts。
export const CN_OFFSET_MS = 8 * 3600 * 1000;

const LEAD_STATUSES = new Set(['new', 'contacted', 'qualified', 'closed', 'invalid']);
const LEAD_COLS = `id, name, phone, email, company, message, source_page, status, note, created_at,
  channel, source, utm_campaign, landing_path, country`;

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
  channel: r.channel,
  source: r.source,
  utmCampaign: r.utm_campaign,
  landingPath: r.landing_path,
  country: r.country,
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
    args.push(status);
    where += ` AND status = $${args.length}`;
  }
  // 关键词：姓名、手机、邮箱、公司、留言模糊匹配（转义 LIKE 通配符）
  const q = (sp.get('q') ?? '').trim().slice(0, 64);
  if (q) {
    args.push(`%${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`);
    const p = `$${args.length}`;
    where += ` AND (name ILIKE ${p} OR phone ILIKE ${p} OR email ILIKE ${p} OR company ILIKE ${p} OR message ILIKE ${p})`;
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
  const lines = [['时间(北京)', '姓名', '手机', '邮箱', '公司', '留言', '来源页面', '状态', '备注', '来源渠道', '来源', 'UTM 活动', '落地页', '国家/地区']];
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
      CHANNEL_LABEL[r.channel] ?? '',
      csvSafe(r.source),
      csvSafe(r.utm_campaign),
      csvSafe(r.landing_path),
      r.country,
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
