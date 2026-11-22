/**
 * /api/cron/self-audit：定期用自家的测评引擎测官网（以及 MONITOR_TARGETS 里的目标），结果写进 audits 表，
 * 在后台「测评报告」里按时间查看趋势。由 Vercel Cron 每天调用一次（vercel.json），每次最多发起一个测评：
 * 依次检查目标，第一个超过 MONITOR_INTERVAL_DAYS 天（默认 7）没有测过的才测，所以每个目标大约每周测一次。
 *
 * 只接受带 Authorization: Bearer <CRON_SECRET> 的请求（Vercel 调用定时任务时自动带上），没配 CRON_SECRET 时拒绝执行。
 * 不写线索、不占公开测评的每日额度；费用约为一次公开测评（平台数 × 8 个问题 × AUDIT_SAMPLES）。
 */
import { after } from 'next/server';
import { runAudit } from '../audit';
import { parseAuditInput } from '../auditSite';
import { auditStore } from '../auditStore';
import { config } from '../config';
import { db, queryOne } from '../db';
import { activeEngines } from '../engines';
import { apiError, json, route } from '../http';
import { randomHex } from '../auth';
import { SITE_URL } from '../../lib/site';

const DAY_MS = 86_400_000;

/** 与公开测评相同的去重键：域名去掉 www，品牌名加 brand: 前缀 */
const targetKey = (domain: string, brand: string) => (domain ? domain.replace(/^www\./, '') : 'brand:' + brand.toLowerCase());

export const selfAudit = route(async (req) => {
  const cfg = config();
  if (!cfg.cronSecret) return apiError(503, 'cron_unconfigured', '未配置 CRON_SECRET，定时任务不执行');
  if (req.headers.get('authorization') !== `Bearer ${cfg.cronSecret}`) return apiError(401, 'unauthorized', '未授权');
  if (!db()) return apiError(503, 'db_unavailable', '未配置数据库');
  const engines = activeEngines();
  if (engines.length === 0) return json({ skipped: 'no_engines' });

  const targets = [new URL(SITE_URL).host, ...cfg.monitorTargets];
  const since = new Date(Date.now() - cfg.monitorIntervalDays * DAY_MS);
  for (const raw of targets) {
    const input = parseAuditInput(raw);
    if (!input) continue;
    const key = targetKey(input.domain, input.brand);
    // 失败的测评不算：第二天会重试
    const recent = await queryOne(
      `SELECT id FROM audits WHERE target_key = $1 AND status <> 'failed' AND created_at > $2 LIMIT 1`,
      [key, since],
    );
    if (recent) continue;
    const id = randomHex(16);
    const res = await auditStore().create(id, key);
    if (!res.created) return json({ skipped: 'running', target: raw, id: res.id });
    after(() => runAudit(id, input.domain, input.brand, engines));
    return json({ id, target: raw }, 202);
  }
  return json({ skipped: 'up_to_date', targets });
});
