'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '../components/ui/PageHeader';
import { useLang } from '../context/LanguageContext';

export const NotFoundView: React.FC = () => {
  const { t, path } = useLang();
  return (
    <div className="pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
      <PageHeader
        eyebrow="404"
        title={t('页面不存在', 'Page not found')}
        intro={t('这个地址没有对应的页面，可能已经移动或删除。', 'There is no page at this address. It may have moved or been removed.')}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={path('/')} className="btn btn-primary btn-lg">
            {t('回到首页', 'Back to the home page')}
          </Link>
          <Link href={path('/insights')} className="btn btn-secondary btn-lg">
            {t('浏览 GEO 洞察', 'Browse GEO insights')}
          </Link>
        </div>
      </PageHeader>
    </div>
  );
};
