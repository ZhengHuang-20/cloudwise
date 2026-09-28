import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  Eye,
  Globe,
  Layers,
  Loader2,
  Radar,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Slider } from '../components/ui/Slider';
import { ScoreRing } from '../components/ui/ScoreRing';
import { scoreTone, TONE_BG, TONE_TEXT } from '../components/ui/tone';
import { SHOW_FDE } from '../lib/features';

interface DiagnosisCenterProps {
  onGoToConfigurator: (prefillData?: any) => void;
  onGoToBooking: () => void;
}

type ToolId = 'frictions' | 'visibility' | 'health' | 'flow' | 'loss';

const TOOLS: { id: ToolId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'frictions', label: '五断点自评', icon: Radar },
  { id: 'visibility', label: 'AI 可见性测评', icon: Eye },
  { id: 'health', label: '官网技术体检', icon: Globe },
  { id: 'flow', label: '询盘现状梳理', icon: Layers },
  { id: 'loss', label: '询盘流失计算器', icon: TrendingDown },
];

const INQUIRY_FLOW = {
  before: [
    '深夜询盘进入公共邮箱，无人应答',
    '次日 9 点业务员人工阅读、手动分拣',
    '复制粘贴到 Excel 或 CRM，参数常有遗漏',
    '24~48 小时后回复，买家已转向竞品',
  ],
  after: [
    'AI 客服 60 秒内多语种专业答疑',
    '自动抽取数量、交期、目标港等采购参数',
    '按高 / 中 / 低意向分级并写入 CRM',
    '高意向线索即时推送企业微信，次日直接跟进',
  ],
};

