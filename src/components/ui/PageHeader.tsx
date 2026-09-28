import React from 'react';

/**
 * 二级页面统一页头（DESIGN.md §5.1）：眉标 → H1 → 导语 → 可选的附加内容。
 * 每个页面只能有一个 H1，且只能由这里输出。
 */
interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, intro, children }) => (
  <header className="page-header layout-text text-center">
    {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
    <h1 className="text-headline">{title}</h1>
    {intro && <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">{intro}</p>}
    {children && <div className="mt-8">{children}</div>}
  </header>
);
