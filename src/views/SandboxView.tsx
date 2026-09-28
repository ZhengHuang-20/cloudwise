import React, { useState } from 'react';
import {
  Laptop2,
  Bot,
  FileUp,
  SplitSquareVertical,
  BarChart3,
  GitCommit,
  Moon,
  Send,
  Sparkles,
  ArrowRight,
  Database,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SandboxView: React.FC<{ onGoToConfigurator: () => void }> = ({ onGoToConfigurator }) => {
  const { showToast, logLeadActivity } = useApp();
  const [activeDemo, setActiveDemo] = useState<'sandbox' | 'custom_data' | 'geo_compare' | 'analytics' | 'fde_week'>('sandbox');

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
    showToast('专属微型知识库已建立！立即向 AI 提问测试。');
    logLeadActivity('体验“用你的资料试一试”知识库构建', 25);
  };

  const handleAskCustomData = () => {
    setTestAnswer(
      '根据您提供的产品资料：Ultra-Eco 5000 采用三级磁悬浮驱动，比传统机型节能 28%！对于交期，标准现货机型交期为 14 天，定制电压机型为 25 天，起订量为 2 台。'
    );
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#f5f5f7]">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="apple-eyebrow">LIVE INTERACTIVE LAB</span>
        <h1 className="apple-section-title">
          能力体验中心与全真沙盒
        </h1>
        <p className="text-sm sm:text-base text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          签约前亲手试用交付物：扮演海外买家考一考 AI 客服、看真实数据看板、或用自己的产品资料试跑。
        </p>
      </div>

      {/* Demo Selector Tabs */}
      <div className="mb-12 flex justify-center">
        <div className="flex items-center gap-1 p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'sandbox', label: '1. AI 客服沙盒', icon: Bot },
            { id: 'custom_data', label: '2. 资料试跑', icon: FileUp },
            { id: 'geo_compare', label: '3. GEO 前后对比', icon: SplitSquareVertical },
            { id: 'analytics', label: '4. 独立站看板', icon: BarChart3 },
            { id: 'fde_week', label: '5. FDE 的一周', icon: GitCommit },
          ].map((demo) => {
            const Icon = demo.icon;
            const isActive = activeDemo === demo.id;
            return (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm backdrop-blur-md'
                    : 'text-[#86868b] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{demo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= DEMO 1: AI 客服沙盒 ================= */}
      {activeDemo === 'sandbox' && (
        <div className="space-y-6">
          <div className="apple-glass rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#86868b]">扮演海外买家：</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'us', label: '美国加州采购总监' },
                  { id: 'eu', label: '德国骨科工程师' },
                  { id: 'me', label: '中东迪拜医院代表' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setBuyerRole(r.id as any)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      buyerRole === r.id
                        ? 'bg-white/15 border-white/30 text-white font-medium'
                        : 'bg-white/[0.02] border-white/[0.08] text-[#86868b]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsMidnightMode(!isMidnightMode)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isMidnightMode
                  ? 'bg-white/15 border border-white/20 text-white'
                  : 'bg-white/[0.04] text-[#86868b]'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-[#2997ff]" />
              <span>{isMidnightMode ? '凌晨 03:00 模式 (全员离线)' : '日间模式'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Chat Window */}
            <div className="lg:col-span-7 apple-glass rounded-3xl flex flex-col h-[520px] overflow-hidden">
              <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#30d158] animate-pulse" />
                  <span className="text-sm font-semibold text-white">示范企业官网 · 实时会话</span>
                </div>
                <span className="text-sm font-mono text-[#d2d2d7]">
                  {isMidnightMode ? '北京时间 03:14 深夜' : '北京时间 14:30'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {chatMessages.map((msg, i) => {
                  const isBuyer = msg.sender === 'buyer';
                  return (
                    <div key={i} className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs font-semibold text-[#a1a1a6] mb-1.5">{isBuyer ? '海外买家' : 'AI 客服'} · {msg.time}</span>
                      <div className={`p-4 rounded-2xl max-w-[85%] text-sm sm:text-base leading-relaxed ${
                        isBuyer
                          ? 'bg-[#0071e3] text-white rounded-tr-sm shadow-sm'
                          : 'bg-white/[0.08] text-[#f5f5f7] border border-white/[0.08] rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendSandboxMessage} className="p-4 bg-black/60 border-t border-white/[0.1] flex gap-3">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="扮演买家向 AI 客服提问..."
                  className="flex-1 h-12 px-5 bg-white/[0.06] border border-white/20 rounded-full text-sm sm:text-base text-white focus:outline-none focus:border-[#2997ff]"
                />
                <button
                  type="submit"
                  className="apple-blue-btn h-12 px-5 text-sm sm:text-base font-semibold flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Telemetry */}
            <div className="lg:col-span-5 apple-glass rounded-3xl p-7 space-y-5 overflow-y-auto h-[540px]">
              <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.1]">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2997ff]" />
                  <span>实时透视面板 (Live Inspector)</span>
                </span>
                <span className="text-xs font-semibold text-[#30d158] font-mono px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">03:14 同步写入</span>
              </div>

              <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/10 space-y-1.5">
                <span className="text-sm font-semibold text-[#d2d2d7] block">命中的知识条目：</span>
                <p className="font-mono text-[#2997ff] text-sm font-medium">《骨科3D多孔钛技术白皮书 M2.4 & 订购交期规则表》</p>
              </div>

              <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/10 flex justify-between items-center text-sm">
                <span className="text-[#d2d2d7] font-medium">意向等级自动判定：</span>
                <span className="font-mono font-bold text-[#30d158] text-base">HIGH 极高意向</span>
              </div>

              <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/10 space-y-2.5 text-sm">
                <span className="font-bold text-white block">生成的 CRM 线索卡片</span>
                <div className="font-mono text-sm space-y-1 text-[#f5f5f7]">
                  <p><span className="text-[#a1a1a6]">采购品类:</span> 3D 多孔钛脊柱假体</p>
                  <p><span className="text-[#a1a1a6]">首批数量:</span> 500 pcs</p>
                  <p><span className="text-[#a1a1a6]">交期要求:</span> 18 工作日</p>
                </div>
              </div>

              <button
                onClick={onGoToConfigurator}
                className="apple-blue-btn w-full h-12 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mt-2"
              >
                <span>为我的企业配置这套 AI 客服</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Demo Card */}
      {activeDemo === 'analytics' && (
        <div className="apple-glass rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="flex justify-between items-center border-b border-white/[0.1] pb-4">
            <div>
              <span className="text-sm font-mono text-[#2997ff] block mb-1">画册第 6 页实拍复刻</span>
              <h3 className="text-2xl font-bold text-white tracking-tight">爱康医疗全球官网实战看板</h3>
            </div>
            <span className="text-sm text-[#30d158] font-mono font-semibold">GA4 真实埋点</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white/[0.04] rounded-2xl border border-white/10 space-y-1">
              <span className="text-sm text-[#d2d2d7] block">海外高意向访问</span>
              <span className="text-3xl font-bold font-mono text-white block">18,420</span>
              <span className="text-xs font-semibold text-[#30d158] block mt-1">↑ 320% 环比增长</span>
            </div>
            <div className="p-5 bg-white/[0.04] rounded-2xl border border-white/10 space-y-1">
              <span className="text-sm text-[#d2d2d7] block">AI 渠道引荐 (Referral)</span>
              <span className="text-3xl font-bold font-mono text-[#2997ff] block">3,315</span>
              <span className="text-xs font-semibold text-[#a1a1a6] block mt-1">ChatGPT / Perplexity 来源</span>
            </div>
            <div className="p-5 bg-white/[0.04] rounded-2xl border border-white/10 space-y-1">
              <span className="text-sm text-[#d2d2d7] block">平均停留时长</span>
              <span className="text-3xl font-bold font-mono text-white block">4m 35s</span>
              <span className="text-xs font-semibold text-[#a1a1a6] block mt-1">深度阅读技术参数</span>
            </div>
            <div className="p-5 bg-white/[0.04] rounded-2xl border border-white/10 space-y-1">
              <span className="text-sm text-[#d2d2d7] block">累计有效询盘</span>
              <span className="text-3xl font-bold font-mono text-[#30d158] block">142 条</span>
              <span className="text-xs font-semibold text-[#30d158] block mt-1">零流失全部写入 CRM</span>
            </div>
          </div>
        </div>
      )}

      {/* Simple Fallbacks for other tabs */}
      {activeDemo === 'custom_data' && (
        <div className="apple-glass rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">用你自己的产品资料，现场建立专属微型知识库</h2>
          <textarea
            rows={5}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full p-4 bg-black/50 border border-white/[0.1] rounded-2xl text-xs text-white font-mono focus:outline-none focus:border-[#2997ff]"
          />
          <button onClick={handleIndexCustomData} className="apple-blue-btn px-6 py-2.5 text-xs">
            建立知识库
          </button>
        </div>
      )}

      {activeDemo === 'geo_compare' && (
        <div className="apple-glass rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">GEO 优化前后 AI 答案对比</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
              <span className="text-xs text-[#ff453a] font-semibold">优化前：AI 未提及您的品牌</span>
              <p className="text-xs text-[#86868b] leading-relaxed">
                When searching for orthopedic implant suppliers, typical multi-national corporations dominate results... (无中国品牌)
              </p>
            </div>
            <div className="p-6 bg-white/[0.03] border border-white/[0.1] rounded-2xl space-y-2">
              <span className="text-xs text-[#30d158] font-semibold">GEO 实施后：首位推荐并带权威信源</span>
              <p className="text-xs text-white leading-relaxed">
                Top certified manufacturers include AK Medical (ak-medical-global.com), globally noted for EBM 3D printing porous titanium implants...
              </p>
            </div>
          </div>
        </div>
      )}

      {activeDemo === 'fde_week' && (
        <div className="apple-glass rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">FDE 驻场工程师每周一轮敏捷循环</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['1. 现场观察 (周一~周二)', '2. 快速原型 (周三)', '3. 一线试用 (周四)', '4. 修改上线 (周五)'].map((step, idx) => (
              <div key={idx} className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-1">
                <span className="text-xs font-mono text-[#2997ff] block">阶段 0{idx + 1}</span>
                <h4 className="text-sm font-semibold text-white">{step}</h4>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
