/**
 * 分数 → 状态色的唯一映射（DESIGN.md §3.1）。
 * < 50 红（断点严重）· 50–74 橙（需关注）· ≥ 75 绿（健康）。
 */
export type Tone = 'success' | 'warning' | 'danger';

export const scoreTone = (score: number): Tone =>
  score >= 75 ? 'success' : score >= 50 ? 'warning' : 'danger';

export const TONE_TEXT: Record<Tone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export const TONE_BG: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export const TONE_VAR: Record<Tone, string> = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};
