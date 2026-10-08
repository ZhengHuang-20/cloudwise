import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { caseList, solutionList } from '../data/caseStudiesData';
import { courseList } from '../data/coursesData';
import { useLang } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { findCase, lessonPath, solutionSlug } from '../site/routes';
import { useSite } from '../site/SiteContext';
import { splitName } from './CasesView';

/** 案例详情页 /cases/<slug> */
export const CaseDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, lang, path } = useLang();
  const { goToAudit, openBooking } = useSite();
  const id = findCase(slug)!.id;
  const currentCase = caseList(lang).find((c) => c.id === id)!;
  const caseName = splitName(currentCase.clientName);
  const comparison = currentCase.scoreComparison;
  const solution = solutionList(lang).find((s) => s.relatedCaseId === id);
  const lessons = courseList(lang)
    .flatMap((c) => c.modules.flatMap((m) => m.lessons))
    .filter((lesson) => currentCase.relatedLessons.includes(lesson.id));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t('案例', 'Cases'), href: '/cases' }, { label: caseName.primary }]}
        eyebrow={currentCase.industry}
        title={caseName.secondary ? `${caseName.primary} ${caseName.secondary}` : caseName.primary}
        intro={currentCase.results.directOutcome}
      />

      <div className="layout-text space-y-5 pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <article className="tile">
          {/* 概要 */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="text-body text-label-secondary">
              {currentCase.status} · {t('目标市场：', 'Target market: ')}
              {currentCase.targetMarket}
            </p>
            <div className="shrink-0">
              {comparison && <p className="mb-3 text-caption font-semibold">{comparison.metric}</p>}
              <dl className="flex items-end gap-5">
                <div>
                  <dt className="text-caption text-label-secondary">{comparison?.beforeLabel ?? t('改造前', 'Before')}</dt>
                  <dd className="text-title-1 tabular-nums text-label-secondary">{currentCase.startingScore}</dd>
                </div>
                <ArrowRight className="mb-3 h-6 w-6 text-label-tertiary" aria-hidden="true" />
                <div>
                  <dt className="text-caption text-label-secondary">{comparison?.afterLabel ?? t('改造后', 'After')}</dt>
                  <dd className="text-headline tabular-nums text-success">
                    {currentCase.results.finalScore}
                    <span className="ml-1 text-title-3 text-label-secondary">{t('分', 'pts')}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* 起点 */}
          <div className="mt-10 grid gap-8 border-t border-separator pt-10 md:grid-cols-2">
            <section>
              <h2 className="text-title-3">{t('出海前的痛点', 'Pain points before going overseas')}</h2>
              <p className="mt-3 text-body text-label-secondary">{currentCase.startingPointFriction}</p>
            </section>
            <section>
              <h2 className="text-title-3">{t('我们研究的海外决策者', 'Overseas decision-makers we studied')}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {currentCase.buyerRoles.map((role) => (
                  <li key={role} className="badge font-normal text-label">
                    {role}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 实施 */}
          <section className="mt-10 border-t border-separator pt-10">
            <h2 className="text-title-3">{t('我们做了什么', 'What we did')}</h2>
            <ol className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
              {currentCase.whatWeDid.map((step, idx) => (
                <li key={step} className="flex gap-4 text-body">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill text-caption font-semibold tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-label-secondary">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 成果 */}
          <section className="mt-10 border-t border-separator pt-10">
            <h2 className="text-title-3">{t('结果', 'Results')}</h2>
            <ul className="mt-5 space-y-3">
              {currentCase.results.metrics.map((metric) => (
                <li key={metric} className="flex gap-3 text-body">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                  <span>{metric}</span>
                </li>
              ))}
            </ul>
            <p className="well mt-6 text-body">{currentCase.results.directOutcome}</p>
          </section>

          {currentCase.reusableExperience.length > 0 && (
            <section className="mt-10 border-t border-separator pt-10">
              <h2 className="text-title-3">{t('可以复用的经验', 'Lessons you can reuse')}</h2>
              <ul className="mt-5 space-y-3">
                {currentCase.reusableExperience.map((item) => (
                  <li key={item} className="flex gap-3 text-body text-label-secondary">
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-label-tertiary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 客户评价 */}
          {currentCase.testimonial && (
            <figure className="mt-10 border-t border-separator pt-10">
              <blockquote className="max-w-3xl text-title-3 font-normal leading-relaxed">
                {currentCase.testimonial.quote}
              </blockquote>
              <figcaption className="mt-4 text-body text-label-secondary">
                {currentCase.testimonial.author} · {currentCase.testimonial.title}
              </figcaption>
            </figure>
          )}

          <div className="mt-10 border-t border-separator pt-8">
            <h2 className="text-caption font-semibold text-label">{t('数据口径', 'Basis of the data')}</h2>
            <p className="mt-2 max-w-3xl text-caption text-label-secondary">{currentCase.dataScopeStatement}</p>
          </div>
        </article>

        <div className="grid gap-5 md:grid-cols-2">
          {solution && (
            <Link
              href={path(`/solutions/${solutionSlug(solution.id)}`)}
              className="tile interactive group flex flex-col items-start"
            >
              <p className="text-caption text-label-secondary">{t('对应的行业方案', 'Matching industry plan')}</p>
              <h2 className="mt-2 text-title-3">{solution.name}</h2>
              <p className="mt-2 flex-1 text-body text-label-secondary">{solution.description}</p>
              <span className="link mt-5 text-body">
                {t('查看方案', 'View the plan')}
                <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          )}
          {lessons.length > 0 && (
            <section className="tile" aria-labelledby="case-lessons">
              <h2 id="case-lessons" className="text-caption text-label-secondary">
                {t('相关课程', 'Related lessons')}
              </h2>
              <ul className="mt-3 space-y-3 text-body">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link href={path(lessonPath(lesson.id))} className="link">
                      {lesson.title}
                      <ChevronRight />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section className="pt-[clamp(3.5rem,2rem+4vw,6rem)] text-center">
          <h2 className="text-headline">{t('先看看你的企业在哪一步', 'See where your company stands')}</h2>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button type="button" onClick={goToAudit} className="btn btn-primary btn-lg">
              {t('给我的企业做同样的测评', 'Run the same audit for my company')}
            </button>
            <button type="button" onClick={openBooking} className="btn btn-secondary btn-lg">
              {t('预约诊断会', 'Book a diagnosis call')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
