import React, { useState } from 'react';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Bi, useLang } from '../context/LanguageContext';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { SHOW_FDE } from '../lib/features';
import { CONTACTS, formatPhone } from '../data/contactsData';

type DealTab = 'overview' | 'plan' | 'qa' | 'contract';

const TABS: { id: DealTab; label: Bi }[] = [
  { id: 'overview', label: { zh: '诊断概要', en: 'Diagnosis summary' } },
  { id: 'plan', label: { zh: '共同行动计划', en: 'Joint action plan' } },
  { id: 'qa', label: { zh: '答疑讨论', en: 'Q&A' } },
  { id: 'contract', label: { zh: '在线签约', en: 'Online contract' } },
];

const INITIAL_ACTIONS: { id: number; title: Bi; owner: Bi; due: Bi; completed: boolean }[] = [
  {
    id: 1,
    title: { zh: '提交现有官网技术与企业产品画册资料', en: 'Submit the current website technical material and the company product brochure' },
    owner: { zh: '客户方 (外贸总监)', en: 'Client (export director)' },
    due: { zh: '第 1 周', en: 'Week 1' },
    completed: true,
  },
  {
    id: 2,
    title: { zh: '完成 4 类海外决策者意图建模与 30 组问题簇审定', en: 'Complete intent modelling for four types of overseas decision-makers and approve 30 question clusters' },
    owner: { zh: '双方联合架构组', en: 'Joint architecture team' },
    due: { zh: '第 2 周', en: 'Week 2' },
    completed: false,
  },
  {
    id: 3,
    title: { zh: '独立站三读者架构与英文内容白皮书初稿评审', en: 'Review the three-reader website architecture and the first draft of the English white paper' },
    owner: { zh: '云端智荐交付团队', en: 'Cloudwise delivery team' },
    due: { zh: '第 4 周', en: 'Week 4' },
    completed: false,
  },
  {
    id: 4,
    title: { zh: 'AI 智能客服沙盒内部测试与 CRM 接口联调', en: 'Internal testing of the AI customer service sandbox and CRM interface integration' },
    owner: SHOW_FDE
      ? { zh: '客户 IT 负责人 & FDE', en: 'Client IT lead & FDE' }
      : { zh: '客户 IT 负责人 & 交付工程师', en: 'Client IT lead & delivery engineer' },
    due: { zh: '第 6 周', en: 'Week 6' },
    completed: false,
  },
  {
    id: 5,
    title: { zh: '全站上线发布并开展首期 AI 可见性月度探针监测', en: 'Full-site launch, and the first monthly AI visibility probe monitoring' },
    owner: { zh: '云端智荐算法组', en: 'Cloudwise algorithm team' },
    due: { zh: '第 8 周', en: 'Week 8' },
    completed: false,
  },
];

interface QaItem {
  q: Bi;
  a: Bi;
  author: Bi;
  time: Bi;
}

const INITIAL_QA: QaItem[] = [
  {
    q: { zh: 'AI 智能客服如何避免对海外买家做出超出权限的承诺？', en: 'How does AI customer service avoid making promises that exceed a buyer’s authority?' },
    a: {
      zh: 'AI 客服只依据后台录入的参数表、认证与交期规则作答，一旦买家提出合同条款或特殊商务条件，系统自动分流并触发销售人工接管。',
      en: 'The AI customer service answers only from the parameter sheets, certifications and lead-time rules entered in the back end. If a buyer raises contract terms or special commercial conditions, the system routes the enquiry automatically and hands it to a salesperson.',
    },
    author: { zh: '客户方技术总监', en: 'Client technical director' },
    time: { zh: '昨天', en: 'Yesterday' },
  },
];

