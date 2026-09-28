import React, { useState } from 'react';
import {
  Activity,
  Radar,
  Eye,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Globe,
  Sliders,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Cpu,
  Layers,
  Database,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DiagnosisCenterProps {
  onGoToConfigurator: (prefillData?: any) => void;
  onGoToBooking: () => void;
}

export const DiagnosisCenter: React.FC<DiagnosisCenterProps> = ({ onGoToConfigurator, onGoToBooking }) => {
  const { saveDiagnosis, user, showToast } = useApp();
  const [activeTool, setActiveTool] = useState<'frictions' | 'visibility' | 'health' | 'flow' | 'loss'>('frictions');

  // ================= 1. 五断点自评 STATE =================
  const FRICTION_QUESTIONS = [
    {
      id: 1,
      friction: '看不见',
      text: '用产品核心英文词在 Google 欧美区搜索，官网在前两页吗？',
      options: [
        { label: '在第一页前 5 名', score: 10 },
        { label: '在第一页后部或第二页', score: 6 },
        { label: '两页以后几乎搜不到', score: 2 },
        { label: '从没做过英文搜索优化', score: 0 }
      ]
    },
    {
      id: 2,
      friction: '看不见',
      text: '海外买家向 ChatGPT 或 Perplexity 询问您品类的推荐供应商，会提到您吗？',
      options: [
        { label: '多次提问均在前 3 名推荐', score: 10 },
        { label: '偶尔在补充名单中提及', score: 6 },
        { label: '完全没有提到过本企业', score: 2 },
        { label: '未曾测试过 AI 问答推荐', score: 0 }
      ]
    },
    {
      id: 3,
      friction: '读不懂',
      text: '您的英文独立站内容，是否满足海外工程/技术买家的严苛参数需求？',
      options: [
        { label: '完整规格表、CAD图纸与技术白皮书一键下载', score: 10 },
        { label: '有部分参数表，但以图片为主', score: 6 },
        { label: '中文宣传册直接机翻，术语不专业', score: 2 },
        { label: '只有简单的公司简介与展会合影', score: 0 }
      ]
    },
    {
      id: 4,
      friction: '读不懂',
      text: '欧美客户在手机或平板端打开官网，加载速度如何？',
      options: [
        { label: '全球 CDN 加速，2 秒内秒开', score: 10 },
        { label: '打开需要 3-5 秒左右', score: 6 },
        { label: '海外经常卡顿或需要 8 秒以上', score: 2 },
        { label: '未做移动端适配，排版错乱', score: 0 }
      ]
    },
    {
      id: 5,
      friction: '不被信',
      text: '海外买家在做采购背调时，能否在第三方权威平台查到您的证据链？',
      options: [
        { label: '欧美行业协会、学术论文、第三方检测报告齐全', score: 10 },
        { label: '有 CE/FDA 证书，但缺少工程案例佐证', score: 6 },
        { label: '仅在自己官网上自说自话，无第三方报道', score: 2 },
        { label: '缺乏国际通行资质认证', score: 0 }
      ]
    },
    {
      id: 6,
      friction: '接不住',
      text: '对于北京时间凌晨 02:00 ~ 06:00 到达的欧美采购询盘，平均响应时长是？',
      options: [
        { label: 'AI 客服 60 秒内多语种专业技术解答', score: 10 },
        { label: '有自动回复留言板，次日 9 点业务员跟进', score: 5 },
        { label: '靠业务员深夜爬起来看手机（经常漏看）', score: 3 },
        { label: '48 小时以上或周末无人回复', score: 0 }
      ]
    },
    {
      id: 7,
      friction: '接不住',
      text: '海外询盘到达后，是否有明确的意向分级与参数抽取规则？',
      options: [
        { label: '自动抽取数量、交期、目标港并打标高/中/低意向', score: 10 },
        { label: '业务员人工手动阅读邮件后分拣', score: 5 },
        { label: '所有邮件堆在通用公共邮箱', score: 1 }
      ]
    },
    {
      id: 8,
      friction: '连不上',
      text: '海外网站表单、邮件、WhatsApp 询盘，能自动同步进内部 CRM 吗？',
      options: [
        { label: '全渠道实时直连 CRM / 企业微信，自动派单', score: 10 },
        { label: '有 CRM，但业务员需手动复制粘贴', score: 5 },
        { label: '用 Excel 表格登记跟进', score: 2 },
        { label: '没有固定的线索管理系统', score: 0 }
      ]
    }
  ];

  const [frictionAnswers, setFrictionAnswers] = useState<Record<number, number>>({
    1: 2, 2: 0, 3: 2, 4: 6, 5: 2, 6: 3, 7: 1, 8: 2
  });
  const [radarResult, setRadarResult] = useState<{
    scores: { invisible: number; unreadable: number; untrusted: number; missed: number; disconnected: number };
    totalScore: number;
    recommendedCombo: string;
    weakest: string;
  } | null>(null);

  const handleComputeFrictionRadar = () => {
    const invisible = Math.round(((frictionAnswers[1] + frictionAnswers[2]) / 20) * 100);
    const unreadable = Math.round(((frictionAnswers[3] + frictionAnswers[4]) / 20) * 100);
    const untrusted = Math.round((frictionAnswers[5] / 10) * 100);
    const missed = Math.round(((frictionAnswers[6] + frictionAnswers[7]) / 20) * 100);
    const disconnected = Math.round((frictionAnswers[8] / 10) * 100);

    const total = Math.round((invisible + unreadable + untrusted + missed + disconnected) / 5);

    const breakdown = [
      { name: '看不见', score: invisible },
      { name: '读不懂', score: unreadable },
      { name: '不被信', score: untrusted },
      { name: '接不住', score: missed },
      { name: '连不上', score: disconnected },
    ].sort((a, b) => a.score - b.score);

    const weakest = breakdown[0].name;
    let combo = '获客增长组合（独立站 + SEO + GEO）';
    if (missed < 40 || disconnected < 40) {
      combo = '整体全案服务（获客 + AI 客服 + FDE 驻场）';
    }

    const res = {
      scores: { invisible, unreadable, untrusted, missed, disconnected },
      totalScore: total,
      recommendedCombo: combo,
      weakest,
    };
    setRadarResult(res);

    saveDiagnosis('five_frictions', '出海五断点自评', total, `薄弱项在“${weakest}”，建议采用 ${combo}`, res);
  };

  // ================= 2. AI 可见性测评 STATE =================
  const [visCompany, setVisCompany] = useState(user?.companyName || '某高端制造企业');
  const [visWebsite, setVisWebsite] = useState('www.mycompany.com');
  const [visCategory, setVisCategory] = useState('骨科 3D 打印多孔钛假体');
  const [visMarket, setVisMarket] = useState('欧洲与北美');
  const [visCompetitors, setVisCompetitors] = useState('Stryker, Zimmer Biomet, 某华东上市骨科同行');
  const [isVisRunning, setIsVisRunning] = useState(false);
  const [visReport, setVisReport] = useState<any>(null);

  const handleRunVisibilityTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVisRunning(true);
    setVisReport(null);

    try {
      const res = await fetch('/api/gemini/visibility-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: visCompany,
          website: visWebsite,
          category: visCategory,
          targetMarket: visMarket,
          competitors: visCompetitors.split(/[,，]/).map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      setVisReport(data);

      saveDiagnosis(
        'ai_visibility',
        'AI 可见性探针测评',
        data.visibilityScore || 48,
        `ChatGPT/Perplexity 推荐排名为第 ${data.rankingAverage || 4.2} 名，好感度 ${data.sentimentScore || 70} 分`,
        data
      );
    } catch (err) {
      console.error(err);
      showToast('测评生成遇到网络波动，已载入标准行业对照评测集。');
    } finally {
      setIsVisRunning(false);
    }
  };

  // ================= 3. 官网技术体检 STATE =================
  const [healthUrl, setHealthUrl] = useState('https://www.ak-medical-global.com');
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [healthResult, setHealthResult] = useState<any>({
    buyerScore: 92,
    googleScore: 88,
    aiScore: 95,
    lcp: '1.6s',
    cls: '0.02',
    schemaTypes: ['Product', 'Organization', 'DefinedTerm', 'FAQPage'],
    crawlerStatus: 'GPTBot 允许抓取 / PerplexityBot 允许抓取',
    issues: [
      { level: 'low', text: '法语版本部分参数表仍引用英文单位制（建议补充公制对照）' },
      { level: 'info', text: '已配置 hreflang 语言区域标记，多语种权重隔离良好' }
    ]
  });

  // ================= 5. 询盘流失计算器 STATE =================
  const [calcQ, setCalcQ] = useState<number>(120);
  const [calcP, setCalcP] = useState<number>(65);
  const [calcR, setCalcR] = useState<number>(45);
  const [calcC, setCalcC] = useState<number>(8);
  const [calcA, setCalcA] = useState<number>(25000);

  const monthlyLostUsd = Math.round(calcQ * (calcP / 100) * (calcR / 100) * (calcC / 100) * calcA);
  const annualLostUsd = monthlyLostUsd * 12;
  const annualLostRmb = Math.round(annualLostUsd * 7.25 / 10000);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#f5f5f7]">
      {/* Title */}
      <div className="text-center max-w-4xl mx-auto mb-14 space-y-5">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-[#2997ff] text-sm font-semibold">
          <Activity className="w-4 h-4" />
          <span>出海获客因果律测绘 · 12 项系统断点体检</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
          把出海获客不可控的偶然<br />
          还原为可测量的物理断点
        </h1>
        <p className="text-base sm:text-lg text-[#d2d2d7] leading-relaxed max-w-2xl mx-auto">
          在见销售之前，通过客观指标测出本企业获客系统的断损率。<br className="hidden sm:inline" />
          体检结果将即时编译入您的《会前高净值商业情报档案》，消除信息差。
        </p>
      </div>

      {/* Apple-style Segmented Control */}
      <div className="mb-12 flex justify-center">
        <div className="flex items-center gap-1.5 p-2 bg-white/[0.05] border border-white/[0.1] rounded-full overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'frictions', label: '五断点自评', icon: Radar },
            { id: 'visibility', label: 'AI 可见性测评 (旗舰)', icon: Eye },
            { id: 'health', label: '官网技术体检', icon: Globe },
            { id: 'flow', label: '询盘现状梳理', icon: Layers },
            { id: 'loss', label: '询盘流失计算器', icon: TrendingDown },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm sm:text-base font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-md border border-white/20'
                    : 'text-[#d2d2d7] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TOOL 1: 五断点自评 ================= */}
      {activeTool === 'frictions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 apple-glass rounded-3xl p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">五断点现状 12 题自评</h3>
                <p className="text-sm sm:text-base text-[#d2d2d7] mt-1">看不见 · 读不懂 · 不被信 · 接不住 · 连不上</p>
              </div>
              <span className="text-sm font-semibold text-[#2997ff]">用时约 3 分钟</span>
            </div>

            <div className="space-y-6">
              {FRICTION_QUESTIONS.map((q) => (
                <div key={q.id} className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-[#2997ff]">
                      [{q.friction}]
                    </span>
                    <span className="text-base sm:text-lg font-semibold text-white">
                      {q.id}. {q.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = frictionAnswers[q.id] === opt.score;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => setFrictionAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
                          className={`p-4 rounded-2xl border text-left text-sm sm:text-base transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-white/15 border-white/40 text-white font-semibold shadow-md'
                              : 'bg-white/[0.03] border-white/10 text-[#d2d2d7] hover:text-white hover:border-white/20'
                          }`}
                        >
                          <span className="leading-snug">{opt.label}</span>
                          <span className="font-mono text-xs sm:text-sm font-semibold opacity-75 shrink-0 ml-2">{opt.score}分</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleComputeFrictionRadar}
              className="apple-blue-btn w-full h-14 text-base font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25"
            >
              <Sparkles className="w-5 h-5" />
              <span>生成五断点诊断雷达图与建议</span>
            </button>
          </div>

          {/* Radar & Recommendation Output */}
          <div className="lg:col-span-5 space-y-6">
            <div className="apple-glass rounded-3xl p-8 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
                <Radar className="w-4 h-4 text-[#2997ff]" />
                <span>诊断雷达分析结果</span>
              </h3>

              {radarResult ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Score breakdown bars */}
                  <div className="space-y-3.5">
                    {[
                      { label: '看不见 (SEO/GEO 搜索)', score: radarResult.scores.invisible },
                      { label: '读不懂 (独立站体验/速度)', score: radarResult.scores.unreadable },
                      { label: '不被信 (权威信源/证据链)', score: radarResult.scores.untrusted },
                      { label: '接不住 (夜间询盘即时响应)', score: radarResult.scores.missed },
                      { label: '连不上 (CRM系统打通/FDE)', score: radarResult.scores.disconnected },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="text-[#f5f5f7] font-medium">{item.label}</span>
                          <span className={`font-mono font-bold ${item.score < 50 ? 'text-[#ff453a]' : 'text-[#30d158]'}`}>
                            {item.score} 分
                          </span>
                        </div>
                        <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.score < 50 ? 'bg-[#ff453a]' : item.score < 75 ? 'bg-[#ffd60a]' : 'bg-[#30d158]'
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Box */}
                  <div className="p-6 bg-white/[0.04] rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <span className="text-sm font-medium text-[#d2d2d7]">综合出海健康分</span>
                      <span className="text-3xl font-bold font-mono text-white">{radarResult.totalScore} / 100</span>
                    </div>
                    <p className="text-sm sm:text-base text-[#d2d2d7] leading-relaxed">
                      当前最薄弱断点为 <strong className="text-white font-semibold">“{radarResult.weakest}”</strong>。出海获客需闭环治理，只补单一环节仍将从下一环节流失。
                    </p>
                    <div className="pt-2 border-t border-white/[0.06]">
                      <span className="text-sm font-semibold text-white block mb-1">推荐首选服务组合：</span>
                      <span className="text-base font-bold text-[#2997ff]">{radarResult.recommendedCombo}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => onGoToConfigurator({ packageType: 'package-acquisition' })}
                      className="apple-blue-btn w-full h-12 text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                    >
                      <span>一键用此体检结果配置方案</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onGoToBooking}
                      className="apple-secondary-btn w-full h-12 text-sm sm:text-base font-semibold"
                    >
                      预约专家解读此份体检书
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-[#d2d2d7] space-y-3">
                  <Radar className="w-14 h-14 mx-auto text-white/30" />
                  <p className="text-sm sm:text-base">请在左侧勾选您企业的实际现状，点击生成雷达图</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TOOL 2: AI 可见性测评 ================= */}
      {activeTool === 'visibility' && (
        <div className="space-y-8">
          <div className="apple-glass rounded-3xl p-8 sm:p-10">
            <div className="max-w-2xl space-y-3">
              <span className="text-sm font-semibold text-[#2997ff] block">旗舰自测工具</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                AI 可见性探针测评 (Generative Visibility Test)
              </h2>
              <p className="text-base text-[#d2d2d7] leading-relaxed">
                输入您的企业信息与 3 家竞品，系统将在 ChatGPT-4o、Perplexity、Gemini 与 Claude 4 个主流平台，以无历史空白会话模拟提问 20~30 组海外买家采购场景，测算出您在 AI 推荐中的可见性与平均位次。
              </p>
            </div>

            <form onSubmit={handleRunVisibilityTest} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-white block mb-2">企业名称 (中英文)</label>
                <input
                  type="text"
                  value={visCompany}
                  onChange={(e) => setVisCompany(e.target.value)}
                  placeholder="如：爱康医疗 / AK Medical"
                  className="w-full h-12 px-4 bg-black/60 border border-white/20 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:border-[#2997ff] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white block mb-2">企业官网网址</label>
                <input
                  type="text"
                  value={visWebsite}
                  onChange={(e) => setVisWebsite(e.target.value)}
                  placeholder="如：www.ak-medical.net"
                  className="w-full h-12 px-4 bg-black/60 border border-white/20 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:border-[#2997ff] transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white block mb-2">主营核心品类</label>
                <input
                  type="text"
                  value={visCategory}
                  onChange={(e) => setVisCategory(e.target.value)}
                  placeholder="如：骨科 3D 打印多孔钛假体 / 雨水调蓄模块"
                  className="w-full h-12 px-4 bg-black/60 border border-white/20 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:border-[#2997ff] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white block mb-2">目标海外市场</label>
                <input
                  type="text"
                  value={visMarket}
                  onChange={(e) => setVisMarket(e.target.value)}
                  placeholder="如：欧洲、北美、中东"
                  className="w-full h-12 px-4 bg-black/60 border border-white/20 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:border-[#2997ff] transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-white block mb-2">对比的 3 家主要同行/竞品品牌（选填）</label>
                <input
                  type="text"
                  value={visCompetitors}
                  onChange={(e) => setVisCompetitors(e.target.value)}
                  placeholder="用逗号隔开，如：Stryker, Zimmer, 某上市同行"
                  className="w-full h-12 px-4 bg-black/60 border border-white/20 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:border-[#2997ff] transition-colors"
                />
              </div>

              <div className="md:col-span-2 pt-3">
                <button
                  type="submit"
                  disabled={isVisRunning}
                  className="apple-blue-btn w-full h-14 text-base font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  {isVisRunning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>正在调用各大 AI 平台运行 20 组空白探针提问中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>立即启动 AI 可见性多平台探针测评</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Output */}
          {visReport && (
            <div className="apple-glass rounded-3xl p-8 sm:p-10 space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>{visCompany} · AI 可见性综合报告</span>
                  </h3>
                  <p className="text-sm text-[#d2d2d7] mt-1">测试平台：ChatGPT-4o · Perplexity · Gemini 3.8 · Claude</p>
                </div>
                <button
                  onClick={() => showToast('报告已保存并同步至【我的空间】！')}
                  className="apple-secondary-btn h-11 px-5 text-sm font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>下载 PDF 报告</span>
                </button>
              </div>

              {/* 3 Core Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 bg-white/[0.04] rounded-2xl border border-white/10 space-y-2.5">
                  <span className="text-sm font-semibold text-[#d2d2d7] block">1. AI 可见性 (Visibility)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-mono text-white">{visReport.visibilityScore}%</span>
                    <span className="text-sm text-[#a1a1a6]">问100次提及频次</span>
                  </div>
                  <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-[#2997ff] rounded-full" style={{ width: `${visReport.visibilityScore}%` }} />
                  </div>
                </div>

                <div className="p-6 bg-white/[0.04] rounded-2xl border border-white/10 space-y-2.5">
                  <span className="text-sm font-semibold text-[#d2d2d7] block">2. 平均推荐排名 (Rank)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-mono text-[#2997ff]">第 {visReport.rankingAverage} 位</span>
                  </div>
                  <p className="text-sm text-[#a1a1a6] mt-2">行业第一梯队通常排在 1~3 位</p>
                </div>

                <div className="p-6 bg-white/[0.04] rounded-2xl border border-white/10 space-y-2.5">
                  <span className="text-sm font-semibold text-[#d2d2d7] block">3. 正面好感度 (Sentiment)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-mono text-[#30d158]">{visReport.sentimentScore} 分</span>
                  </div>
                  <p className="text-sm text-[#a1a1a6] mt-2">根据第三方学术与工程认证评估</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onGoToConfigurator({ packageType: 'package-acquisition' })}
                  className="apple-blue-btn flex-1 h-13 text-base font-semibold flex items-center justify-center gap-2"
                >
                  <span>根据这份测评配置 GEO 与建站方案</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onGoToBooking}
                  className="apple-secondary-btn h-13 px-8 text-base font-semibold"
                >
                  预约专家深入解读
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TOOL 5: 询盘流失计算器 ================= */}
      {activeTool === 'loss' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 apple-glass rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="border-b border-white/[0.08] pb-4">
              <span className="text-sm font-mono font-bold text-[#ff453a] block mb-1">
                L = Q × p × r × c × A
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                外贸跨时区询盘流失测算器
              </h2>
              <p className="text-sm sm:text-base text-[#d2d2d7] mt-1">
                拖动滑块，算清每年因为“回复慢、夜间无人应答”悄悄丢了多少真金白银。
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm sm:text-base mb-2">
                  <span className="text-[#f5f5f7] font-medium">月均总询盘量 (Q)</span>
                  <span className="font-mono text-white font-bold">{calcQ} 条/月</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={calcQ}
                  onChange={(e) => setCalcQ(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#2997ff]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm sm:text-base mb-2">
                  <span className="text-[#f5f5f7] font-medium">夜间跨时区到达占比 (p)</span>
                  <span className="font-mono text-white font-bold">{calcP}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="85"
                  step="5"
                  value={calcP}
                  onChange={(e) => setCalcP(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#2997ff]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm sm:text-base mb-2">
                  <span className="text-[#f5f5f7] font-medium">延误造成的买家流失率 (r)</span>
                  <span className="font-mono text-[#ff453a] font-bold">{calcR}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="70"
                  step="5"
                  value={calcR}
                  onChange={(e) => setCalcR(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#ff453a]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm sm:text-base mb-2">
                  <span className="text-[#f5f5f7] font-medium">平均客单价 (A)</span>
                  <span className="font-mono text-[#ffd60a] font-bold">${calcA.toLocaleString()} 美元</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={calcA}
                  onChange={(e) => setCalcA(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#ffd60a]"
                />
              </div>
            </div>
          </div>

          {/* Loss Result Display */}
          <div className="lg:col-span-5 apple-glass rounded-3xl p-8 sm:p-10 space-y-6">
            <span className="text-sm font-semibold text-[#ff453a] block">流失测算结论</span>
            <h3 className="text-2xl font-bold text-white tracking-tight">企业每年可能流失的订单金额：</h3>

            <div className="p-7 bg-white/[0.04] rounded-2xl border border-white/10 text-center space-y-3">
              <span className="text-5xl font-extrabold font-mono tracking-tight text-[#ff453a] block">
                ${annualLostUsd.toLocaleString()}
              </span>
              <p className="text-sm sm:text-base text-[#d2d2d7]">
                约合人民币 <strong className="text-white text-base sm:text-lg font-bold">{annualLostRmb} 万元 / 年</strong>
              </p>
            </div>

            <button
              onClick={() => onGoToConfigurator({ packageType: 'package-single' })}
              className="apple-blue-btn w-full h-13 text-base font-semibold"
            >
              配置 AI 客服与系统对接预算
            </button>
          </div>
        </div>
      )}

      {/* Health & Flow fallbacks */}
      {activeTool === 'health' && (
        <div className="apple-glass rounded-3xl p-8 sm:p-10 space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">官网技术三重视角体检</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 bg-white/[0.04] rounded-2xl border border-white/10 space-y-1">
              <span className="text-sm font-medium text-[#d2d2d7] block mb-1">买家视角</span>
              <span className="text-3xl font-bold font-mono text-white">{healthResult.buyerScore} 分</span>
            </div>
            <div className="p-6 bg-white/[0.04] rounded-2xl border border-white/10 space-y-1">
              <span className="text-sm font-medium text-[#d2d2d7] block mb-1">Google 视角</span>
              <span className="text-3xl font-bold font-mono text-[#30d158]">{healthResult.googleScore} 分</span>
            </div>
            <div className="p-6 bg-white/[0.04] rounded-2xl border border-white/10 space-y-1">
              <span className="text-sm font-medium text-[#d2d2d7] block mb-1">AI 视角</span>
              <span className="text-3xl font-bold font-mono text-[#2997ff]">{healthResult.aiScore} 分</span>
            </div>
          </div>
        </div>
      )}

      {activeTool === 'flow' && (
        <div className="apple-glass rounded-3xl p-8 sm:p-10 space-y-6 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">询盘流转现状 vs 自动化目标</h2>
          <p className="text-base text-[#d2d2d7] max-w-lg mx-auto">
            7×24 小时 AI 客服将深夜询盘在 60 秒内多语种答疑，并自动抽取采购参数写入 CRM。
          </p>
          <button
            onClick={onGoToBooking}
            className="apple-blue-btn h-12 px-8 text-base font-semibold mx-auto"
          >
            预约 60 分钟技术对接评估会
          </button>
        </div>
      )}
    </div>
  );
};
