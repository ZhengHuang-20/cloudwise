import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * 全站唯一的弹窗外壳（DESIGN.md §4.8）。
 * 负责遮罩、尺寸、标题栏、关闭按钮，以及 Esc 关闭 / 焦点圈定 / 背景滚动锁定。
 * 内容区自行决定是否滚动；常规内容直接包一层 <DialogBody>。
 */
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 标题左侧的识别元素（头像 / 字母徽标），可选 */
  leading?: React.ReactNode;
  /** 关闭按钮左侧的次要操作 */
  actions?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
  /** 追加到面板上的类，例如固定高度 */
  panelClassName?: string;
  children: React.ReactNode;
}

const SIZE_CLASS: Record<NonNullable<DialogProps['size']>, string> = {
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// 叠放栈：只有最上层弹窗响应 Esc / Tab
const dialogStack: symbol[] = [];

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  leading,
  actions,
  size = 'lg',
  panelClassName = '',
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const token = Symbol('dialog');
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogStack.push(token);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (dialogStack[dialogStack.length - 1] !== token) return;
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panelRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = dialogStack.indexOf(token);
      if (index >= 0) dialogStack.splice(index, 1);
      if (dialogStack.length === 0) document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md animate-fade-in sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-tile bg-surface shadow-[0_24px_80px_rgb(0_0_0/0.6)] outline-none animate-sheet-in sm:max-h-[88vh] sm:rounded-tile ${SIZE_CLASS[size]} ${panelClassName}`}
      >
        <header className="flex shrink-0 items-center gap-4 border-b border-separator px-6 py-4 sm:px-8 sm:py-5">
          {leading}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="line-clamp-2 text-title-3">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-caption text-label-secondary">{description}</p>}
          </div>
          {actions}
          <button type="button" onClick={onClose} className="btn-icon" aria-label="关闭">
            <X />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
};

export const DialogBody: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <div className={`min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-8 ${className}`}>
    {children}
  </div>
);
