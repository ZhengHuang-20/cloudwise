import React, { useEffect, useState } from 'react';
import { scoreTone, TONE_VAR } from './tone';

/** 圆环得分（DESIGN.md §4.7）。颜色由分数自动决定，不要手动指定。 */
interface ScoreRingProps {
  value: number;
  size?: number;
  stroke?: number;
  caption?: React.ReactNode;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ value, size = 148, stroke = 12, caption }) => {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, shown)) / 100);

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`得分 ${value} / 100`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-separator)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TONE_VAR[scoreTone(value)]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s var(--ease-apple)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-title-1 tabular-nums">{value}</span>
        {caption && <span className="text-caption text-label-secondary">{caption}</span>}
      </div>
    </div>
  );
};
