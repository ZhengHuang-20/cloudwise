import React, { useId } from 'react';

/** 带标签与数值读数的滑块（DESIGN.md §4.4）。已填充轨道随数值变化。 */
interface SliderProps {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => React.ReactNode;
  /** 读数颜色类，默认主文字色；只在数值本身带语义（如流失率）时使用状态色 */
  valueClassName?: string;
  /** 已填充轨道颜色，默认强调蓝 */
  trackColor?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  valueClassName = 'text-label',
  trackColor,
}) => {
  const id = useId();
  const percent = ((value - min) / (max - min)) * 100;
  const style = {
    '--fill': `${percent}%`,
    ...(trackColor ? { '--range-color': trackColor } : {}),
  } as React.CSSProperties;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-body text-label">
          {label}
        </label>
        <output htmlFor={id} className={`text-body font-semibold tabular-nums ${valueClassName}`}>
          {format ? format(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-2"
        style={style}
      />
    </div>
  );
};
