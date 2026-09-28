import React, { useState } from 'react';
import {
  FolderGit2,
  Building2,
  CheckCircle,
  TrendingUp,
  FileCheck,
  Shield,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  Quote,
  ChevronRight
} from 'lucide-react';
import { CASE_STUDIES, INDUSTRY_SOLUTIONS } from '../data/caseStudiesData';

interface CasesViewProps {
  onGoToDiagnosis: () => void;
  onGoToCourse: (courseCode: string) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({ onGoToDiagnosis, onGoToCourse }) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'solutions'>('cases');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-ak-medical');

  const currentCase = CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#f5f5f7]">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="apple-eyebrow">FIELD PROVEN RESULTS</span>
        <h1 className="apple-section-title">
          标杆实战案例与行业解决方案
        </h1>
        <p className="text-sm sm:text-base text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          每个案例用统一规范的工程标准字段呈现：痛点起点、攻坚实施、实测成果与真实转化证据。
        </p>
      </div>

      {/* Apple-style Segmented switcher */}
      <div className="flex justify-center mb-10">
        <div className="flex p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-5 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
              activeTab === 'cases' ? 'bg-white/15 text-white shadow-sm backdrop-blur-md' : 'text-[#86868b] hover:text-white'
            }`}
          >
            标杆客户实战样本 (爱康医疗 · 泰宁科创)
          </button>
          <button
            onClick={() => setActiveTab('solutions')}
            className={`px-5 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
              activeTab === 'solutions' ? 'bg-white/15 text-white shadow-sm backdrop-blur-md' : 'text-[#86868b] hover:text-white'
            }`}
          >
            细分行业解决方案 (医疗器械 · 环保工程)
          </button>
        </div>
      </div>

      {activeTab === 'cases' ? (
        <div className="space-y-8">
          {/* Case selector pill buttons */}
          <div className="flex gap-2 justify-center">
            {CASE_STUDIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCaseId === c.id
                    ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                    : 'bg-white/[0.03] border border-white/[0.08] text-[#86868b] hover:text-white'
                }`}
              >
                {c.clientName}
              </button>
            ))}
          </div>

          {/* Current Case Detail Card */}
          <div className="apple-glass rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#2997ff] block">
                  {currentCase.industry}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{currentCase.clientName}</h2>
                <p className="text-sm text-[#d2d2d7] mt-1">{currentCase.status} · 目标市场：{currentCase.targetMarket}</p>
              </div>

              <div className="p-4 sm:p-5 bg-white/[0.04] rounded-2xl border border-white/10 flex items-center gap-6">
                <div>
                  <span className="text-xs font-semibold text-[#a1a1a6] block font-mono">旧站就绪度</span>
                  <span className="text-2xl font-bold font-mono text-[#a1a1a6]">{currentCase.startingScore} 分</span>
                </div>
                <div className="text-white/40 font-bold text-lg">→</div>
                <div>
                  <span className="text-xs font-semibold text-[#30d158] block font-mono">新站可见度</span>
                  <span className="text-3xl font-bold font-mono text-[#30d158]">{currentCase.results.finalScore} 分</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/10 space-y-3">
                <span className="text-sm font-bold text-[#ff453a] block">出海前痛点：</span>
                <p className="text-base text-[#d2d2d7] leading-relaxed">{currentCase.startingPointFriction}</p>
              </div>

              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/10 space-y-3">
                <span className="text-sm font-bold text-[#2997ff] block">海外决策者建模角色：</span>
                <div className="flex flex-wrap gap-2.5">
                  {currentCase.buyerRoles.map((role, idx) => (
                    <span key={idx} className="bg-white/[0.06] border border-white/10 px-3.5 py-1.5 rounded-full text-sm font-medium text-[#f5f5f7]">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* What we did */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-[#2997ff]" />
                <span>实施落地动作 (做了什么)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCase.whatWeDid.map((step, idx) => (
                  <div key={idx} className="p-5 bg-white/[0.03] rounded-2xl border border-white/10 text-base text-[#d2d2d7] flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-white/[0.1] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Quote */}
            {currentCase.testimonial && (
              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-3">
                <Quote className="w-6 h-6 text-[#2997ff] opacity-50" />
                <p className="text-sm italic text-white leading-relaxed">
                  {currentCase.testimonial.quote}
                </p>
                <p className="text-xs text-[#86868b]">
                  — {currentCase.testimonial.author} · {currentCase.testimonial.title}
                </p>
              </div>
            )}

            {/* Action CTA */}
            <div className="pt-2">
              <button
                onClick={onGoToDiagnosis}
                className="apple-blue-btn w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>为我的企业做一次同款体检</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INDUSTRY_SOLUTIONS.map((sol) => (
            <div key={sol.id} className="apple-glass rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#2997ff]">细分行业方案</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">{sol.name}</h3>
                  <p className="text-xs text-[#86868b]">{sol.description}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-white block">海外决策者关注点：</span>
                  <div className="space-y-1.5 text-xs text-[#a1a1a6]">
                    {sol.overseasDecisionMakers.map((dm, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                        <span className="text-white font-medium mr-2">{dm.role}:</span>
                        <span>{dm.focusPoints.join(' · ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCaseId(sol.relatedCaseId);
                  setActiveTab('cases');
                }}
                className="apple-secondary-btn w-full py-3 text-xs flex items-center justify-center gap-1.5"
              >
                <span>查阅对应标杆案例档案</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
