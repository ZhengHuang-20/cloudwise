import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { caseList, solutionList } from '../data/caseStudiesData';
import { useLang } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { caseSlug, solutionSlug } from '../site/routes';

// 数据里的客户名形如「爱康医疗 (AK Medical)」，展示时拆成主名与英文名
export const splitName = (name: string) => {
  const match = name.match(/^(.*?)\s*\((.*)\)$/);
  return match ? { primary: match[1], secondary: match[2] } : { primary: name, secondary: '' };
};

/** 案例与行业方案列表 /cases：每个案例、方案都有自己的详情页 */
export const CasesView: React.FC = () => {
  const { t, lang, path } = useLang();
  const cases = caseList(lang);
  const solutions = solutionList(lang);

  return (
    <div>
      <PageHeader
        eyebrow={t('标杆案例', 'Case studies')}
        title={t('案例与行业方案', 'Cases and industry plans')}
        intro={t(
          '每个案例按同样的顺序写：起点、做了什么、结果，以及数据的口径。',
          'Every case follows the same order: the starting point, what we did, the results, and the basis of the data.'
        )}
      />

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <section aria-labelledby="cases-title">
          <h2 id="cases-title" className="text-title-2">
            {t('标杆案例', 'Case studies')}
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {cases.map((c) => {
              const name = splitName(c.clientName);
              const comparison = c.scoreComparison;
              return (
                <Link
                  key={c.id}
                  href={path(`/cases/${caseSlug(c.id)}`)}
                  className="tile interactive group flex flex-col items-start"
                >
                  <p className="text-caption text-label-secondary">{c.industry}</p>
                  <h3 className="mt-2 text-title-1">
                    {name.primary}
                    {name.secondary && (
                      <span className="ml-3 text-title-3 font-normal text-label-secondary">{name.secondary}</span>
                    )}
                  </h3>
                  <p className="mt-8 flex items-center gap-3 text-headline tabular-nums">
                    <span className="text-label-secondary">{c.startingScore}</span>
                    <ArrowRight className="h-6 w-6 text-label-tertiary" aria-hidden="true" />
                    <span className="text-success">{c.results.finalScore}</span>
                    <span className="text-title-3 text-label-secondary">{t('分', 'pts')}</span>
                  </p>
                  <p className="mt-1 text-caption text-label-secondary">
                    {comparison
                      ? `${comparison.metric} · ${comparison.beforeLabel} → ${comparison.afterLabel}`
                      : t('改造前 → 改造后', 'Before → after')}
                  </p>
                  <p className="mt-6 flex-1 text-body text-label-secondary">{c.results.directOutcome}</p>
                  <span className="link mt-6 text-body">
                    {t('阅读完整案例', 'Read the full case')}
                    <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="solutions-title" className="mt-[clamp(4rem,2.5rem+4vw,6rem)]">
          <h2 id="solutions-title" className="text-title-2">
            {t('行业方案', 'Industry plans')}
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {solutions.map((sol) => (
              <Link
                key={sol.id}
                href={path(`/solutions/${solutionSlug(sol.id)}`)}
                className="tile interactive group flex flex-col items-start"
              >
                <p className="text-caption text-label-secondary">{t('行业方案', 'Industry plan')}</p>
                <h3 className="mt-2 text-title-2">{sol.name}</h3>
                <p className="mt-3 flex-1 text-body text-label-secondary">{sol.description}</p>
                <span className="link mt-6 text-body">
                  {t('查看方案', 'View the plan')}
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
