/**
 * 读取 Vercel Web Analytics 的汇总数据（只读），给客户后台「数据概览」作参考。
 * 只适用于部署在 Vercel 上、开启了 Web Analytics 的项目；令牌只在服务端读取，任何错误都降级为「不可用」，不影响页面其他部分。
 * 与我们自己的采集口径不同（Vercel 不统计线索、渠道细分与会话），展示时要注明来源。
 */
import { config } from './config';

const ENDPOINT = 'https://api.vercel.com/v1/query/web-analytics/visits/aggregate';

export type VercelTotals =
  | { available: true; pv: number; uv: number }
  | { available: false; reason: 'no_token' | 'not_configured' | 'request_failed' | 'unexpected_response' };

/** 在返回值里按候选字段名取数字（Vercel 的字段名以官方文档为准，这里兼容常见写法） */
function pick(row: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return null;
}

/** 取汇总行：兼容 { data: [...] }、[...] 与单个对象三种返回形态 */
function totalRow(body: unknown): Record<string, unknown> | null {
  if (Array.isArray(body)) return (body[0] as Record<string, unknown>) ?? null;
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (Array.isArray(b.data)) return (b.data[0] as Record<string, unknown>) ?? null;
    return b;
  }
  return null;
}

/**
 * 查询 [since, until] 内的浏览量与访客数。
 * 有 Vercel 项目 ID 的站点才会请求；请求带超时，失败时返回 available: false 并给出原因。
 */
export async function vercelTotals(
  site: { vercelTeamId: string; vercelProjectId: string },
  since: Date,
  until: Date,
): Promise<VercelTotals> {
  const token = config().vercelToken;
  if (!token) return { available: false, reason: 'no_token' };
  if (!site.vercelProjectId) return { available: false, reason: 'not_configured' };

  const params = new URLSearchParams({
    projectId: site.vercelProjectId,
    since: since.toISOString(),
    until: until.toISOString(),
  });
  if (site.vercelTeamId) params.set('teamId', site.vercelTeamId);

  let body: unknown;
  try {
    const res = await fetch(`${ENDPOINT}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
      // 同一时间段的结果缓存 10 分钟，避免每次打开后台都请求 Vercel
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      console.warn(`[vercel] web analytics 请求失败：HTTP ${res.status}`);
      return { available: false, reason: 'request_failed' };
    }
    body = await res.json();
  } catch (err) {
    console.warn('[vercel] web analytics 请求异常', err instanceof Error ? err.name : 'unknown');
    return { available: false, reason: 'request_failed' };
  }

  const row = totalRow(body);
  const pv = row ? pick(row, ['pageViews', 'pageviews', 'views', 'count']) : null;
  const uv = row ? pick(row, ['visitors', 'uniqueVisitors', 'uv']) : null;
  if (pv === null || uv === null) {
    // 只记录返回的字段名，不记录内容
    console.warn('[vercel] 无法识别返回格式，字段：', row ? Object.keys(row).join(',') : '(空)');
    return { available: false, reason: 'unexpected_response' };
  }
  return { available: true, pv, uv };
}