export const DiagnosisCenter: React.FC<DiagnosisCenterProps> = ({ onGoToConfigurator, onGoToBooking }) => {
  const { saveDiagnosis, user, showToast } = useApp();
  const [activeTool, setActiveTool] = useState<ToolId>('frictions');
  const frictionResultRef = useRef<HTMLDivElement>(null);

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
      combo = SHOW_FDE ? '整体全案服务（获客 + AI 客服 + FDE 驻场）' : '整体全案服务（获客 + AI 客服 + 系统对接）';
    }

    const res = {
      scores: { invisible, unreadable, untrusted, missed, disconnected },
      totalScore: total,
      recommendedCombo: combo,
      weakest,
    };
    setRadarResult(res);

    saveDiagnosis('five_frictions', '出海五断点自评', total, `薄弱项在“${weakest}”，建议采用 ${combo}`, res);

    // 窄屏下结果在题目下方，主动带用户过去
    if (window.innerWidth < 1024) {
      requestAnimationFrame(() => frictionResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
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
      showToast('网络不稳定，测评未完成，请稍后重试');
    } finally {
      setIsVisRunning(false);
    }
  };

  // ================= 3. 官网技术体检（示例报告） =================
  const healthUrl = 'www.ak-medical-global.com';
  const healthResult = {
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
  };

  // ================= 5. 询盘流失计算器 STATE =================
  const [calcQ, setCalcQ] = useState<number>(120);
  const [calcP, setCalcP] = useState<number>(65);
  const [calcR, setCalcR] = useState<number>(45);
  const [calcC] = useState<number>(8);
  const [calcA, setCalcA] = useState<number>(25000);

  const monthlyLostUsd = Math.round(calcQ * (calcP / 100) * (calcR / 100) * (calcC / 100) * calcA);
  const annualLostUsd = monthlyLostUsd * 12;
  const annualLostRmb = Math.round(annualLostUsd * 7.25 / 10000);

  const answeredCount = Object.keys(frictionAnswers).length;

  return (
    <div>
      <PageHeader
        eyebrow="断点体检"
        title={
          <>
            <span className="inline-block">把出海获客的偶然，</span>
            <span className="inline-block">还原为可测量的断点</span>
          </>
        }
        intro="见销售之前，先用客观指标测出获客系统的断损率。体检结果会即时编入你的《会前商业情报档案》。"
      >
        <SegmentedControl ariaLabel="选择体检工具" size="lg" value={activeTool} onChange={setActiveTool} options={TOOLS} />
      </PageHeader>

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {/* ================= TOOL 1: 五断点自评 ================= */}
        {activeTool === 'frictions' && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
            <section className="tile lg:col-span-7" aria-labelledby="frictions-title">
              <h2 id="frictions-title" className="text-title-2">
                五断点现状自评
              </h2>
              <p className="mt-2 text-body text-label-secondary">
                看不见 · 读不懂 · 不被信 · 接不住 · 连不上。共 {FRICTION_QUESTIONS.length} 题，约 3 分钟。
              </p>

              <div className="mt-8 space-y-10">
                {FRICTION_QUESTIONS.map((q) => (
                  <fieldset key={q.id}>
                    <legend className="text-body font-semibold">
                      <span className="mr-2 text-label-secondary tabular-nums">{q.id}.</span>
                      {q.text}
                    </legend>
                    <p className="mt-1 text-caption text-label-secondary">断点：{q.friction}</p>
                    <div role="radiogroup" aria-label={q.text} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {q.options.map((opt) => {
                        const isSelected = frictionAnswers[q.id] === opt.score;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setFrictionAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
                            className="choice"
                          >
                            <span>{opt.label}</span>
                            <span className="shrink-0 text-caption tabular-nums text-label-secondary">{opt.score} 分</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              <button
                type="button"
                onClick={handleComputeFrictionRadar}
                className="btn btn-primary btn-lg btn-block mt-10"
              >
                生成诊断结果
              </button>
            </section>

            <section
              ref={frictionResultRef}
              className="tile scroll-mt-20 lg:sticky lg:top-20 lg:col-span-5"
              aria-labelledby="frictions-result-title"
              aria-live="polite"
            >
              <h2 id="frictions-result-title" className="text-title-3">
                诊断结果
              </h2>

              {radarResult ? (
                <div className="animate-fade-in">
                  <div className="mt-6 flex items-center gap-6">
                    <ScoreRing value={radarResult.totalScore} size={120} stroke={10} caption="/ 100" />
                    <div>
                      <p className="text-caption text-label-secondary">综合出海健康分</p>
                      <p className="mt-1 text-body">
                        最薄弱的断点是 <span className="font-semibold text-danger">“{radarResult.weakest}”</span>
                      </p>
                    </div>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {[
                      { label: '看不见', desc: 'SEO / GEO 搜索', score: radarResult.scores.invisible },
                      { label: '读不懂', desc: '独立站体验与速度', score: radarResult.scores.unreadable },
                      { label: '不被信', desc: '权威信源与证据链', score: radarResult.scores.untrusted },
                      { label: '接不住', desc: '夜间询盘即时响应', score: radarResult.scores.missed },
                      { label: '连不上', desc: SHOW_FDE ? 'CRM 打通与 FDE' : 'CRM 与系统打通', score: radarResult.scores.disconnected },
                    ].map((item) => {
                      const tone = scoreTone(item.score);
                      return (
                        <li key={item.label}>
                          <div className="flex items-baseline justify-between gap-4 text-body">
                            <span>
                              {item.label}
                              <span className="ml-2 text-caption text-label-secondary">{item.desc}</span>
                            </span>
                            <span className={`font-semibold tabular-nums ${TONE_TEXT[tone]}`}>{item.score}</span>
                          </div>
                          <div className="meter mt-2">
                            <span className={TONE_BG[tone]} style={{ width: `${item.score}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="well mt-8">
                    <p className="text-caption text-label-secondary">推荐首选组合</p>
                    <p className="mt-1 text-title-3">{radarResult.recommendedCombo}</p>
                    <p className="mt-3 text-body text-label-secondary">
                      出海获客需要闭环治理，只补单一环节，仍会从下一环节流失。
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() => onGoToConfigurator({ packageType: 'package-acquisition' })}
                      className="btn btn-primary btn-block"
                    >
                      用此结果配置方案
                    </button>
                    <button type="button" onClick={onGoToBooking} className="btn btn-secondary btn-block">
                      预约专家解读
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Radar className="mx-auto h-12 w-12 text-label-tertiary" />
                  <p className="mt-4 text-body text-label-secondary">
                    已预填 {answeredCount} 题的典型现状。按实际情况调整后，生成您的五断点诊断。
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================= TOOL 2: AI 可见性测评 ================= */}
        {activeTool === 'visibility' && (
          <div className="space-y-5">
            <section className="tile" aria-labelledby="visibility-title">
              <div className="max-w-3xl">
                <span className="badge">旗舰工具</span>
                <h2 id="visibility-title" className="mt-4 text-title-1">
                  AI 可见性探针测评
                </h2>
                <p className="mt-4 text-body text-label-secondary">
                  输入企业信息与 3 家竞品，系统在 ChatGPT、Perplexity、Gemini 与 Claude 上以无历史的空白会话，模拟 20~30 组海外买家采购提问，测算您在 AI 推荐中的可见性与平均位次。
                </p>
              </div>

              <form onSubmit={handleRunVisibilityTest} className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="vis-company" className="field-label">企业名称（中英文）</label>
                  <input
                    id="vis-company"
                    type="text"
                    value={visCompany}
                    onChange={(e) => setVisCompany(e.target.value)}
                    placeholder="如 爱康医疗 / AK Medical"
                    className="field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="vis-website" className="field-label">企业官网</label>
                  <input
                    id="vis-website"
                    type="text"
                    value={visWebsite}
                    onChange={(e) => setVisWebsite(e.target.value)}
                    placeholder="如 www.ak-medical.net"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="vis-category" className="field-label">主营核心品类</label>
                  <input
                    id="vis-category"
                    type="text"
                    value={visCategory}
                    onChange={(e) => setVisCategory(e.target.value)}
                    placeholder="如 骨科 3D 打印多孔钛假体"
                    className="field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="vis-market" className="field-label">目标海外市场</label>
                  <input
                    id="vis-market"
                    type="text"
                    value={visMarket}
                    onChange={(e) => setVisMarket(e.target.value)}
                    placeholder="如 欧洲、北美、中东"
                    className="field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="vis-competitors" className="field-label">对比竞品（选填）</label>
                  <input
                    id="vis-competitors"
                    type="text"
                    value={visCompetitors}
                    onChange={(e) => setVisCompetitors(e.target.value)}
                    placeholder="用逗号分隔，如 Stryker, Zimmer, 某上市同行"
                    className="field"
                  />
                  <p className="mt-2 text-caption text-label-secondary">最多 3 家，用逗号分隔。</p>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={isVisRunning} className="btn btn-primary btn-lg btn-block">
                    {isVisRunning ? (
                      <>
                        <Loader2 className="animate-spin" />
                        正在向各 AI 平台发起探针提问…
                      </>
                    ) : (
                      '开始测评'
                    )}
                  </button>
                </div>
              </form>
            </section>

            {visReport && (
              <section className="tile animate-fade-in" aria-labelledby="visibility-report-title" aria-live="polite">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 id="visibility-report-title" className="text-title-2">
                      {visCompany} · AI 可见性报告
                    </h2>
                    <p className="mt-1 text-caption text-label-secondary">
                      测试平台：ChatGPT · Perplexity · Gemini · Claude
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('报告已保存到“我的空间”')}
                    className="btn btn-neutral btn-sm shrink-0 self-start"
                  >
                    <Download />
                    下载 PDF 报告
                  </button>
                </div>

                <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="well">
                    <dt className="text-caption text-label-secondary">AI 可见性</dt>
                    <dd className={`mt-1 text-title-1 tabular-nums ${TONE_TEXT[scoreTone(visReport.visibilityScore)]}`}>
                      {visReport.visibilityScore}%
                    </dd>
                    <p className="mt-1 text-caption text-label-secondary">每 100 次提问中被提及的次数</p>
                  </div>
                  <div className="well">
                    <dt className="text-caption text-label-secondary">平均推荐位次</dt>
                    <dd className="mt-1 text-title-1 tabular-nums">第 {visReport.rankingAverage} 位</dd>
                    <p className="mt-1 text-caption text-label-secondary">行业第一梯队通常在 1~3 位</p>
                  </div>
                  <div className="well">
                    <dt className="text-caption text-label-secondary">正面好感度</dt>
                    <dd className={`mt-1 text-title-1 tabular-nums ${TONE_TEXT[scoreTone(visReport.sentimentScore)]}`}>
                      {visReport.sentimentScore} 分
                    </dd>
                    <p className="mt-1 text-caption text-label-secondary">基于第三方学术与工程认证评估</p>
                  </div>
                </dl>

                {Array.isArray(visReport.competitorComparisons) && visReport.competitorComparisons.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-title-3">与竞品对比</h3>
                    <ul className="mt-4 space-y-4">
                      {visReport.competitorComparisons.map((c: any, index: number) => (
                        <li key={`${c.name}-${index}`}>
                          <div className="flex items-baseline justify-between gap-4 text-body">
                            <span className={index === 0 ? 'font-semibold' : 'text-label-secondary'}>{c.name}</span>
                            <span className="shrink-0 text-caption tabular-nums text-label-secondary">
                              <span className="text-body font-semibold text-label">{c.score}</span> 分 · 平均第 {c.rank} 位
                            </span>
                          </div>
                          <div className="meter mt-2">
                            <span className={index === 0 ? 'bg-accent' : 'bg-label-tertiary'} style={{ width: `${c.score}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(visReport.samplePrompts) && visReport.samplePrompts.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-title-3">AI 实测问答</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {visReport.samplePrompts.map((p: any, index: number) => (
                        <article key={index} className="well">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-caption font-semibold">{p.platform}</span>
                            <span className={`badge ${p.mentionedCompany ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                              {p.mentionedCompany ? '已提及' : '未提及'}
                            </span>
                          </div>
                          <p className="mt-3 text-body">“{p.prompt}”</p>
                          <p className="mt-2 text-caption text-label-secondary">{p.aiAnswerSnippet}</p>
                          {Array.isArray(p.sourcesCited) && p.sourcesCited.length > 0 && (
                            <p className="mt-3 text-caption text-label-secondary">引用信源：{p.sourcesCited.join('、')}</p>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {(Array.isArray(visReport.weaknesses) || Array.isArray(visReport.actionableSteps)) && (
                  <div className="mt-10 grid gap-8 md:grid-cols-2">
                    {Array.isArray(visReport.weaknesses) && (
                      <div>
                        <h3 className="text-title-3">主要短板</h3>
                        <ul className="mt-3 divide-y divide-separator">
                          {visReport.weaknesses.map((w: string) => (
                            <li key={w} className="flex gap-3 py-3 text-body">
                              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-warning" />
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(visReport.actionableSteps) && (
                      <div>
                        <h3 className="text-title-3">建议行动</h3>
                        <ol className="mt-3 divide-y divide-separator">
                          {visReport.actionableSteps.map((s: string, index: number) => (
                            <li key={s} className="flex gap-3 py-3 text-body">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fill text-caption font-semibold tabular-nums">
                                {index + 1}
                              </span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-10 flex flex-col gap-3 border-t border-separator pt-8 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => onGoToConfigurator({ packageType: 'package-acquisition' })}
                    className="btn btn-primary"
                  >
                    据此配置 GEO 与建站方案
                  </button>
                  <button type="button" onClick={onGoToBooking} className="btn btn-secondary">
                    预约专家解读
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ================= TOOL 3: 官网技术体检 ================= */}
        {activeTool === 'health' && (
          <section className="tile animate-fade-in" aria-labelledby="health-title">
            <p className="text-caption text-label-secondary">示例报告 · {healthUrl}</p>
            <h2 id="health-title" className="mt-2 text-title-1">
              官网技术三重视角体检
            </h2>
            <p className="mt-4 max-w-3xl text-body text-label-secondary">
              同一个网站要同时写给三类读者：海外买家、Google 爬虫与 AI 大模型。下面是爱康医疗全球官网的体检结果。
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: '买家视角', score: healthResult.buyerScore },
                { label: 'Google 视角', score: healthResult.googleScore },
                { label: 'AI 视角', score: healthResult.aiScore },
              ].map((item) => (
                <div key={item.label} className="well">
                  <dt className="text-caption text-label-secondary">{item.label}</dt>
                  <dd className="mt-1 text-title-1 tabular-nums">
                    {item.score}
                    <span className="ml-1 text-body text-label-secondary">分</span>
                  </dd>
                  <div className="meter mt-3">
                    <span className={TONE_BG[scoreTone(item.score)]} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </dl>

            <dl className="mt-10 divide-y divide-separator border-y border-separator">
              {[
                { label: '最大内容绘制 LCP', value: healthResult.lcp },
                { label: '累积布局偏移 CLS', value: healthResult.cls },
                { label: '结构化数据', value: healthResult.schemaTypes.join(' · ') },
                { label: 'AI 爬虫', value: healthResult.crawlerStatus },
              ].map((row) => (
                <div key={row.label} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-6">
                  <dt className="text-body text-label-secondary">{row.label}</dt>
                  <dd className="text-body tabular-nums sm:text-right">{row.value}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-10 text-title-3">发现</h3>
            <ul className="mt-3 space-y-3">
              {healthResult.issues.map((issue) => (
                <li key={issue.text} className="flex gap-3 text-body">
                  {issue.level === 'info' ? (
                    <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-warning" />
                  )}
                  <span>{issue.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-separator pt-8">
              <button type="button" onClick={onGoToBooking} className="btn btn-primary">
                预约我的官网体检
              </button>
            </div>
          </section>
        )}

        {/* ================= TOOL 4: 询盘现状梳理 ================= */}
        {activeTool === 'flow' && (
          <section className="tile animate-fade-in" aria-labelledby="flow-title">
            <h2 id="flow-title" className="text-title-1">
              询盘流转：现状与自动化之后
            </h2>
            <p className="mt-4 max-w-3xl text-body text-label-secondary">
              7×24 小时 AI 客服在 60 秒内多语种答疑深夜询盘，并自动抽取采购参数写入 CRM。
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {[
                { title: '现状', items: INQUIRY_FLOW.before, tone: 'text-danger', icon: AlertTriangle },
                { title: '自动化之后', items: INQUIRY_FLOW.after, tone: 'text-success', icon: Check },
              ].map((column) => {
                const Icon = column.icon;
                return (
                  <div key={column.title} className="well">
                    <h3 className="text-title-3">{column.title}</h3>
                    <ol className="mt-4 space-y-4">
                      {column.items.map((item) => (
                        <li key={item} className="flex gap-3 text-body">
                          <Icon className={`mt-1 h-5 w-5 shrink-0 ${column.tone}`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 border-t border-separator pt-8">
              <button type="button" onClick={onGoToBooking} className="btn btn-primary">
                预约 60 分钟技术对接评估
              </button>
            </div>
          </section>
        )}

        {/* ================= TOOL 5: 询盘流失计算器 ================= */}
        {activeTool === 'loss' && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
            <section className="tile lg:col-span-7" aria-labelledby="loss-title">
              <h2 id="loss-title" className="text-title-2">
                跨时区询盘流失测算
              </h2>
              <p className="mt-2 text-body text-label-secondary">
                拖动滑块，算清每年因为回复慢、夜间无人应答而流失的订单金额。
              </p>

              <div className="mt-8 space-y-7">
                <Slider label="月均询盘量 Q" value={calcQ} min={20} max={500} step={10} onChange={setCalcQ} format={(v) => `${v} 条 / 月`} />
                <Slider label="夜间到达占比 p" value={calcP} min={30} max={85} step={5} onChange={setCalcP} format={(v) => `${v}%`} />
                <Slider
                  label="延误导致的流失率 r"
                  value={calcR}
                  min={20}
                  max={70}
                  step={5}
                  onChange={setCalcR}
                  format={(v) => `${v}%`}
                  valueClassName="text-danger"
                  trackColor="var(--color-danger)"
                />
                <Slider
                  label="平均客单价 A"
                  value={calcA}
                  min={5000}
                  max={100000}
                  step={5000}
                  onChange={setCalcA}
                  format={(v) => `$${v.toLocaleString()}`}
                />
              </div>

              <p className="mt-8 border-t border-separator pt-5 text-caption text-label-secondary">
                公式 L = Q × p × r × c × A，成交率 c 按行业均值 {calcC}% 计。
              </p>
            </section>

            <section className="tile lg:sticky lg:top-20 lg:col-span-5" aria-labelledby="loss-result-title" aria-live="polite">
              <p className="text-caption text-label-secondary">测算结论</p>
              <h2 id="loss-result-title" className="mt-1 text-title-3">
                每年可能流失的订单金额
              </h2>
              <p className="mt-6 text-headline tabular-nums text-danger">${annualLostUsd.toLocaleString()}</p>
              <p className="mt-2 text-body text-label-secondary">
                约合人民币 <span className="font-semibold tabular-nums text-label">{annualLostRmb}</span> 万元 / 年
              </p>
              <button
                type="button"
                onClick={() => onGoToConfigurator({ packageType: 'package-single' })}
                className="btn btn-primary btn-block mt-8"
              >
                规划 AI 客服方案
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
