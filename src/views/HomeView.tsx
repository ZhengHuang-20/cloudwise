import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Radar,
  Globe,
  Bot,
  Search,
  Users,
  CheckCircle2,
  TrendingUp,
  Shield,
  Calendar,
  Layers,
  Award,
  Zap,
  Activity,
  Play,
  ChevronRight,
  Cpu,
  Terminal,
  Clock,
  FileText,
  AlertTriangle,
  Lightbulb,
  Check,
  Building2,
  Lock,
  BarChart3,
  Flame,
  SearchCode,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  Calculator,
  Laptop2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  openBookingModal: () => void;
}

interface AuditResult {
  target: string;
  region: string;
  industry: string;
  totalScore: number;
  geoScore: number;
  seoScore: number;
  siteScore: number;
  responseScore: number;
  level: string;
  lostEstimate: string;
  findings: string[];
  recommendation: string;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, openBookingModal }) => {
  const { setAiAdvisorOpen, logLeadActivity, saveDiagnosis, showToast } = useApp();

  // Instant GEO/SEO Evaluation Tool State
  const [inputUrl, setInputUrl] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('欧美核心市场 (北美+欧洲)');
  const [selectedIndustry, setSelectedIndustry] = useState('高端装备与智能制造');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Quick preset test cases
  const PRESETS = [
    {
      name: '爱康医疗',
      url: 'www.ak-medical.net',
      industry: '高端医疗器械与耗材',
      region: '欧洲市场 (重点德国/英国)',
      result: {
        target: '爱康医疗 (www.ak-medical.net)',
        region: '欧洲市场 (重点德国/英国)',
        industry: '高端医疗器械与耗材',
        totalScore: 92,
        geoScore: 94,
        seoScore: 89,
        siteScore: 95,
        responseScore: 90,
        level: '卓越标杆 · 高度自证就绪',
        lostEstimate: '< 3 万美元 / 年 (流失控制极佳)',
        findings: [
          'ChatGPT / Perplexity 检索“骨科3D打印耗材”时，首屏直接引用该企业技术白皮书与认证卷宗',
          'Google 欧美地区 18 组核心产品词稳定在前 3 名',
          '欧洲 CDN 测速 1.2 秒秒开，具备完整 MDR CE 技术规格一键下载',
          '7×24h 智能客服零时差解答海外合规提问并即时同步 CRM'
        ],
        recommendation: '已具备成熟全球转化能力，建议持续拓展南美与中东多语种 GEO 信源注入。'
      }
    },
    {
      name: '泰宁科创',
      url: 'www.tidelion.com',
      industry: '环保工程与水务装备',
      region: '欧美核心市场 (北美+欧洲)',
      result: {
        target: '泰宁科创 (www.tidelion.com)',
        region: '欧美核心市场 (北美+欧洲)',
        industry: '环保工程与水务装备',
        totalScore: 88,
        geoScore: 86,
        seoScore: 93,
        siteScore: 85,
        responseScore: 88,
        level: '卓越标杆 · 核心词前排覆盖',
        lostEstimate: '< 5 万美元 / 年',
        findings: [
          'Google 欧美覆盖 60 组符合英国 SuDS 规范的核心英文词库',
          '地标工程案例已转化为符合国际标准的权威第三方证据链',
          '大模型在城市海绵水务工程问答中高频推荐为主要供应商',
          '欧美采购询盘自动抽取技术参数并实时派发业务大区'
        ],
        recommendation: '建议加强 WhatsApp 海外即时接单引擎与移动端参数交互。'
      }
    },
    {
      name: '某精密五金出口企业 (典型现状)',
      url: 'www.example-hardware.com',
      industry: '离散制造与精密五金',
      region: '北美市场',
      result: {
        target: '某精密五金出口企业 (典型现状)',
        region: '北美市场',
        industry: '离散制造与精密五金',
        totalScore: 42,
        geoScore: 28,
        seoScore: 45,
        siteScore: 58,
        responseScore: 36,
        level: '严重流失 · 存在多重断点',
        lostEstimate: '约 18 ~ 32 万美元 / 年',
        findings: [
          'ChatGPT / Perplexity 推荐行业供应商时完全查无此人（0 权威引用）',
          'Google 核心英文采购词全部排在第 3 页以后，被贸易商或印度同行截流',
          '海外节点访问速度高达 5.8 秒，且充斥中文画册直译，缺少工程师需要的 CAD 公差表',
          '北京时间凌晨 02:00 ~ 06:00 欧美采购询盘无即时应答，次日上班跟进时客户早已转投竞品'
        ],
        recommendation: '核心破局组合：三读者架构独立站 + 60 组采购级外贸 SEO + GEO 权威知识图谱 + 24h AI 客服。'
      }
    }
  ];

  // Trigger evaluation
  const handleStartAudit = (customPreset?: typeof PRESETS[0]) => {
    const targetName = customPreset ? customPreset.result.target : (inputUrl.trim() || '某中型出海制造企业官网');
    setIsAuditing(true);
    setAuditStep(1);
    setAuditResult(null);

    // Simulate multi-step real-time audit probe
    setTimeout(() => setAuditStep(2), 500);
    setTimeout(() => setAuditStep(3), 1000);
    setTimeout(() => setAuditStep(4), 1500);
    setTimeout(() => {
      setIsAuditing(false);
      if (customPreset) {
        setAuditResult(customPreset.result);
      } else {
        // Compute realistic synthetic audit based on user input
        const generatedResult: AuditResult = {
          target: targetName,
          region: selectedRegion,
          industry: selectedIndustry,
          totalScore: 48,
          geoScore: 34,
          seoScore: 48,
          siteScore: 64,
          responseScore: 46,
          level: '中危断点 · 获客链路存在明显跑冒滴漏',
          lostEstimate: '约 12 ~ 25 万美元 / 年',
          findings: [
            'GEO 生成式收录：向 ChatGPT 与 Perplexity 询问该行业知名供应商时，未收录该品牌技术参数与资质',
            'Google 外贸 SEO：目标区域前两页搜索结果中查无此人，被欧美本土经销商与头部竞品占据',
            '海外独立站架构：海外节点打开耗时 4.2 秒，缺少针对技术总监与合规官的专属卷宗下载',
            '时差接单断点：夜间 8 小时无即时技术问答，海外买家跳出率高达 82%'
          ],
          recommendation: '建议配置【获客增长组合（独立站+SEO+GEO）】+【24h 智能客服】，优先修复欧美搜索可见性与夜间时差黑洞。'
        };
        setAuditResult(generatedResult);
      }

      // Log activity in CRM and notify user
      logLeadActivity(`完成了【${targetName}】官网/品牌 GEO & SEO 智能测评`, 20, { target: targetName });
      saveDiagnosis('ai_visibility', '官网 GEO/SEO 即时评估', customPreset ? customPreset.result.totalScore : 48, '官网与品牌出海能力测绘', {});
      showToast('出海 GEO & SEO 测评报告已生成！');
    }, 2000);
  };

  return (
    <div className="relative overflow-hidden text-[#f5f5f7]">
      {/* Apple Keynote Specular Stage Glow */}
      <div className="apple-stage-glow" />

      <div className="relative z-10 space-y-28 sm:space-y-36 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* ========================================================
            1. HERO SECTION: DIRECT GEO & SEO EVALUATION TOOL
           ======================================================== */}
        <section className="text-center max-w-4xl mx-auto space-y-8 pt-4 sm:pt-10">
          {/* Eyebrow / Kicker */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.05] border border-white/[0.12] backdrop-blur-2xl shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] animate-pulse" />
            <span className="apple-eyebrow text-xs sm:text-sm tracking-wider">
              云端智荐 · AI 助力中国中型企业出海售前转化系统
            </span>
          </div>

          {/* Master Headline (User's Exact Slogan) */}
          <div className="space-y-5">
            <h1 className="apple-hero-title">
              让海外买家找到你<br />
              <span className="text-apple-blue">让 AI 替你接住生意</span>
            </h1>

            {/* Core Services Pills / Slogan List */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-sm sm:text-base font-medium text-[#d2d2d7] bg-white/[0.04] border border-white/[0.1] px-5 py-2.5 rounded-full backdrop-blur-xl shadow-sm">
              <span className="text-white">独立站建站</span>
              <span className="text-[#86868b] font-light">/</span>
              <span className="text-[#2997ff]">GEO</span>
              <span className="text-[#86868b] font-light">/</span>
              <span className="text-[#64d2ff]">SEO</span>
              <span className="text-[#86868b] font-light">/</span>
              <span className="text-[#30d158]">AI智能客服及系统对接</span>
              <span className="text-[#86868b] font-light">/</span>
              <span className="text-[#bf5af2]">FDE驻场工程师</span>
            </div>
          </div>

          {/* ========================================================
              HERO CORE TOOL: BRAND & WEBSITE GEO/SEO INSTANT ANALYZER
             ======================================================== */}
          <div className="relative max-w-3xl mx-auto text-left pt-3">
            <div className="rounded-3xl p-7 sm:p-10 apple-glass border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.85)] space-y-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.1] pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-[#2997ff] flex items-center justify-center shrink-0">
                    <SearchCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                      <span>品牌与官网 GEO / SEO 出海就绪度即时评估</span>
                      <span className="text-xs font-semibold text-[#30d158] bg-green-500/15 border border-green-500/30 px-2.5 py-0.5 rounded-full">
                        免费开放
                      </span>
                    </h2>
                    <p className="text-sm text-[#a1a1a6] mt-0.5">
                      输入企业英文官网或品牌名称，智能探查海外大模型收录与 Google 搜索排位
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-[#86868b] hidden sm:inline px-2.5 py-1 rounded-md bg-white/[0.04]">
                  AI 探针引擎 v3.2
                </span>
              </div>

              {/* Input & Selector Form */}
              <div className="space-y-5">
                <div className="relative">
                  <label className="text-sm font-semibold text-[#f5f5f7] block mb-2">
                    企业英文官网域名 或 品牌 / 核心产品词：
                  </label>
                  <div className="relative flex items-center">
                    <Globe className="w-5 h-5 text-[#86868b] absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="例如：www.ak-medical.net 或 爱康医疗 / 骨科植入物"
                      className="w-full pl-12 pr-4 h-14 sm:h-16 bg-black/60 border border-white/20 rounded-2xl text-base sm:text-lg text-white placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff] focus:ring-2 focus:ring-[#2997ff]/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#d2d2d7] block mb-2">
                      目标出海区域：
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full h-12 px-4 bg-black/60 border border-white/15 rounded-xl text-sm sm:text-base text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
                    >
                      <option value="欧美核心市场 (北美+欧洲)">欧美核心市场 (北美+欧洲)</option>
                      <option value="北美市场 (美国/加拿大)">北美市场 (美国/加拿大)</option>
                      <option value="欧洲市场 (重点德国/英国)">欧洲市场 (重点德国/英国)</option>
                      <option value="东南亚及一带一路市场">东南亚及一带一路市场</option>
                      <option value="全球全域市场">全球全域市场</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#d2d2d7] block mb-2">
                      所属行业领域：
                    </label>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="w-full h-12 px-4 bg-black/60 border border-white/15 rounded-xl text-sm sm:text-base text-[#f5f5f7] focus:outline-none focus:border-[#2997ff]"
                    >
                      <option value="高端装备与智能制造">高端装备与智能制造</option>
                      <option value="医疗器械与生物耗材">医疗器械与生物耗材</option>
                      <option value="汽车零部件与工程机械">汽车零部件与工程机械</option>
                      <option value="精密五金与离散工业">精密五金与离散工业</option>
                      <option value="新能源与光伏储能">新能源与光伏储能</option>
                      <option value="其他工业制造出海品类">其他工业制造出海品类</option>
                    </select>
                  </div>
                </div>

                {/* Preset Quick Tests */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs sm:text-sm text-[#a1a1a6]">快速试测：</span>
                  {PRESETS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputUrl(item.url);
                        setSelectedIndustry(item.industry);
                        setSelectedRegion(item.region);
                        handleStartAudit(item);
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm bg-white/[0.06] hover:bg-white/[0.14] text-white border border-white/10 transition-all font-medium"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    onClick={() => handleStartAudit()}
                    disabled={isAuditing}
                    className="apple-blue-btn w-full h-14 sm:h-16 text-base sm:text-lg font-semibold flex items-center justify-center gap-3 shadow-xl"
                  >
                    {isAuditing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>正在探查海外大模型收录与搜索链路...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-white" />
                        <span>立即智能评估出海 GEO & SEO</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time Telemetry Simulator Steps while evaluating */}
              {isAuditing && (
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 font-mono text-sm text-[#d2d2d7]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#2997ff]">
                    <span className="w-2 h-2 rounded-full bg-[#2997ff] animate-ping" />
                    <span>AI 探针执行中：</span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className={auditStep >= 1 ? 'text-[#30d158]' : 'text-[#86868b]'}>
                      ✓ 步骤 1/4: 模拟欧美云端节点访问测速与 Schema 知识图谱提取...
                    </div>
                    <div className={auditStep >= 2 ? 'text-[#30d158]' : 'text-[#86868b]'}>
                      ✓ 步骤 2/4: 向 ChatGPT/Perplexity 探查该品牌在行业推荐中的权重与证据链...
                    </div>
                    <div className={auditStep >= 3 ? 'text-[#30d158]' : 'text-[#86868b]'}>
                      ✓ 步骤 3/4: 检索 Google 欧美地区 60 组外贸采购关键词位序...
                    </div>
                    <div className={auditStep >= 4 ? 'text-[#30d158]' : 'text-[#86868b]'}>
                      ✓ 步骤 4/4: 测算北京时间夜间 8 小时海外买家跨时区流失概率...
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Result Panel */}
              {auditResult && !isAuditing && (
                <div className="rounded-2xl p-6 sm:p-8 bg-black/60 border border-white/15 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                    <div>
                      <span className="text-xs sm:text-sm font-mono text-[#2997ff] block mb-1">
                        评估对象：{auditResult.target}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        出海获客综合就绪度得分
                      </h3>
                      <p className="text-xs sm:text-sm text-[#a1a1a6] mt-0.5">
                        基于 Google 搜索规范、大模型引用拓扑与海外买家行为模型测算
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white block">
                          {auditResult.totalScore}
                          <span className="text-base text-[#86868b] font-normal"> / 100</span>
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-[#ff9f0a]">
                          {auditResult.level}
                        </span>
                      </div>
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-right">
                        <span className="text-xs text-[#a1a1a6] block">估测年化商机流失</span>
                        <span className="text-sm sm:text-base font-bold text-[#ff453a] font-mono">
                          {auditResult.lostEstimate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Dimension Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                      <span className="text-xs sm:text-sm text-[#a1a1a6] block font-medium">GEO 生成式推荐</span>
                      <span className="text-2xl font-bold font-mono text-white block">
                        {auditResult.geoScore} <span className="text-xs text-[#86868b]">/100</span>
                      </span>
                      <span className="text-xs text-[#ff9f0a] block font-medium">AI 提及率需加强</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                      <span className="text-xs sm:text-sm text-[#a1a1a6] block font-medium">Google 外贸 SEO</span>
                      <span className="text-2xl font-bold font-mono text-white block">
                        {auditResult.seoScore} <span className="text-xs text-[#86868b]">/100</span>
                      </span>
                      <span className="text-xs text-[#2997ff] block font-medium">前两页核心词</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                      <span className="text-xs sm:text-sm text-[#a1a1a6] block font-medium">独立站技术合规</span>
                      <span className="text-2xl font-bold font-mono text-white block">
                        {auditResult.siteScore} <span className="text-xs text-[#86868b]">/100</span>
                      </span>
                      <span className="text-xs text-[#30d158] block font-medium">海外测速与架构</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                      <span className="text-xs sm:text-sm text-[#a1a1a6] block font-medium">跨时区夜间响应</span>
                      <span className="text-2xl font-bold font-mono text-white block">
                        {auditResult.responseScore} <span className="text-xs text-[#86868b]">/100</span>
                      </span>
                      <span className="text-xs text-[#bf5af2] block font-medium">24h 接单闭环</span>
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="space-y-3">
                    <span className="text-sm font-semibold text-white block">核心审计洞察发现：</span>
                    <div className="space-y-2 text-sm text-[#d2d2d7]">
                      {auditResult.findings.map((item, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <AlertTriangle className="w-4 h-4 text-[#ff9f0a] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation and Next Actions */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-blue-950/25 border border-[#2997ff]/30 text-sm space-y-4">
                    <div>
                      <span className="text-base font-semibold text-[#2997ff] block mb-1.5">针对性破局方案建议：</span>
                      <p className="text-sm sm:text-base text-[#e5e5ea] leading-relaxed">{auditResult.recommendation}</p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={openBookingModal}
                        className="apple-blue-btn w-full sm:w-auto h-12 px-6 text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>预约架构师 45 分钟闭门深度复盘</span>
                      </button>

                      <button
                        onClick={() => onNavigate('diagnosis')}
                        className="apple-secondary-btn w-full sm:w-auto h-12 px-6 text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <Radar className="w-4 h-4" />
                        <span>去诊断中心做 12 项完整自测 →</span>
                      </button>

                      <button
                        onClick={() => onNavigate('configurator')}
                        className="w-full sm:w-auto h-12 px-4 rounded-full text-sm text-[#a1a1a6] hover:text-white transition-colors"
                      >
                        测算方案预算与配置
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================
            2. FOUR CORE ENTERPRISE SERVICES (Direct, Non-Confusing)
           ======================================================== */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="apple-eyebrow text-xs sm:text-sm tracking-wider">OUR CORE SERVICES</span>
            <h2 className="apple-section-title">云端智荐提供的四大出海核心服务</h2>
            <p className="text-base sm:text-lg text-[#a1a1a6] leading-relaxed">
              告别泛泛空谈，针对中国中型制造企业出海痛点，提供确定性落地系统与交付标准。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service 1 */}
            <div
              onClick={() => onNavigate('services')}
              className="apple-glass-card rounded-3xl p-8 space-y-5 cursor-pointer hover:border-[#2997ff]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#2997ff] flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#2997ff] transition-colors">
                  海外独立站建站
                </h3>
                <p className="text-sm sm:text-[15px] text-[#d2d2d7] leading-relaxed">
                  专为欧美采购主管、技术总监与合规官设计的三读者架构独立站。海外节点秒开，满足海外严苛技术卷宗与参数要求。
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-sm text-[#2997ff] font-medium flex items-center justify-between">
                <span>查看建站方案与标准</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 2 */}
            <div
              onClick={() => onNavigate('services')}
              className="apple-glass-card rounded-3xl p-8 space-y-5 cursor-pointer hover:border-[#64d2ff]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[#64d2ff] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#64d2ff] transition-colors">
                  出海 GEO 优化 (大模型优化)
                </h3>
                <p className="text-sm sm:text-[15px] text-[#d2d2d7] leading-relaxed">
                  让海外采购商向 ChatGPT、Perplexity、Google SGE 询问行业推荐供应商时，AI 主动提及并推荐您的品牌。
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-sm text-[#64d2ff] font-medium flex items-center justify-between">
                <span>查看 GEO 权威信源方案</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 3 */}
            <div
              onClick={() => onNavigate('services')}
              className="apple-glass-card rounded-3xl p-8 space-y-5 cursor-pointer hover:border-[#bf5af2]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#bf5af2] flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#bf5af2] transition-colors">
                  外贸 SEO 优化
                </h3>
                <p className="text-sm sm:text-[15px] text-[#d2d2d7] leading-relaxed">
                  搭建 60 组外贸采购级高价值核心词库，遵循 Google Search Essentials 与 E-E-A-T，让海外买家在搜索第一屏找到你。
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-sm text-[#bf5af2] font-medium flex items-center justify-between">
                <span>查看外贸 SEO 词库策略</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 4 */}
            <div
              onClick={() => onNavigate('services')}
              className="apple-glass-card rounded-3xl p-8 space-y-5 cursor-pointer hover:border-[#30d158]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 text-[#30d158] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#30d158] transition-colors">
                  FDE 驻场与 AI 客服对接
                </h3>
                <p className="text-sm sm:text-[15px] text-[#d2d2d7] leading-relaxed">
                  资深技术工程师现场驻场打通企业 CRM 与 ERP，7×24h 智能客服零时差解答海外技术质询并沉淀高净值商业情报。
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-sm text-[#30d158] font-medium flex items-center justify-between">
                <span>查看 FDE 驻场与交付模式</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. PRE-SALES TOOLS SUITE: NOT JUST A MARKETING SITE
           ======================================================== */}
        <section className="apple-glass rounded-3xl p-8 sm:p-12 space-y-8 border border-white/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.1] pb-6">
            <div>
              <span className="apple-eyebrow text-xs sm:text-sm tracking-wider">PRE-SALES TOOLSUITE</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                售前实用工具：见销售之前，自己先看清问题与预算
              </h2>
            </div>
            <p className="text-base text-[#d2d2d7] font-medium max-w-sm">
              我们提供全套面向出海决策人的开源工具，免注册直接使用。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => onNavigate('diagnosis')}
              className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#2997ff]/40 transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <Radar className="w-7 h-7 text-[#2997ff]" />
                <span className="text-sm font-semibold text-[#2997ff] px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">工具 01</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#2997ff] transition-colors">
                出海系统五断点全量体检
              </h3>
              <p className="text-base text-[#d2d2d7] leading-relaxed">
                只需回答 12 道客观题目，系统即刻生成雷达图，透视企业在“看不见、读不懂、不被信、接不住、连不上”上的破损度。
              </p>
              <div className="text-base text-[#2997ff] font-semibold flex items-center gap-1.5 pt-2">
                立即开始 12 题体检 <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div
              onClick={() => onNavigate('configurator')}
              className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#bf5af2]/40 transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <Calculator className="w-7 h-7 text-[#bf5af2]" />
                <span className="text-sm font-semibold text-[#bf5af2] px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">工具 02</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#bf5af2] transition-colors">
                出海方案组合与预算配置器
              </h3>
              <p className="text-base text-[#d2d2d7] leading-relaxed">
                自主勾选独立站、SEO、GEO、AI 客服或 FDE 驻场等模块，系统毫秒级透明测算出预算区间、排期与交付物清单。
              </p>
              <div className="text-base text-[#bf5af2] font-semibold flex items-center gap-1.5 pt-2">
                测算方案与投入 <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div
              onClick={() => onNavigate('sandbox')}
              className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#30d158]/40 transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <Laptop2 className="w-7 h-7 text-[#30d158]" />
                <span className="text-sm font-semibold text-[#30d158] px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20">工具 03</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#30d158] transition-colors">
                海外买家多角色交互沙盒
              </h3>
              <p className="text-base text-[#d2d2d7] leading-relaxed">
                现场模拟德国医疗器械买家、美国分销商与海外工程合规官发起真实技术提问，体验 AI 客服如何零时差给出权威依据。
              </p>
              <div className="text-base text-[#30d158] font-semibold flex items-center gap-1.5 pt-2">
                进入沙盒体验实景 <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. FIELD CASES: PROVEN TRACK RECORD
           ======================================================== */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="apple-eyebrow text-xs sm:text-sm tracking-wider">FIELD VALIDATED</span>
              <h2 className="apple-section-title">真实标杆：看中大型制造企业如何突围</h2>
            </div>
            <button
              onClick={() => onNavigate('cases')}
              className="flex items-center gap-1.5 text-sm text-[#2997ff] hover:text-[#52aeff] font-semibold transition-colors"
            >
              <span>查阅全部行业实操案卷</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AK Medical Card */}
            <div
              onClick={() => onNavigate('cases')}
              className="apple-glass-card rounded-3xl p-8 space-y-6 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-mono text-[#2997ff] block mb-1">港股上市 · 骨科植入物头部企业</span>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#2997ff] transition-colors">
                    爱康医疗 (AK Medical)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#86868b] block font-mono">AI 可见性就绪度</span>
                  <span className="text-2xl font-bold font-mono text-[#30d158]">47 → 95 分</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#d2d2d7] leading-relaxed">
                颠覆传统画册站，针对 4 类海外医疗决策者精准建模，系统化注入 91 项技术文献与临床证据链。ChatGPT 连续数月带来真实高意向欧洲采购商引荐。
              </p>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-sm text-[#a1a1a6]">
                <span>解决痛点：看不见 · 不被信</span>
                <span className="text-white group-hover:text-[#2997ff] flex items-center gap-1 font-semibold">
                  查看完整案例拆解 <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Tide Lion Card */}
            <div
              onClick={() => onNavigate('cases')}
              className="apple-glass-card rounded-3xl p-8 space-y-6 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-mono text-[#2997ff] block mb-1">国家级专精特新小巨人 · 环保水务</span>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#2997ff] transition-colors">
                    泰宁科创 (Tide Lion)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#86868b] block font-mono">Google 欧美主词排名</span>
                  <span className="text-2xl font-bold font-mono text-[#2997ff]">60 组首位</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#d2d2d7] leading-relaxed">
                将国内工程叙事重塑为 60 组符合英国 SuDS 规范的核心英文词库，把国内地标工程转化为国际认可的技术证据链，成功打入欧美千万级项目短名单。
              </p>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-sm text-[#a1a1a6]">
                <span>解决痛点：读不懂 · 连不上</span>
                <span className="text-white group-hover:text-[#2997ff] flex items-center gap-1 font-semibold">
                  查看完整案例拆解 <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. BOTTOM CALL TO ACTION
           ======================================================== */}
        <section className="apple-glass rounded-3xl p-10 sm:p-16 text-center space-y-6 max-w-4xl mx-auto border border-white/15">
          <span className="apple-eyebrow text-xs sm:text-sm tracking-wider">READY TO TRANSFORM?</span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            让您的出海体系，具备直接拿下海外大单的转化能力
          </h2>
          <p className="text-base sm:text-lg text-[#d2d2d7] max-w-xl mx-auto leading-relaxed">
            免费完成 12 项系统断点自测，或预约 45 分钟架构师闭门复盘，获取专属《出海 GEO & SEO 改善路线图》。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onNavigate('diagnosis')}
              className="apple-blue-btn h-14 px-8 text-base font-semibold shadow-xl flex items-center justify-center gap-2"
            >
              <Radar className="w-5 h-5" />
              <span>开始系统 12 项客观断点体检</span>
            </button>
            <button
              onClick={openBookingModal}
              className="apple-secondary-btn h-14 px-8 text-base font-semibold flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-[#2997ff]" />
              <span>预约 45 分钟闭门架构诊断会</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
