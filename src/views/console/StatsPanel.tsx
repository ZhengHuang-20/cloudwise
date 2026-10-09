import React, { useEffect, useState } from 'react';
import { Alert, App as AntApp, Badge, Button, Card, Empty, Segmented, Spin, Switch, Table, Tooltip } from 'antd';
import { ArrowRight, ChartLine, Info, Table2 } from 'lucide-react';
import { api, formatTime } from '../../lib/api';
import { BreakdownCard, DeltaText, PagesCard } from './Breakdown';
import { useConsole } from './ConsoleContext';
import { CHANNEL_LABEL, countryName, delta, DEVICE_LABEL, formatDuration, formatPercent, languageName } from './labels';
import { PageTitle } from './parts';
import { CONSOLE_COLORS } from './theme';
import { fullLabel, METRIC_LABEL, TrendChart, type DailyPoint, type Metric } from './TrendChart';
import { LEAD_BADGE, LEAD_STATUS, type Lead, type Site } from './types';

interface Kpis {
  pv: number;
  uv: number;
  legacyPv: number;
  sessions: number;
  bounceRate: number | null;
  avgEngagedMs: number | null;
  aiVisitors: number;
  newVisitors: number;
  leads: number;
  newLeads: number;
  conversionRate: number | null;
}

/** 上一周期：以 Vercel 为准但上一周期超出 Vercel 的查询范围时，访客、浏览量、AI 访客与转化率为 null（不做环比） */
type PrevKpis = Omit<Kpis, 'pv' | 'uv' | 'aiVisitors'> & { pv: number | null; uv: number | null; aiVisitors: number | null };

interface Stats {
  days: number;
  /** 访客、浏览量与趋势的来源：vercel = Vercel Web Analytics 为准，script = 采集脚本 */
  source: 'vercel' | 'script';
  /** 站点关联了 Vercel 却读不到时的原因 */
  vercelIssue: string | null;
  /** 请求失败时 Vercel 返回的状态码与说明 */
  vercelDetail: string | null;
  /** Vercel 能查询的天数（Hobby 30） */
  vercelWindowDays: number;
  /** 采集脚本自己统计的访客与浏览量（Vercel 为准时作对照） */
  script: { pv: number; uv: number };
  current: Kpis;
  previous: PrevKpis;
  daily: DailyPoint[];
  prevDaily: DailyPoint[];
}

/** 1 = 近 24 小时（按小时） */
type Days = 1 | 7 | 30 | 90;

