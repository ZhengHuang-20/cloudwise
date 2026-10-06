/**
 * /api/public/audits：AI 可见性测评（首页）。POST 创建异步任务，GET 轮询进度与报告。
 * 未配置数据库时 POST 直接返回完整结果（见 finishInline）。
 */
import { after } from 'next/server';
import { runAudit } from '../audit';
import { parseAuditInput } from '../auditSite';
import { auditStore, withStale, type AuditJob } from '../auditStore';
import { config } from '../config';
import { activeEngines, engineSignature } from '../engines';
import { apiError, clientIP, json, readJSON, route, str } from '../http';
import { randomHex } from '../auth';
import { hit, limits } from '../ratelimit';
import { db } from '../db';
import { sleep } from '../gemini';

const AUDIT_ID_RE = /^[0-9a-f]{32}$/;

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

/**
 * 未配置数据库时任务只存在本实例的内存里，而 Vercel 会把轮询请求分到别的实例，轮询会 404。
 * 所以这种情况下在本次请求里等任务结束，把结果直接放在 POST 的响应里返回（前端收到 report 就不再轮询）。
 */
async function finishInline(id: string): Promise<Response> {
  const store = auditStore();
  for (;;) {
    const j = await store.get(id);
    if (!j) return apiError(404, 'not_found', '测评不存在或已过期');
    const cur = withStale(j);
    if (cur.status === 'done' || cur.status === 'failed') return json(jobJSON(cur));
    await sleep(1000);
  }
}

export const createAudit = route(async (req) => {
  const body = await readJSON(req);
  // 蜜罐字段，真人看不到
  if (str(body.website)) return apiError(400, 'bad_request', '请求无效');
  const input = parseAuditInput(str(body.target));
  if (!input) return apiError(400, 'bad_target', '请输入官网域名或品牌名称，例如 www.example.com 或 爱康医疗');
  if (!(await limits.audit(clientIP(req)))) return apiError(429, 'rate_limited', '测评次数过多，请一小时后再试');

  const { domain, brand } = input;
  const key = domain ? domain.replace(/^www\./, '') : 'brand:' + brand.toLowerCase();
  const engines = activeEngines();
  const store = auditStore();

  const inline = !db();

  // 7 天内测过的目标直接复用
  const cached = await store.findCached(key, engineSignature(engines));
  if (cached) return inline ? finishInline(cached) : json({ id: cached, cached: true });

  // 同一目标正在测评时，合并到同一个任务；否则占用当日（UTC）一次真实探测额度后创建
  const id = randomHex(16);
  const res = await store.create(id, key);
  if (!res.created) return inline ? finishInline(res.id) : json({ id: res.id }, 202);
  if (engines.length > 0) {
    const day = new Date().toISOString().slice(0, 10);
    if ((await hit(`audit_budget:${day}`, 86_400)) > config().auditDailyLimit) {
      await store.fail(id, '今日免费测评名额已用完');
      return apiError(429, 'budget_exhausted', '今日免费测评名额已用完，请明天再试，或预约诊断会');
    }
  }

  if (inline) {
    await runAudit(id, domain, brand, engines);
    return finishInline(id);
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
