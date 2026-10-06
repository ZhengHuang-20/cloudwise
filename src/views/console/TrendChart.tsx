import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CONSOLE_COLORS } from './theme';

export interface DailyPoint {
  date: string;
  pv: number;
  uv: number;
  leads: number;
}

export type Metric = 'uv' | 'pv' | 'leads';

export const METRIC_LABEL: Record<Metric, string> = { uv: '访客', pv: '浏览量', leads: '线索' };

const SERIES = CONSOLE_COLORS.link;
const HEIGHT = 280;
const PAD = { top: 12, right: 12, bottom: 28, left: 44 };

/** 取整的刻度：1 / 2 / 5 × 10^n */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}

/**
 * 单指标的每日趋势：2px 折线 + 10% 面积，悬停（或键盘左右键）显示十字线与当天三项数据。
 * 单一序列不需要图例，卡片标题与指标切换说明画的是什么；完整数据见表格视图。
 */
export const TrendChart: React.FC<{ data: DailyPoint[]; metric: Metric }> = ({ data, metric }) => {
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
  const ticks = niceTicks(Math.max(0, ...values));
  const yMax = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const n = data.length;
  const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = n > 0 ? `${line}L${x(n - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z` : '';

  // x 轴最多 6 个日期标签，首尾必出
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  const xLabels = data
    .map((d, i) => ({ i, text: d.date.slice(5) }))
    .filter(({ i }) => i === 0 || i === n - 1 || (i % labelEvery === 0 && n - 1 - i >= labelEvery / 2));

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
  const tipLeft = active !== null ? x(active) : 0;

  return (
    <div ref={wrapRef} className="relative select-none" style={{ height: HEIGHT }}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          tabIndex={0}
          aria-label={`近 ${n} 天每日${METRIC_LABEL[metric]}，合计 ${total}，单日最高 ${peak}。可用左右方向键逐日查看。`}
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
          <p className="text-caption text-label-secondary tabular-nums">{point.date}</p>
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
        </div>
      )}
    </div>
  );
};
