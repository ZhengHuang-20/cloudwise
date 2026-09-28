import React, { useState } from 'react';
import {
  BookOpen,
  FileDown,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Tag,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { RESOURCE_ITEMS, ResourceItem } from '../data/resourcesData';
import { GLOSSARY_TERMS, GlossaryTerm } from '../data/glossaryData';
import { useApp } from '../context/AppContext';

export const ResourcesView: React.FC<{ onGoToLesson?: (lessonId: string) => void }> = ({ onGoToLesson }) => {
  const { showToast, logLeadActivity } = useApp();
  const [activeTab, setActiveTab] = useState<'resources' | 'glossary'>('resources');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleDownload = (item: ResourceItem) => {
    showToast(`《${item.title}》下载链接已就绪！`);
    logLeadActivity(`下载行业资源与模板: ${item.title}`, 5);
  };

  const filteredGlossary = GLOSSARY_TERMS.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.englishTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.oneLineDefinition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#f5f5f7]">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="apple-eyebrow">STANDARDS & ASSETS</span>
        <h1 className="apple-section-title">
          标准化工具模板与权威出海术语
        </h1>
        <p className="text-sm sm:text-base text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          资源中心负责实操沉淀与落地模板，术语百科负责被全球搜索引擎与 AI 爬虫收录引用。
        </p>
      </div>

      {/* Tab Switcher - Apple Segmented Control */}
      <div className="flex justify-center mb-10">
        <div className="flex p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full">
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
              activeTab === 'resources' ? 'bg-white/15 text-white shadow-sm backdrop-blur-md' : 'text-[#86868b] hover:text-white'
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>实战工具模板与白皮书 ({RESOURCE_ITEMS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
              activeTab === 'glossary' ? 'bg-white/15 text-white shadow-sm backdrop-blur-md' : 'text-[#86868b] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>AI 出海权威术语百科 ({GLOSSARY_TERMS.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: RESOURCES & TEMPLATES ================= */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESOURCE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="apple-glass rounded-3xl p-8 flex flex-col justify-between hover:border-white/20 transition-all space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#2997ff] text-[11px]">
                    {item.category}
                  </span>
                  <span className="font-mono text-[#86868b] text-[11px]">{item.format} · {item.fileSize}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight leading-snug">{item.title}</h3>
                <p className="text-xs text-[#a1a1a6] leading-relaxed font-normal">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#86868b]">已下载 {item.downloadCount} 次</span>
                <button
                  onClick={() => handleDownload(item)}
                  className="apple-blue-btn px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 2: GLOSSARY WIKI ================= */}
      {activeTab === 'glossary' && (
        <div className="space-y-8">
          {/* Search bar & Filter */}
          <div className="apple-glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索出海术语 (如 GEO、E-E-A-T)..."
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/[0.1] rounded-full text-xs text-white focus:outline-none focus:border-[#2997ff]"
              />
            </div>

            <div className="flex gap-1.5 text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
              {['all', 'SEO/GEO', '技术底座', '交付与架构'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all ${
                    selectedCategory === cat
                      ? 'bg-white/15 border-white/30 text-white font-medium'
                      : 'bg-white/[0.02] border-white/[0.08] text-[#86868b]'
                  }`}
                >
                  {cat === 'all' ? '全部术语' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Glossary cards */}
          <div className="space-y-6">
            {filteredGlossary.map((term) => (
              <div key={term.id} className="apple-glass rounded-3xl p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="text-xs font-mono text-[#2997ff] uppercase tracking-wider block mb-1">
                      {term.englishTerm}
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight">{term.questionTitle}</h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#86868b] border border-white/10 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                    {term.category}
                  </span>
                </div>

                <div className="p-4 bg-white/[0.03] border-l-2 border-[#2997ff] rounded-r-2xl text-xs sm:text-sm font-medium text-white leading-relaxed">
                  <span className="text-[#2997ff] mr-2">定义直答：</span>
                  {term.oneLineDefinition}
                </div>

                <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-normal">
                  {term.detailedExplanation}
                </p>

                <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] text-xs text-[#a1a1a6] space-y-1">
                  <span className="text-white font-medium block">标杆案例体现：</span>
                  <p>{term.realWorldExample}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                  <div className="flex items-center gap-2 text-[#86868b]">
                    <span>关联术语:</span>
                    {term.relatedTerms.map((rt, i) => (
                      <span key={i} className="text-white hover:underline cursor-pointer" onClick={() => setSearchQuery(rt)}>
                        {rt}
                      </span>
                    ))}
                  </div>

                  {term.relatedLessonId && onGoToLesson && (
                    <button
                      onClick={() => onGoToLesson(term.relatedLessonId!)}
                      className="text-[#2997ff] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>在学院课程中深入学习</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
