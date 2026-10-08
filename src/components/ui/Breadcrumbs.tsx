import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export interface Crumb {
  label: string;
  /** 不带语言前缀的路径；最后一项（当前页）不传 */
  href?: string;
}

/** 面包屑：首页 › 栏目 › 当前页。对应的 BreadcrumbList 结构化数据由服务端页面输出 */
export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => {
  const { t, path } = useLang();
  const all: Crumb[] = [{ label: t('首页', 'Home'), href: '/' }, ...items];
  return (
    <nav aria-label={t('面包屑', 'Breadcrumb')}>
      <ol className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-caption text-label-secondary">
        {all.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4 text-label-tertiary" aria-hidden="true" />}
            {item.href && i < all.length - 1 ? (
              <Link href={path(item.href)} className="transition-colors hover:text-label">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-label">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
