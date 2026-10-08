import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { glossaryList, GLOSSARY_CATEGORY_EN } from '../data/glossaryData';
import { useLang } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { termSlug } from '../site/routes';

// 分类从数据中派生，避免新增分类后筛选不到；筛选值保持中文，英文界面只改显示

/** 术语百科列表 /glossary：每条术语有自己的页面 /glossary/<slug> */
export const GlossaryView: React.FC = () => {
  const { t, lang, path } = useLang();
  const terms = glossaryList(lang);
  const glossaryCategories = Array.from(new Set(glossaryList('zh').map((term) => term.category)));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredGlossary = terms.filter((term) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      term.term.toLowerCase().includes(query) ||
      term.englishTerm.toLowerCase().includes(query) ||
      term.oneLineDefinition.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <PageHeader
        eyebrow={t('术语百科', 'Glossary')}
        title={t('出海 SEO、GEO 与 AI 术语百科', 'Glossary of export SEO, GEO and AI terms')}
        intro={t(
          '每个术语用一问一答写成：先一句话说清是什么，再讲案例与常见误区。方便你查，也方便搜索引擎与 AI 引用。',
          'Each term is written as a question and answer: one sentence on what it is, then a case and common pitfalls. Easy for you to look up, and easy for search engines and AI to cite.'
        )}
      />

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <div className="mx-auto max-w-4xl">
          {/* 搜索与筛选 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-label-secondary" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('搜索术语，如 GEO、E-E-A-T', 'Search terms, e.g. GEO, E-E-A-T')}
                aria-label={t('搜索术语', 'Search terms')}
                className="field rounded-full pl-12"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label={t('按分类筛选', 'Filter by category')}>
              {['all', ...glossaryCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="chip shrink-0"
                >
                  {cat === 'all' ? t('全部', 'All') : lang === 'en' ? GLOSSARY_CATEGORY_EN[cat as keyof typeof GLOSSARY_CATEGORY_EN] : cat}
                </button>
              ))}
            </div>
          </div>

          {filteredGlossary.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-title-3">{t('没有找到相关术语', 'No matching terms')}</p>
              <p className="mt-2 text-body text-label-secondary">{t('换个关键词，或查看全部术语。', 'Try another keyword, or view all terms.')}</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="btn btn-secondary mt-6"
              >
                {t('清除筛选', 'Clear filters')}
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {filteredGlossary.map((term) => (
                <article key={term.id} className="tile">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-caption text-label-secondary">{term.englishTerm}</span>
                    <span className="badge">{lang === 'en' ? GLOSSARY_CATEGORY_EN[term.category] : term.category}</span>
                  </div>
                  <h2 className="mt-3 text-title-2">
                    <Link href={path(`/glossary/${termSlug(term.id)}`)} className="transition-colors hover:text-link">
                      {term.questionTitle}
                    </Link>
                  </h2>
                  <p className="mt-4 text-intro text-label-secondary">{term.oneLineDefinition}</p>
                  <Link href={path(`/glossary/${termSlug(term.id)}`)} className="link mt-5 text-body">
                    {t('阅读完整解释', 'Read the full answer')}
                    <ChevronRight />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
