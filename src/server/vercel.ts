/**
 * 读取 Vercel Web Analytics 的数据（只读），给客户后台「数据概览」作参考。
 * 只适用于部署在 Vercel 上、开启了 Web Analytics 的项目；令牌只在服务端读取，任何错误都降级为「不可用」，不影响页面其他部分。
 * 与我们自己的采集口径不同（Vercel 不统计线索、会话与参与时长），展示时要注明来源。
 *
 * 接口：/v1/query/web-analytics/visits/count 取总数（{ data: { pageviews, visitors } }），
 * /visits/aggregate 按维度分组（by 必填，{ data: [{ <维度>: 值, pageviews, visitors }] }，limit 之外的归入 "Others"）。
 */
import { config } from './config';

const BASE = 'https://api.vercel.com/v1/query/web-analytics/visits';

type Unavailable = { available: false; reason: 'no_token' | 'not_configured' | 'request_failed' | 'unexpected_response' };

export type VercelTotals = { available: true; pv: number; uv: number } | Unavailable;

export interface VercelRow {
  name: string;
  pv: number;
  uv: number;
}

export type VercelGroups = { available: true; rows: VercelRow[] } | Unavailable;

/** 后台的维度名 → Vercel 的 by 参数（白名单，只拼这些常量） */
export const VERCEL_DIMS: Record<string, string> = {
  referrer: 'referrerHostname',
  country: 'country',
  page: 'requestPath',
  device: 'deviceType',
  browser: 'browserName',
  os: 'osName',
  utm_source: 'utmSource',
  utm_campaign: 'utmCampaign',
};

interface VercelSite {
  vercelTeamId: string;
  vercelProjectId: string;
}

/** 在返回值里按候选字段名取数字（官方字段为 pageviews / visitors，这里兼容常见写法） */
function pick(row: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return null;
}

const pvOf = (row: Record<string, unknown>) => pick(row, ['pageviews', 'pageViews', 'views', 'count']);
const uvOf = (row: Record<string, unknown>) => pick(row, ['visitors', 'uniqueVisitors', 'uv']);

/** 请求 Vercel；失败时返回不可用的原因。同一参数的结果缓存 10 分钟，避免每次打开后台都请求 Vercel。 */
async function vercelGet(
  path: 'count' | 'aggregate',
  site: VercelSite,
  since: Date,
  until: Date,
  extra: Record<string, string> = {},
): Promise<{ ok: true; body: unknown } | Unavailable> {
  const token = config().vercelToken;
  if (!token) return { available: false, reason: 'no_token' };
  if (!site.vercelProjectId) return { available: false, reason: 'not_configured' };

  const params = new URLSearchParams({
    projectId: site.vercelProjectId,
    since: since.toISOString(),
    until: until.toISOString(),
    ...extra,
  });
  if (site.vercelTeamId) params.set('teamId', site.vercelTeamId);

  try {
    const res = await fetch(`${BASE}/${path}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      // Vercel 的错误体形如 { error: { code, message } }，记下来方便排查（令牌缺权限、项目或团队 ID 不对等）
      const detail = await res.text().catch(() => '');
      console.warn(`[vercel] web analytics ${path} 请求失败：HTTP ${res.status} ${detail.slice(0, 300)}`);
      return { available: false, reason: 'request_failed' };
    }
    return { ok: true, body: await res.json() };
  } catch (err) {
    console.warn(`[vercel] web analytics ${path} 请求异常`, err instanceof Error ? err.name : 'unknown');
    return { available: false, reason: 'request_failed' };
  }
}

/** 取 { data: ... } 里的内容，兼容直接返回数据的形态 */
function dataOf(body: unknown): unknown {
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) return (body as { data: unknown }).data;
  return body;
}

/** 查询 [since, until] 内的浏览量与访客数。 */
export async function vercelTotals(site: VercelSite, since: Date, until: Date): Promise<VercelTotals> {
  const res = await vercelGet('count', site, since, until);
  if (!('ok' in res)) return res;
  const data = dataOf(res.body);
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  const pv = row && typeof row === 'object' ? pvOf(row) : null;
  const uv = row && typeof row === 'object' ? uvOf(row) : null;
  if (pv === null || uv === null) {
    // 只记录返回的字段名，不记录内容
    console.warn('[vercel] 无法识别 count 返回格式，字段：', row && typeof row === 'object' ? Object.keys(row).join(',') : '(空)');
    return { available: false, reason: 'unexpected_response' };
  }
  return { available: true, pv, uv };
}

/** 按一个维度分组查询浏览量与访客数（dim 为 VERCEL_DIMS 的键），按访客数降序，"Others" 放最后。 */
export async function vercelGroups(site: VercelSite, since: Date, until: Date, dim: string, limit: number): Promise<VercelGroups> {
  const by = VERCEL_DIMS[dim];
  const res = await vercelGet('aggregate', site, since, until, { by, limit: String(limit) });
  if (!('ok' in res)) return res;
  const data = dataOf(res.body);
  if (!Array.isArray(data)) {
    console.warn('[vercel] 无法识别 aggregate 返回格式：data 不是数组');
    return { available: false, reason: 'unexpected_response' };
  }
  const rows: VercelRow[] = [];
  for (const item of data as Record<string, unknown>[]) {
    const pv = item && typeof item === 'object' ? pvOf(item) : null;
    const uv = item && typeof item === 'object' ? uvOf(item) : null;
    if (pv === null || uv === null) {
      console.warn('[vercel] 无法识别 aggregate 返回格式，字段：', item && typeof item === 'object' ? Object.keys(item).join(',') : '(空)');
      return { available: false, reason: 'unexpected_response' };
    }
    const v = item[by];
    rows.push({ name: typeof v === 'string' ? v : v == null ? '' : String(v), pv, uv });
  }
  // "Others" 是 limit 之外的合计，固定放最后
  const others = (r: VercelRow) => (r.name === 'Others' ? 1 : 0);
  rows.sort((a, b) => others(a) - others(b) || b.uv - a.uv || b.pv - a.pv);
  return { available: true, rows };
}
