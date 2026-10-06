import React, { useEffect, useState } from 'react';
import { App as AntApp, Badge, Button, Card, Empty, Segmented, Spin, Statistic, Table } from 'antd';
import { ArrowRight, ChartLine, Table2 } from 'lucide-react';
import { api, formatTime } from '../../lib/api';
import { useConsole } from './ConsoleContext';
import { PageTitle } from './parts';
import { METRIC_LABEL, TrendChart, type DailyPoint, type Metric } from './TrendChart';
import { LEAD_BADGE, LEAD_STATUS, type Lead, type Site } from './types';

interface Stats {
  pv: number;
  uv: number;
  leads: number;
  newLeads: number;
  daily: DailyPoint[];
  topPages: { name: string; count: number }[];
  topReferrers: { name: string; count: number }[];
  devices: { name: string; count: number }[];
}

const DEVICE: Record<string, string> = { desktop: '电脑', mobile: '手机', tablet: '平板' };

const Kpi: React.FC<{ title: string; value: number | string; hint: React.ReactNode }> = ({ title, value, hint }) => (
  <Card variant="borderless">
    <Statistic title={title} value={value} styles={{ content: { fontVariantNumeric: 'tabular-nums', fontWeight: 600 } }} />
    <p className="mt-2 text-caption text-label-secondary">{hint}</p>
  </Card>
);

const RankCard: React.FC<{ title: string; items: { name: string; count: number }[]; map?: Record<string, string>; empty: string }> = ({
  title,
  items,
  map,
  empty,
}) => {
  const max = Math.max(1, ...items.map((i) => i.count));
  const total = items.reduce((a, b) => a + b.count, 0);
  return (
    <Card variant="borderless" title={title} className="h-full">
      {items.length === 0 ? (
        <p className="py-6 text-center text-caption text-label-secondary">{empty}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.name}>
              <div className="flex justify-between gap-4">
                <span className="truncate" title={i.name}>{map?.[i.name] ?? i.name}</span>
                <span className="shrink-0 tabular-nums text-label-secondary">
                  {i.count.toLocaleString()}
                  <span className="ml-2 inline-block w-12 text-right text-label-tertiary">{((i.count / (total || 1)) * 100).toFixed(0)}%</span>
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-fill">
                <div className="h-full rounded-full bg-link" style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

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
                <p className="truncate text-caption text-label-tertiary tabular-nums">{formatTime(l.createdAt)}</p>
              </div>
              <Badge status={LEAD_BADGE[l.status]} text={LEAD_STATUS[l.status]} className="shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export const StatsPanel: React.FC<{ site: Site }> = ({ site }) => {
  const { go } = useConsole();
  const { message } = AntApp.useApp();
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reloading, setReloading] = useState(false);
  const [metric, setMetric] = useState<Metric>('uv');
  const [view, setView] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    setReloading(true);
    api<Stats>(`/api/sites/${site.id}/stats?days=${days}`)
      .then(setStats)
      .catch((e) => message.error(e.message))
      .finally(() => setReloading(false));
  }, [site.id, days, message]);

  const rate = stats && stats.uv > 0 ? `${((stats.leads / stats.uv) * 100).toFixed(1)}%` : '—';

  return (
    <>
      <PageTitle
        title="数据概览"
        description={`${site.name} · ${site.domain} · 按北京时间统计`}
        extra={
          <Segmented
            aria-label="统计范围"
            value={days}
            onChange={(v) => setDays(v as 7 | 30 | 90)}
            options={[
              { value: 7, label: '近 7 天' },
              { value: 30, label: '近 30 天' },
              { value: 90, label: '近 90 天' },
            ]}
          />
        }
      />

      {!stats ? (
        <div className="flex justify-center py-24"><Spin /></div>
      ) : (
        <div className="space-y-4 transition-opacity duration-200" style={{ opacity: reloading ? 0.55 : 1 }}>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <Kpi title="页面浏览量" value={stats.pv} hint="每次打开页面计一次" />
            <Kpi title="访客数" value={stats.uv} hint="按浏览器去重" />
            <Kpi
              title="线索数"
              value={stats.leads}
              hint={
                stats.newLeads > 0 ? (
                  <button type="button" className="link" onClick={() => go('leads')}>
                    {stats.newLeads} 条待跟进
                  </button>
                ) : (
                  '没有待跟进的线索'
                )
              }
            />
            <Kpi title="留资转化率" value={rate} hint="线索数 ÷ 访客数" />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card
              variant="borderless"
              className="xl:col-span-2"
              title={`每日${METRIC_LABEL[metric]}`}
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
                stats.pv === 0 && stats.leads === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无访问数据。把采集脚本放进网站后，数据会在这里出现。"
                    style={{ paddingBlock: 40 }}
                  >
                    <Button onClick={() => go('install')}>查看接入代码</Button>
                  </Empty>
                ) : (
                  <TrendChart data={stats.daily} metric={metric} />
                )
              ) : (
                <Table
                  size="small"
                  rowKey="date"
                  dataSource={[...stats.daily].reverse()}
                  pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
                  columns={[
                    { title: '日期', dataIndex: 'date' },
                    { title: '访客', dataIndex: 'uv', align: 'right', className: 'tabular-nums' },
                    { title: '浏览量', dataIndex: 'pv', align: 'right', className: 'tabular-nums' },
                    { title: '线索', dataIndex: 'leads', align: 'right', className: 'tabular-nums' },
                  ]}
                />
              )}
            </Card>
            <RecentLeads site={site} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <RankCard title="热门页面" items={stats.topPages} empty="暂无数据" />
            <RankCard title="来源网站" items={stats.topReferrers} empty="暂无外部来源（直接访问不计入）" />
            <RankCard title="设备" items={stats.devices} map={DEVICE} empty="暂无数据" />
          </div>
        </div>
      )}
    </>
  );
};
