import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckSquare,
  Square,
  MessageSquare,
  Calendar,
  DollarSign,
  Download,
  Share2,
  Users,
  Video,
  Clock,
  Sparkles,
  Send,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DealRoomView: React.FC<{ onGoToBooking: () => void }> = ({ onGoToBooking }) => {
  const { activeProposal, user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'pricing' | 'qa' | 'contract'>('overview');

  const [actionItems, setActionItems] = useState([
    { id: 1, title: '提交现有官网技术与企业产品画册资料', owner: '客户方 (外贸总监)', due: '第 1 周', completed: true },
    { id: 2, title: '完成 4 类海外决策者意图建模与 30 组问题簇审定', owner: '双方联合架构组', due: '第 2 周', completed: false },
    { id: 3, title: '独立站三读者架构与英文内容白皮书初稿评审', owner: '云端智荐交付团队', due: '第 4 周', completed: false },
    { id: 4, title: 'AI 智能客服沙盒内部测试与 CRM 接口联调', owner: '客户 IT 负责人 & FDE', due: '第 6 周', completed: false },
    { id: 5, title: '全站上线发布并开展首期 AI 可见性月度探针监测', owner: '云端智荐算法组', due: '第 8 周', completed: false },
  ]);

  const toggleAction = (id: number) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const [qaList, setQaList] = useState([
    {
      q: 'AI 智能客服如何防止大模型胡言乱语给客户承诺极低价格？',
      a: '通过严格的系统级知识库隔离与防幻觉边界设置。AI 客服仅能依据后台录入的参数表与报价阶梯进行区间说明，一旦买家提出特殊折扣或合同条款，系统自动分流并触发销售人工接管。',
      author: '客户方技术总监',
      time: '昨天',
    }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setQaList((prev) => [
      ...prev,
      {
        q: newQuestion,
        a: '售前架构师已接收问题，系统正在基于企业知识库自动起草回复...',
        author: user?.name || '客户方决策者',
        time: '刚刚',
      }
    ]);
    setNewQuestion('');
    showToast('提问已发布！');
  };

  const [isContractSigned, setIsContractSigned] = useState(false);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#f5f5f7]">
      {/* Deal Room Header */}
      <div className="apple-glass rounded-3xl p-8 mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#2997ff]">
              <Lock className="w-3.5 h-3.5" />
              <span>客户专属方案空间 (Deal Room)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {activeProposal?.title || '出海企业专属方案空间'}
            </h1>
            <p className="text-xs text-[#86868b]">
              企业账户：{user?.companyName || '某外贸智造龙头'} · 方案状态：商务审阅中
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('已复制专属空间安全直链，可一键发送给老板或内部协同！');
                }
              }}
              className="apple-secondary-btn px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>邀请团队协同</span>
            </button>
            <button
              onClick={onGoToBooking}
              className="apple-blue-btn px-5 py-2 text-xs font-semibold"
            >
              召开方案推进会
            </button>
          </div>
        </div>

        {/* Tab selection - Apple Segmented Control */}
        <div className="flex gap-1.5 p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'overview', label: '1. 诊断概要', icon: Video },
            { id: 'plan', label: '2. 共同行动计划 (MAP)', icon: CheckSquare },
            { id: 'pricing', label: '3. 分项报价单', icon: DollarSign },
            { id: 'qa', label: '4. 答疑讨论区', icon: MessageSquare },
            { id: 'contract', label: '5. 在线签署合同', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm backdrop-blur-md'
                    : 'text-[#86868b] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 apple-glass rounded-3xl p-8 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2997ff]" />
              <span>一页纸诊断结论与交付路线图</span>
            </h2>

            <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-3 text-xs sm:text-sm text-[#a1a1a6] leading-relaxed">
              <p>
                尊敬的 <strong className="text-white">{user?.companyName || '贵司团队'}</strong> 决策层：
              </p>
              <p>
                综合五断点自评与 AI 可见性测试，贵司在海外采购市场的核心卡点主要集中在：
                <strong className="text-white">“海外买家问 AI 时查无此人（GEO 不被信）”</strong> 以及
                <strong className="text-white">“跨时区夜间询盘延迟流失（接不住）”</strong>。
              </p>
              <p>
                双方团队将围绕共同行动计划按周推进，确保每一分投入都有可量化的业务指标产出。
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                <span className="text-[#86868b] block mb-1">预算区间</span>
                <span className="font-mono text-white font-bold text-base">
                  {activeProposal?.budgetRange || '26.0 ~ 36.0 万元'}
                </span>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                <span className="text-[#86868b] block mb-1">交付周期</span>
                <span className="font-mono text-white font-bold text-base">
                  {activeProposal?.timeline || '8 ~ 12 周'}
                </span>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                <span className="text-[#86868b] block mb-1">协同架构师</span>
                <span className="text-white font-bold text-base">David Huang</span>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                <span className="text-[#86868b] block mb-1">交付模式</span>
                <span className="text-[#30d158] font-bold text-base">敏捷驻场</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 apple-glass rounded-3xl p-8 space-y-6">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2997ff]" />
              <span>专属售前与交付团队</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="David"
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h4 className="font-bold text-white">David Huang</h4>
                  <p className="text-[#86868b]">出海解决方案总监 · 负责方案</p>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Chen"
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h4 className="font-bold text-white">Chen Wei</h4>
                  <p className="text-[#86868b]">FDE 驻场交付工程师 · 负责落地</p>
                </div>
              </div>
            </div>

            <button
              onClick={onGoToBooking}
              className="apple-blue-btn w-full py-3 text-xs font-semibold"
            >
              预约 30 分钟方案答疑会
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PLAN ================= */}
      {activeTab === 'plan' && (
        <div className="apple-glass rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">共同行动计划 (Mutual Action Plan)</h2>
              <p className="text-xs text-[#86868b]">明确双方责任人与验收节点</p>
            </div>
            <span className="text-xs text-[#30d158] font-mono">
              完成度：{actionItems.filter((i) => i.completed).length} / {actionItems.length}
            </span>
          </div>

          <div className="space-y-3">
            {actionItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleAction(item.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  item.completed
                    ? 'bg-white/[0.01] border-white/[0.04] text-[#86868b]'
                    : 'bg-white/[0.03] border-white/[0.08] text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-[#30d158] shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-[#86868b] shrink-0" />
                  )}
                  <div>
                    <h4 className={`text-xs sm:text-sm font-semibold ${item.completed ? 'line-through text-[#86868b]' : 'text-white'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#86868b]">责任方：{item.owner}</p>
                  </div>
                </div>

                <span className="font-mono text-xs text-[#2997ff]">{item.due}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PRICING ================= */}
      {activeTab === 'pricing' && (
        <div className="apple-glass rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">分项报价清单与付款节点</h2>
          <div className="space-y-3 text-xs">
            {[
              { item: '海外独立站三读者架构重构与多语种部署', range: '10.0 ~ 12.0 万元', ratio: '阶段一 (30%)' },
              { item: '60 组外贸核心词体系建立与 Google SEO 布局', range: '6.0 ~ 8.0 万元', ratio: '阶段二 (20%)' },
              { item: '海外决策者建模、91 项内容规划与 GEO 信源铺设', range: '8.0 ~ 12.0 万元', ratio: '阶段三 (30%)' },
              { item: '7×24 小时 AI 智能客服部署与 CRM 直连', range: '4.0 ~ 6.0 万元', ratio: '阶段四 (20%)' },
            ].map((p, idx) => (
              <div key={idx} className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">{p.item}</span>
                  <span className="text-[11px] text-[#86868b]">付款节点：{p.ratio}</span>
                </div>
                <span className="font-mono text-white font-bold text-sm">{p.range}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback QA and Contract tabs */}
      {activeTab === 'qa' && (
        <div className="apple-glass rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">在线讨论与答疑</h2>
          <div className="space-y-3">
            {qaList.map((qa, i) => (
              <div key={i} className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-white">
                  <span>问：{qa.q}</span>
                  <span className="text-[#86868b] text-[11px]">{qa.author}</span>
                </div>
                <p className="text-[#a1a1a6] leading-relaxed pl-2 border-l border-[#2997ff]">
                  答：{qa.a}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="向架构师提问..."
              className="flex-1 px-4 py-2.5 bg-black/50 border border-white/[0.1] rounded-full text-xs text-white"
            />
            <button type="submit" className="apple-blue-btn px-6 py-2.5 text-xs font-semibold">
              提交
            </button>
          </form>
        </div>
      )}

      {activeTab === 'contract' && (
        <div className="apple-glass rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">合同在线签署</h2>
          <div className="p-6 bg-black/40 rounded-2xl border border-white/[0.08] text-xs font-mono text-[#a1a1a6] leading-relaxed space-y-2">
            <p>第一条 知识产权归属：项目交付形成的所有独立站源码、结构化知识库归属于甲方所有。</p>
            <p>第二条 数据保密条款：严格恪守保密义务，采用物理隔离存储，未经授权绝不对外披露。</p>
          </div>
          <button
            onClick={() => {
              setIsContractSigned(true);
              showToast('🎉 合同签署成功！空间已自动升级为【项目交付空间】。');
            }}
            disabled={isContractSigned}
            className="apple-blue-btn px-8 py-3 text-xs font-semibold disabled:opacity-50"
          >
            {isContractSigned ? '合同已生效 (已转项目空间)' : '在线确认并签署合同'}
          </button>
        </div>
      )}
    </div>
  );
};