export const DealRoomView: React.FC<{ onGoToBooking: () => void }> = ({ onGoToBooking }) => {
  const { activeProposal, user, showToast } = useApp();
  const { t, tb } = useLang();

  const [activeTab, setActiveTab] = useState<DealTab>('overview');

  const [actionItems, setActionItems] = useState(INITIAL_ACTIONS);

  const toggleAction = (id: number) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const [qaList, setQaList] = useState(INITIAL_QA);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setQaList((prev) => [
      ...prev,
      {
        q: { zh: newQuestion, en: newQuestion },
        a: {
          zh: '售前架构师已接收问题，系统正在基于企业知识库自动起草回复...',
          en: 'The pre-sales architect has received the question. The system is drafting a reply from the company knowledge base...',
        },
        author: { zh: user?.name || '客户方决策者', en: user?.name || 'Client decision-maker' },
        time: { zh: '刚刚', en: 'Just now' },
      }
    ]);
    setNewQuestion('');
    showToast(t('问题已发布', 'Question posted'));
  };

  const [isContractSigned, setIsContractSigned] = useState(false);

  const completedCount = actionItems.filter((i) => i.completed).length;

  return (
    <div>
      {/* 工作区页头：左对齐 */}
      <header className="page-header layout-wide">
        <p className="flex items-center gap-2 text-caption text-label-secondary">
          <Lock className="h-4 w-4" />
          {t('客户专属方案空间', 'Client project room')}
        </p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-title-1">{activeProposal?.title || t('出海企业专属方案空间', 'Export project room')}</h1>
            <p className="mt-3 text-body text-label-secondary">
              {user?.companyName || t('贵司', 'Your company')} · {t('方案状态：商务审阅中', 'Status: under commercial review')}
            </p>
            <p className="mt-1 text-caption text-label-secondary">
              {t('示例空间：以下为演示内容，不代表真实项目。', 'Sample room: the content below is for demonstration and does not represent a real project.')}
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast(t('空间链接已复制，可发给老板或团队协同', 'Room link copied. Send it to the owner or the team'));
                }
              }}
              className="btn btn-neutral"
            >
              {t('邀请团队', 'Invite the team')}
            </button>
            <button type="button" onClick={onGoToBooking} className="btn btn-primary">
              {t('召开推进会', 'Schedule a progress meeting')}
            </button>
          </div>
        </div>

        <SegmentedControl
          className="mt-10"
          ariaLabel={t('方案空间内容', 'Project room content')}
          value={activeTab}
          onChange={setActiveTab}
          options={TABS.map((tab) => ({ id: tab.id, label: tb(tab.label) }))}
        />
      </header>

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {/* ================= 诊断概要 ================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 animate-fade-in">
            <section className="tile lg:col-span-8" aria-labelledby="overview-title">
              <h2 id="overview-title" className="text-title-2">
                {t('一页纸诊断结论与交付路线', 'One-page diagnosis and delivery route')}
              </h2>
              <div className="mt-6 max-w-3xl space-y-4 text-body text-label-secondary">
                <p>
                  {t('致 ', 'To ')}
                  <span className="font-semibold text-label">{user?.companyName || t('贵司', 'your company')}</span>
                  {t('：', ':')}
                </p>
                <p>
                  {t(
                    '根据 AI 可见性测评与前期沟通，目前最主要的两个卡点是：',
                    'Based on the AI visibility audit and our earlier conversations, the two main bottlenecks are:'
                  )}
                  <span className="font-semibold text-label">
                    {t('“海外买家问 AI 时看不到贵司（不被信）”', '“Overseas buyers ask AI and cannot see you (not trusted)”')}
                  </span>
                  {t('和', ' and ')}
                  <span className="font-semibold text-label">
                    {t('“欧美工作时间的询盘无人及时回复（接不住）”', '“Enquiries during European and US working hours go unanswered (can’t keep up)”')}
                  </span>
                  {t('。', '.')}
                </p>
                <p>
                  {t(
                    '双方按共同行动计划逐周推进，每个阶段都约定可以核对的成果与指标。',
                    'Both sides move forward week by week against the joint action plan, and every phase agrees on results and metrics that can be checked.'
                  )}
                </p>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-separator pt-8 sm:grid-cols-3">
                {[
                  { label: t('交付周期', 'Delivery timeline'), value: activeProposal?.timeline || t('8 ~ 12 周', '8 ~ 12 weeks') },
                  { label: t('对接人', 'Contacts'), value: CONTACTS.map((c) => t(c.name, c.nameEn)).join(' · ') },
                  { label: t('交付模式', 'Delivery model'), value: SHOW_FDE ? t('敏捷驻场', 'Agile on-site') : t('敏捷迭代', 'Agile iteration') },
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
                {t('售前对接', 'Pre-sales contacts')}
              </h2>
              <ul className="mt-6 space-y-5">
                {CONTACTS.map((member) => (
                  <li key={member.phone} className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="avatar h-11 w-11 text-caption"
                    >
                      {t(member.name, member.nameEn).slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-body font-semibold">{t(member.name, member.nameEn)}</p>
                      <p className="text-caption text-label-secondary">{t(member.title, member.titleEn)}</p>
                      <a href={`tel:${member.phone}`} className="link text-caption tabular-nums">
                        {formatPhone(member.phone)}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={onGoToBooking} className="btn btn-secondary btn-block mt-8">
                {t('预约 30 分钟方案答疑', 'Book a 30-minute project Q&A')}
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
                  {t('共同行动计划', 'Joint action plan')}
                </h2>
                <p className="mt-1 text-body text-label-secondary">
                  {t('明确双方责任人与验收节点。点击事项可标记完成。', 'Owners and acceptance points for both sides. Click an item to mark it done.')}
                </p>
              </div>
              <div className="w-full sm:w-48">
                <p className="text-right text-caption text-label-secondary">
                  {t('已完成', 'Done')} <span className="tabular-nums text-label">{completedCount}</span> / {actionItems.length}
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
                        {tb(item.title)}
                      </span>
                      <span className="block text-caption text-label-secondary">
                        {t('责任方：', 'Owner: ')}
                        {tb(item.owner)}
                      </span>
                    </span>
                    <span className="shrink-0 text-caption tabular-nums text-label-secondary">{tb(item.due)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ================= 答疑讨论 ================= */}
        {activeTab === 'qa' && (
          <section className="tile animate-fade-in" aria-labelledby="qa-title">
            <h2 id="qa-title" className="text-title-2">
              {t('答疑讨论', 'Q&A')}
            </h2>
            <ul className="mt-8 divide-y divide-separator border-y border-separator">
              {qaList.map((qa, i) => (
                <li key={i} className="py-6">
                  <p className="text-body font-semibold">{tb(qa.q)}</p>
                  <p className="mt-1 text-caption text-label-secondary">
                    {tb(qa.author)} · {tb(qa.time)}
                  </p>
                  <p className="mt-4 border-l-2 border-separator-strong pl-4 text-body text-label-secondary">{tb(qa.a)}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAskQuestion} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder={t('向架构师提问…', 'Ask the architect…')}
                aria-label={t('输入问题', 'Enter a question')}
                className="field"
              />
              <button type="submit" disabled={!newQuestion.trim()} className="btn btn-primary shrink-0">
                {t('提交问题', 'Submit question')}
              </button>
            </form>
          </section>
        )}

        {/* ================= 在线签约 ================= */}
        {activeTab === 'contract' && (
          <section className="tile animate-fade-in" aria-labelledby="contract-title">
            <h2 id="contract-title" className="text-title-2">
              {t('合同在线签署', 'Sign the contract online')}
            </h2>
            <ol className="well mt-8 space-y-3 text-body text-label-secondary">
              <li>
                <span className="font-semibold text-label">{t('第一条　知识产权归属　', 'Article 1: Intellectual property　')}</span>
                {t(
                  '项目交付形成的所有独立站源码、结构化知识库归属于甲方所有。',
                  'The source code of the website and the structured knowledge base produced by the project belong to Party A.'
                )}
              </li>
              <li>
                <span className="font-semibold text-label">{t('第二条　数据保密条款　', 'Article 2: Data confidentiality　')}</span>
                {t(
                  '乙方对项目资料承担保密义务，未经甲方书面同意不对外披露；存储方式以正式合同为准。',
                  'Party B keeps the project material confidential and does not disclose it without Party A’s written consent. Storage arrangements follow the formal contract.'
                )}
              </li>
            </ol>

            {isContractSigned ? (
              <p className="mt-8 flex items-center gap-3 text-body animate-fade-in">
                <CheckCircle2 className="h-6 w-6 text-success" />
                {t('示例：签署后，本空间将升级为项目交付空间。', 'Sample: once signed, this room becomes a project delivery room.')}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsContractSigned(true);
                  showToast(t('合同已签署，空间已升级为项目交付空间', 'Contract signed. The room is now a project delivery room'));
                }}
                className="btn btn-primary mt-8"
              >
                {t('确认并签署合同', 'Confirm and sign the contract')}
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
