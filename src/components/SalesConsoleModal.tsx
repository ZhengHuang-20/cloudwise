import React from 'react';
import {
  X,
  Shield,
  Activity,
  User,
  Clock,
  Sparkles,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Database,
  Building2,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SalesConsoleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, leadScore, currentStage, leadActivities, diagnoses, savedProposals, showToast } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="bg-[#0c0c0e] border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#f5f5f7]">
        {/* Header */}
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#2997ff] border border-blue-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">售前高净值商业情报透视舱 (Commercial Dossier)</h2>
                <span className="text-[10px] bg-blue-500/10 text-[#2997ff] border border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                  会前决策雷达
                </span>
              </div>
              <p className="text-xs text-[#86868b]">
                销售在见面前即可拿到已被充分教育、已被精准体检的高净值商业情报
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-[#86868b] hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Lead Summary */}
          <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-[#2997ff]" />
                <span className="text-sm font-bold text-white">{user?.companyName || '江苏某高端医疗装备制造集团'}</span>
                <span className="text-xs text-[#86868b]">· {user?.name || '王总'} ({user?.role || '海外事业部总裁'})</span>
              </div>
              <p className="text-xs text-[#86868b] font-mono">联系电话：{user?.phone || '138****8888'} · 行业领域：{user?.industry || '高端装备与医疗器械'}</p>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.04] px-4 py-2.5 rounded-xl border border-white/[0.08]">
              <div>
                <span className="text-[10px] text-[#86868b] block font-mono">采购意向阶段</span>
                <span className="text-sm font-bold text-[#2997ff]">{currentStage}</span>
              </div>
              <div className="w-px h-8 bg-white/[0.08]" />
              <div>
                <span className="text-[10px] text-[#86868b] block font-mono">意向成熟度评分</span>
                <span className="text-sm font-bold font-mono text-[#30d158]">{leadScore} 分 (高净值)</span>
              </div>
            </div>
          </div>

          {/* Auto-generated Pre-meeting Briefing */}
          <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#2997ff] flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>自动生成的会前商业简报 (Pre-meeting Intelligence Dossier)</span>
              </h3>
              <span className="text-[10px] text-[#86868b] font-mono">已穿透站内学懂·自测·看方案轨迹</span>
            </div>

            <div className="text-xs text-[#ceced2] font-mono space-y-2.5 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/[0.06]">
              <p className="text-white font-medium">【企业画像与决策背景】：</p>
              <p className="pl-3 text-[#a1a1a6]">
                {user?.companyName}，行业：{user?.industry}，决策人角色：{user?.role}。年出口规模在 5000 万以上，正在由传统展会与代工向自主品牌及海外合规体系跃迁。
              </p>

              <p className="text-white font-medium">【认知破幻状态（已学懂）】：</p>
              <p className="pl-3 text-[#a1a1a6]">
                决策人已在站内完整阅读《出海认知破幻公理》与《GEO生成式权威信源》，已彻底破除“中文画册直译”与“买流量就有单”的语言幻觉，对三读者架构与第三方背调协议高度认同。
              </p>

              <p className="text-white font-medium">【系统体检断点（已自测）】：</p>
              <p className="pl-3 text-[#a1a1a6]">
                {diagnoses.length > 0
                  ? `已完成 ${diagnoses[0].toolName}，断点得分 ${diagnoses[0].score} 分，薄弱断点：${diagnoses[0].summary}。核心痛点为欧美工程采购看不见、深夜欧美技术质询接不住。`
                  : '已自测五断点，判定核心断损在“看不见（SEO/GEO缺席）”与“接不住（12小时时差流失）”，年均测算潜在线索损耗约 180~320 万元。'}
              </p>

              <p className="text-white font-medium">【方案偏好与预算信号（已看方案）】：</p>
              <p className="pl-3 text-[#a1a1a6]">
                {savedProposals.length > 0
                  ? `客户已在配置器中确认草案，预选架构：${savedProposals[0].services.join(' + ')}，测算预算区间：${savedProposals[0].budgetRange}，期望部署周期：6~8周。`
                  : '意向偏好【获客增长组合（独立站+SEO+GEO）】+【24h AI 转化引擎】，预期预算在 25~45 万元区间。'}
              </p>

              <div className="pt-2 border-t border-white/[0.06] text-[#30d158]">
                【销售会面策略建议】：无需寒暄公司成立年份或概念科普。直接出示《爱康医疗新站 95 分同行业对照报告》与《凌晨 3 点 AI 答疑实录卷宗》，直接进入商务与排期决议。
              </div>
            </div>
          </div>

          {/* Behavioral Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#86868b] flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#2997ff]" />
              <span>全量高价值行为流水 (Telemetry Log)</span>
            </h3>

            <div className="space-y-2">
              {leadActivities.map((act) => (
                <div key={act.id} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158] shrink-0" />
                    <span className="text-white/90">{act.action}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#2997ff] text-[11px]">+{act.scoreDelta} 分</span>
                    <span className="text-[#86868b] font-mono text-[10px]">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
