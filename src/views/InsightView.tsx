import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Markdown } from '../components/Markdown';
import { FaqList } from '../components/FaqList';
import { useLang } from '../context/LanguageContext';
import { INSIGHT_TOPIC_LABEL, INSIGHTS } from '../data/insights';
import { SERVICES } from '../data/servicesData';
import { glossaryList } from '../data/glossaryData';
import { courseList } from '../data/coursesData';
import { SERVICE_IDENTITY } from '../components/ui/serviceIdentity';
import { BRAND } from '../lib/site';
import { findInsight, lessonPath, termSlug } from '../site/routes';
import { useSite } from '../site/SiteContext';
import { InsightCard } from './InsightsView';

/** 「GEO 洞察」文章页 /insights/<slug> */
export const InsightView: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, tb, lang, path } = useLang();
  const { openBooking, goToAudit } = useSite();
  const insight = findInsight(slug)!;
  const content = insight[lang];
  const services = SERVICES.filter((s) => insight.relatedServices.includes(s.slug));
  const terms = glossaryList(lang).filter((term) => insight.relatedTerms.includes(term.id));
  const lessons = courseList(lang)
    .flatMap((c) => c.modules.flatMap((m) => m.lessons))
    .filter((lesson) => insight.relatedLessons.includes(lesson.id));
  const more = INSIGHTS.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t('GEO 洞察', 'GEO insights'), href: '/insights' }, { label: content.title }]}
        eyebrow={tb(INSIGHT_TOPIC_LABEL[insight.topic])}
        title={content.title}
      >
        <p className="text-caption text-label-secondary">
          {t(`${BRAND.zh}编辑部`, `${BRAND.en} editorial team`)} · {t('发布于 ', 'Published ')}
          <time dateTime={insight.publishedAt}>{insight.publishedAt}</time>
          {insight.updatedAt !== insight.publishedAt && (
            <>
              {' · '}
              {t('更新于 ', 'Updated ')}
              <time dateTime={insight.updatedAt}>{insight.updatedAt}</time>
            </>
          )}
        </p>
      </PageHeader>

      <article className="layout-reading pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {/* 先给答案：单独成段，便于读者扫读与 AI 摘录 */}
        <section aria-label={t('简短回答', 'Short answer')} className="well">
          <p className="text-caption text-label-secondary">{t('简短回答', 'Short answer')}</p>
          <p className="mt-2 text-intro text-label">{content.answer}</p>
        </section>

        <Markdown source={content.body} className="mt-10" />

        <FaqList items={content.faqs} className="mt-16" />

        {(services.length > 0 || terms.length > 0 || lessons.length > 0) && (
          <section aria-labelledby="related-title" className="mt-16 border-t border-separator pt-10">
            <h2 id="related-title" className="text-title-2">
              {t('延伸阅读', 'Further reading')}
            </h2>
            <ul className="mt-5 space-y-3 text-body">
              {services.map((svc) => (
                <li key={svc.slug}>
                  <Link href={path(`/services/${svc.slug}`)} className="link">
                    {t('服务：', 'Service: ')}
                    {t(SERVICE_IDENTITY[svc.key].name, SERVICE_IDENTITY[svc.key].nameEn)}
                    <ChevronRight />
                  </Link>
                </li>
              ))}
              {terms.map((term) => (
                <li key={term.id}>
                  <Link href={path(`/glossary/${termSlug(term.id)}`)} className="link">
                    {t('术语：', 'Glossary: ')}
                    {term.questionTitle}
                    <ChevronRight />
                  </Link>
                </li>
              ))}
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link href={path(lessonPath(lesson.id))} className="link">
                    {t('课程：', 'Lesson: ')}
                    {lesson.title}
                    <ChevronRight />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="tile mt-16 text-center">
          <h2 className="text-title-2">{t('看看 AI 现在怎么介绍你', 'See how AI describes you today')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-label-secondary">
            {t(
              '免费的 AI 可见性测评会以海外买家身份向 ChatGPT、Perplexity、Gemini 提问，并检查官网的技术底座。',
              'The free AI visibility audit asks ChatGPT, Perplexity and Gemini questions as an overseas buyer would, and checks your website’s technical foundation.'
            )}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button type="button" onClick={goToAudit} className="btn btn-primary">
              {t('开始测评', 'Start the audit')}
            </button>
            <button type="button" onClick={openBooking} className="btn btn-secondary">
              {t('预约诊断会', 'Book a diagnosis call')}
            </button>
          </div>
        </section>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-insights" className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
          <h2 id="more-insights" className="text-title-2">
            {t('更多文章', 'More articles')}
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {more.map((item) => (
              <InsightCard key={item.slug} insight={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
