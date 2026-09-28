import React, { useState } from 'react';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SegmentedControl } from '../components/ui/SegmentedControl';

type DealTab = 'overview' | 'plan' | 'pricing' | 'qa' | 'contract';

const TABS: { id: DealTab; label: string }[] = [
  { id: 'overview', label: '诊断概要' },
  { id: 'plan', label: '共同行动计划' },
  { id: 'pricing', label: '分项报价' },
  { id: 'qa', label: '答疑讨论' },
  { id: 'contract', label: '在线签约' },
];

const PRICE_ITEMS = [
  { item: '海外独立站三读者架构重构与多语种部署', min: 10, max: 12, ratio: '阶段一 · 30%' },
  { item: '60 组外贸核心词体系建立与 Google SEO 布局', min: 6, max: 8, ratio: '阶段二 · 20%' },
  { item: '海外决策者建模、91 项内容规划与 GEO 信源铺设', min: 8, max: 12, ratio: '阶段三 · 30%' },
  { item: '7×24 小时 AI 智能客服部署与 CRM 直连', min: 4, max: 6, ratio: '阶段四 · 20%' },
];

const TEAM = [
  { name: 'David Huang', initials: 'DH', role: '出海解决方案总监 · 负责方案' },
  { name: 'Chen Wei', initials: 'CW', role: 'FDE 驻场交付工程师 · 负责落地' },
];

const formatRange = (min: number, max: number) => `${min.toFixed(1)} ~ ${max.toFixed(1)} 万元`;

