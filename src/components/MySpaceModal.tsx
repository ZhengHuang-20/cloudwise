import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Activity,
  FileText,
  Award,
  Database,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
  Share2,
  LogOut,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSES } from '../data/coursesData';

interface MySpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  openSupabaseModal: () => void;
}

export const MySpaceModal: React.FC<MySpaceModalProps> = ({ isOpen, onClose, openSupabaseModal }) => {
  const {
    user,
    logout,
    updateUserProfile,
    totalCompletedLessons,
    completedQuizzesCount,
    getCourseProgressPercentage,
    diagnoses,
    savedProposals,
    supabaseStatus,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'progress' | 'diagnoses' | 'proposals' | 'certificate' | 'profile'>('progress');

  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.companyName || '');
  const [industry, setIndustry] = useState(user?.industry || '');
  const [role, setRole] = useState(user?.role || '业务负责人');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, companyName: company, industry, role });
    showToast('个人档案与企业信息已更新！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="apple-glass rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#f5f5f7] border border-white/[0.12]">
        {/* Header */}
        <div className="px-8 py-5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.08] text-[#2997ff] border border-white/[0.1] flex items-center justify-center font-bold text-sm">
              {user?.name?.slice(0, 1) || '我'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{user?.name || '出海探索者'}</h2>
                <span className="text-[10px] font-mono text-[#2997ff] bg-[#2997ff]/10 px-2 py-0.5 rounded-full border border-[#2997ff]/20">
                  {user?.role || '决策者'}
                </span>
                <span className="text-xs text-[#86868b]">· {user?.companyName || '出海企业'}</span>
              </div>
              <p className="text-[11px] text-[#86868b]">个人出海学习档案与体检中心</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openSupabaseModal}
              className="apple-secondary-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
              title="配置 Supabase 云数据库同步"
            >
              <Database className={`w-3.5 h-3.5 ${supabaseStatus.isConfigured ? 'text-[#30d158]' : 'text-[#ffd60a]'}`} />
              <span className="hidden sm:inline font-mono text-[11px]">
                {supabaseStatus.isConfigured ? 'Supabase' : '云端配置'}
              </span>
            </button>
            <button onClick={onClose} className="p-1.5 text-[#86868b] hover:text-white rounded-full hover:bg-white/[0.06] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Apple Segmented Control */}
        <div className="px-8 py-3 bg-black/40 border-b border-white/[0.06] flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
          {[
            { id: 'progress', label: '学习进度', icon: GraduationCap },
            { id: 'diagnoses', label: `体检档案 (${diagnoses.length})`, icon: Activity },
            { id: 'proposals', label: `方案草案 (${savedProposals.length})`, icon: FileText },
            { id: 'certificate', label: '结业能力认证卡', icon: Award },
            { id: 'profile', label: '企业档案管理', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  isActive ? 'bg-white/15 text-white shadow-sm backdrop-blur-md' : 'text-[#86868b] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                  <span className="text-xs text-[#86868b] block mb-1">已学完课时</span>
                  <span className="text-2xl font-bold font-mono text-white">{totalCompletedLessons} 节</span>
                </div>
                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                  <span className="text-xs text-[#86868b] block mb-1">完成课后自测</span>
                  <span className="text-2xl font-bold font-mono text-[#30d158]">{completedQuizzesCount} 次</span>
                </div>
                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                  <span className="text-xs text-[#86868b] block mb-1">已做体检测试</span>
                  <span className="text-2xl font-bold font-mono text-[#2997ff]">{diagnoses.length} 项</span>
                </div>
                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                  <span className="text-xs text-[#86868b] block mb-1">方案草案存档</span>
                  <span className="text-2xl font-bold font-mono text-[#bf5af2]">{savedProposals.length} 份</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white tracking-tight">五门专业课程进度：</h3>
                <div className="space-y-3">
                  {COURSES.map((course) => {
                    const percent = getCourseProgressPercentage(course.id);
                    return (
                      <div key={course.id} className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-[#f5f5f7]">{course.code}. {course.title.split('——')[0]}</span>
                          <span className="font-mono text-[#2997ff]">{percent}%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                          <div className="h-full bg-[#2997ff] rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Certificate Tab */}
          {activeTab === 'certificate' && (
            <div className="apple-glass rounded-3xl p-10 space-y-6 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30 mx-auto flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-mono text-[#ffd60a] tracking-wider uppercase block mb-1">
                  AI 出海实战能力结业证书 (Certificate)
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">出海获客能力认证卡</h3>
                <p className="text-xs text-[#86868b] mt-1">授予：{user?.name} · {user?.companyName}</p>
              </div>

              <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/[0.06] text-xs text-[#a1a1a6] space-y-2 text-left font-mono">
                <p>✔ 掌握独立站三读者架构与 Core Web Vitals 技术规范</p>
                <p>✔ 掌握 Google 60 组外贸核心词体系与 E-E-A-T 质量标准</p>
                <p>✔ 掌握 GEO 六步闭环与海外 AI 大模型推荐机制</p>
                <p>✔ 掌握 7×24 小时出海 AI 客服知识库建设与 CRM 直连</p>
              </div>

              <button
                onClick={() => showToast('证书高清卡片已生成！可直接保存分享。')}
                className="apple-blue-btn w-full py-3 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>分享到朋友圈 / LinkedIn</span>
              </button>
            </div>
          )}

          {/* Fallback Diagnoses / Proposals / Profile */}
          {activeTab === 'diagnoses' && (
            <div className="space-y-3">
              {diagnoses.map((diag) => (
                <div key={diag.id} className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center text-sm font-semibold text-white">
                    <span>{diag.toolName}</span>
                    <span className="font-mono text-[#2997ff]">{diag.score} 分</span>
                  </div>
                  <p className="text-xs text-[#86868b]">{diag.summary}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-3">
              {savedProposals.map((prop) => (
                <div key={prop.id} className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center text-sm font-semibold text-white">
                    <span>{prop.title}</span>
                    <span className="font-mono text-[#30d158]">{prop.budgetRange}</span>
                  </div>
                  <p className="text-xs text-[#86868b]">周期：{prop.timeline} · 保存于 {prop.date}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="text-xs font-medium text-[#a1a1a6] block mb-1">姓名 / 称呼</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-black/50 border border-white/[0.1] rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#a1a1a6] block mb-1">企业全称</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2 bg-black/50 border border-white/[0.1] rounded-xl text-xs text-white"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="submit" className="apple-blue-btn flex-1 py-2.5 text-xs font-semibold">
                  保存档案
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="apple-secondary-btn px-5 py-2.5 text-xs text-[#ff453a]"
                >
                  退出
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
