/** /api/admin/audits（仅管理员）：全部 AI 可见性测评项目，可查看并下载每份报告。 */
import { authed, adminOnly } from '../auth';
import { query, queryOne } from '../db';
import { apiError, json } from '../http';
import { auditStore, withStale } from '../auditStore';
import { jobJSON } from './audits';
import type { AuditReport } from '../audit';

const AUDIT_ID_RE = /^[0-9a-f]{32}$/;

export const listAudits = authed(adminOnly, async (req) => {
  const q = new URL(req.url).searchParams;
  const page = Math.max(1, Number(q.get('page')) || 1);
  const size = Math.min(100, Math.max(1, Number(q.get('pageSize')) || 20));
  const kw = (q.get('q') ?? '').trim().slice(0, 100);
  const where = kw ? `WHERE a.target_key ILIKE $1 OR a.report->'entity'->>'brand' ILIKE $1` : '';
  const args: unknown[] = kw ? [`%${kw.replace(/[%_\\]/g, '\\$&')}%`] : [];
  const total = await queryOne(`SELECT count(*)::int AS n FROM audits a ${where}`, args);
  const rows = await query(
    `SELECT a.id, a.target_key, a.status, a.mode, a.total_score, a.error, a.created_at, a.updated_at,
            a.report->'entity'->>'brand' AS brand, a.report->>'level' AS level,
            (SELECT l.name FROM leads l WHERE l.audit_id = a.id ORDER BY l.id DESC LIMIT 1) AS contact_name,
            (SELECT l.phone FROM leads l WHERE l.audit_id = a.id ORDER BY l.id DESC LIMIT 1) AS contact_phone
     FROM audits a ${where} ORDER BY a.created_at DESC LIMIT ${size} OFFSET ${(page - 1) * size}`,
    args,
  );
  return json({
    audits: rows.map((r) => ({
      id: r.id,
      target: r.target_key.startsWith('brand:') ? r.target_key.slice(6) : r.target_key,
      brand: r.brand ?? '',
      status: r.status,
      mode: r.mode,
      score: r.total_score,
      level: r.level ?? '',
      error: r.error,
      contactName: r.contact_name ?? '',
      contactPhone: r.contact_phone ?? '',
      createdAt: r.created_at,
    })),
    total: total?.n ?? 0,
    page,
    pageSize: size,
  });
});

export const getAdminAudit = authed(adminOnly, async (_req, _u, params) => {
  if (!AUDIT_ID_RE.test(params.id ?? '')) return apiError(404, 'not_found', '测评不存在');
  const job = await auditStore().get(params.id);
  if (!job) return apiError(404, 'not_found', '测评不存在');
  return json(jobJSON(withStale(job)));
});

const pct = (v: number) => `${Math.round(v)}%`;

function toMarkdown(r: AuditReport): string {
  const L: string[] = [];
  L.push(`# AI 可见性测评报告：${r.entity?.brand || r.target || r.domain}`, '');
  L.push(`- 目标：${r.target || r.domain || '-'}`, `- 官网：${r.domain || '未找到'}`, `- 测评时间：${r.createdAt}`);
  L.push(`- 综合得分：${r.totalScore}（${r.level}）`, `- 探测平台：${r.engine}`, `- 问题数 ${r.questions}，回答数 ${r.answers}`, '');
  L.push('## 核心指标', '');
  L.push(`- 提及率：${pct(r.metrics.mentionRate)}`, `- 引用率：${pct(r.metrics.citationRate)}`);
  L.push(`- 品牌认知：${pct(r.metrics.brandKnowledge)}`, `- 可读性：${pct(r.metrics.readability)}`, `- 平均排位：${r.metrics.avgPosition}`, '');
  if (r.engines?.length) {
    L.push('## 分平台结果', '');
    for (const e of r.engines) L.push(`- ${(e as any).name ?? (e as any).engine ?? ''}：${JSON.stringify(e)}`);
    L.push('');
  }
  if (r.shareOfVoice?.length) {
    L.push('## 声量占比', '');
    for (const s of r.shareOfVoice) L.push(`- ${s.name}${s.isSelf ? '（本品牌）' : ''}：${s.mentions} 次`);
    L.push('');
  }
  if (r.findings?.length) L.push('## 核心发现', '', ...r.findings.map((f) => `- ${f}`), '');
  if (r.recommendation) L.push('## 建议', '', r.recommendation, '');
  return L.join('\n');
}

export const downloadAudit = authed(adminOnly, async (req, _u, params) => {
  if (!AUDIT_ID_RE.test(params.id ?? '')) return apiError(404, 'not_found', '测评不存在');
  const job = await auditStore().get(params.id);
  if (!job?.report) return apiError(404, 'not_found', '这份测评没有可下载的报告');
  const format = new URL(req.url).searchParams.get('format') === 'json' ? 'json' : 'md';
  const name = `audit-${(job.report.domain || job.key).replace(/[^\w.-]+/g, '_').slice(0, 60)}-${params.id.slice(0, 8)}.${format}`;
  const body = format === 'json' ? JSON.stringify(job.report, null, 2) : toMarkdown(job.report);
  return new Response(body, {
    headers: {
      'Content-Type': format === 'json' ? 'application/json; charset=utf-8' : 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
});
