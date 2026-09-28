import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { CASE_STUDIES, INDUSTRY_SOLUTIONS } from '../data/caseStudiesData';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';

interface CasesViewProps {
  onGoToDiagnosis: () => void;
  onGoToCourse: (courseCode: string) => void;
}

// 数据里的客户名形如「爱康医疗 (AK Medical)」，展示时拆成主名与英文名
const splitName = (name: string) => {
  const match = name.match(/^(.*?)\s*\((.*)\)$/);
  return match ? { primary: match[1], secondary: match[2] } : { primary: name, secondary: '' };
};

export const CasesView: React.FC<CasesViewProps> = ({ onGoToDiagnosis }) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'solutions'>('cases');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-ak-medical');

  const currentCase = CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];
  const caseName = splitName(currentCase.clientName);
  const comparison = currentCase.scoreComparison;

  return (
    <div>
      <PageHeader
        eyebrow="标杆案例"
        title="标杆实战案例与行业方案"
        intro="每个案例都用同一套字段呈现：痛点起点、实施动作、实测成果与可核验的口径说明。"
      >
        <SegmentedControl
          ariaLabel="案例内容"
          size="lg"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'cases', label: '标杆案例' },
            { id: 'solutions', label: '行业方案' },
          ]}
        />
      </PageHeader>

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {activeTab === 'cases' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="选择案例">
              {CASE_STUDIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selectedCaseId === c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="chip"
                >
                  {splitName(c.clientName).primary}
                </button>
              ))}
            </div>

            <article className="tile animate-fade-in" key={currentCase.id}>
              {/* 概要 */}
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <p className="text-caption text-label-secondary">{currentCase.industry}</p>
                  <h2 className="mt-2 text-title-1">
                    {caseName.primary}
                    {caseName.secondary && (
                      <span className="ml-3 text-title-3 font-normal text-label-secondary">{caseName.secondary}</span>
                    )}
                  </h2>
                  <p className="mt-3 text-body text-label-secondary">
                    {currentCase.status} · 目标市场：{currentCase.targetMarket}
                  </p>
                </div>

                <div className="shrink-0">
                  {comparison && <p className="mb-3 text-caption font-semibold">{comparison.metric}</p>}
                  <dl className="flex items-end gap-5">
                    <div>
                      <dt className="text-caption text-label-secondary">{comparison?.beforeLabel ?? '改造前'}</dt>
                      <dd className="text-title-1 tabular-nums text-label-secondary">{currentCase.startingScore}</dd>
                    </div>
                    <ArrowRight className="mb-3 h-6 w-6 text-label-tertiary" aria-hidden="true" />
                    <div>
                      <dt className="text-caption text-label-secondary">{comparison?.afterLabel ?? '改造后'}</dt>
                      <dd className="text-headline tabular-nums text-success">
                        {currentCase.results.finalScore}
                        <span className="ml-1 text-title-3 text-label-secondary">分</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 起点 */}
              <div className="mt-10 grid gap-8 border-t border-separator pt-10 md:grid-cols-2">
                <section>
                  <h3 className="text-title-3">出海前的痛点</h3>
                  <p className="mt-3 text-body text-label-secondary">{currentCase.startingPointFriction}</p>
                </section>
                <section>
                  <h3 className="text-title-3">建模的海外决策者</h3>
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
                <h3 className="text-title-3">我们做了什么</h3>
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
                <h3 className="text-title-3">实测成果</h3>
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

              <div className="mt-10 flex flex-col gap-6 border-t border-separator pt-8 md:flex-row md:items-center md:justify-between">
                <p className="max-w-2xl text-caption text-label-secondary">{currentCase.dataScopeStatement}</p>
                <button type="button" onClick={onGoToDiagnosis} className="btn btn-primary shrink-0">
                  为我的企业做同款体检
                </button>
              </div>
            </article>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {INDUSTRY_SOLUTIONS.map((sol) => (
              <article key={sol.id} className="tile flex flex-col animate-fade-in">
                <p className="text-caption text-label-secondary">行业方案</p>
                <h2 className="mt-2 text-title-2">{sol.name}</h2>
                <p className="mt-3 text-body text-label-secondary">{sol.description}</p>

                <h3 className="mt-8 text-body font-semibold">海外决策者关注什么</h3>
                <dl className="mt-2 flex-1 divide-y divide-separator">
                  {sol.overseasDecisionMakers.map((dm) => (
                    <div key={dm.role} className="py-4">
                      <dt className="text-body">{dm.role}</dt>
                      <dd className="mt-1 text-caption text-label-secondary">{dm.focusPoints.join(' · ')}</dd>
                    </div>
                  ))}
                </dl>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCaseId(sol.relatedCaseId);
                    setActiveTab('cases');
                  }}
                  className="btn btn-secondary mt-6 self-start"
                >
                  查看对应案例
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
