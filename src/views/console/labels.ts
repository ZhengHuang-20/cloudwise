/** 后台数据页共用的维度名称与数值格式（渠道、国家、语言、时长、百分比、环比）。 */

export { CHANNEL_LABEL } from '../../lib/channels';

export const DEVICE_LABEL: Record<string, string> = { desktop: '电脑', mobile: '手机', tablet: '平板' };

let regionNames: Intl.DisplayNames | null | undefined;
let languageNames: Intl.DisplayNames | null | undefined;

function displayNames(type: 'region' | 'language') {
  try {
    return new Intl.DisplayNames(['zh-CN'], { type });
  } catch {
    return null;
  }
}

/** ISO 国家代码 → 中文名（US → 美国）；没有地区信息时为「未知」 */
export function countryName(code: string): string {
  if (!code) return '未知';
  if (regionNames === undefined) regionNames = displayNames('region');
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** 浏览器语言 → 中文名（en-US → 英语（美国）） */
export function languageName(code: string): string {
  if (!code) return '未知';
  if (languageNames === undefined) languageNames = displayNames('language');
  try {
    return languageNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** 路径里的中文等字符在采集时是百分号编码，展示时还原 */
export function prettyPath(p: string): string {
  try {
    return decodeURI(p);
  } catch {
    return p;
  }
}

export const formatPercent = (v: number | null | undefined, digits = 1) =>
  v === null || v === undefined ? '—' : `${(v * 100).toFixed(digits)}%`;

/** 毫秒 → 「42 秒」「2 分 05 秒」 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} 秒`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} 分 ${String(s % 60).padStart(2, '0')} 秒`;
  return `${Math.floor(m / 60)} 小时 ${String(m % 60).padStart(2, '0')} 分`;
}

export type Trend = 'up' | 'down' | 'flat';

export interface Delta {
  text: string;
  trend: Trend;
}

/**
 * 与上一周期比较。计数类给相对变化（+12.5%），比率类（ratio）给百分点差（+2.1 个点）。
 * 上期为 0 时：本期也为 0 → 持平，否则 →「新增」。任一侧没有数据时返回 null。
 */
export function delta(cur: number | null | undefined, prev: number | null | undefined, ratio = false): Delta | null {
  if (cur === null || cur === undefined || prev === null || prev === undefined) return null;
  if (ratio) {
    const pp = (cur - prev) * 100;
    if (Math.abs(pp) < 0.05) return { text: '持平', trend: 'flat' };
    return { text: `${pp > 0 ? '+' : '−'}${Math.abs(pp).toFixed(1)} 个点`, trend: pp > 0 ? 'up' : 'down' };
  }
  if (prev === 0) return cur === 0 ? { text: '持平', trend: 'flat' } : { text: '新增', trend: 'up' };
  const r = (cur - prev) / prev;
  if (Math.abs(r) < 0.0005) return { text: '持平', trend: 'flat' };
  return { text: `${r > 0 ? '+' : '−'}${Math.abs(r * 100).toFixed(1)}%`, trend: r > 0 ? 'up' : 'down' };
}
