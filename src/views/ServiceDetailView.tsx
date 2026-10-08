import React from 'react';
import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SERVICE_IDENTITY } from '../components/ui/serviceIdentity';
import { FdeBuildLayers } from '../components/FdeBuildLayers';
import { FaqList } from '../components/FaqList';
import { useLang } from '../context/LanguageContext';
import { courseList } from '../data/coursesData';
import { INSIGHTS } from '../data/insights';
import { findService } from '../site/routes';
import { useSite } from '../site/SiteContext';
import { InsightCard } from './InsightsView';

/** 单项服务详情页 /services/<slug> */
export const ServiceDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, tb, lang, path } = useLang();
  const { openBooking, goToAudit, goToConfigurator } = useSite();
  const svc = findService(slug)!;
  const identity = SERVICE_IDENTITY[svc.key];
  const Icon = identity.icon;
  const course = courseList(lang).find((c) => c.code === svc.code);
  const insights = INSIGHTS.filter((item) => item.relatedServices.includes(svc.slug)).slice(0, 3);
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
          <button type="button" onClick={goToAudit} className="btn btn-secondary btn-lg">
            {t('先做 AI 可见性测评', 'Run the AI visibility audit first')}
          </button>
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

        {svc.key === 'fde' && <FdeBuildLayers />}

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
