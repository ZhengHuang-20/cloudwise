import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CONSOLE_COLORS } from './theme';

export interface DailyPoint {
  date: string;
  pv: number;
  uv: number;
  leads: number;
  sessions?: number;
  bounceRate?: number | null;
  avgEngagedMs?: number | null;
}

export type Metric = 'uv' | 'pv' | 'leads';

/** 分桶标签：按天为 YYYY-MM-DD，按小时为 YYYY-MM-DD HH（近 24 小时） */
const isHour = (date: string) => date.length > 10;
/** 坐标轴上的短标签：按天 MM-DD，按小时 HH:00 */
const shortLabel = (date: string) => (isHour(date) ? `${date.slice(11)}:00` : date.slice(5));
/** 悬浮提示与表格里的完整标签 */
export const fullLabel = (date: string) => (isHour(date) ? `${date}:00` : date);

export const METRIC_LABEL: Record<Metric, string> = { uv: '访客', pv: '浏览量', leads: '线索' };

const SERIES = CONSOLE_COLORS.link;
/** 上一周期：灰色虚线，只作参照 */
const PREV = CONSOLE_COLORS.tertiary;
const HEIGHT = 280;
const PAD = { top: 12, right: 12, bottom: 28, left: 44 };

/** 取整的刻度：1 / 2 / 5 × 10^n，最小间隔 1 */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  // 计数都是整数，间隔至少为 1，否则取整后刻度会重复（如 0、0.5、1 → 0、1、1）
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw);
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}

/**
 * 单指标的趋势（按天，或近 24 小时按小时）：2px 折线 + 10% 面积，悬停（或键盘左右键）显示十字线与该时段三项数据。
 * 传入 prev 时叠加上一周期的灰色虚线（按天对齐）并显示图例；完整数据见表格视图。
 */
export const TrendChart: React.FC<{ data: DailyPoint[]; metric: Metric; prev?: DailyPoint[] }> = ({ data, metric, prev }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setActive(null), [data, metric]);

  const values = data.map((d) => d[metric]);
  const prevValues = prev && prev.length === data.length ? prev.map((d) => d[metric]) : null;
  const ticks = niceTicks(Math.max(0, ...values, ...(prevValues ?? [])));
  const yMax = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const n = data.length;
  const hourly = n > 0 && isHour(data[0].date);
  const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = n > 0 ? `${line}L${x(n - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z` : '';
  const prevLine = prevValues?.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('') ?? '';

  // x 轴最多 6 个时间标签（窄屏每 72px 一个），首尾必出
  const maxLabels = Math.max(2, Math.min(6, Math.floor(plotW / 72)));
  const labelEvery = Math.max(1, Math.ceil((n - 1) / (maxLabels - 1)));
  const xLabels = data
    .map((d, i) => ({ i, text: shortLabel(d.date) }))
    .filter(({ i }) => i === 0 || i === n - 1 || (i % labelEvery === 0 && n - 1 - i >= labelEvery * 0.6));

  const pick = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || n === 0) return;
    const rel = (clientX - rect.left - PAD.left) / (plotW || 1);
    setActive(Math.min(n - 1, Math.max(0, Math.round(rel * (n - 1)))));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setActive((cur) => {
      const base = cur ?? (e.key === 'ArrowLeft' ? n : -1);
      return Math.min(n - 1, Math.max(0, base + (e.key === 'ArrowRight' ? 1 : -1)));
    });
  };

  const peak = Math.max(0, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  const point = active !== null ? data[active] : null;
  const prevPoint = active !== null && prevValues ? prev![active] : null;
  const tipLeft = active !== null ? x(active) : 0;

  return (
    <div>
      {prevValues && (
        <div className="mb-3 flex items-center gap-5 text-caption text-label-secondary" aria-hidden="true">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded-full" style={{ background: SERIES }} />
            本期
          </span>
          <span className="flex items-center gap-2">
            <svg width="16" height="2" className="block">
              <line x1="0" x2="16" y1="1" y2="1" stroke={PREV} strokeWidth={2} strokeDasharray="4 3" />
            </svg>
            上一周期
          </span>
        </div>
      )}
      <div ref={wrapRef} className="relative select-none" style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            tabIndex={0}
            aria-label={
              hourly
                ? `近 24 小时每小时${METRIC_LABEL[metric]}，合计 ${total}，单小时最高 ${peak}${
                    prevValues ? `；上一周期合计 ${prevValues.reduce((a, b) => a + b, 0)}` : ''
                  }。可用左右方向键逐小时查看。`
                : `近 ${n} 天每日${METRIC_LABEL[metric]}，合计 ${total}，单日最高 ${peak}${
                    prevValues ? `；上一周期合计 ${prevValues.reduce((a, b) => a + b, 0)}` : ''
                  }。可用左右方向键逐日查看。`
            }
            className="block rounded-[8px] outline-none focus-visible:outline-2 focus-visible:outline-link"
            onPointerMove={(e) => pick(e.clientX)}
            onPointerLeave={() => setActive(null)}
            onKeyDown={onKey}
            onBlur={() => setActive(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={CONSOLE_COLORS.separatorSoft} strokeWidth={1} />
                <text
                  x={PAD.left - 10}
                  y={y(t)}
                  dy="0.32em"
                  textAnchor="end"
                  fontSize={14}
                  fill={CONSOLE_COLORS.tertiary}
                  className="tabular-nums"
                >
                  {t.toLocaleString()}
                </text>
              </g>
            ))}
            {xLabels.map(({ i, text }) => (
              <text
                key={i}
                x={x(i)}
                y={HEIGHT - 6}
                textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
                fontSize={14}
                fill={CONSOLE_COLORS.tertiary}
                className="tabular-nums"
              >
                {text}
              </text>
            ))}
            {prevLine && (
              <path d={prevLine} fill="none" stroke={PREV} strokeWidth={2} strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round" />
            )}
            <path d={area} fill={SERIES} fillOpacity={0.1} />
            <path d={line} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {point && active !== null && (
              <g pointerEvents="none">
                <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} stroke={CONSOLE_COLORS.secondary} strokeWidth={1} />
                <circle cx={x(active)} cy={y(values[active])} r={5} fill={SERIES} stroke={CONSOLE_COLORS.surface} strokeWidth={2} />
              </g>
            )}
          </svg>
        )}

        {point && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 z-10 min-w-36 rounded-[10px] border border-hairline bg-surface-raised px-3 py-2.5 shadow-[0_12px_32px_rgb(0_0_0/0.5)]"
            style={{
              left: tipLeft,
              transform: `translateX(${tipLeft > width / 2 ? 'calc(-100% - 12px)' : '12px'})`,
            }}
          >
            <p className="text-caption text-label-secondary tabular-nums">{fullLabel(point.date)}</p>
            <p className="mt-1 flex items-center gap-2">
              <span className="h-0.5 w-3 rounded-full" style={{ background: SERIES }} />
              <span className="text-body font-semibold tabular-nums">{point[metric].toLocaleString()}</span>
              <span className="text-caption text-label-secondary">{METRIC_LABEL[metric]}</span>
            </p>
            <p className="mt-1 text-caption text-label-secondary tabular-nums">
              {(['uv', 'pv', 'leads'] as Metric[])
                .filter((m) => m !== metric)
                .map((m) => `${METRIC_LABEL[m]} ${point[m].toLocaleString()}`)
                .join(' · ')}
            </p>
            {prevPoint && (
              <p className="mt-1 text-caption text-label-secondary tabular-nums">
                上期 {shortLabel(prevPoint.date)}：{prevPoint[metric].toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
