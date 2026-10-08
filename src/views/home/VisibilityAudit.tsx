import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, ChevronRight, Globe, Loader2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LanguageContext';
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
  ProbeLogEntry,
  parseAuditInput,
  SiteCheck,
  startAudit,
  WebSource,
} from '../../lib/audit';
import { CONTACT_NAME_MAX, contactNameError, contactPhoneError, parseContact } from '../../lib/contact';

type T = (zh: string, en: string) => string;

// 与后端 runAudit 的五个步骤一一对应；第 4 步的平台名来自任务状态
const auditSteps = (engines: string[] | null, byBrand: boolean, t: T, lang: 'zh' | 'en') => {
  const sep = lang === 'en' ? ', ' : '、';
  return [
    byBrand
      ? t('查找品牌官网，并读取页面内容、AI 爬虫权限与结构化数据', 'Find the brand’s website, then read its content, AI crawler access and structured data')
      : t('读取官网：页面内容、AI 爬虫权限与结构化数据', 'Read the website: content, AI crawler access and structured data'),
    t('识别品牌、所属行业与目标市场', 'Identify the brand, industry and target market'),
    t('生成海外买家会向 AI 提出的采购问题', 'Generate the procurement questions overseas buyers would ask AI'),
    engines && engines.length > 0
      ? t(`以买家身份向 ${engines.join(sep)} 提问（开启联网搜索）`, `Ask ${engines.join(sep)} as a buyer, with web search on`)
      : t('以买家身份向各 AI 平台提问（开启联网搜索）', 'Ask each AI platform as a buyer, with web search on'),
    t('统计品牌提及、推荐排位与引用来源', 'Count brand mentions, recommendation rank and cited sources'),
  ];
};

type JobProgress = Pick<AuditJob, 'status' | 'step' | 'done' | 'total' | 'engines' | 'log'> & { byBrand: boolean };

const POLL_MS = 1500;
const POLL_LIMIT_MS = 7 * 60 * 1000;

interface VisibilityAuditProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  openBookingModal: () => void;
  onGoToConfigurator: () => void;
}

