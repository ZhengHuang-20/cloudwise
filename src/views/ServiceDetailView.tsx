import React from 'react';
import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SERVICE_IDENTITY } from '../components/ui/serviceIdentity';
import { FdeBuildLayers } from '../components/FdeBuildLayers';
import { FdeWhyUs } from '../components/FdeWhyUs';
import { FaqList } from '../components/FaqList';
import { Markdown } from '../components/Markdown';
import { useLang } from '../context/LanguageContext';
import { courseList } from '../data/coursesData';
import { glossaryList } from '../data/glossaryData';
import { findService, termSlug } from '../site/links';
import type { InsightSummary } from '../site/pageData';
import { useSite } from '../site/SiteContext';
import { InsightCard } from './InsightsView';

/** 单项服务详情页 /services/<slug> */
export const ServiceDetailView: React.FC<{ slug: string; insights?: InsightSummary[] }> = ({ slug, insights = [] }) => {
  const { t, tb, lang, path } = useLang();
  const { openBooking, goToConfigurator } = useSite();
  const svc = findService(slug)!;
  const identity = SERVICE_IDENTITY[svc.key];
  const Icon = identity.icon;
  const course = courseList(lang).find((c) => c.code === svc.code);
  // 术语按「相关课时」归到课程，课程与服务一一对应（课程 C ↔ 服务 C）
  const terms = glossaryList(lang).filter((term) => term.relatedLessonId?.split('-')[1]?.toUpperCase() === svc.code);
  const name = t(identity.name, identity.nameEn);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t('服务', 'Services'), href: '/services' }, { label: name }]}
        eyebrow={t(`服务 ${svc.code} · 对应卡点：${tb(svc.friction)}`, `Service ${svc.code} · Pain point: ${tb(svc.friction)}`)}
        title={tb(svc.title)}
        intro={tb(svc.oneLiner)}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={openBooking} className="btn btn-primary btn-lg">
            {t('预约诊断会', 'Book a diagnosis call')}
          </button>
          <Link href={path('/audit')} className="btn btn-secondary btn-lg">
            {t('先做 AI 可见性测评', 'Run the AI visibility audit first')}
          </Link>
        </div>
      </PageHeader>

      <div className="layout-text space-y-5 pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <article className="tile">
          <Icon className={`h-8 w-8 ${identity.text}`} />
          <h2 className="mt-5 text-title-2">{t('我们解决什么问题', 'The problem we solve')}</h2>
          <p className="mt-4 text-body text-label-secondary">{tb(svc.desc)}</p>
          <blockquote className="mt-6 border-l-2 border-separator-strong pl-4 text-body text-label-secondary">
            <span className="font-semibold text-label">{t('我们的判断　', 'Our view: ')}</span>
            {tb(svc.judgement)}
          </blockquote>

          <h2 className="mt-12 text-title-2">{t('交付标准', 'Deliverables')}</h2>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {svc.deliverables.map((item) => (
              <li key={item.zh} className="flex gap-3 text-body">
                <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                <span>{tb(item)}</span>
              </li>
            ))}
          </ul>

          <dl className="well mt-10">
            <dt className="text-caption text-label-secondary">{t('案例', 'Case')}</dt>
            <dd className="mt-1 text-body">{tb(svc.caseName)}</dd>
          </dl>
        </article>

        {svc.engagement && (
          <section aria-labelledby="engagement-title" className="tile">
            <p className="text-caption text-label-secondary">{t('合作方式', 'How we work together')}</p>
            <h2 id="engagement-title" className="mt-2 text-title-2">
              {/* 在逗号后断行，避免窄屏把词组拆开 */}
              {tb(svc.engagement.title)
                .split(/(?<=，)/)
                .map((part) => (
                  <span key={part} className="inline-block">
                    {part}
                  </span>
                ))}
            </h2>
            <p className="mt-4 text-body text-label-secondary">{tb(svc.engagement.intro)}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {svc.engagement.options.map((option) => (
                <div key={option.title.zh} className="well">
                  <h3 className="text-title-3">{tb(option.title)}</h3>
                  <p className="mt-2 text-body text-label-secondary">{tb(option.desc)}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 border-t border-separator pt-8">
              <h3 className="text-title-3">{tb(svc.engagement.kpi.title)}</h3>
              <p className="mt-2 text-body text-label-secondary">{tb(svc.engagement.kpi.desc)}</p>
            </div>
            <p className="mt-6 text-caption text-label-secondary">{tb(svc.engagement.note)}</p>
            <button type="button" onClick={openBooking} className="btn btn-secondary mt-8">
              {t('预约诊断会', 'Book a diagnosis call')}
            </button>
          </section>
        )}

        {svc.guide && (
          <article className="tile">
            <Markdown source={tb(svc.guide)} />
          </article>
        )}

        {svc.key === 'fde' && <FdeBuildLayers />}
        {svc.key === 'fde' && <FdeWhyUs />}

        <div className="tile">
          <FaqList items={svc.faqs.map((f) => ({ q: tb(f.q), a: tb(f.a) }))} />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {course && (
            <Link href={path(`/academy/${svc.slug}`)} className="tile interactive group flex flex-col items-start">
              <p className="text-caption text-label-secondary">{t(`配套课程 ${course.code}`, `Related course ${course.code}`)}</p>
              <h2 className="mt-2 text-title-3">{course.title.split('——')[0]}</h2>
              <p className="mt-2 flex-1 text-body text-label-secondary">{course.subtitle}</p>
              <span className="link mt-5 text-body">
                {t('进入课程', 'Open the course')}
                <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          )}
          <div className="tile flex flex-col items-start">
            <p className="text-caption text-label-secondary">{t('下一步', 'Next step')}</p>
            <h2 className="mt-2 text-title-3">{t('组合服务，查看周期与交付物', 'Combine services and see timelines and deliverables')}</h2>
            <p className="mt-2 flex-1 text-body text-label-secondary">
              {t(
                '常见的起点是“独立站 + SEO + GEO”获客组合。方案规划会按规模给出阶段排期与交付物清单。',
                'A common starting point is the "website + SEO + GEO" lead package. The planner gives a phased schedule and deliverables list for your scale.'
              )}
            </p>
            <button
              type="button"
              onClick={() => goToConfigurator({ packageType: 'package-acquisition' })}
              className="btn btn-secondary mt-5"
            >
              {t('打开方案规划', 'Open the planner')}
            </button>
          </div>
        </div>

        {terms.length > 0 && (
          <section aria-labelledby="related-terms" className="pt-10">
            <h2 id="related-terms" className="text-title-2">
              {t('相关术语', 'Related terms')}
            </h2>
            <ul className="mt-5 space-y-3 text-body">
              {terms.map((term) => (
                <li key={term.id}>
                  <Link href={path(`/glossary/${termSlug(term.id)}`)} className="link">
                    {term.questionTitle}
                    <ChevronRight />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {insights.length > 0 && (
          <section aria-labelledby="related-insights" className="pt-10">
            <h2 id="related-insights" className="text-title-2">
              {t('相关文章', 'Related articles')}
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {insights.map((item) => (
                <InsightCard key={item.slug} insight={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