export const DealRoomView: React.FC<{ onGoToBooking: () => void }> = ({ onGoToBooking }) => {
  const { activeProposal, user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<DealTab>('overview');

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
    showToast('问题已发布');
  };

  const [isContractSigned, setIsContractSigned] = useState(false);

  const completedCount = actionItems.filter((i) => i.completed).length;
  const totalMin = PRICE_ITEMS.reduce((sum, p) => sum + p.min, 0);
  const totalMax = PRICE_ITEMS.reduce((sum, p) => sum + p.max, 0);

  return (
    <div>
      {/* 工作区页头：左对齐 */}
      <header className="page-header layout-wide">
        <p className="flex items-center gap-2 text-caption text-label-secondary">
          <Lock className="h-4 w-4" />
          客户专属方案空间
        </p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-title-1">{activeProposal?.title || '出海企业专属方案空间'}</h1>
            <p className="mt-3 text-body text-label-secondary">
              {user?.companyName || '某外贸智造龙头'} · 方案状态：商务审阅中
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('空间链接已复制，可发给老板或团队协同');
                }
              }}
              className="btn btn-neutral"
            >
              邀请团队
            </button>
            <button type="button" onClick={onGoToBooking} className="btn btn-primary">
              召开推进会
            </button>
          </div>
        </div>

        <SegmentedControl className="mt-10" ariaLabel="方案空间内容" value={activeTab} onChange={setActiveTab} options={TABS} />
      </header>

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {/* ================= 诊断概要 ================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 animate-fade-in">
            <section className="tile lg:col-span-8" aria-labelledby="overview-title">
              <h2 id="overview-title" className="text-title-2">
                一页纸诊断结论与交付路线
              </h2>
              <div className="mt-6 max-w-3xl space-y-4 text-body text-label-secondary">
                <p>
                  尊敬的 <span className="font-semibold text-label">{user?.companyName || '贵司团队'}</span> 决策层：
                </p>
                <p>
                  综合五断点自评与 AI 可见性测试，贵司在海外采购市场的核心卡点集中在
                  <span className="font-semibold text-label">“海外买家问 AI 时查无此人（GEO 不被信）”</span>与
                  <span className="font-semibold text-label">“跨时区夜间询盘延迟流失（接不住）”</span>。
                </p>
                <p>双方团队将围绕共同行动计划按周推进，确保每一分投入都有可量化的业务指标产出。</p>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-separator pt-8 sm:grid-cols-4">
                {[
                  { label: '预算区间', value: activeProposal?.budgetRange || '26.0 ~ 36.0 万元' },
                  { label: '交付周期', value: activeProposal?.timeline || '8 ~ 12 周' },
                  { label: '协同架构师', value: 'David Huang' },
                  { label: '交付模式', value: '敏捷驻场' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-caption text-label-secondary">{stat.label}</dt>
                    <dd className="mt-1 text-body font-semibold tabular-nums">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="tile lg:col-span-4" aria-labelledby="team-title">
              <h2 id="team-title" className="text-title-3">
                专属售前与交付团队
              </h2>
              <ul className="mt-6 space-y-5">
                {TEAM.map((member) => (
                  <li key={member.name} className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="avatar h-11 w-11 text-caption"
                    >
                      {member.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-body font-semibold">{member.name}</p>
                      <p className="text-caption text-label-secondary">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={onGoToBooking} className="btn btn-secondary btn-block mt-8">
                预约 30 分钟方案答疑
              </button>
            </section>
          </div>
        )}

        {/* ================= 共同行动计划 ================= */}
        {activeTab === 'plan' && (
          <section className="tile animate-fade-in" aria-labelledby="plan-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="plan-title" className="text-title-2">
                  共同行动计划
                </h2>
                <p className="mt-1 text-body text-label-secondary">明确双方责任人与验收节点。点击事项可标记完成。</p>
              </div>
              <div className="w-full sm:w-48">
                <p className="text-right text-caption text-label-secondary">
                  已完成 <span className="tabular-nums text-label">{completedCount}</span> / {actionItems.length}
                </p>
                <div className="meter mt-2">
                  <span className="bg-success" style={{ width: `${(completedCount / actionItems.length) * 100}%` }} />
                </div>
              </div>
            </div>

            <ul className="mt-8 divide-y divide-separator border-y border-separator">
              {actionItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.completed}
                    onClick={() => toggleAction(item.id)}
                    className="flex w-full items-center gap-4 py-4 text-left"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
                    ) : (
                      <Circle className="h-6 w-6 shrink-0 text-label-tertiary" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className={`block text-body ${item.completed ? 'text-label-secondary line-through' : ''}`}>
                        {item.title}
                      </span>
                      <span className="block text-caption text-label-secondary">责任方：{item.owner}</span>
                    </span>
                    <span className="shrink-0 text-caption tabular-nums text-label-secondary">{item.due}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ================= 分项报价 ================= */}
        {activeTab === 'pricing' && (
          <section className="tile animate-fade-in" aria-labelledby="pricing-title">
            <h2 id="pricing-title" className="text-title-2">
              分项报价与付款节点
            </h2>
            <dl className="mt-8 divide-y divide-separator border-y border-separator">
              {PRICE_ITEMS.map((p) => (
                <div key={p.item} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <dt>
                    <span className="block text-body">{p.item}</span>
                    <span className="block text-caption text-label-secondary">付款节点：{p.ratio}</span>
                  </dt>
                  <dd className="shrink-0 text-body font-semibold tabular-nums">{formatRange(p.min, p.max)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex items-baseline justify-between gap-6">
              <span className="text-body text-label-secondary">合计</span>
              <span className="text-title-2 tabular-nums">{formatRange(totalMin, totalMax)}</span>
            </div>
          </section>
        )}

        {/* ================= 答疑讨论 ================= */}
        {activeTab === 'qa' && (
          <section className="tile animate-fade-in" aria-labelledby="qa-title">
            <h2 id="qa-title" className="text-title-2">
              答疑讨论
            </h2>
            <ul className="mt-8 divide-y divide-separator border-y border-separator">
              {qaList.map((qa, i) => (
                <li key={i} className="py-6">
                  <p className="text-body font-semibold">{qa.q}</p>
                  <p className="mt-1 text-caption text-label-secondary">
                    {qa.author} · {qa.time}
                  </p>
                  <p className="mt-4 border-l-2 border-separator-strong pl-4 text-body text-label-secondary">{qa.a}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAskQuestion} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="向架构师提问…"
                aria-label="输入问题"
                className="field"
              />
              <button type="submit" disabled={!newQuestion.trim()} className="btn btn-primary shrink-0">
                提交问题
              </button>
            </form>
          </section>
        )}

        {/* ================= 在线签约 ================= */}
        {activeTab === 'contract' && (
          <section className="tile animate-fade-in" aria-labelledby="contract-title">
            <h2 id="contract-title" className="text-title-2">
              合同在线签署
            </h2>
            <ol className="well mt-8 space-y-3 text-body text-label-secondary">
              <li>
                <span className="font-semibold text-label">第一条　知识产权归属　</span>
                项目交付形成的所有独立站源码、结构化知识库归属于甲方所有。
              </li>
              <li>
                <span className="font-semibold text-label">第二条　数据保密条款　</span>
                严格恪守保密义务，采用物理隔离存储，未经授权绝不对外披露。
              </li>
            </ol>

            {isContractSigned ? (
              <p className="mt-8 flex items-center gap-3 text-body animate-fade-in">
                <CheckCircle2 className="h-6 w-6 text-success" />
                合同已生效，本空间已升级为项目交付空间。
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsContractSigned(true);
                  showToast('合同已签署，空间已升级为项目交付空间');
                }}
                className="btn btn-primary mt-8"
              >
                确认并签署合同
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
