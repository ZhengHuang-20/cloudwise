import React, { useState } from 'react';
import { ChevronRight, Download, Search } from 'lucide-react';
import { RESOURCE_ITEMS, ResourceItem } from '../data/resourcesData';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';

// 分类从数据中派生，避免新增分类后筛选不到
const GLOSSARY_CATEGORIES = Array.from(new Set(GLOSSARY_TERMS.map((term) => term.category)));

export const ResourcesView: React.FC<{ onGoToLesson?: (lessonId: string) => void }> = ({ onGoToLesson }) => {
  const { showToast, logLeadActivity } = useApp();
  const [activeTab, setActiveTab] = useState<'resources' | 'glossary'>('resources');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleDownload = (item: ResourceItem) => {
    showToast(`《${item.title}》已开始下载`);
    logLeadActivity(`下载行业资源与模板: ${item.title}`, 5);
  };

  const filteredGlossary = GLOSSARY_TERMS.filter((term) => {
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
        eyebrow="资源"
        title="模板、白皮书与术语"
        intro="模板与白皮书帮你动手做；术语百科用一问一答写成，方便你查，也方便搜索引擎与 AI 引用。"
      >
        <SegmentedControl
          ariaLabel="资源类型"
          size="lg"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'resources', label: `模板与白皮书 ${RESOURCE_ITEMS.length}` },
            { id: 'glossary', label: `术语百科 ${GLOSSARY_TERMS.length}` },
          ]}
        />
      </PageHeader>

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {RESOURCE_ITEMS.map((item) => (
              <article key={item.id} className="card flex flex-col animate-fade-in">
                <p className="text-caption text-label-secondary">
                  {item.category} · {item.format} · {item.fileSize}
                </p>
                <h2 className="mt-3 text-title-3">{item.title}</h2>
                <p className="mt-2 flex-1 text-body text-label-secondary">{item.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-separator pt-4">
                  <span aria-hidden="true" />
                  <button type="button" onClick={() => handleDownload(item)} className="btn btn-neutral btn-sm">
                    <Download />
                    下载
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="mx-auto max-w-4xl">
            {/* 搜索与筛选 */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-label-secondary" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索术语，如 GEO、E-E-A-T"
                  aria-label="搜索术语"
                  className="field rounded-full pl-12"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="按分类筛选">
                {['all', ...GLOSSARY_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="chip shrink-0"
                  >
                    {cat === 'all' ? '全部' : cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredGlossary.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-title-3">没有找到相关术语</p>
                <p className="mt-2 text-body text-label-secondary">换个关键词，或查看全部术语。</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="btn btn-secondary mt-6"
                >
                  清除筛选
                </button>
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                {filteredGlossary.map((term) => (
                  <article key={term.id} className="tile animate-fade-in">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="text-caption text-label-secondary">{term.englishTerm}</span>
                      <span className="badge">{term.category}</span>
                    </div>
                    <h2 className="mt-3 text-title-2">{term.questionTitle}</h2>

                    <p className="mt-5 text-intro">{term.oneLineDefinition}</p>
                    <p className="mt-4 text-body text-label-secondary">{term.detailedExplanation}</p>

                    <div className="well mt-6">
                      <h3 className="text-body font-semibold">标杆案例</h3>
                      <p className="mt-1 text-body text-label-secondary">{term.realWorldExample}</p>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-separator pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-caption text-label-secondary">相关术语</span>
                        {term.relatedTerms.map((related) => (
                          <button key={related} type="button" onClick={() => setSearchQuery(related)} className="chip">
                            {related}
                          </button>
                        ))}
                      </div>
                      {term.relatedLessonId && onGoToLesson && (
                        <button
                          type="button"
                          onClick={() => onGoToLesson(term.relatedLessonId!)}
                          className="link shrink-0 text-body"
                        >
                          在学院中深入学习
                          <ChevronRight />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