export const VisibilityAudit: React.FC<VisibilityAuditProps> = ({ inputRef, openBookingModal, onGoToConfigurator }) => {
  const { logLeadActivity, saveDiagnosis, showToast } = useApp();
  const { t, lang } = useLang();
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactErrors, setContactErrors] = useState<{ name: string; phone: string }>({ name: '', phone: '' });
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [job, setJob] = useState<JobProgress | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  // 测评失败时保留第④步的提问日志，方便排查是哪个平台、什么原因
  const [failedLog, setFailedLog] = useState<ProbeLogEntry[]>([]);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const isRunning = job !== null;
  const targetError = t('请输入官网域名或品牌名称，例如 www.example.com 或 爱康医疗', 'Enter a website domain or brand name, e.g. www.example.com or Aikang Medical');
  const nameErrorText = t(`请填写联系人姓名（${CONTACT_NAME_MAX} 个字以内）`, `Enter a contact name (up to ${CONTACT_NAME_MAX} characters)`);
  const phoneErrorText = t('请填写 11 位手机号码', 'Enter an 11-digit mobile number');

  const finish = (result: AuditReport) => {
    const target = result.domain || result.target || result.entity.brand;
    setJob(null);
    setReport(result);
    logLeadActivity(`完成了【${target}】AI 可见性测评`, 20, { target, mode: result.mode });
    saveDiagnosis('ai_visibility', 'AI 可见性测评', result.totalScore, `${target} · ${result.level}`, {
      auditId: result.id,
      mode: result.mode,
    });
    showToast(t('测评报告已生成', 'Your audit report is ready'));
  };

  const fail = (message: string, log?: ProbeLogEntry[] | null) => {
    setJob(null);
    setFailedLog(log ?? []);
    setInputError(message);
    inputRef.current?.focus();
  };

  const poll = async (id: string, startedAt: number) => {
    while (alive.current) {
      if (Date.now() - startedAt > POLL_LIMIT_MS) return fail(t('测评超时，请稍后重试', 'The audit timed out. Please try again later'));
      let current: AuditJob;
      try {
        current = await getAudit(id);
      } catch (err) {
        return fail(err instanceof ApiError ? err.message : t('测评失败，请稍后重试', 'The audit failed. Please try again later'));
      }
      if (!alive.current) return;
      if (current.status === 'done' && current.report) return finish(current.report);
      if (current.status === 'failed') return fail(current.error || t('测评失败，请稍后重试', 'The audit failed. Please try again later'), current.log);
      setJob((prev) => ({
        byBrand: prev?.byBrand ?? false,
        status: current.status,
        step: current.step,
        done: current.done,
        total: current.total,
        engines: current.engines,
        log: current.log,
      }));
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAuditInput(input);
    const contact = parseContact(contactName, contactPhone);
    const nameError = contactNameError(contactName) ? nameErrorText : '';
    const phoneError = contactPhoneError(contactPhone) ? phoneErrorText : '';
    setInputError(parsed ? '' : targetError);
    setContactErrors({ name: nameError, phone: phoneError });
    if (!parsed || !contact.ok) {
      // 错误都在表单里标出来；焦点落到第一个出错的字段
      if (!parsed) inputRef.current?.focus();
      else if (nameError) nameRef.current?.focus();
      else phoneRef.current?.focus();
      return;
    }
    const target = 'domain' in parsed ? parsed.domain : parsed.brand;
    setReport(null);
    setFailedLog([]);
    setJob({ status: 'queued', step: 0, done: 0, total: 0, engines: null, log: null, byBrand: 'brand' in parsed });
    try {
      const started = await startAudit({ target, contactName: contact.name, contactPhone: contact.phone });
      if (!alive.current) return;
      await poll(started.id, Date.now());
    } catch (err) {
      fail(err instanceof ApiError ? err.message : t('测评失败，请稍后重试', 'The audit failed. Please try again later'));
    }
  };

  return (
    <>
    <div className="layout-text">
    <div className="tile mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title-2">{t('AI 可见性测评', 'AI visibility audit')}</h2>
          <p className="mt-2 text-body text-label-secondary">
            {t(
              '输入官网域名或品牌名称，我们以海外买家的身份向 AI 搜索提问，统计你被推荐、被引用的情况，并检查官网能否被 AI 读取。只填品牌名时，由 AI 联网查找官网；所属行业与目标市场也由 AI 自动判断。',
              'Enter your website domain or brand name. We ask AI search tools questions as an overseas buyer would, track whether you get recommended and cited, and check whether AI can read your website. If you only enter a brand name, AI searches the web for the site, and it also determines your industry and target market.'
            )}
          </p>
        </div>
        <span className="badge shrink-0 bg-success/15 text-success">{t('免费', 'Free')}</span>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="audit-target" className="field-label">
            {t('官网域名或品牌名称', 'Website domain or brand name')}
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
              placeholder={t('例如 www.ak-medical.net 或 爱康医疗', 'e.g. www.ak-medical.net or Aikang Medical')}
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

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="audit-name" className="field-label">
              {t('联系人姓名', 'Contact name')}
            </label>
            <input
              ref={nameRef}
              id="audit-name"
              type="text"
              value={contactName}
              onChange={(e) => {
                setContactName(e.target.value);
                if (contactErrors.name) setContactErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder={t('如 张总', 'e.g. Mr. Zhang')}
              maxLength={CONTACT_NAME_MAX}
              className="field"
              autoComplete="name"
              required
              aria-invalid={contactErrors.name ? true : undefined}
              aria-describedby={contactErrors.name ? 'audit-name-error' : undefined}
            />
            {contactErrors.name && (
              <p id="audit-name-error" role="alert" className="mt-2 text-caption text-danger">
                {contactErrors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="audit-phone" className="field-label">
              {t('手机号', 'Mobile number')}
            </label>
            <input
              ref={phoneRef}
              id="audit-phone"
              type="tel"
              inputMode="tel"
              value={contactPhone}
              onChange={(e) => {
                setContactPhone(e.target.value);
                if (contactErrors.phone) setContactErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder={t('如 13800138000', 'e.g. 13800138000')}
              className="field tabular-nums"
              autoComplete="tel-national"
              required
              aria-invalid={contactErrors.phone ? true : undefined}
              aria-describedby={contactErrors.phone ? 'audit-phone-error' : undefined}
            />
            {contactErrors.phone && (
              <p id="audit-phone-error" role="alert" className="mt-2 text-caption text-danger">
                {contactErrors.phone}
              </p>
            )}
          </div>
          <p className="text-caption text-label-secondary sm:col-span-2">
            {t(
              '联系方式仅用于发送测评结果，以及安排 30 分钟诊断会。',
              'Your contact details are used only to send the audit results and to arrange a 30-minute diagnosis call.'
            )}
          </p>
        </div>

        <button type="submit" disabled={isRunning} className="btn btn-primary btn-lg btn-block">
          {isRunning ? (
            <>
              <Loader2 className="animate-spin" />
              {t('正在测评…', 'Running audit…')}
            </>
          ) : (
            t('开始测评', 'Start audit')
          )}
        </button>
      </form>

      {job && <AuditProgress job={job} />}

      {!job && !report && failedLog.length > 0 && (
        <div className="mt-8 border-t border-separator pt-8">
          <h3 className="text-title-3">{t('提问日志', 'Probe log')}</h3>
          <ProbeLogSummary entries={failedLog} />
          <ProbeLogList entries={failedLog} className="mt-4" />
        </div>
      )}
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

const AuditProgress: React.FC<{ job: JobProgress }> = ({ job }) => {
  const { t, lang } = useLang();
  return (
  <div className="mt-8 border-t border-separator pt-8">
    <p className="text-caption text-label-secondary" aria-live="polite">
      {job.status === 'queued'
        ? t('排队中，前面还有测评在进行…', 'Queued. Other audits are running ahead of yours…')
        : t(
            '需要真实向多个 AI 平台提问几十次，通常 1 到 3 分钟完成，请不要关闭页面。',
            'We need to ask several AI platforms dozens of real questions. This usually takes 1 to 3 minutes, so please keep this page open.'
          )}
    </p>
    <ol className="mt-4 space-y-3" aria-label={t('测评进度', 'Audit progress')}>
      {auditSteps(job.engines, job.byBrand, t, lang).map((step, index) => {
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
                  ({job.done} / {job.total})
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
    {job.log && job.log.length > 0 && <ProbeLogList entries={job.log} live className="mt-6" />}
  </div>
  );
};

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
  const { t, lang } = useLang();
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
  const probeLog = report.probeLog ?? [];

  const tiles = [
    {
      label: t('AI 推荐时提到你', 'Mentioned by AI when recommending'),
      value: metrics.mentionRate,
      unit: '%',
      note: metrics.avgPosition > 0 ? t(`平均排第 ${metrics.avgPosition} 位`, `Average rank ${metrics.avgPosition}`) : t('不带品牌名的问题', 'Questions without the brand name'),
      ai: true,
    },
    { label: t('官网被引用', 'Your site is cited'), value: metrics.citationRate, unit: '%', note: t('回答列出的来源', 'Sources listed in answers'), ai: true },
    { label: t('品牌认知', 'Brand awareness'), value: metrics.brandKnowledge, unit: '%', note: t('直接问品牌时', 'When asked about the brand directly'), ai: true },
    {
      label: t('AI 可读取性', 'AI readability'),
      value: metrics.readability,
      unit: ' / 100',
      note: hasSite ? t('官网检查', 'Website check') : t('未检查官网', 'Website not checked'),
      ai: false,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in" aria-live="polite">
      {report.mode === 'sample' && (
        <p className="flex items-start gap-2 text-body text-warning">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
          <span>
            {t(
              '测评服务暂未接入 AI，以下 AI 部分为示例数据，仅用于展示报告格式。',
              'The AI service is not connected yet. The AI section below is sample data, shown only to illustrate the report format.'
            )}
          </span>
        </p>
      )}
      {report.mode === 'site_only' && (
        <p className="flex items-start gap-2 text-body text-warning">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
          <span>
            {t(
              '本次向 AI 提问没有成功，只给出官网检查结果，请稍后重新测评。',
              'The AI questions did not succeed this time, so only the website check is shown. Please run the audit again later.'
            )}
          </span>
        </p>
      )}

      {/* 身份条 */}
      <header className="card flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h3 className="break-all text-title-2">{entity.brand}</h3>
          <p className="mt-1 break-all text-caption text-label-secondary">
            {report.domain ? report.domain : searchedSite ? t('未找到官网', 'No website found') : t('未提供官网', 'No website provided')}
            {report.domainSource === 'resolved' &&
              t(
                ' · 官网由 AI 根据品牌名查找，如不准确请直接输入官网域名',
                ' · Website found by AI from the brand name. If this is wrong, enter the domain directly'
              )}
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 [&>.badge]:max-w-full [&>.badge]:whitespace-normal">
          <span className="badge">
            {t('行业：', 'Industry: ')}
            {entity.industry}
          </span>
          <span className="badge">
            {t('市场：', 'Market: ')}
            {entity.market}
          </span>
          {hasAI && <span className="badge">{report.engine}</span>}
          {hasAI && (
            <span className="badge tabular-nums">
              {t(
                `${report.questions} 题 × ${report.samples} 次 · 共 ${report.answers} 次有效回答`,
                `${report.questions} questions × ${report.samples} times · ${report.answers} valid answers in total`
              )}
            </span>
          )}
        </div>
      </header>

      {/* 总分 + 四项指标 */}
      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card flex items-center gap-6 lg:col-span-4 lg:flex-col lg:justify-center lg:text-center">
          <ScoreRing value={report.totalScore} caption="/ 100" size={168} stroke={14} />
          <div>
            <p className="text-title-3">
              {hasAI ? t('AI 可见性综合得分', 'Overall AI visibility score') : t('官网 AI 可读取性', 'Website readability for AI')}
            </p>
            <p className={`mt-1 text-body font-semibold ${TONE_TEXT[tone]}`}>{report.level}</p>
            {hasAI && engineCount > 1 && (
              <p className="mt-2 text-caption text-label-secondary">
                {t(
                  '总分按各平台平均；AI 回答每次略有不同，结果按比例统计',
                  'The total is the average across platforms. AI answers vary a little each time, so results are shown as proportions.'
                )}
              </p>
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
              title={t('各平台表现', 'Results by platform')}
              hint={t('同一批买家问题，在不同 AI 平台上的结果', 'The same buyer questions, asked on different AI platforms')}
              className={showVoice ? 'lg:col-span-7' : 'lg:col-span-12'}
            >
              <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
                {engines.map((engine) => (
                  <EngineCard key={engine.id} engine={engine} log={probeLog} />
                ))}
              </ul>
            </Panel>
          )}
          {showVoice && (
            <Panel
              title={t('AI 推荐了谁', 'Who AI recommends')}
              hint={t('不带品牌名的采购问题中，各品牌被提到的次数', 'How often each brand is mentioned in procurement questions without the brand name')}
              className={showEngines ? 'lg:col-span-5' : 'lg:col-span-12'}
            >
              <ul className="space-y-3">
                {report.shareOfVoice.map((voice) => (
                  <li key={voice.name} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 text-body">
                    <span className={`truncate ${voice.isSelf ? 'font-semibold' : ''}`} title={voice.name}>
                      {voice.name}
                      {voice.isSelf && <span className="text-label-secondary">{t('（你）', ' (you)')}</span>}
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
          <Panel title={t('官网能否被 AI 读取', 'Can AI read the website?')} className="lg:col-span-5">
            <p className="flex items-start gap-3 text-body">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
              <span className="text-label-secondary">
                {searchedSite
                  ? t('AI 联网搜索没有找到这个品牌的官网，', 'AI web search found no website for this brand. ')
                  : t('只输入了品牌名，', 'Only the brand name was entered. ')}
                {t('本次未做官网检查。输入官网域名可获得完整测评。', 'The website was not checked this time. Enter the domain for a full audit.')}
              </span>
            </p>
          </Panel>
        )}
        <Panel title={t('核心发现与建议', 'Key findings and recommendations')} className={report.site ? 'lg:col-span-5' : 'lg:col-span-7'}>
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
            <h5 className="text-body font-semibold">{t('建议方案', 'Recommended plan')}</h5>
            <p className="mt-2 text-body text-label-secondary">{report.recommendation}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button type="button" onClick={openBookingModal} className="btn btn-primary">
                {t('预约 30 分钟诊断会', 'Book a 30-minute diagnosis call')}
              </button>
              <button
                type="button"
                onClick={onGoToConfigurator}
                className="link justify-center px-2 py-2 text-body sm:justify-start"
              >
                {t('规划服务方案', 'Plan a service package')}
                <ChevronRight />
              </button>
            </div>
          </div>
        </Panel>
      </div>

      {hasAI && report.evidence.length > 0 && <EvidenceExplorer report={report} />}

      {probeLog.length > 0 && <ProbeLogPanel entries={probeLog} />}
    </div>
  );
};

const EngineCard: React.FC<{ engine: AuditEngineResult; log: ProbeLogEntry[] }> = ({ engine, log }) => {
  const { t } = useLang();
  const failedAll = engine.answers === 0;
  const reason = topReason(log.filter((entry) => entry.engine === engine.name));
  const rows = [
    { label: t('提到你', 'Mentions you'), value: engine.mentionRate },
    { label: t('引用官网', 'Cites your site'), value: engine.citationRate },
    { label: t('品牌认知', 'Brand awareness'), value: engine.brandKnowledge },
  ];
  return (
    <li className="well">
      <h5 className="text-body font-semibold">{engine.name}</h5>
      {!failedAll && engine.avgPosition > 0 && (
        <p className="text-caption tabular-nums text-label-secondary">{t(`平均排第 ${engine.avgPosition} 位`, `Average rank ${engine.avgPosition}`)}</p>
      )}
      {failedAll ? (
        <p className="mt-4 text-caption text-label-secondary">
          {t('提问失败，未计入总分', 'Questions failed, not included in the score')}
          {reason && (
            <span className="mt-1 block text-danger">
              {t('原因：', 'Reason: ')}
              {reason}
            </span>
          )}
        </p>
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
            <p className="mt-3 text-caption text-label-secondary">
              {t(`${engine.failed} 次提问失败`, `${engine.failed} questions failed`)}
              {reason && `${t('：', ': ')}${reason}`}
            </p>
          )}
        </>
      )}
    </li>
  );
};

// ---------- 回答明细：左侧列表，右侧详情 ----------

const hostOf = (source: WebSource) => source.domain || source.title || source.uri;

const EvidenceExplorer: React.FC<{ report: AuditReport }> = ({ report }) => {
  const { t } = useLang();
  const [engineFilter, setEngineFilter] = useState('all');
  const [selected, setSelected] = useState(0);
  const answeredEngines = (report.engines ?? []).filter((e) => e.answers > 0);
  const list =
    engineFilter === 'all' ? report.evidence : report.evidence.filter((item) => item.engine === engineFilter);
  const current = list[Math.min(selected, list.length - 1)];

  return (
    <Panel
      title={t('AI 的原话', 'What AI actually said')}
      hint={t('AI 对买家问题的真实回答（英文原文）', 'AI’s real answers to buyer questions (original English)')}
      aside={
        answeredEngines.length > 1 ? (
          <SegmentedControl
            ariaLabel={t('按平台筛选回答', 'Filter answers by platform')}
            value={engineFilter}
            onChange={(value) => {
              setEngineFilter(value);
              setSelected(0);
            }}
            options={[
              { id: 'all', label: t('全部', 'All') },
              ...answeredEngines.map((engine) => ({ id: engine.name, label: engine.name })),
            ]}
          />
        ) : undefined
      }
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <ul
          className="max-h-80 divide-y divide-separator overflow-y-auto lg:col-span-5 lg:max-h-[32rem]"
          aria-label={t('回答列表', 'Answer list')}
        >
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
                        {t('提到了你', 'Mentioned you')}
                        {item.position > 0 ? t(` · 第 ${item.position} 位`, ` · rank ${item.position}`) : ''}
                      </span>
                    ) : (
                      <span className="badge bg-danger/15 text-danger">{t('未提到', 'Not mentioned')}</span>
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
}) => {
  const { t } = useLang();
  return (
  <article className={`well max-h-[32rem] overflow-y-auto ${className}`}>
    <div className="flex flex-wrap items-center gap-2">
      <span className="badge">{item.engine ?? 'Gemini'}</span>
      <span className="badge">{item.branded ? t('带品牌名', 'With brand name') : t('不带品牌名', 'Without brand name')}</span>
      {item.ownCited && <span className="badge bg-success/15 text-success">{t('引用了官网', 'Cites your site')}</span>}
    </div>
    <h5 className="mt-3 text-body font-semibold" lang="en">
      {item.question}
    </h5>
    <p className="mt-2 whitespace-pre-line break-words text-body text-label-secondary" lang="en">
      {item.answer}
    </p>
    {item.sources.length > 0 && (
      <div className="mt-4 border-t border-separator pt-3">
        <p className="text-caption text-label-secondary">{t('引用来源', 'Sources cited')}</p>
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
};

// ---------- 官网体检 ----------

const siteRows = (site: SiteCheck, t: T, lang: 'zh' | 'en'): { ok: boolean; label: string; detail: string }[] => {
  const sep = lang === 'en' ? ', ' : '、';
  const blocked = site.crawlers.filter((c) => !c.allowed);
  if (!site.reachable) return [{ ok: false, label: t('官网访问', 'Website access'), detail: site.error || t('无法访问', 'Cannot be reached') }];
  return [
    {
      ok: blocked.length === 0,
      label: t('AI 爬虫权限', 'AI crawler access'),
      detail:
        blocked.length === 0
          ? t(`robots.txt 未屏蔽 ${site.crawlers.map((c) => c.agent).join(sep)}`, `robots.txt does not block ${site.crawlers.map((c) => c.agent).join(sep)}`)
          : t(`已屏蔽 ${blocked.map((c) => `${c.agent}（${c.product}）`).join(sep)}`, `Blocked: ${blocked.map((c) => `${c.agent} (${c.product})`).join(sep)}`),
    },
    {
      ok: site.textChars >= 500,
      label: t('不执行 JavaScript 时的正文', 'Body text without running JavaScript'),
      detail: t(`约 ${site.textChars.toLocaleString('zh-CN')} 字`, `About ${site.textChars.toLocaleString('en-US')} characters`),
    },
    {
      ok: site.english,
      label: t('英文内容', 'English content'),
      detail: site.lang ? t(`页面语言 ${site.lang}`, `Page language ${site.lang}`) : t('未声明页面语言', 'No page language declared'),
    },
    {
      ok: site.schemaTypes.length > 0,
      label: t('结构化数据', 'Structured data'),
      detail: site.schemaTypes.length > 0 ? site.schemaTypes.slice(0, 6).join(sep) : t('未发现 Schema 标记', 'No Schema markup found'),
    },
    { ok: site.hasLlmsTxt, label: 'llms.txt', detail: site.hasLlmsTxt ? t('已提供', 'Provided') : t('未提供', 'Not provided') },
    {
      ok: site.hasSitemap,
      label: t('站点地图', 'Sitemap'),
      detail: site.hasSitemap ? t('已提供', 'Provided') : t('未发现 sitemap', 'No sitemap found'),
    },
    { ok: site.https, label: 'HTTPS', detail: site.https ? t('已启用', 'Enabled') : t('未启用', 'Not enabled') },
    {
      ok: site.ttfbMs < 2000,
      label: t('首字节耗时', 'Time to first byte'),
      detail: t(
        `约 ${(site.ttfbMs / 1000).toFixed(1)} 秒（从测评服务器访问）`,
        `About ${(site.ttfbMs / 1000).toFixed(1)} s (measured from the audit server)`
      ),
    },
  ];
};

const SiteChecks: React.FC<{ site: SiteCheck; className?: string }> = ({ site, className }) => {
  const { t, lang } = useLang();
  const rows = siteRows(site, t, lang);
  const passed = rows.filter((r) => r.ok).length;
  return (
    <Panel
      title={t('官网能否被 AI 读取', 'Can AI read the website?')}
      className={className}
      aside={
        <span className="badge tabular-nums">
          {t(`${passed} / ${rows.length} 项通过`, `${passed} / ${rows.length} passed`)}
        </span>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <li key={row.label} className="well flex items-start gap-3 text-body">
            {row.ok ? (
              <Check className="mt-1 h-5 w-5 shrink-0 text-success" aria-label={t('通过', 'Passed')} />
            ) : (
              <X className="mt-1 h-5 w-5 shrink-0 text-danger" aria-label={t('待改进', 'Needs work')} />
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

// ---------- 提问日志 ----------

/** 出现最多的失败原因 */
const topReason = (entries: ProbeLogEntry[]) => {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.ok && entry.reason) counts.set(entry.reason, (counts.get(entry.reason) ?? 0) + 1);
  }
  let best = '';
  let max = 0;
  counts.forEach((count, reason) => {
    if (count > max) [best, max] = [reason, count];
  });
  return best;
};

const seconds = (ms: number, t: T) => t(`${(ms / 1000).toFixed(1)} 秒`, `${(ms / 1000).toFixed(1)} s`);

/** 按平台汇总：成功、失败次数，平均耗时与主要失败原因 */
const ProbeLogSummary: React.FC<{ entries: ProbeLogEntry[] }> = ({ entries }) => {
  const { t } = useLang();
  const engines = [...new Set(entries.map((entry) => entry.engine))];
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
      {engines.map((name) => {
        const list = entries.filter((entry) => entry.engine === name);
        const ok = list.filter((entry) => entry.ok);
        const failed = list.length - ok.length;
        const avg = ok.length > 0 ? ok.reduce((sum, entry) => sum + entry.ms, 0) / ok.length : 0;
        const reason = topReason(list);
        return (
          <li key={name} className="well">
            <p className="text-body font-semibold">{name}</p>
            <p className="mt-1 text-caption tabular-nums text-label-secondary">
              <span className="text-success">{t(`成功 ${ok.length}`, `Succeeded ${ok.length}`)}</span>
              {' · '}
              <span className={failed > 0 ? 'text-danger' : undefined}>{t(`失败 ${failed}`, `Failed ${failed}`)}</span>
              {ok.length > 0 && ` · ${t('平均', 'avg')} ${seconds(avg, t)}`}
            </p>
            {reason && <p className="mt-1 text-caption text-danger">{reason}</p>}
          </li>
        );
      })}
    </ul>
  );
};

const ProbeLogList: React.FC<{ entries: ProbeLogEntry[]; live?: boolean; className?: string }> = ({
  entries,
  live = false,
  className = '',
}) => {
  const { t } = useLang();
  const listRef = useRef<HTMLOListElement>(null);

  // 进行中时跟随最新一条
  useEffect(() => {
    if (live && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [live, entries.length]);

  return (
    <ol
      ref={listRef}
      className={`well max-h-72 space-y-2 overflow-y-auto ${className}`}
      aria-label={t('提问日志', 'Probe log')}
      aria-live={live ? 'polite' : undefined}
    >
      {entries.map((entry, index) => (
        <li key={index} className="flex items-start gap-2 text-caption">
          {entry.ok ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label={t('成功', 'Succeeded')} />
          ) : (
            <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label={t('失败', 'Failed')} />
          )}
          <span className="min-w-0">
            <span className="tabular-nums">
              <span className="font-semibold">{entry.engine}</span>
              <span className="text-label-secondary">
                {' · '}
                {t(
                  `第 ${entry.question} 题第 ${entry.sample} 次${entry.branded ? '（带品牌名）' : ''}`,
                  `Question ${entry.question}, try ${entry.sample}${entry.branded ? ' (with brand name)' : ''}`
                )}
                {' · '}
                {seconds(entry.ms, t)}
                {entry.ok && t(` · ${entry.sources} 个来源`, ` · ${entry.sources} sources`)}
              </span>
            </span>
            {!entry.ok && (
              <>
                <span className="block text-danger">{entry.reason || t('调用失败', 'Call failed')}</span>
                {entry.detail && (
                  <span className="block break-all text-label-tertiary" lang="en">
                    {entry.detail}
                  </span>
                )}
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
};

const ProbeLogPanel: React.FC<{ entries: ProbeLogEntry[] }> = ({ entries }) => {
  const { t } = useLang();
  const [onlyFailed, setOnlyFailed] = useState(false);
  const failed = entries.filter((entry) => !entry.ok).length;
  const shown = onlyFailed ? entries.filter((entry) => !entry.ok) : entries;
  return (
    <Panel
      title={t('提问日志', 'Probe log')}
      hint={t(
        `以买家身份向各平台提问的逐条记录，共 ${entries.length} 次，失败 ${failed} 次`,
        `Each question asked to each platform as a buyer: ${entries.length} in total, ${failed} failed`
      )}
      aside={
        failed > 0 ? (
          <button type="button" className="chip" aria-pressed={onlyFailed} onClick={() => setOnlyFailed((v) => !v)}>
            {t('只看失败', 'Failed only')}
          </button>
        ) : undefined
      }
    >
      <ProbeLogSummary entries={entries} />
      <ProbeLogList entries={shown} className="mt-4" />
    </Panel>
  );
};
