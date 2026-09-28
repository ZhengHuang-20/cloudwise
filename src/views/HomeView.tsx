import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Globe,
  ListChecks,
  Loader2,
  Lock,
  Radar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabId } from '../components/navigation';
import { Reveal } from '../components/ui/Reveal';
import { ScoreRing } from '../components/ui/ScoreRing';
import { SERVICE_IDENTITY, ServiceKey } from '../components/ui/serviceIdentity';
import { scoreTone, TONE_BG, TONE_TEXT } from '../components/ui/tone';
import { SERVICE_COUNT_CN, SHOW_FDE } from '../lib/features';

interface HomeViewProps {
  onNavigate: (tab: TabId) => void;
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

// 所属行业与目标市场都不让用户填写，由测评根据官网域名与品牌判断。
// 首页测评目前是本地模拟：行业按关键词、市场按域名后缀推断，识别不出时给出通用默认值。
const INDUSTRY_RULES: [RegExp, string][] = [
  [/medical|health|ortho|implant|pharma|dental|bio|医|骨科|植入|耗材|药|生物/, '医疗器械与生物耗材'],
  [/solar|energy|battery|inverter|光伏|储能|新能源|电池|逆变/, '新能源与光伏储能'],
  [/water|pump|valve|drain|rain|environ|水务|环保|排水|雨水|海绵|泵|阀/, '环保工程与水务装备'],
  [/auto|vehicle|truck|machinery|excavat|crane|汽车|零部件|工程机械|挖掘|起重/, '汽车零部件与工程机械'],
  [/hardware|fastener|screw|bolt|metal|cnc|mould|mold|五金|紧固|螺丝|钣金|模具|机加工/, '精密五金与离散工业'],
];

const inferIndustry = (target: string) => {
  const t = target.trim().toLowerCase();
  return INDUSTRY_RULES.find(([pattern]) => pattern.test(t))?.[1] ?? '工业制造出海';
};

const inferRegion = (target: string) => {
  const t = target.trim().toLowerCase();
  if (/\.(de|fr|it|es|nl|eu|uk|pl|se|ch|at|be|dk|no|fi)(\/|:|$)/.test(t)) return '欧洲市场';
  if (/\.(us|ca)(\/|:|$)/.test(t)) return '北美市场';
  if (/\.(sg|my|th|vn|id|ph|ae|sa|qa)(\/|:|$)/.test(t)) return '东南亚及中东市场';
  return '欧美核心市场（北美 + 欧洲）';
};

const AUDIT_STEPS = [
  '根据官网与品牌识别所属行业与主要目标市场',
  '海外云端节点测速与 Schema 知识图谱提取',
  '向 ChatGPT / Perplexity 探查品牌在行业推荐中的权重与证据链',
  '检索目标市场 60 组 Google 外贸采购关键词位序',
  '测算北京时间夜间 8 小时海外买家跨时区流失概率',
];

const ALL_SERVICES: { key: ServiceKey; title: string; desc: string; link: string }[] = [
  {
    key: 'site',
    title: '海外独立站建站',
    desc: '专为欧美采购主管、技术总监与合规官设计的三读者架构独立站。海外节点秒开，满足严苛的技术卷宗与参数要求。',
    link: '了解建站方案',
  },
  {
    key: 'seo',
    title: '外贸 SEO 优化',
    desc: '搭建 60 组采购级核心词库，遵循 Google Search Essentials 与 E-E-A-T，让海外买家在搜索第一屏找到你。',
    link: '了解 SEO 词库策略',
  },
  {
    key: 'geo',
    title: '出海 GEO 优化',
    desc: '海外采购商向 ChatGPT、Perplexity、Google SGE 询问推荐供应商时，让 AI 主动提及并推荐你的品牌。',
    link: '了解 GEO 信源方案',
  },
  {
    key: 'chat',
    title: 'AI 智能客服与系统对接',
    desc: '基于企业专属参数库，7×24 小时多语种解答公差、认证与交期，实时判定意向并同步 CRM。',
    link: '了解 AI 客服',
  },
  {
    key: 'fde',
    title: 'FDE 驻场工程师',
    desc: '带着 AI 驻场一线，把业务经验写成标准、装进系统、交给 AI 执行。源码、数据和会用的人都留给企业。',
    link: '了解三层建设',
  },
];
const SERVICES = SHOW_FDE ? ALL_SERVICES : ALL_SERVICES.filter((service) => service.key !== 'fde');

// 售前工具：tab 为 'audit' 时滚动到首页的 AI 可见性测评，其余跳转到对应页面
const TOOLS: { tab: TabId | 'audit'; icon: React.ComponentType<{ className?: string }>; title: string; desc: string; link: string }[] = [
  {
    tab: 'audit',
    icon: Radar,
    title: 'AI 可见性测评',
    desc: '输入官网或品牌，看 ChatGPT、Perplexity 与 Google 是否找得到你，以及断点在哪里。',
    link: '开始测评',
  },
  {
    tab: 'configurator',
    icon: ListChecks,
    title: '方案组合与交付规划',
    desc: `自由组合独立站、SEO、GEO${SHOW_FDE ? '、AI 客服与 FDE 驻场' : ' 与 AI 客服'}，实时得到交付周期、阶段排期与交付物清单。`,
    link: '规划方案',
  },
  {
    tab: 'deal-room',
    icon: Lock,
    title: '专属方案空间',
    desc: '保存的方案自动生成共享空间，双方在这里推进行动计划、答疑讨论与在线签约。',
    link: '进入方案空间',
  },
];

const prefersReducedMotion =() => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, openBookingModal }) => {
  const { logLeadActivity, saveDiagnosis, showToast } = useApp();
  const auditInputRef = useRef<HTMLInputElement>(null);

  // Instant GEO/SEO Evaluation Tool State
  const [inputUrl, setInputUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Quick preset test cases
  const PRESETS = [
    {
      name: '爱康医疗',
      url: 'www.ak-medical-global.com',
      result: {
        target: '爱康医疗 (www.ak-medical-global.com)',
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
      name: '典型五金出口企业',
      url: 'www.example-hardware.com',
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
    setTimeout(() => setAuditStep(2), 400);
    setTimeout(() => setAuditStep(3), 800);
    setTimeout(() => setAuditStep(4), 1200);
    setTimeout(() => setAuditStep(5), 1600);
    setTimeout(() => {
      setIsAuditing(false);
      if (customPreset) {
        setAuditResult(customPreset.result);
      } else {
        // Compute realistic synthetic audit based on user input
        const generatedResult: AuditResult = {
          target: targetName,
          region: inferRegion(inputUrl),
          industry: inferIndustry(inputUrl),
          totalScore: 48,
          geoScore: 34,
          seoScore: 48,
          siteScore: 64,
          responseScore: 46,
          level: '中危断点 · 获客链路存在明显跑冒滴漏',
          lostEstimate: '约 12 ~ 25 万美元 / 年',
          findings: [
            'GEO 生成式收录：向 ChatGPT 与 Perplexity 询问该行业知名供应商时，未收录该品牌技术参数与资质',
            'Google 外贸 SEO：目标市场前两页搜索结果中查无此人，被当地经销商与头部竞品占据',
            '海外独立站架构：海外节点打开耗时 4.2 秒，缺少针对技术总监与合规官的专属卷宗下载',
            '时差接单断点：夜间 8 小时无即时技术问答，海外买家跳出率高达 82%'
          ],
          recommendation: '建议配置【获客增长组合（独立站+SEO+GEO）】+【24h 智能客服】，优先修复目标市场的搜索可见性与夜间时差黑洞。'
        };
        setAuditResult(generatedResult);
      }

      // Log activity in CRM and notify user
      logLeadActivity(`完成了【${targetName}】官网/品牌 GEO & SEO 智能测评`, 20, { target: targetName });
      saveDiagnosis('ai_visibility', 'AI 可见性测评', customPreset ? customPreset.result.totalScore : 48, '官网与品牌出海能力测绘', {});
      showToast('评估报告已生成');
    }, 2000);
  };

  const scrollToAudit = () => {
    document.getElementById('audit')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    auditInputRef.current?.focus({ preventScroll: true });
  };

  const resultTone = auditResult ? scoreTone(auditResult.totalScore) : 'warning';

  return (
    <div>
      {/* ===================== Hero ===================== */}
      <section className="layout-text pt-[clamp(4rem,2rem+6vw,7.5rem)] text-center">
        <p className="eyebrow">云端智荐 · AI 出海售前系统</p>
        <h1 className="mt-4 text-display">
          让海外买家找到你
          <br />
          <span className="text-gradient-ai">让 AI 替你接住生意</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-intro text-label-secondary">
          独立站建站 · GEO · SEO · AI 智能客服及系统对接{SHOW_FDE && ' · FDE 驻场工程师'}。
          为中国中型制造企业打通出海获客到售前转化的每一个环节。
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button type="button" onClick={scrollToAudit} className="btn btn-primary btn-lg">
            免费评估出海就绪度
          </button>
          <button type="button" onClick={openBookingModal} className="btn btn-secondary btn-lg">
            预约专家诊断
          </button>
        </div>
      </section>

      {/* ===================== 即时评估工具 ===================== */}
      <section id="audit" className="layout-text scroll-mt-20 pt-16 md:pt-20">
        <div className="tile mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-title-2">AI 可见性测评</h2>
              <p className="mt-2 text-body text-label-secondary">
                输入英文官网或品牌名，探查海外大模型收录与 Google 搜索排位。所属行业与目标市场由 AI 根据官网与品牌自动判断。
              </p>
            </div>
            <span className="badge shrink-0 bg-success/15 text-success">免费</span>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleStartAudit();
            }}
          >
            <div>
              <label htmlFor="audit-target" className="field-label">
                官网域名，或品牌 / 核心产品词
              </label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-label-secondary" />
                <input
                  ref={auditInputRef}
                  id="audit-target"
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="例如 www.ak-medical.net 或 骨科植入物"
                  className="field field-lg pl-12"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-caption text-label-secondary">试试示例</span>
              {PRESETS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  disabled={isAuditing}
                  onClick={() => {
                    setInputUrl(item.url);
                    handleStartAudit(item);
                  }}
                  className="chip disabled:opacity-40"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <button type="submit" disabled={isAuditing} className="btn btn-primary btn-lg btn-block">
              {isAuditing ? (
                <>
                  <Loader2 className="animate-spin" />
                  正在评估…
                </>
              ) : (
                '开始评估'
              )}
            </button>
          </form>

          {/* 评估进度 */}
          {isAuditing && (
            <ol className="mt-8 space-y-3 border-t border-separator pt-8" aria-label="评估进度">
              {AUDIT_STEPS.map((step, index) => {
                const stepNumber = index + 1;
                const isDone = auditStep > stepNumber;
                const isCurrent = auditStep === stepNumber;
                return (
                  <li
                    key={step}
                    className={`flex items-center gap-3 text-body transition-colors ${
                      isDone || isCurrent ? 'text-label' : 'text-label-tertiary'
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {isDone ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : isCurrent ? (
                        <Loader2 className="h-5 w-5 animate-spin text-link" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-label-tertiary" />
                      )}
                    </span>
                    {step}
                  </li>
                );
              })}
            </ol>
          )}

          {/* 评估结果 */}
          {auditResult && !isAuditing && (
            <div className="mt-8 border-t border-separator pt-8 animate-fade-in" aria-live="polite">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <ScoreRing value={auditResult.totalScore} caption="/ 100" />
                <div className="min-w-0">
                  <p className="text-caption text-label-secondary">{auditResult.target}</p>
                  <p className="text-caption text-label-secondary">
                    AI 判断行业：{auditResult.industry} · 目标市场：{auditResult.region}
                  </p>
                  <h3 className="mt-1 text-title-2">出海获客综合就绪度</h3>
                  <p className={`mt-1 text-body font-semibold ${TONE_TEXT[resultTone]}`}>{auditResult.level}</p>
                  <p className="mt-3 text-body text-label-secondary">
                    估测年化商机流失 <span className="font-semibold text-label">{auditResult.lostEstimate}</span>
                  </p>
                </div>
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'GEO 生成式推荐', score: auditResult.geoScore },
                  { label: 'Google 外贸 SEO', score: auditResult.seoScore },
                  { label: '独立站技术合规', score: auditResult.siteScore },
                  { label: '跨时区夜间响应', score: auditResult.responseScore },
                ].map((metric) => {
                  const tone = scoreTone(metric.score);
                  return (
                    <div key={metric.label} className="well">
                      <dt className="text-caption text-label-secondary">{metric.label}</dt>
                      <dd className="mt-1 text-title-2 tabular-nums">
                        {metric.score}
                        <span className="text-caption font-normal text-label-secondary"> / 100</span>
                      </dd>
                      <div className="meter mt-3">
                        <span className={TONE_BG[tone]} style={{ width: `${metric.score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </dl>

              <h4 className="mt-10 text-title-3">核心发现</h4>
              <ul className="mt-2 divide-y divide-separator">
                {auditResult.findings.map((item) => (
                  <li key={item} className="flex items-start gap-3 py-4 text-body">
                    {resultTone === 'success' ? (
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                    ) : (
                      <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-warning" />
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="well mt-6">
                <h4 className="text-body font-semibold">建议方案</h4>
                <p className="mt-2 text-body text-label-secondary">{auditResult.recommendation}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button type="button" onClick={openBookingModal} className="btn btn-primary">
                    预约 45 分钟深度复盘
                  </button>
                  <button type="button" onClick={() => onNavigate('configurator')} className="link justify-center px-2 py-2 text-body sm:justify-start">
                    规划服务方案
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===================== 核心服务 ===================== */}
      <section className="section layout-wide">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">核心服务</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">{SERVICE_COUNT_CN}项服务，</span>
            <span className="inline-block">一套获客系统。</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            针对中国中型制造企业的出海痛点，每一项服务都有确定的落地系统与交付标准。
          </p>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-6">
          {SERVICES.map((service, index) => {
            const identity = SERVICE_IDENTITY[service.key];
            const Icon = identity.icon;
            // 五张：前两张各占 3 列、后三张各占 2 列；四张：2 × 2
            const span =
              index < 2 || SERVICES.length === 4
                ? 'lg:col-span-3'
                : index === 4
                  ? 'md:col-span-2 lg:col-span-2'
                  : 'lg:col-span-2';
            return (
              <button
                key={service.key}
                type="button"
                onClick={() => onNavigate('services')}
                className={`tile interactive group flex flex-col items-start ${span}`}
              >
                <Icon className={`h-8 w-8 ${identity.text}`} />
                <h3 className="mt-6 text-title-2">{service.title}</h3>
                <p className="mt-3 flex-1 text-body text-label-secondary">{service.desc}</p>
                <span className="link mt-6 text-body">
                  {service.link}
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </Reveal>
      </section>

      {/* ===================== 售前工具 ===================== */}
      <section className="section layout-wide pt-0">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">售前工具</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">见销售之前，</span>
            <span className="inline-block">先看清问题与方案。</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">面向出海决策人的自助工具，免注册，打开即用。</p>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.tab}
                type="button"
                onClick={() => (tool.tab === 'audit' ? scrollToAudit() : onNavigate(tool.tab))}
                className="tile interactive group flex flex-col items-start"
              >
                <Icon className="h-8 w-8 text-label" />
                <h3 className="mt-6 text-title-2">{tool.title}</h3>
                <p className="mt-3 flex-1 text-body text-label-secondary">{tool.desc}</p>
                <span className="link mt-6 text-body">
                  {tool.link}
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </Reveal>
      </section>

      {/* ===================== 标杆案例 ===================== */}
      <section className="section layout-wide pt-0">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">标杆案例</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">看中大型制造企业</span>
            <span className="inline-block">如何突围。</span>
          </h2>
          <button type="button" onClick={() => onNavigate('cases')} className="link mt-5 text-intro">
            查看全部案例
            <ChevronRight />
          </button>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {[
            {
              meta: '港股上市 · 骨科植入物头部企业',
              name: '爱康医疗',
              stat: '47 → 95',
              statUnit: '分',
              statLabel: 'GEO / SEO 评分 · 国内官网 → 新建海外官网',
              desc: '告别画册式官网，针对 4 类海外医疗决策者精准建模，系统化注入 91 项技术文献与临床证据链。ChatGPT 连续数月带来真实的欧洲采购引荐。',
              pains: '看不见 · 不被信',
            },
            {
              meta: '国家级专精特新“小巨人” · 环保水务',
              name: '泰宁科创',
              stat: '60',
              statUnit: '组',
              statLabel: 'Google 欧美核心词首位',
              desc: '将国内工程叙事重塑为 60 组符合英国 SuDS 规范的核心英文词库，把地标工程转化为国际认可的证据链，打入欧美千万级项目短名单。',
              pains: '读不懂 · 连不上',
            },
          ].map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => onNavigate('cases')}
              className="tile interactive group flex flex-col items-start"
            >
              <p className="text-caption text-label-secondary">{item.meta}</p>
              <h3 className="mt-1 text-title-2">{item.name}</h3>
              <p className="mt-8 text-headline tabular-nums">
                {item.stat}
                <span className="ml-1 text-title-3 text-label-secondary">{item.statUnit}</span>
              </p>
              <p className="mt-1 text-caption text-label-secondary">{item.statLabel}</p>
              <p className="mt-6 flex-1 text-body text-label-secondary">{item.desc}</p>
              <div className="mt-8 flex w-full flex-wrap items-center justify-between gap-3 border-t border-separator pt-5">
                <span className="text-caption text-label-secondary">解决断点：{item.pains}</span>
                <span className="link text-body">
                  阅读案例
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))}
        </Reveal>
      </section>

      {/* ===================== 收尾行动 ===================== */}
      <section className="section layout-text pt-0 text-center">
        <Reveal>
          <h2 className="text-headline">
            <span className="inline-block">让出海体系，</span>
            <span className="inline-block">具备拿下海外大单的转化能力。</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            免费完成 AI 可见性测评，或预约 45 分钟架构师闭门复盘，获取专属《出海 GEO & SEO 改善路线图》。
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button type="button" onClick={scrollToAudit} className="btn btn-primary btn-lg">
              开始 AI 可见性测评
            </button>
            <button type="button" onClick={openBookingModal} className="btn btn-secondary btn-lg">
              预约 45 分钟诊断
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
