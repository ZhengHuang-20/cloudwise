import React from 'react';
import { useLang } from '../context/LanguageContext';

/** 常见问题：问答全部直接展示（不折叠），方便读者扫读，也方便搜索引擎与 AI 摘录。结构化数据由服务端页面输出 */
export const FaqList: React.FC<{ items: { q: string; a: string }[]; className?: string }> = ({ items, className = '' }) => {
  const { t } = useLang();
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="faq-title" className={className}>
      <h2 id="faq-title" className="text-title-2">
        {t('常见问题', 'Frequently asked questions')}
      </h2>
      <dl className="mt-6 divide-y divide-separator border-t border-separator">
        {items.map((item) => (
          <div key={item.q} className="py-5">
            <dt className="text-title-3">{item.q}</dt>
            <dd className="mt-2 text-body text-label-secondary">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
