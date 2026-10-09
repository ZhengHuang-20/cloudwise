/**
 * 读取 Vercel Web Analytics 的数据（只读）。托管在 Vercel 上的站点，客户后台「数据概览」的访客、浏览量、趋势与来源 / 地区 / 页面 / 设备
 * 以它为准（见 routes/stats.ts），采集脚本补充线索、跳出、参与时长等 Vercel 没有的数据。
 * 令牌只在服务端读取；任何错误都降级为「不可用」，由调用方回退到采集脚本的数据。
 *
 * 接口：/v1/query/web-analytics/visits/count 取总数（{ data: { pageviews, visitors } }），
 * /visits/aggregate 分组（by 必填，最多两个维度、其中最多一个时间粒度；{ data: [{ <维度>: 值 | timestamp, pageviews, visitors }] }，
 * limit 之外的归入 "Others"）。默认只统计生产环境。
 */
import { config } from './config';

const BASE = 'https://api.vercel.com/v1/query/web-analytics/visits';

export type Unavailable = {
  available: false;
  reason: 'no_token' | 'not_configured' | 'request_failed' | 'unexpected_response';
  /** request_failed 时 Vercel 返回的状态码与错误说明（不含令牌等敏感信息） */
  detail?: string;
};

export type VercelTotals = { available: true; pv: number; uv: number } | Unavailable;

export interface VercelGroup {
  /** 维度名 → 值（Vercel 的维度名，如 country、referrerHostname） */
  keys: Record<string, string>;
  pv: number;
  uv: number;
}

export type VercelGroups = { available: true; rows: VercelGroup[] } | Unavailable;

/** 按天的浏览量与访客，键为 UTC 日期 YYYY-MM-DD（Vercel 按 UTC 分天） */
export type VercelDaily = { available: true; days: Map<string, { pv: number; uv: number }> } | Unavailable;

export interface VercelSite {
  vercelTeamId: string;
  vercelProjectId: string;
}

/** 站点关联了 Vercel 项目、服务端也有令牌时才去请求 */
export const vercelEnabled = (site: VercelSite) => !!site.vercelProjectId && !!config().vercelToken;

const DAY_MS = 24 * 3600 * 1000;

/** 从 since 起的数据是否都在 Vercel 的查询范围内（Hobby 只能查最近 1 个月，超出时 Vercel 报错或没有数据） */
export const vercelCovers = (since: Date) => since.getTime() >= Date.now() - config().vercelWindowDays * DAY_MS;

/** "Others" 是 limit 之外的合计，不是真实的维度值 */
export const OTHERS = 'Others';

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
  extra: [string, string][] = [],
): Promise<{ ok: true; body: unknown } | Unavailable> {
  const token = config().vercelToken;
  if (!token) return { available: false, reason: 'no_token' };
  if (!site.vercelProjectId) return { available: false, reason: 'not_configured' };

  const params = new URLSearchParams({
    projectId: site.vercelProjectId,
    since: since.toISOString(),
    until: until.toISOString(),
  });
  // by 可以有两个，按 form 方式重复参数名
  for (const [k, v] of extra) params.append(k, v);
  if (site.vercelTeamId) params.set('teamId', site.vercelTeamId);

  try {
    const res = await fetch(`${BASE}/${path}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      // Vercel 的错误体形如 { error: { code, message } }，记下来方便排查（令牌缺权限、项目或团队 ID 不对等）
      const text = await res.text().catch(() => '');
      console.warn(`[vercel] web analytics ${path} 请求失败：HTTP ${res.status} ${text.slice(0, 300)}`);
      let message = '';
      try {
        message = String(JSON.parse(text)?.error?.message ?? '');
      } catch {
        // 不是 JSON 时只给状态码
      }
      return { available: false, reason: 'request_failed', detail: `HTTP ${res.status}${message ? ` ${message.slice(0, 200)}` : ''}` };
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

/** 只记录返回的字段名，不记录内容 */
function unexpected(what: string, row: unknown): Unavailable {
  console.warn(`[vercel] 无法识别 ${what} 返回格式，字段：`, row && typeof row === 'object' ? Object.keys(row).join(',') : '(空)');
  return { available: false, reason: 'unexpected_response' };
}

/** 查询 [since, until] 内的浏览量与访客数。 */
export async function vercelTotals(site: VercelSite, since: Date, until: Date): Promise<VercelTotals> {
  const res = await vercelGet('count', site, since, until);
  if (!('ok' in res)) return res;
  const data = dataOf(res.body);
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  const pv = row && typeof row === 'object' ? pvOf(row) : null;
  const uv = row && typeof row === 'object' ? uvOf(row) : null;
  if (pv === null || uv === null) return unexpected('count', row);
  return { available: true, pv, uv };
}

/** 读取 aggregate 的行，逐行取出数值；任何一行认不出就整体判为格式不符。 */
async function aggregateRows(site: VercelSite, since: Date, until: Date, extra: [string, string][]) {
  const res = await vercelGet('aggregate', site, since, until, extra);
  if (!('ok' in res)) return res;
  const data = dataOf(res.body);
  if (!Array.isArray(data)) return unexpected('aggregate', data);
  const rows: { item: Record<string, unknown>; pv: number; uv: number }[] = [];
  for (const item of data as Record<string, unknown>[]) {
    const pv = item && typeof item === 'object' ? pvOf(item) : null;
    const uv = item && typeof item === 'object' ? uvOf(item) : null;
    if (pv === null || uv === null) return unexpected('aggregate', item);
    rows.push({ item, pv, uv });
  }
  return { ok: true as const, rows };
}

/** 按一到两个维度（Vercel 的维度名）分组查询浏览量与访客数。 */
export async function vercelGroups(site: VercelSite, since: Date, until: Date, by: string[], limit: number): Promise<VercelGroups> {
  const res = await aggregateRows(site, since, until, [...by.map((b): [string, string] => ['by', b]), ['limit', String(limit)]]);
  if (!('ok' in res)) return res;
  return {
    available: true,
    rows: res.rows.map(({ item, pv, uv }) => ({
      keys: Object.fromEntries(by.map((b) => [b, item[b] == null ? '' : String(item[b])])),
      pv,
      uv,
    })),
  };
}

/** 按天查询浏览量与访客数（limit 设为天数，避免默认的 10 条截断时间序列）。 */
export async function vercelDaily(site: VercelSite, since: Date, until: Date): Promise<VercelDaily> {
  const buckets = Math.ceil((until.getTime() - since.getTime()) / DAY_MS) + 1;
  const res = await aggregateRows(site, since, until, [
    ['by', 'day'],
    ['limit', String(buckets)],
  ]);
  if (!('ok' in res)) return res;
  const days = new Map<string, { pv: number; uv: number }>();
  for (const { item, pv, uv } of res.rows) {
    const t = new Date(item.timestamp as string);
    if (Number.isNaN(t.getTime())) return unexpected('aggregate(day)', item);
    days.set(t.toISOString().slice(0, 10), { pv, uv });
  }
  return { available: true, days };
}