/** 迷你趋势线：KPI 卡片里只看走势，具体数值看下方趋势图。没有数据的日子断开。 */
const Sparkline: React.FC<{ values: (number | null | undefined)[] }> = ({ values }) => {
  const W = 88;
  const H = 28;
  const nums = values.filter((v): v is number => typeof v === 'number');
  if (nums.length < 2) return null;
  const max = Math.max(...nums);
  const min = Math.min(0, ...nums);
  const span = max - min || 1;
  const n = values.length;
  let d = '';
  let pen = false;
  values.forEach((v, i) => {
    if (typeof v !== 'number') {
      pen = false;
      return;
    }
    const x = n <= 1 ? W / 2 : (i / (n - 1)) * (W - 2) + 1;
    const y = H - 1 - ((v - min) / span) * (H - 2);
    d += `${pen ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    pen = true;
  });
  return (
    <svg width={W} height={H} aria-hidden="true" className="block shrink-0">
      <path d={d} fill="none" stroke={CONSOLE_COLORS.link} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

/** 在线人数：采集脚本 5 分钟内有浏览的访客（Vercel 的查询接口不提供实时数据），每分钟刷新一次 */
const Online: React.FC<{ siteId: number }> = ({ siteId }) => {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    setN(null);
    const load = () =>
      api<{ online: number }>(`/api/sites/${siteId}/stats/online`)
        .then((r) => alive && setN(r.online))
        .catch(() => alive && setN(null));
    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [siteId]);
  if (n === null) return null;
  return (
    <Tooltip title="5 分钟内有浏览的访客（采集脚本统计），每分钟刷新">
      <span className="inline-flex items-center gap-1.5 text-caption text-label-secondary tabular-nums">
        <span className={`inline-block h-2 w-2 rounded-full ${n > 0 ? 'bg-success' : 'bg-fill'}`} aria-hidden="true" />
        {n} 人在线
      </span>
    </Tooltip>
  );
};

const VERCEL_ISSUE: Record<string, string> = {
  no_token: '服务端没有配置 VERCEL_API_TOKEN',
  request_failed: '请求 Vercel 失败，请检查令牌权限与团队 / 项目 ID',
  unexpected_response: 'Vercel 返回的格式无法识别',
};

const Kpi: React.FC<{
  title: string;
  tip: string;
  value: string;
  d: ReturnType<typeof delta>;
  goodWhen?: 'up' | 'down';
  spark?: (number | null | undefined)[];
  extra?: React.ReactNode;
}> = ({ title, tip, value, d, goodWhen, spark, extra }) => (
  <Card variant="borderless" className="h-full" styles={{ body: { padding: 18 } }}>
    <div className="flex items-center gap-1.5 text-label-secondary">
      <span>{title}</span>
      <Tooltip title={tip}>
        <button type="button" className="text-label-tertiary" aria-label={`${title}：${tip}`}>
          <Info size={14} />
        </button>
      </Tooltip>
    </div>
    <div className="mt-2 flex items-end justify-between gap-2">
      <p className="truncate text-[1.625rem] font-semibold leading-tight tabular-nums">{value}</p>
      {spark && (
        // 窄屏两列时让位给数值
        <div className="hidden sm:block">
          <Sparkline values={spark} />
        </div>
      )}
    </div>
    <p className="mt-2 text-caption">
      <DeltaText d={d} goodWhen={goodWhen} suffix="较上期" />
    </p>
    {extra && <p className="mt-1 text-caption">{extra}</p>}
  </Card>
);

const RecentLeads: React.FC<{ site: Site }> = ({ site }) => {
  const { go } = useConsole();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  useEffect(() => {
    api<{ leads: Lead[] }>(`/api/sites/${site.id}/leads?page=1`)
      .then((r) => setLeads(r.leads.slice(0, 5)))
      .catch(() => setLeads([]));
  }, [site.id]);

  return (
    <Card
      variant="borderless"
      title="最新线索"
      className="h-full"
      extra={
        <Button type="link" size="small" onClick={() => go('leads')} icon={<ArrowRight size={14} />} iconPlacement="end">
          全部线索
        </Button>
      }
    >
      {!leads ? (
        <div className="flex justify-center py-8"><Spin /></div>
      ) : leads.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无线索" />
      ) : (
        <ul className="-my-2 divide-y divide-separator">
          {leads.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate">
                  {l.name || '未留姓名'}
                  {l.company && <span className="text-label-secondary"> · {l.company}</span>}
                </p>
                <p className="truncate text-caption text-label-tertiary tabular-nums">
                  {formatTime(l.createdAt)}
                  {l.channel && ` · ${l.source || CHANNEL_LABEL[l.channel] || l.channel}`}
                  {l.country && ` · ${countryName(l.country)}`}
                </p>
              </div>
              <Badge status={LEAD_BADGE[l.status]} text={LEAD_STATUS[l.status]} className="shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

/** AI 来源：GEO 效果的直接证据。没有数据时引导去做 AI 可见性测评。 */
const AiCard: React.FC<{ site: Site; days: Days; stats: Stats; comparable: boolean }> = ({ site, days, stats, comparable }) => {
  const { current, previous } = stats;
  return (
    <BreakdownCard
      title="AI 来源"
      siteId={site.id}
      days={days}
      quality
      tabs={[{ dim: 'ai', label: 'AI 助手', empty: '暂无来自 AI 助手的访问' }]}
      header={
        <div className="mb-5 flex items-end justify-between gap-3 rounded-[10px] bg-surface-raised px-4 py-3">
          <div>
            <p className="text-caption text-label-secondary">AI 助手带来的访客</p>
            <p className="text-[1.375rem] font-semibold tabular-nums">{current.aiVisitors.toLocaleString()}</p>
          </div>
          <div className="text-right text-caption">
            <p className="text-label-secondary tabular-nums">占访客 {formatPercent(current.uv ? current.aiVisitors / current.uv : null)}</p>
            {comparable && <DeltaText d={delta(current.aiVisitors, previous.aiVisitors)} suffix="较上期" />}
          </div>
        </div>
      }
      emptyExtra={
        <p className="text-center text-caption text-label-secondary">
          ChatGPT、Perplexity、Gemini 等推荐您的网站时，访问会出现在这里。
          <a className="link ml-1" href="/audit" target="_blank" rel="noreferrer">
            做一次 AI 可见性测评
          </a>
        </p>
      }
    />
  );
};

export const StatsPanel: React.FC<{ site: Site }> = ({ site }) => {
  const { go } = useConsole();
  const { message } = AntApp.useApp();
  const [days, setDays] = useState<Days>(7);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reloading, setReloading] = useState(false);
  const [metric, setMetric] = useState<Metric>('uv');
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [compare, setCompare] = useState(true);

  useEffect(() => {
    setReloading(true);
    api<Stats>(`/api/sites/${site.id}/stats?days=${days}`)
      .then(setStats)
      .catch((e) => message.error(e.message))
      .finally(() => setReloading(false));
  }, [site.id, days, message]);

  const cur = stats?.current;
  const prev = stats?.previous;
  // 上一周期含统计升级前的访问时，会话类指标（跳出率、时长、AI 来源）的上期数据不完整，不做比较
  const prevHasSessions = !!prev && prev.sessions > 0 && prev.legacyPv === 0;
  const fromVercel = stats?.source === 'vercel';
  const scriptNote = (n: number) => <span className="text-label-tertiary tabular-nums">采集脚本统计 {n.toLocaleString()}</span>;

  return (
    <>
      <PageTitle
        title="数据概览"
        description={
          fromVercel
            ? `${site.name} · ${site.domain} · 访客、浏览量与来源 / 地区 / 页面 / 设备以 Vercel Web Analytics 为准，线索、跳出与参与时长来自采集脚本 · 与上一周期对比`
            : `${site.name} · ${site.domain} · 按北京时间统计，与上一周期对比`
        }
        extra={
          <>
            <Online siteId={site.id} />
            <label className="flex items-center gap-2 text-caption text-label-secondary">
              <Switch size="small" checked={compare} onChange={setCompare} />
              趋势叠加上一周期
            </label>
            <Segmented
              aria-label="统计范围"
              value={days}
              onChange={(v) => setDays(v as Days)}
              options={[
                { value: 1, label: '近 24 小时' },
                { value: 7, label: '近 7 天' },
                { value: 30, label: '近 30 天' },
                { value: 90, label: '近 90 天' },
              ]}
            />
          </>
        }
      />

      {!stats || !cur || !prev ? (
        <div className="flex justify-center py-24"><Spin /></div>
      ) : (
        <div className="space-y-4 transition-opacity duration-200" style={{ opacity: reloading ? 0.55 : 1 }}>
          {stats.vercelIssue === 'out_of_window' ? (
            <div>
              <Alert
                type="info"
                showIcon
                closable
                title={`Vercel 只能查询最近 ${stats.vercelWindowDays} 天的数据，近 ${stats.days} 天的访客、浏览量与来源等显示采集脚本的统计。`}
              />
            </div>
          ) : (
            stats.vercelIssue && (
              <div>
                <Alert
                  type="warning"
                  showIcon
                  title={`站点已关联 Vercel 项目，但暂时读不到 Vercel 的数据（${VERCEL_ISSUE[stats.vercelIssue] ?? stats.vercelIssue}${stats.vercelDetail ? `：${stats.vercelDetail}` : ''}），当前显示采集脚本的统计。`}
                />
              </div>
            )
          )}
          {cur.legacyPv > 0 && (
            <div>
              <Alert
                type="info"
                showIcon
                closable
                title={
                  fromVercel
                    ? `所选时间内有 ${cur.legacyPv.toLocaleString()} 次浏览发生在采集脚本升级之前：跳出率、参与时长、入口 / 退出页与浏览器语言从升级后开始统计（访客、浏览量与来源等来自 Vercel，不受影响）。`
                    : `所选时间内有 ${cur.legacyPv.toLocaleString()} 次浏览发生在统计升级之前：这部分只计入访客与浏览量，来源渠道、国家地区、跳出率与参与时长从升级后开始统计。`
                }
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
            <Kpi
              title="访客"
              tip={fromVercel ? 'Vercel Web Analytics 统计的访客数（按天匿名去重）' : '按浏览器去重的访客数'}
              value={cur.uv.toLocaleString()}
              d={delta(cur.uv, prev.uv)}
              spark={stats.daily.map((x) => x.uv)}
              extra={fromVercel ? scriptNote(stats.script.uv) : undefined}
            />
            <Kpi
              title="浏览量"
              tip={fromVercel ? 'Vercel Web Analytics 统计的页面浏览次数' : '页面被打开的次数'}
              value={cur.pv.toLocaleString()}
              d={delta(cur.pv, prev.pv)}
              spark={stats.daily.map((x) => x.pv)}
              extra={fromVercel ? scriptNote(stats.script.pv) : undefined}
            />
            <Kpi
              title="跳出率"
              tip="只看了 1 个页面、停留不到 10 秒且没有留资的访问占比，越低越好"
              value={formatPercent(cur.bounceRate)}
              d={prevHasSessions ? delta(cur.bounceRate, prev.bounceRate, true) : null}
              goodWhen="down"
              spark={stats.daily.map((x) => x.bounceRate)}
            />
            <Kpi
              title="平均参与时长"
              tip="每次访问中页面停留在前台的平均时长（切到其他标签页不计）"
              value={formatDuration(cur.avgEngagedMs)}
              d={prevHasSessions ? delta(cur.avgEngagedMs, prev.avgEngagedMs) : null}
              spark={stats.daily.map((x) => x.avgEngagedMs)}
            />
            <Kpi
              title="线索"
              tip="访客在网站上留下联系方式的次数"
              value={cur.leads.toLocaleString()}
              d={delta(cur.leads, prev.leads)}
              spark={stats.daily.map((x) => x.leads)}
              extra={
                cur.newLeads > 0 ? (
                  <button type="button" className="link" onClick={() => go('leads')}>
                    {cur.newLeads} 条待跟进
                  </button>
                ) : (
                  <span className="text-label-tertiary">没有待跟进的线索</span>
                )
              }
            />
            <Kpi
              title="留资转化率"
              tip={fromVercel ? '留下线索的访客 ÷ 访客（访客取 Vercel 的数据）' : '留下线索的访客 ÷ 访客'}
              value={formatPercent(cur.conversionRate)}
              d={delta(cur.conversionRate, prev.conversionRate, true)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card
              variant="borderless"
              className="xl:col-span-2"
              title={`${days === 1 ? '每小时' : '每日'}${METRIC_LABEL[metric]}`}
              extra={
                <div className="flex items-center gap-2">
                  <Segmented
                    size="small"
                    aria-label="指标"
                    value={metric}
                    onChange={(v) => setMetric(v as Metric)}
                    options={(['uv', 'pv', 'leads'] as Metric[]).map((m) => ({ value: m, label: METRIC_LABEL[m] }))}
                  />
                  <Segmented
                    size="small"
                    aria-label="展示方式"
                    value={view}
                    onChange={(v) => setView(v as 'chart' | 'table')}
                    options={[
                      { value: 'chart', icon: <ChartLine size={14} />, title: '图表' },
                      { value: 'table', icon: <Table2 size={14} />, title: '表格' },
                    ]}
                  />
                </div>
              }
            >
              {view === 'chart' ? (
                cur.pv === 0 && cur.leads === 0 && prev.pv === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无访问数据。把采集脚本放进网站后，数据会在这里出现。"
                    style={{ paddingBlock: 40 }}
                  >
                    <Button onClick={() => go('install')}>查看接入代码</Button>
                  </Empty>
                ) : (
                  <>
                    <TrendChart data={stats.daily} metric={metric} prev={compare ? stats.prevDaily : undefined} />
                    {fromVercel && metric !== 'leads' && (
                      <p className="mt-2 text-caption text-label-tertiary">
                        {days === 1 ? '来自 Vercel Web Analytics' : '来自 Vercel Web Analytics，按 UTC 日期分天'}
                      </p>
                    )}
                  </>
                )
              ) : (
                <Table
                  size="small"
                  rowKey="date"
                  dataSource={[...stats.daily].reverse()}
                  pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
                  scroll={{ x: 520 }}
                  columns={[
                    { title: days === 1 ? '时间' : '日期', dataIndex: 'date', className: 'tabular-nums', render: (v: string) => fullLabel(v) },
                    { title: '访客', dataIndex: 'uv', align: 'right', className: 'tabular-nums' },
                    { title: '浏览量', dataIndex: 'pv', align: 'right', className: 'tabular-nums' },
                    { title: '跳出率', dataIndex: 'bounceRate', align: 'right', className: 'tabular-nums', render: (v) => formatPercent(v, 0) },
                    { title: '参与时长', dataIndex: 'avgEngagedMs', align: 'right', className: 'tabular-nums', render: (v) => formatDuration(v) },
                    { title: '线索', dataIndex: 'leads', align: 'right', className: 'tabular-nums' },
                  ]}
                />
              )}
            </Card>
            <RecentLeads site={site} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <BreakdownCard
              title="来源渠道"
              siteId={site.id}
              days={days}
              quality
              tabs={[
                { dim: 'channel', label: '渠道', name: (v) => CHANNEL_LABEL[v] ?? v },
                { dim: 'source', label: '来源', empty: '暂无站外来源（直接访问不计入）' },
                { dim: 'utm_campaign', label: '活动', empty: '暂无带 utm_campaign 参数的访问' },
              ]}
            />
            <AiCard site={site} days={days} stats={stats} comparable={fromVercel || prevHasSessions} />
            <BreakdownCard
              title="国家 / 地区"
              siteId={site.id}
              days={days}
              quality
              tabs={[
                { dim: 'country', label: '国家', name: countryName },
                { dim: 'lang', label: '浏览器语言', name: languageName },
              ]}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <PagesCard siteId={site.id} days={days} withRoutes={fromVercel} />
            </div>
            <BreakdownCard
              title="访客环境"
              siteId={site.id}
              days={days}
              tabs={[
                { dim: 'device', label: '设备', name: (v) => DEVICE_LABEL[v] ?? v },
                { dim: 'browser', label: '浏览器' },
                { dim: 'os', label: '系统' },
              ]}
            />
          </div>
        </div>
      )}
    </>
  );
};
