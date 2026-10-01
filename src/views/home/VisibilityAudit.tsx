import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, ChevronRight, Globe, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { scoreTone, TONE_BG, TONE_TEXT } from '../../components/ui/tone';
import { ApiError } from '../../lib/api';
import {
  AuditEvidence,
  AuditJob,
  AuditReport,
  getAudit,
  isBackendMissing,
  parseDomain,
  sampleReport,
  SiteCheck,
  startAudit,
  WebSource,
} from '../../lib/audit';

// 与后端 runAudit 的五个步骤一一对应；第 4 步的平台名来自任务状态
const auditSteps = (engines: string[] | null) => [
  '读取官网：页面内容、AI 爬虫权限与结构化数据',
  '识别品牌、所属行业与目标市场',
  '生成海外买家会向 AI 提出的采购问题',
  `以买家身份向 ${engines && engines.length > 0 ? engines.join('、') : 'AI 搜索'} 提问（开启联网搜索）`,
  '统计品牌提及、推荐排位与引用来源',
];

type JobProgress = Pick<AuditJob, 'status' | 'step' | 'done' | 'total' | 'engines'>;

const POLL_MS = 1500;
const POLL_LIMIT_MS = 7 * 60 * 1000;
const EVIDENCE_PREVIEW = 3;
const ANSWER_PREVIEW_CHARS = 280;

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
    setJob(null);
    setReport(result);
    logLeadActivity(`完成了【${result.domain}】AI 可见性测评`, 20, { target: result.domain, mode: result.mode });
    saveDiagnosis('ai_visibility', 'AI 可见性测评', result.totalScore, `${result.domain} · ${result.level}`, {
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
      setJob({
        status: current.status,
        step: current.step,
        done: current.done,
        total: current.total,
        engines: current.engines,
      });
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const domain = parseDomain(input);
    if (!domain) {
      setInputError('请输入官网域名，例如 www.example.com');
      inputRef.current?.focus();
      return;
    }
    setInputError('');
    setReport(null);
    setJob({ status: 'queued', step: 0, done: 0, total: 0, engines: null });
    try {
      const { id } = await startAudit(domain);
      await poll(id, Date.now());
    } catch (err) {
      if (isBackendMissing(err)) {
        // 测评服务未启用（例如用 Node 版 server.ts 开发时），展示标注过的示例
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (alive.current) finish(sampleReport(domain));
        return;
      }
      fail(err instanceof ApiError ? err.message : '测评失败，请稍后重试');
    }
  };

  return (
    <div className="tile mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title-2">AI 可见性测评</h2>
          <p className="mt-2 text-body text-label-secondary">
            输入官网域名，我们以海外买家的身份向 AI 搜索提问，统计你被推荐、被引用的情况，并检查官网能否被 AI 读取。所属行业与目标市场由 AI 根据官网自动判断。
          </p>
        </div>
        <span className="badge shrink-0 bg-success/15 text-success">免费</span>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="audit-target" className="field-label">
            官网域名
          </label>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-label-secondary" />
            <input
              ref={inputRef}
              id="audit-target"
              type="text"
              inputMode="url"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputError) setInputError('');
              }}
              placeholder="例如 www.ak-medical.net"
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

      {report && !isRunning && (
        <AuditResult report={report} openBookingModal={openBookingModal} onGoToConfigurator={onGoToConfigurator} />
      )}
    </div>
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
      {auditSteps(job.engines).map((step, index) => {
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

// ---------- 结果 ----------

interface AuditResultProps {
  report: AuditReport;
  openBookingModal: () => void;
  onGoToConfigurator: () => void;
}

const AuditResult: React.FC<AuditResultProps> = ({ report, openBookingModal, onGoToConfigurator }) => {
  const [showAllEvidence, setShowAllEvidence] = useState(false);
  const [engineFilter, setEngineFilter] = useState('all');
  const tone = scoreTone(report.totalScore);
  const hasAI = report.mode !== 'site_only';
  const { metrics, entity } = report;
  const engines = report.engines ?? [];
  const engineCount = engines.length;
  const answeredEngines = engines.filter((e) => e.answers > 0);
  const filtered =
    engineFilter === 'all' ? report.evidence : report.evidence.filter((item) => item.engine === engineFilter);
  const evidence = showAllEvidence ? filtered : filtered.slice(0, EVIDENCE_PREVIEW);
  const maxVoice = Math.max(1, ...report.shareOfVoice.map((v) => v.mentions));

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
    { label: 'AI 可读取性', value: metrics.readability, unit: ' / 100', note: '官网检查', ai: false },
  ];

  return (
    <div className="mt-8 border-t border-separator pt-8 animate-fade-in" aria-live="polite">
      {report.mode === 'sample' && (
        <p className="mb-6 flex items-start gap-2 text-body text-warning">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
          <span>测评服务暂未接入 AI，以下 AI 部分为示例数据，仅用于展示报告格式。</span>
        </p>
      )}
      {report.mode === 'site_only' && (
        <p className="mb-6 flex items-start gap-2 text-body text-warning">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
          <span>本次向 AI 提问没有成功，只给出官网检查结果，请稍后重新测评。</span>
        </p>
      )}

      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <ScoreRing value={report.totalScore} caption="/ 100" />
        <div className="min-w-0">
          <p className="break-all text-caption text-label-secondary">
            {entity.brand} · {report.domain}
          </p>
          <p className="text-caption text-label-secondary">
            AI 判断行业：{entity.industry} · 目标市场：{entity.market}
          </p>
          <h3 className="mt-1 text-title-2">{hasAI ? 'AI 可见性综合得分' : '官网 AI 可读取性'}</h3>
          <p className={`mt-1 text-body font-semibold ${TONE_TEXT[tone]}`}>{report.level}</p>
          {hasAI && (
            <p className="mt-3 text-caption text-label-secondary">
              向 {report.engine} 提出 {report.questions} 个问题，每个平台每题问 {report.samples} 次，共 {report.answers}{' '}
              次有效回答。AI 的回答每次略有不同，结果按比例统计{engineCount > 1 && '，总分按各平台平均'}。
            </p>
          )}
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => {
          const available = hasAI || !tile.ai;
          const tileTone = scoreTone(tile.value);
          return (
            <div key={tile.label} className="well">
              <dt className="text-caption text-label-secondary">{tile.label}</dt>
              <dd className="mt-1 text-title-2 tabular-nums">
                {available ? tile.value : '—'}
                {available && <span className="text-caption font-normal text-label-secondary">{tile.unit}</span>}
              </dd>
              <div className="meter mt-3">
                <span className={TONE_BG[tileTone]} style={{ width: `${available ? tile.value : 0}%` }} />
              </div>
              <p className="mt-2 text-caption text-label-secondary">{tile.note}</p>
            </div>
          );
        })}
      </dl>

      {hasAI && engineCount > 1 && (
        <section className="mt-10" aria-labelledby="audit-engines">
          <h4 id="audit-engines" className="text-title-3">
            各平台表现
          </h4>
          <table className="mt-2 w-full text-body">
            <thead>
              <tr className="text-caption text-label-secondary">
                <th scope="col" className="py-2 text-left font-normal">平台</th>
                <th scope="col" className="py-2 text-right font-normal">提到你</th>
                <th scope="col" className="py-2 text-right font-normal">引用官网</th>
                <th scope="col" className="py-2 text-right font-normal">品牌认知</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator border-t border-separator">
              {engines.map((engine) => (
                <tr key={engine.id}>
                  <th scope="row" className="py-3 text-left font-semibold">
                    {engine.name}
                    {engine.failed > 0 && (
                      <span className="block text-caption font-normal text-label-secondary">
                        {engine.answers === 0 ? '提问失败，未计入' : `${engine.failed} 次提问失败`}
                      </span>
                    )}
                  </th>
                  {[engine.mentionRate, engine.citationRate, engine.brandKnowledge].map((value, i) => (
                    <td
                      key={i}
                      className={`py-3 text-right tabular-nums ${engine.answers > 0 ? TONE_TEXT[scoreTone(value)] : 'text-label-secondary'}`}
                    >
                      {engine.answers > 0 ? `${value}%` : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {hasAI && report.shareOfVoice.length > 1 && (
        <section className="mt-10" aria-labelledby="audit-voice">
          <h4 id="audit-voice" className="text-title-3">
            AI 推荐了谁
          </h4>
          <p className="mt-1 text-caption text-label-secondary">不带品牌名的采购问题中，各品牌被提到的次数</p>
          <ul className="mt-4 space-y-3">
            {report.shareOfVoice.map((voice) => (
              <li key={voice.name} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-body">
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
        </section>
      )}

      {hasAI && report.evidence.length > 0 && (
        <section className="mt-10" aria-labelledby="audit-evidence">
          <h4 id="audit-evidence" className="text-title-3">
            AI 的原话
          </h4>
          <p className="mt-1 text-caption text-label-secondary">以下是 AI 对买家问题的真实回答（英文原文节选）</p>
          {answeredEngines.length > 1 && (
            <SegmentedControl
              className="mt-4"
              ariaLabel="按平台筛选回答"
              value={engineFilter}
              onChange={(value) => {
                setEngineFilter(value);
                setShowAllEvidence(false);
              }}
              options={[
                { id: 'all', label: '全部' },
                ...answeredEngines.map((engine) => ({ id: engine.name, label: engine.name })),
              ]}
            />
          )}
          <ul className="mt-2 divide-y divide-separator">
            {evidence.map((item, index) => (
              <EvidenceItem key={`${item.question}-${index}`} item={item} domain={report.domain} />
            ))}
          </ul>
          {filtered.length > EVIDENCE_PREVIEW && (
            <button
              type="button"
              className="link mt-2 text-body"
              aria-expanded={showAllEvidence}
              onClick={() => setShowAllEvidence((v) => !v)}
            >
              {showAllEvidence ? '收起' : `查看全部 ${filtered.length} 条回答`}
            </button>
          )}
        </section>
      )}

      {report.site && <SiteChecks site={report.site} />}

      <h4 className="mt-10 text-title-3">核心发现</h4>
      <ul className="mt-2 divide-y divide-separator">
        {report.findings.map((item) => (
          <li key={item} className="flex items-start gap-3 py-4 text-body">
            {tone === 'success' ? (
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
        <p className="mt-2 text-body text-label-secondary">{report.recommendation}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
    </div>
  );
};

const hostOf = (source: WebSource) => source.domain || source.title || source.uri;

const EvidenceItem: React.FC<{ item: AuditEvidence; domain: string }> = ({ item, domain }) => {
  const [expanded, setExpanded] = useState(false);
  const long = item.answer.length > ANSWER_PREVIEW_CHARS;
  const text = expanded || !long ? item.answer : `${item.answer.slice(0, ANSWER_PREVIEW_CHARS)}…`;
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge">{item.engine ?? 'Gemini'}</span>
        <span className="badge">{item.branded ? '带品牌名' : '不带品牌名'}</span>
        {item.mentioned ? (
          <span className="badge bg-success/15 text-success">
            提到了你{item.position > 0 ? ` · 第 ${item.position} 位` : ''}
          </span>
        ) : (
          <span className="badge bg-danger/15 text-danger">未提到</span>
        )}
      </div>
      <p className="mt-2 text-body font-semibold" lang="en">
        {item.question}
      </p>
      <p className="mt-1 whitespace-pre-line break-words text-body text-label-secondary" lang="en">
        {text}
      </p>
      {long && (
        <button
          type="button"
          className="link mt-1 text-caption"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? '收起' : '展开全文'}
        </button>
      )}
      {item.sources.length > 0 && (
        <p className="mt-2 break-words text-caption text-label-secondary">
          引用来源：
          {item.sources.map((source, i) => {
            const own = hostOf(source).toLowerCase().includes(domain.replace(/^www\./, ''));
            return (
              <React.Fragment key={`${source.uri}-${i}`}>
                {i > 0 && '、'}
                <span className={own ? 'font-semibold text-success' : undefined}>{hostOf(source)}</span>
              </React.Fragment>
            );
          })}
        </p>
      )}
    </li>
  );
};

const SiteChecks: React.FC<{ site: SiteCheck }> = ({ site }) => {
  const blocked = site.crawlers.filter((c) => !c.allowed);
  const rows: { ok: boolean; label: string; detail: string }[] = site.reachable
    ? [
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
      ]
    : [{ ok: false, label: '官网访问', detail: site.error || '无法访问' }];

  return (
    <section className="mt-10" aria-labelledby="audit-site">
      <h4 id="audit-site" className="text-title-3">
        官网能否被 AI 读取
      </h4>
      <ul className="mt-2 divide-y divide-separator">
        {rows.map((row) => (
          <li key={row.label} className="flex items-start gap-3 py-3 text-body">
            {row.ok ? (
              <Check className="mt-1 h-5 w-5 shrink-0 text-success" aria-label="通过" />
            ) : (
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-warning" aria-label="待改进" />
            )}
            <span className="min-w-0">
              <span className="font-semibold">{row.label}</span>
              <span className="break-words text-label-secondary"> · {row.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
