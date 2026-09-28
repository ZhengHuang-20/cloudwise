import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, BarChart3, Bot, Check, FileUp, GitCommit, Moon, SplitSquareVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { FDE_WEEK_EXAMPLE, FDE_WEEK_OUTPUTS } from '../data/fdeData';

type DemoId = 'sandbox' | 'custom_data' | 'geo_compare' | 'analytics' | 'fde_week';

const DEMOS: { id: DemoId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'sandbox', label: 'AI 客服沙盒', icon: Bot },
  { id: 'custom_data', label: '资料试跑', icon: FileUp },
  { id: 'geo_compare', label: 'GEO 前后对比', icon: SplitSquareVertical },
  { id: 'analytics', label: '独立站看板', icon: BarChart3 },
  { id: 'fde_week', label: 'FDE 的一周', icon: GitCommit },
];

const BUYER_ROLES: { id: 'us' | 'eu' | 'me'; label: string }[] = [
  { id: 'us', label: '美国采购总监' },
  { id: 'eu', label: '德国骨科工程师' },
  { id: 'me', label: '迪拜医院代表' },
];

export const SandboxView: React.FC<{ onGoToConfigurator: () => void }> = ({ onGoToConfigurator }) => {
  const { showToast, logLeadActivity } = useApp();
  const [activeDemo, setActiveDemo] = useState<DemoId>('sandbox');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ================= 1. AI 客服沙盒 STATE =================
  const [buyerRole, setBuyerRole] = useState<'us' | 'eu' | 'me'>('us');
  const [isMidnightMode, setIsMidnightMode] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'buyer' | 'ai'; text: string; time: string }>>([
    {
      sender: 'buyer',
      text: 'Hi, what is the MOQ and standard delivery lead time for 500 pcs of porous titanium spinal cages?',
      time: '03:12 AM',
    },
    {
      sender: 'ai',
      text: 'Hello! For our 3D-printed porous titanium spinal cages (CE & FDA certified), the MOQ is 50 pcs. For a batch of 500 pcs, standard cleanroom production and sterilization lead time is approximately 18 working days. May I know which hospital or region you are procuring for?',
      time: '03:13 AM',
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendSandboxMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const newBuyerMsg = {
      sender: 'buyer' as const,
      text: inputQuery,
      time: '03:14 AM',
    };

    setChatMessages((prev) => [...prev, newBuyerMsg]);
    setInputQuery('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Thank you for the specification details! We have logged your request in our VIP engineering system. Our regional medical specialist will follow up with the full technical CAD file and compliance dossier at 9:00 AM your local time.`,
          time: '03:14 AM',
        }
      ]);
      logLeadActivity('体验 AI 客服沙盒与凌晨三点模式', 10);
    }, 600);
  };

  // ================= 2. 自定义资料测试 STATE =================
  const [customText, setCustomText] = useState(
    '产品名称：工业智能低碳空气压缩机 Ultra-Eco 5000\n核心参数：排气量 12 m³/min，工作压力 0.8 MPa，采用三级磁悬浮驱动，比传统机型节能 28%。\n资质认证：已获欧盟 CE 认证与 ISO 14064 碳足迹认证。\n起订量与交期：MOQ 2 台，标准现货交期 14 天，定制电压机型 25 天。'
  );
  const [isIndexed, setIsIndexed] = useState(false);
  const [testQuestion, setTestQuestion] = useState('这台设备比传统机器节能多少？交期多久？');
  const [testAnswer, setTestAnswer] = useState('');

  const handleIndexCustomData = () => {
    setIsIndexed(true);
    showToast('专属知识库已建立，可以开始提问');
    logLeadActivity('体验“用你的资料试一试”知识库构建', 25);
  };

  const handleAskCustomData = () => {
    setTestAnswer(
      '根据您提供的产品资料：Ultra-Eco 5000 采用三级磁悬浮驱动，比传统机型节能 28%！对于交期，标准现货机型交期为 14 天，定制电压机型为 25 天，起订量为 2 台。'
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="能力体验"
        title="签约之前，先亲手试一试"
        intro="扮演海外买家考一考 AI 客服，看真实的数据看板，或者用你自己的产品资料试跑。"
      >
        <SegmentedControl ariaLabel="选择体验项目" size="lg" value={activeDemo} onChange={setActiveDemo} options={DEMOS} />
      </PageHeader>

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {/* ================= DEMO 1: AI 客服沙盒 ================= */}
        {activeDemo === 'sandbox' && (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-caption text-label-secondary">扮演买家</span>
                <SegmentedControl ariaLabel="扮演的海外买家" value={buyerRole} onChange={setBuyerRole} options={BUYER_ROLES} />
              </div>
              <button
                type="button"
                aria-pressed={isMidnightMode}
                onClick={() => setIsMidnightMode(!isMidnightMode)}
                className="chip self-start sm:self-auto"
              >
                <Moon />
                {isMidnightMode ? '凌晨 03:00 · 全员离线' : '日间模式'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* 会话窗口 */}
              <section
                className="tile flex h-[560px] flex-col overflow-hidden p-0 lg:col-span-7"
                aria-label="示范企业官网实时会话"
              >
                <div className="flex items-center justify-between border-b border-separator px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                    <span className="text-body font-semibold">示范企业官网 · 在线客服</span>
                  </div>
                  <span className="text-caption tabular-nums text-label-secondary">
                    北京时间 {isMidnightMode ? '03:14' : '14:30'}
                  </span>
                </div>

                <div ref={chatScrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6" aria-live="polite">
                  {chatMessages.map((msg, i) => {
                    const isBuyer = msg.sender === 'buyer';
                    return (
                      <div key={i} className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}>
                        <span className="mb-1.5 text-caption text-label-secondary">
                          {isBuyer ? '海外买家' : 'AI 客服'} · {msg.time}
                        </span>
                        <p
                          className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-body ${
                            isBuyer ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md bg-surface-raised text-label'
                          }`}
                        >
                          {msg.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendSandboxMessage} className="flex items-center gap-3 border-t border-separator p-4">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="扮演买家向 AI 客服提问…"
                    aria-label="输入提问"
                    className="field rounded-full"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim()}
                    className="btn-icon h-11 w-11 bg-accent text-white hover:bg-accent-hover hover:text-white disabled:opacity-40"
                    aria-label="发送"
                  >
                    <ArrowUp />
                  </button>
                </form>
              </section>

              {/* 实时透视 */}
              <section className="tile lg:col-span-5" aria-labelledby="inspector-title">
                <div className="flex items-center justify-between gap-3">
                  <h2 id="inspector-title" className="text-title-3">
                    实时透视
                  </h2>
                  <span className="badge bg-success/15 text-success">03:14 已写入 CRM</span>
                </div>

                <dl className="mt-6 divide-y divide-separator border-y border-separator">
                  <div className="py-4">
                    <dt className="text-caption text-label-secondary">命中的知识条目</dt>
                    <dd className="mt-1 text-body">《骨科 3D 多孔钛技术白皮书 M2.4》与订购交期规则表</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <dt className="text-caption text-label-secondary">意向等级</dt>
                    <dd className="text-body font-semibold text-success">高意向</dd>
                  </div>
                  <div className="py-4">
                    <dt className="text-caption text-label-secondary">生成的 CRM 线索</dt>
                    <dd className="mt-2 space-y-1.5 text-body">
                      {[
                        ['采购品类', '3D 多孔钛脊柱假体'],
                        ['首批数量', '500 pcs'],
                        ['交期要求', '18 个工作日'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <span className="text-label-secondary">{k}</span>
                          <span className="tabular-nums">{v}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                </dl>

                <button type="button" onClick={onGoToConfigurator} className="btn btn-primary btn-block mt-8">
                  为我的企业配置 AI 客服
                </button>
              </section>
            </div>
          </div>
        )}

        {/* ================= DEMO 2: 资料试跑 ================= */}
        {activeDemo === 'custom_data' && (
          <section className="tile mx-auto max-w-3xl animate-fade-in" aria-labelledby="custom-title">
            <h2 id="custom-title" className="text-title-2">
              用你的产品资料，现场建一个知识库
            </h2>
            <p className="mt-2 text-body text-label-secondary">粘贴参数、认证与交期信息，AI 客服只会依据这些资料作答。</p>

            <label htmlFor="custom-data" className="field-label mt-8">
              产品资料
            </label>
            <textarea
              id="custom-data"
              rows={6}
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setIsIndexed(false);
                setTestAnswer('');
              }}
              className="field"
            />

            {!isIndexed ? (
              <button type="button" onClick={handleIndexCustomData} className="btn btn-primary mt-5">
                建立知识库
              </button>
            ) : (
              <div className="mt-8 border-t border-separator pt-8 animate-fade-in">
                <label htmlFor="custom-question" className="field-label">
                  向 AI 客服提问
                </label>
                <form
                  className="flex flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskCustomData();
                  }}
                >
                  <input
                    id="custom-question"
                    type="text"
                    value={testQuestion}
                    onChange={(e) => setTestQuestion(e.target.value)}
                    className="field"
                  />
                  <button type="submit" className="btn btn-primary shrink-0">
                    提问
                  </button>
                </form>
                {testAnswer && (
                  <p className="mt-5 max-w-[90%] rounded-[1.25rem] rounded-bl-md bg-surface-raised px-4 py-3 text-body animate-fade-in">
                    {testAnswer}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================= DEMO 3: GEO 前后对比 ================= */}
        {activeDemo === 'geo_compare' && (
          <section className="tile animate-fade-in" aria-labelledby="geo-title">
            <h2 id="geo-title" className="text-title-2">
              GEO 优化前后，AI 的回答有何不同
            </h2>
            <p className="mt-2 text-body text-label-secondary">
              提问：“Who are the leading orthopedic implant suppliers?”
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="well">
                <span className="badge bg-danger/15 text-danger">优化前 · 未提及品牌</span>
                <p className="mt-4 text-body text-label-secondary">
                  When searching for orthopedic implant suppliers, typical multi-national corporations dominate results...
                </p>
                <p className="mt-3 text-caption text-label-secondary">回答中没有任何中国品牌。</p>
              </div>
              <div className="well">
                <span className="badge bg-success/15 text-success">GEO 实施后 · 首位推荐</span>
                <p className="mt-4 text-body">
                  Top certified manufacturers include AK Medical (ak-medical-global.com), globally noted for EBM 3D printing porous titanium implants...
                </p>
                <p className="mt-3 text-caption text-label-secondary">首位推荐，并附带官网权威信源。</p>
              </div>
            </div>
          </section>
        )}

        {/* ================= DEMO 4: 独立站看板 ================= */}
        {activeDemo === 'analytics' && (
          <section className="tile animate-fade-in" aria-labelledby="analytics-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-caption text-label-secondary">画册第 6 页实拍复刻</p>
                <h2 id="analytics-title" className="mt-1 text-title-2">
                  爱康医疗全球官网实战看板
                </h2>
              </div>
              <span className="badge self-start sm:self-auto">GA4 真实埋点</span>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: '海外高意向访问', value: '18,420', note: '环比增长 320%', noteClass: 'text-success' },
                { label: 'AI 渠道引荐', value: '3,315', note: 'ChatGPT / Perplexity 来源', noteClass: 'text-label-secondary' },
                { label: '平均停留时长', value: '4m 35s', note: '深度阅读技术参数', noteClass: 'text-label-secondary' },
                { label: '累计有效询盘', value: '142', note: '全部写入 CRM，零流失', noteClass: 'text-success' },
              ].map((stat) => (
                <div key={stat.label} className="well">
                  <dt className="text-caption text-label-secondary">{stat.label}</dt>
                  <dd className="mt-1 text-title-1 tabular-nums">{stat.value}</dd>
                  <p className={`mt-1 text-caption ${stat.noteClass}`}>{stat.note}</p>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* ================= DEMO 5: FDE 的一周 ================= */}
        {activeDemo === 'fde_week' && (
          <section className="tile animate-fade-in" aria-labelledby="fde-title">
            <h2 id="fde-title" className="text-title-2">
              FDE 的一周：以询盘分级为例
            </h2>
            <p className="mt-2 max-w-2xl text-body text-label-secondary">
              每周一轮“观察-原型-试用-沉淀”。一个场景走完一轮，标准化、信息化、智能化三层各往前一步。以下为示例。
            </p>
            <ol className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {FDE_WEEK_EXAMPLE.map((step, idx) => (
                <li key={step.loop} className="well flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-caption font-semibold tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="badge">{step.layer}</span>
                  </div>
                  <h3 className="mt-4 text-title-3">{step.loop}</h3>
                  <p className="mt-1 text-caption text-label-secondary">{step.when}</p>
                  <p className="mt-3 text-body text-label-secondary">{step.desc}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 border-t border-separator pt-6">
              <h3 className="text-body font-semibold">这一周留给企业</h3>
              <ul className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-3">
                {FDE_WEEK_OUTPUTS.map((output) => (
                  <li key={output} className="flex gap-3 text-body">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                    <span>{output}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
