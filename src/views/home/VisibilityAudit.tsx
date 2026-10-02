import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, ChevronRight, Globe, Loader2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { scoreTone, TONE_BG, TONE_TEXT } from '../../components/ui/tone';
import { ApiError } from '../../lib/api';
import {
  AuditEngineResult,
  AuditEvidence,
  AuditJob,
  AuditReport,
  getAudit,
  isBackendMissing,
  parseAuditInput,
  sampleReport,
  SiteCheck,
  startAudit,
  WebSource,
} from '../../lib/audit';

// 与后端 runAudit 的五个步骤一一对应；第 4 步的平台名来自任务状态
const auditSteps = (engines: string[] | null, byBrand: boolean) => [
  byBrand ? '查找品牌官网，并读取页面内容、AI 爬虫权限与结构化数据' : '读取官网：页面内容、AI 爬虫权限与结构化数据',
  '识别品牌、所属行业与目标市场',
  '生成海外买家会向 AI 提出的采购问题',
  engines && engines.length > 0
    ? `以买家身份向 ${engines.join('、')} 提问（开启联网搜索）`
    : '以买家身份向各 AI 平台提问（开启联网搜索）',
  '统计品牌提及、推荐排位与引用来源',
];

type JobProgress = Pick<AuditJob, 'status' | 'step' | 'done' | 'total' | 'engines'> & { byBrand: boolean };

const POLL_MS = 1500;
const POLL_LIMIT_MS = 7 * 60 * 1000;

interface VisibilityAuditProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  openBookingModal: () => void;
  onGoToConfigurator: () => void;
}

export const VisibilityAudit: React.FC<VisibilityAuditProps> = ({ inputRef, openBookingModal, onGoToConfigurator }) => {
  const { logLeadActivity, saveDiagnosis, showToast } = useApp();
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [job, setJob] = useState<JobProgress | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const isRunning = job !== null;

  const finish = (result: AuditReport) => {
    const target = result.domain || result.target || result.entity.brand;
    setJob(null);
    setReport(result);
    logLeadActivity(`完成了【${target}】AI 可见性测评`, 20, { target, mode: result.mode });
    saveDiagnosis('ai_visibility', 'AI 可见性测评', result.totalScore, `${target} · ${result.level}`, {
      auditId: result.id,
      mode: result.mode,
    });
    showToast('测评报告已生成');
  };

  const fail = (message: string) => {
    setJob(null);
    setInputError(message);
    inputRef.current?.focus();
  };

  const poll = async (id: string, startedAt: number) => {
    while (alive.current) {
      if (Date.now() - startedAt > POLL_LIMIT_MS) return fail('测评超时，请稍后重试');
      let current: AuditJob;
      try {
        current = await getAudit(id);
      } catch (err) {
        return fail(err instanceof ApiError ? err.message : '测评失败，请稍后重试');
      }
      if (!alive.current) return;
      if (current.status === 'done' && current.report) return finish(current.report);
      if (current.status === 'failed') return fail(current.error || '测评失败，请稍后重试');
      setJob((prev) => ({
        byBrand: prev?.byBrand ?? false,
        status: current.status,
        step: current.step,
        done: current.done,
        total: current.total,
        engines: current.engines,
      }));
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAuditInput(input);
    if (!parsed) {
      setInputError('请输入官网域名或品牌名称，例如 www.example.com 或 爱康医疗');
      inputRef.current?.focus();
      return;
    }
    const target = 'domain' in parsed ? parsed.domain : parsed.brand;
    setInputError('');
    setReport(null);
    setJob({ status: 'queued', step: 0, done: 0, total: 0, engines: null, byBrand: 'brand' in parsed });
    try {
      const { id } = await startAudit(target);
      await poll(id, Date.now());
    } catch (err) {
      if (isBackendMissing(err)) {
        // 测评服务未启用（例如用 Node 版 server.ts 开发时），展示标注过的示例
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (alive.current) finish(sampleReport(target));
        return;
      }
      fail(err instanceof ApiError ? err.message : '测评失败，请稍后重试');
    }
  };

  return (
    <>
    <div className="layout-text">
    <div className="tile mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title-2">AI 可见性测评</h2>
          <p className="mt-2 text-body text-label-secondary">
            输入官网域名或品牌名称，我们以海外买家的身份向 AI 搜索提问，统计你被推荐、被引用的情况，并检查官网能否被 AI 读取。只填品牌名时，由 AI 联网查找官网；所属行业与目标市场也由 AI 自动判断。
          </p>
        </div>
        <span className="badge shrink-0 bg-success/15 text-success">免费</span>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="audit-target" className="field-label">
            官网域名或品牌名称
          </label>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-label-secondary" />
            <input
              ref={inputRef}
              id="audit-target"
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputError) setInputError('');
              }}
              placeholder="例如 www.ak-medical.net 或 爱康医疗"
              className="field field-lg pl-12"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={inputError ? true : undefined}
              aria-describedby={inputError ? 'audit-target-error' : undefined}
            />
          </div>
          {inputError && (
            <p id="audit-target-error" role="alert" className="mt-2 text-caption text-danger">
              {inputError}
            </p>
          )}
        </div>

        <button type="submit" disabled={isRunning} className="btn btn-primary btn-lg btn-block">
          {isRunning ? (
            <>
              <Loader2 className="animate-spin" />
              正在测评…
            </>
          ) : (
            '开始测评'
          )}
        </button>
      </form>

      {job && <AuditProgress job={job} />}
    </div>
    </div>

    {report && !isRunning && (
      <div className="layout-wide mt-6">
        <AuditResult report={report} openBookingModal={openBookingModal} onGoToConfigurator={onGoToConfigurator} />
      </div>
    )}
    </>
  );
};

