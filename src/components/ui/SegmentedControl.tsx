import React, { useEffect, useRef } from 'react';

/**
 * 分段控件（DESIGN.md §4.5）。页面级切换用 size="lg"，面板内切换用默认尺寸。
 * 支持 ←/→ 键切换；选中项在窄屏下会自动滚动到可见区域。
 */
export interface SegmentedOption<T extends string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'md' | 'lg';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  className = '',
}: SegmentedControlProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const selected = track?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!track || !selected || track.scrollWidth <= track.clientWidth) return;
    const left = selected.offsetLeft - track.clientWidth / 2 + selected.clientWidth / 2;
    track.scrollTo({ left, behavior: 'smooth' });
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const index = options.findIndex((o) => o.id === value);
    const nextIndex = (index + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    onChange(options[nextIndex].id);
    requestAnimationFrame(() => {
      trackRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    });
  };

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`segmented ${size === 'lg' ? 'segmented-lg' : ''} ${className}`}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.id)}
            className="segmented-item"
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
