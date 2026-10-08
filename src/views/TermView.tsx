import React from 'react';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { glossaryList, GLOSSARY_CATEGORY_EN } from '../data/glossaryData';
import { INSIGHTS } from '../data/insights';
import { useLang } from '../context/LanguageContext';
import { findTerm, lessonPath, termSlug } from '../site/routes';
import { useSite } from '../site/SiteContext';
import { InsightCard } from './InsightsView';

// 「相关术语」写的是术语名（如 SEO、E-E-A-T），能对上已有词条的就链接过去
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9一-龥]/g, '');

/** 术语详情页 /glossary/<slug> */
export const TermView: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, lang, path } = useLang();
  const { goToAudit } = useSite();
  const id = findTerm(slug)!.id;
  const terms = glossaryList(lang);
  const term = terms.find((item) => item.id === id)!;
  const insights = INSIGHTS.filter((item) => item.relatedTerms.includes(id)).slice(0, 3);
  const linkFor = (name: string) =>
    terms.find(
      (item) =>
        item.id !== id &&
        [item.term, item.englishTerm, termSlug(item.id)].some((n) => normalize(n).startsWith(normalize(name)) && normalize(name).length > 1)
    );
  const category = lang === 'en' ? GLOSSARY_CATEGORY_EN[term.category] : term.category;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t('术语百科', 'Glossary'), href: '/glossary' }, { label: term.term }]}
        eyebrow={`${term.englishTerm} · ${category}`}
        title={term.questionTitle}
      />

      <article className="layout-reading pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <section aria-label={t('一句话回答', 'Short answer')} className="well">
          <p className="text-caption text-label-secondary">{t('一句话回答', 'Short answer')}</p>
          <p className="mt-2 text-intro text-label">{term.oneLineDefinition}</p>
        </section>

        <div className="prose-article mt-10">
          <h2>{t('详细解释', 'In detail')}</h2>
          <p>{term.detailedExplanation}</p>
          <h2>{t('实际案例', 'In practice')}</h2>
          <p>{term.realWorldExample}</p>
          {term.commonPitfalls.length > 0 && (
            <>
              <h2>{t('常见误区', 'Common pitfalls')}</h2>
              <ul className="!list-none !pl-0">
                {term.commonPitfalls.map((pit) => (
                  <li key={pit} className="flex gap-3">
                    <X className="mt-1 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                    <span>{pit}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <section aria-labelledby="related-title" className="mt-16 border-t border-separator pt-10">
          <h2 id="related-title" className="text-title-2">
            {t('相关术语', 'Related terms')}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {term.relatedTerms.map((name) => {
              const target = linkFor(name);
              return (
                <li key={name}>
                  {target ? (
                    <Link href={path(`/glossary/${termSlug(target.id)}`)} className="chip">
                      {name}
                    </Link>
                  ) : (
                    <span className="badge font-normal text-label">{name}</span>
                  )}
                </li>
              );
            })}
          </ul>
          {term.relatedLessonId && (
            <Link href={path(lessonPath(term.relatedLessonId))} className="link mt-8 text-body">
              {t('在出海学院中深入学习', 'Study this in the Export Academy')}
              <ChevronRight />
            </Link>
          )}
        </section>

        {insights.length > 0 && (
          <section aria-labelledby="term-insights" className="mt-16">
            <h2 id="term-insights" className="text-title-2">
              {t('相关文章', 'Related articles')}
            </h2>
            <div className="mt-6 grid gap-5">
              {insights.map((item) => (
                <InsightCard key={item.slug} insight={item} />
              ))}
            </div>
          </section>
        )}

        <section className="tile mt-16 text-center">
          <h2 className="text-title-2">{t('看看你的官网做得怎么样', 'See how your website measures up')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-label-secondary">
            {t('免费的 AI 可见性测评会检查技术底座，并测试 AI 是否会推荐你。', 'The free AI visibility audit checks your technical foundation and tests whether AI recommends you.')}
          </p>
          <button type="button" onClick={goToAudit} className="btn btn-primary mt-6">
            {t('开始测评', 'Start the audit')}
          </button>
        </section>
      </article>
    </div>
  );
};
