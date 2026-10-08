import React from 'react';
import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';
import { caseList, solutionList } from '../data/caseStudiesData';
import { useLang } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { caseSlug, findSolution } from '../site/routes';
import { useSite } from '../site/SiteContext';
import { splitName } from './CasesView';

/** 行业方案详情页 /solutions/<slug> */
export const SolutionDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, lang, path } = useLang();
  const { openBooking } = useSite();
  const id = findSolution(slug)!.id;
  const sol = solutionList(lang).find((s) => s.id === id)!;
  const relatedCase = caseList(lang).find((c) => c.id === sol.relatedCaseId);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t('案例', 'Cases'), href: '/cases' }, { label: sol.name }]}
        eyebrow={t('行业方案', 'Industry plan')}
        title={sol.name}
        intro={sol.description}
      />

      <div className="layout-text space-y-5 pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <section className="tile" aria-labelledby="dm-title">
          <h2 id="dm-title" className="text-title-2">
            {t('海外决策者关注什么', 'What overseas decision-makers focus on')}
          </h2>
          <dl className="mt-4 divide-y divide-separator">
            {sol.overseasDecisionMakers.map((dm) => (
              <div key={dm.role} className="py-4">
                <dt className="text-title-3">{dm.role}</dt>
                <dd className="mt-1 text-body text-label-secondary">{dm.focusPoints.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="tile" aria-labelledby="questions-title">
            <h2 id="questions-title" className="text-title-3">
              {t('买家常问的问题（英文原文）', 'Questions buyers ask')}
            </h2>
            <ul className="mt-4 space-y-3">
              {sol.typicalProblemClusters.map((q) => (
                <li key={q} lang="en" className="text-body text-label-secondary">
                  {q}
                </li>
              ))}
            </ul>
          </section>
          <section className="tile" aria-labelledby="formats-title">
            <h2 id="formats-title" className="text-title-3">
              {t('推荐的内容形式', 'Recommended content formats')}
            </h2>
            <ul className="mt-4 space-y-3">
              {sol.recommendedContentFormat.map((f) => (
                <li key={f} className="flex gap-3 text-body">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="tile" aria-labelledby="compliance-title">
          <h2 id="compliance-title" className="text-title-3">
            {t('合规要点', 'Compliance notes')}
          </h2>
          <ul className="mt-4 space-y-3">
            {sol.complianceNotes.map((n) => (
              <li key={n} className="text-body text-label-secondary">
                {n}
              </li>
            ))}
          </ul>
        </section>

        {relatedCase && (
          <Link href={path(`/cases/${caseSlug(relatedCase.id)}`)} className="tile interactive group flex flex-col items-start">
            <p className="text-caption text-label-secondary">{t('对应案例', 'Matching case')}</p>
            <h2 className="mt-2 text-title-2">{splitName(relatedCase.clientName).primary}</h2>
            <p className="mt-2 text-body text-label-secondary">{relatedCase.results.directOutcome}</p>
            <span className="link mt-5 text-body">
              {t('阅读案例', 'Read the case')}
              <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        )}

        <section className="pt-[clamp(3.5rem,2rem+4vw,6rem)] text-center">
          <h2 className="text-headline">{t('同行业，聊聊你的情况', 'Same industry? Tell us about your situation')}</h2>
          <button type="button" onClick={openBooking} className="btn btn-primary btn-lg mt-9">
            {t('预约诊断会', 'Book a diagnosis call')}
          </button>
        </section>
      </div>
    </div>
  );
};