// ---------- 进度 ----------

const AuditProgress: React.FC<{ job: JobProgress }> = ({ job }) => (
  <div className="mt-8 border-t border-separator pt-8">
    <p className="text-caption text-label-secondary" aria-live="polite">
      {job.status === 'queued'
        ? '排队中，前面还有测评在进行…'
        : '需要真实向多个 AI 平台提问几十次，通常 1 到 3 分钟完成，请不要关闭页面。'}
    </p>
    <ol className="mt-4 space-y-3" aria-label="测评进度">
      {auditSteps(job.engines, job.byBrand).map((step, index) => {
        const stepNumber = index + 1;
        const isDone = job.step > stepNumber;
        const isCurrent = job.step === stepNumber;
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
                <Loader2 className="h-5 w-5 animate-spin text-label-secondary" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-label-tertiary" />
              )}
            </span>
            <span>
              {step}
              {stepNumber === 4 && job.total > 0 && (isCurrent || isDone) && (
                <span className="tabular-nums text-label-secondary">
                  {' '}
                  （{job.done} / {job.total}）
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  </div>
);

// ---------- 结果：驾驶舱 ----------
// 桌面端一屏看全：顶部身份条 → 总分与四项指标 → 平台对比与竞品声量 → 官网体检与结论 → 回答明细（左列表右详情）。
// 窄屏自动退化为单列。

interface AuditResultProps {
  report: AuditReport;
  openBookingModal: () => void;
  onGoToConfigurator: () => void;
}

const Panel: React.FC<{
  title: string;
  hint?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, hint, aside, className = '', children }) => (
  <section className={`card min-w-0 ${className}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h4 className="text-title-3">{title}</h4>
        {hint && <p className="mt-1 text-caption text-label-secondary">{hint}</p>}
      </div>
      {aside}
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const AuditResult: React.FC<AuditResultProps> = ({ report, openBookingModal, onGoToConfigurator }) => {
  const tone = scoreTone(report.totalScore);
  const hasAI = report.mode !== 'site_only';
  const hasSite = report.site !== null;
  // 没有官网时区分：真的搜过没找到，还是示例模式根本没搜
  const searchedSite = report.domainSource === 'none' && report.mode !== 'sample';
  const { metrics, entity } = report;
  const engines = report.engines ?? [];
  const engineCount = engines.length;
  const maxVoice = Math.max(1, ...report.shareOfVoice.map((v) => v.mentions));
  const showEngines = hasAI && engineCount > 1;
  const showVoice = hasAI && report.shareOfVoice.length > 1;

  const tiles = [
    {
      label: 'AI 推荐时提到你',
      value: metrics.mentionRate,
      unit: '%',
      note: metrics.avgPosition > 0 ? `平均排第 ${metrics.avgPosition} 位` : '不带品牌名的问题',
      ai: true,
    },
    { label: '官网被引用', value: metrics.citationRate, unit: '%', note: '回答列出的来源', ai: true },
    { label: '品牌认知', value: metrics.brandKnowledge, unit: '%', note: '直接问品牌时', ai: true },
    {
      label: 'AI 可读取性',
      value: metrics.readability,
      unit: ' / 100',
      note: hasSite ? '官网检查' : '未检查官网',
      ai: false,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in" aria-live="polite">
      {report.mode === 'sample' && (
        <p className="flex items-start gap-2 text-body text-warning">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
          <span>测评服务暂未接入 AI，以下 AI 部分为示例数据，仅用于展示报告格式。</span>
        </p>
      )}
      {report.mode === 'site_only' && (
        <p className="flex items-start gap-2 text-body text-warning">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
          <span>本次向 AI 提问没有成功，只给出官网检查结果，请稍后重新测评。</span>
        </p>
      )}

      {/* 身份条 */}
      <header className="card flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h3 className="break-all text-title-2">{entity.brand}</h3>
          <p className="mt-1 break-all text-caption text-label-secondary">
            {report.domain ? report.domain : searchedSite ? '未找到官网' : '未提供官网'}
            {report.domainSource === 'resolved' && ' · 官网由 AI 根据品牌名查找，如不准确请直接输入官网域名'}
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 [&>.badge]:max-w-full [&>.badge]:whitespace-normal">
          <span className="badge">行业：{entity.industry}</span>
          <span className="badge">市场：{entity.market}</span>
          {hasAI && <span className="badge">{report.engine}</span>}
          {hasAI && (
            <span className="badge tabular-nums">
              {report.questions} 题 × {report.samples} 次 · 共 {report.answers} 次有效回答
            </span>
          )}
        </div>
      </header>

      {/* 总分 + 四项指标 */}
      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card flex items-center gap-6 lg:col-span-4 lg:flex-col lg:justify-center lg:text-center">
          <ScoreRing value={report.totalScore} caption="/ 100" size={168} stroke={14} />
          <div>
            <p className="text-title-3">{hasAI ? 'AI 可见性综合得分' : '官网 AI 可读取性'}</p>
            <p className={`mt-1 text-body font-semibold ${TONE_TEXT[tone]}`}>{report.level}</p>
            {hasAI && engineCount > 1 && (
              <p className="mt-2 text-caption text-label-secondary">总分按各平台平均；AI 回答每次略有不同，结果按比例统计</p>
            )}
          </div>
        </section>
        <dl className="grid grid-cols-2 gap-4 lg:col-span-8">
          {tiles.map((tile) => {
            const available = tile.ai ? hasAI : hasSite;
            const tileTone = scoreTone(tile.value);
            return (
              <div key={tile.label} className="card flex flex-col justify-between">
                <dt className="text-caption text-label-secondary">{tile.label}</dt>
                <dd className="mt-2 text-display tabular-nums">
                  {available ? tile.value : '—'}
                  {available && <span className="text-body font-normal text-label-secondary">{tile.unit}</span>}
                </dd>
                <div>
                  <div className="meter mt-4">
                    <span className={TONE_BG[tileTone]} style={{ width: `${available ? tile.value : 0}%` }} />
                  </div>
                  <p className="mt-2 text-caption text-label-secondary">{tile.note}</p>
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      {/* 平台对比 + 竞品声量 */}
      {(showEngines || showVoice) && (
        <div className="grid gap-4 lg:grid-cols-12">
          {showEngines && (
            <Panel
              title="各平台表现"
              hint="同一批买家问题，在不同 AI 平台上的结果"
              className={showVoice ? 'lg:col-span-7' : 'lg:col-span-12'}
            >
              <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
                {engines.map((engine) => (
                  <EngineCard key={engine.id} engine={engine} />
                ))}
              </ul>
            </Panel>
          )}
          {showVoice && (
            <Panel
              title="AI 推荐了谁"
              hint="不带品牌名的采购问题中，各品牌被提到的次数"
              className={showEngines ? 'lg:col-span-5' : 'lg:col-span-12'}
            >
              <ul className="space-y-3">
                {report.shareOfVoice.map((voice) => (
                  <li key={voice.name} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 text-body">
                    <span className={`truncate ${voice.isSelf ? 'font-semibold' : ''}`} title={voice.name}>
                      {voice.name}
                      {voice.isSelf && <span className="text-label-secondary">（你）</span>}
                    </span>
                    <div className="meter">
                      <span
                        className={voice.isSelf ? 'bg-label' : 'bg-label-tertiary'}
                        style={{ width: `${(voice.mentions / maxVoice) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right tabular-nums text-label-secondary">{voice.mentions}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}

      {/* 官网体检 + 结论 */}
      <div className="grid gap-4 lg:grid-cols-12">
        {report.site ? (
          <SiteChecks site={report.site} className="lg:col-span-7" />
        ) : (
          <Panel title="官网能否被 AI 读取" className="lg:col-span-5">
            <p className="flex items-start gap-3 text-body">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
              <span className="text-label-secondary">
                {searchedSite ? 'AI 联网搜索没有找到这个品牌的官网，' : '只输入了品牌名，'}
                本次未做官网检查。输入官网域名可获得完整测评。
              </span>
            </p>
          </Panel>
        )}
        <Panel title="核心发现与建议" className={report.site ? 'lg:col-span-5' : 'lg:col-span-7'}>
          <ul className="divide-y divide-separator">
            {report.findings.map((item) => (
              <li key={item} className="flex items-start gap-3 py-3 text-body first:pt-0">
                {tone === 'success' ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                ) : (
                  <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-warning" />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="well mt-4">
            <h5 className="text-body font-semibold">建议方案</h5>
            <p className="mt-2 text-body text-label-secondary">{report.recommendation}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button type="button" onClick={openBookingModal} className="btn btn-primary">
                预约 30 分钟诊断会
              </button>
              <button
                type="button"
                onClick={onGoToConfigurator}
                className="link justify-center px-2 py-2 text-body sm:justify-start"
              >
                规划服务方案
                <ChevronRight />
              </button>
            </div>
          </div>
        </Panel>
      </div>

      {hasAI && report.evidence.length > 0 && <EvidenceExplorer report={report} />}
    </div>
  );
};

const EngineCard: React.FC<{ engine: AuditEngineResult }> = ({ engine }) => {
  const failedAll = engine.answers === 0;
  const rows = [
    { label: '提到你', value: engine.mentionRate },
    { label: '引用官网', value: engine.citationRate },
    { label: '品牌认知', value: engine.brandKnowledge },
  ];
  return (
    <li className="well">
      <h5 className="text-body font-semibold">{engine.name}</h5>
      {!failedAll && engine.avgPosition > 0 && (
        <p className="text-caption tabular-nums text-label-secondary">平均排第 {engine.avgPosition} 位</p>
      )}
      {failedAll ? (
        <p className="mt-4 text-caption text-label-secondary">提问失败，未计入总分</p>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {rows.map((row) => (
              <li key={row.label}>
                <div className="flex items-baseline justify-between text-caption">
                  <span className="text-label-secondary">{row.label}</span>
                  <span className={`tabular-nums ${TONE_TEXT[scoreTone(row.value)]}`}>{row.value}%</span>
                </div>
                <div className="meter mt-1">
                  <span className={TONE_BG[scoreTone(row.value)]} style={{ width: `${row.value}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {engine.failed > 0 && (
            <p className="mt-3 text-caption text-label-secondary">{engine.failed} 次提问失败</p>
          )}
        </>
      )}
    </li>
  );
};

// ---------- 回答明细：左侧列表，右侧详情 ----------

const hostOf = (source: WebSource) => source.domain || source.title || source.uri;

const EvidenceExplorer: React.FC<{ report: AuditReport }> = ({ report }) => {
  const [engineFilter, setEngineFilter] = useState('all');
  const [selected, setSelected] = useState(0);
  const answeredEngines = (report.engines ?? []).filter((e) => e.answers > 0);
  const list =
    engineFilter === 'all' ? report.evidence : report.evidence.filter((item) => item.engine === engineFilter);
  const current = list[Math.min(selected, list.length - 1)];

  return (
    <Panel
      title="AI 的原话"
      hint="AI 对买家问题的真实回答（英文原文）"
      aside={
        answeredEngines.length > 1 ? (
          <SegmentedControl
            ariaLabel="按平台筛选回答"
            value={engineFilter}
            onChange={(value) => {
              setEngineFilter(value);
              setSelected(0);
            }}
            options={[
              { id: 'all', label: '全部' },
              ...answeredEngines.map((engine) => ({ id: engine.name, label: engine.name })),
            ]}
          />
        ) : undefined
      }
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <ul className="max-h-80 divide-y divide-separator overflow-y-auto lg:col-span-5 lg:max-h-[32rem]" aria-label="回答列表">
          {list.map((item, index) => {
            const active = index === Math.min(selected, list.length - 1);
            return (
              <li key={`${item.engine}-${item.question}-${index}`}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(index)}
                  className={`w-full rounded-control px-3 py-3 text-left transition-colors ${
                    active ? 'bg-surface-raised' : 'hover:bg-surface-hover'
                  }`}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="badge">{item.engine ?? 'Gemini'}</span>
                    {item.mentioned ? (
                      <span className="badge bg-success/15 text-success">
                        提到了你{item.position > 0 ? ` · 第 ${item.position} 位` : ''}
                      </span>
                    ) : (
                      <span className="badge bg-danger/15 text-danger">未提到</span>
                    )}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-body" lang="en">
                    {item.question}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {current && <EvidenceDetail item={current} domain={report.domain} className="lg:col-span-7" />}
      </div>
    </Panel>
  );
};

const EvidenceDetail: React.FC<{ item: AuditEvidence; domain: string; className?: string }> = ({
  item,
  domain,
  className = '',
}) => (
  <article className={`well max-h-[32rem] overflow-y-auto ${className}`}>
    <div className="flex flex-wrap items-center gap-2">
      <span className="badge">{item.engine ?? 'Gemini'}</span>
      <span className="badge">{item.branded ? '带品牌名' : '不带品牌名'}</span>
      {item.ownCited && <span className="badge bg-success/15 text-success">引用了官网</span>}
    </div>
    <h5 className="mt-3 text-body font-semibold" lang="en">
      {item.question}
    </h5>
    <p className="mt-2 whitespace-pre-line break-words text-body text-label-secondary" lang="en">
      {item.answer}
    </p>
    {item.sources.length > 0 && (
      <div className="mt-4 border-t border-separator pt-3">
        <p className="text-caption text-label-secondary">引用来源</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {item.sources.map((source, i) => {
            const own = domain !== '' && hostOf(source).toLowerCase().includes(domain.replace(/^www\./, ''));
            return (
              <li
                key={`${source.uri}-${i}`}
                className={`badge ${own ? 'bg-success/15 text-success' : ''}`}
              >
                {hostOf(source)}
              </li>
            );
          })}
        </ul>
      </div>
    )}
  </article>
);

// ---------- 官网体检 ----------

const siteRows = (site: SiteCheck): { ok: boolean; label: string; detail: string }[] => {
  const blocked = site.crawlers.filter((c) => !c.allowed);
  if (!site.reachable) return [{ ok: false, label: '官网访问', detail: site.error || '无法访问' }];
  return [
    {
      ok: blocked.length === 0,
      label: 'AI 爬虫权限',
      detail:
        blocked.length === 0
          ? `robots.txt 未屏蔽 ${site.crawlers.map((c) => c.agent).join('、')}`
          : `已屏蔽 ${blocked.map((c) => `${c.agent}（${c.product}）`).join('、')}`,
    },
    {
      ok: site.textChars >= 500,
      label: '不执行 JavaScript 时的正文',
      detail: `约 ${site.textChars.toLocaleString('zh-CN')} 字`,
    },
    { ok: site.english, label: '英文内容', detail: site.lang ? `页面语言 ${site.lang}` : '未声明页面语言' },
    {
      ok: site.schemaTypes.length > 0,
      label: '结构化数据',
      detail: site.schemaTypes.length > 0 ? site.schemaTypes.slice(0, 6).join('、') : '未发现 Schema 标记',
    },
    { ok: site.hasLlmsTxt, label: 'llms.txt', detail: site.hasLlmsTxt ? '已提供' : '未提供' },
    { ok: site.hasSitemap, label: '站点地图', detail: site.hasSitemap ? '已提供' : '未发现 sitemap' },
    { ok: site.https, label: 'HTTPS', detail: site.https ? '已启用' : '未启用' },
    {
      ok: site.ttfbMs < 2000,
      label: '首字节耗时',
      detail: `约 ${(site.ttfbMs / 1000).toFixed(1)} 秒（从测评服务器访问）`,
    },
  ];
};

const SiteChecks: React.FC<{ site: SiteCheck; className?: string }> = ({ site, className }) => {
  const rows = siteRows(site);
  const passed = rows.filter((r) => r.ok).length;
  return (
    <Panel
      title="官网能否被 AI 读取"
      className={className}
      aside={
        <span className="badge tabular-nums">
          {passed} / {rows.length} 项通过
        </span>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <li key={row.label} className="well flex items-start gap-3 text-body">
            {row.ok ? (
              <Check className="mt-1 h-5 w-5 shrink-0 text-success" aria-label="通过" />
            ) : (
              <X className="mt-1 h-5 w-5 shrink-0 text-danger" aria-label="待改进" />
            )}
            <span className="min-w-0">
              <span className="block font-semibold">{row.label}</span>
              <span className="block break-words text-caption text-label-secondary">{row.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
};
