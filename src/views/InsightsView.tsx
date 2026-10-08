import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { useLang } from '../context/LanguageContext';
import { Insight, INSIGHT_TOPIC_LABEL, INSIGHTS } from '../data/insights';

export const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const { t, tb, lang, path } = useLang();
  const content = insight[lang];
  return (
    <Link href={path(`/insights/${insight.slug}`)} className="card interactive group flex flex-col items-start">
      <p className="text-caption text-label-secondary">
        {tb(INSIGHT_TOPIC_LABEL[insight.topic])} · <time dateTime={insight.publishedAt}>{insight.publishedAt}</time>
      </p>
      <h3 className="mt-2 text-title-3">{content.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-body text-label-secondary">{content.description}</p>
      <span className="link mt-5 text-body">
        {t('阅读全文', 'Read more')}
        <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
};

/** 「GEO 洞察」列表 /insights */
export const InsightsView: React.FC = () => {
  const { t } = useLang();
  return (
    <div>
      <PageHeader
        eyebrow={t('GEO 洞察', 'GEO insights')}
        title={t('出海 SEO 与 GEO 的方法、数据与实操', 'Methods, data and practice for export SEO and GEO')}
        intro={t(
          '每篇文章先给答案，再讲做法与出处。写给出海企业的决策者与市场负责人，也方便搜索引擎与 AI 引用。',
          'Every article gives the answer first, then the method and the sources. Written for export decision-makers and marketing leads, and easy for search engines and AI to cite.'
        )}
      />
      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {INSIGHTS.map((item) => (
            <InsightCard key={item.slug} insight={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
