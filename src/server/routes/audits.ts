/**
 * /api/public/audits：AI 可见性测评（首页）。POST 创建异步任务，GET 轮询进度与报告。
 * 测评必须填写联系人姓名与手机号，每次提交都写入 audit_contacts 与官网的线索（leads），因此依赖数据库。
 */
import { after } from 'next/server';
import { auditProbeCount, runAudit } from '../audit';
import { parseAuditInput } from '../auditSite';
import { auditStore, withStale, type AuditJob } from '../auditStore';
import { config } from '../config';
import { activeEngines, engineSignature } from '../engines';
import { apiError, clientIP, clip, json, readJSON, route, str, userAgent } from '../http';
import { currentUser, randomHex } from '../auth';
import { hit, limits } from '../ratelimit';
import { db, exec, queryOne } from '../db';
import { parseContact } from '../../lib/contact';
import { ANALYTICS_SITE_KEY } from '../../lib/site';

const AUDIT_ID_RE = /^[0-9a-f]{32}$/;

/** 测评是从哪个页面提交的（首页 # 区块或 /audit），取 Referer 的路径写进线索的来源页面 */
function sourcePageOf(req: Request): string {
  try {
    return clip(new URL(req.headers.get('referer') ?? '').pathname, 512);
  } catch {
    return '';
  }
}

const jobJSON = (j: AuditJob) => ({
  id: j.id,
  status: j.status,
  step: j.step,
  done: j.done,
  total: j.total,
  engines: j.engines,
  log: j.log,
  error: j.error,
  report: j.report,
});

export const createAudit = route(async (req) => {
  const body = await readJSON(req);
  // 蜜罐字段，真人看不到
  if (str(body.website)) return apiError(400, 'bad_request', '请求无效');
  const input = parseAuditInput(str(body.target));
  if (!input) return apiError(400, 'bad_target', '请输入官网域名或品牌名称，例如 www.example.com 或 爱康医疗');
  const contact = parseContact(str(body.contactName), str(body.contactPhone));
  if (!contact.ok) return apiError(400, 'bad_contact', contact.message);
  if (!db()) return apiError(503, 'db_unavailable', '测评服务暂未开放，请稍后再试，或直接预约诊断会');
  // 登录的客户不受每小时次数、当日名额与 24 小时复用的限制，每次都重新测评
  const unlimited = (await currentUser(req)) !== null;
  if (!unlimited && !(await limits.audit(clientIP(req)))) return apiError(429, 'rate_limited', '测评次数过多，请一小时后再试');

  const { domain, brand } = input;
  // 联系方式每次提交都入库，包括复用已有报告的提交
  await exec('INSERT INTO audit_contacts (target, contact_name, contact_phone) VALUES ($1, $2, $3)', [
    domain || brand,
    contact.name,
    contact.phone,
  ]);
  // 同时进入官网的线索管理。官网站点未登记时不写入（测评照常进行）
  const official = await queryOne(`SELECT id FROM sites WHERE site_key = $1`, [ANALYTICS_SITE_KEY]);
  if (official) {
    await exec(
      `INSERT INTO leads (site_id, name, phone, message, source_page, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        official.id,
        contact.name,
        contact.phone,
        clip(`AI 可见性测评：${domain || brand}`, 2000),
        sourcePageOf(req),
        clientIP(req),
        clip(userAgent(req), 255),
      ],
    );
  }

  const key = domain ? domain.replace(/^www\./, '') : 'brand:' + brand.toLowerCase();
  const engines = activeEngines();
  const store = auditStore();

  // 24 小时内测过的目标直接读库返回（登录的客户跳过，每次都重新测）
  const cached = unlimited ? null : await store.findCached(key, engineSignature(engines));
  if (cached) return json({ id: cached, cached: true });

  // 同一目标正在测评时，合并到同一个任务；否则按本次要发出的探测数占用当日（UTC）额度后创建
  const id = randomHex(16);
  const res = await store.create(id, key);
  if (!res.created) return json({ id: res.id }, 202);
  if (!unlimited && engines.length > 0) {
    const day = new Date().toISOString().slice(0, 10);
    if ((await hit(`audit_budget:${day}`, 86_400, auditProbeCount(engines.length))) > config().auditDailyLimit) {
      await store.fail(id, '今日免费测评名额已用完');
      return apiError(429, 'budget_exhausted', '今日免费测评名额已用完，请明天再试，或预约诊断会');
    }
  }

  // 响应先返回，测评在同一次函数调用里继续执行（Vercel 上由 waitUntil 托管，受 maxDuration 限制）
  after(() => runAudit(id, domain, brand, engines));
  return json({ id }, 202);
});

export const getAudit = route(async (_req, ctx) => {
  const { id } = await ctx.params;
  if (!AUDIT_ID_RE.test(id ?? '')) return apiError(404, 'not_found', '测评不存在或已过期');
  const found = await auditStore().get(id);
  if (!found) return apiError(404, 'not_found', '测评不存在或已过期');
  return json(jobJSON(withStale(found)));
});
