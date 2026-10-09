import React, { useEffect, useState } from 'react';
import { Card, Empty, Segmented, Spin, Table, type TableColumnsType } from 'antd';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { api } from '../../lib/api';
import { delta, formatDuration, formatPercent, prettyPath, type Delta } from './labels';

export interface BreakdownRow {
  name: string;
  visitors: number;
  /** 上一周期的访客数；上一周期数据不完整（含统计升级前的访问）时为 null */
  prevVisitors: number | null;
  /** 会话维度 */
  sessions?: number;
  bounceRate?: number | null;
  leads?: number;
  /** dim=page */
  pageviews?: number;
  avgEngagedMs: number | null;
}

export interface Breakdown {
  dim: string;
  /** vercel = Vercel Web Analytics 的分组（只有访客、浏览量与环比），script = 采集脚本 */
  source: 'vercel' | 'script';
  total: number;
  rows: BreakdownRow[];
}

/** 读取一个维度的拆分数据；站点、时间范围或维度变化时重新请求，切换期间保留上一次的结果。 */
export function useBreakdown(siteId: number, days: number, dim: string, limit = 10) {
  const [data, setData] = useState<Breakdown | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api<Breakdown>(`/api/sites/${siteId}/stats/breakdown?days=${days}&dim=${dim}&limit=${limit}`)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [siteId, days, dim, limit]);
  return { data: data?.dim === dim ? data : null, error, loading };
}

/** 环比文字：箭头 + 数字，颜色只是辅助（goodWhen 决定涨是好事还是坏事） */
export const DeltaText: React.FC<{ d: Delta | null; goodWhen?: 'up' | 'down'; suffix?: string }> = ({ d, goodWhen = 'up', suffix = '' }) => {
  if (!d) return <span className="text-label-tertiary">暂无可比数据</span>;
  const tone = d.trend === 'flat' ? 'text-label-secondary' : (d.trend === 'up') === (goodWhen === 'up') ? 'text-success' : 'text-danger';
  const Icon = d.trend === 'up' ? ArrowUpRight : d.trend === 'down' ? ArrowDownRight : null;
  return (
    <span className={`inline-flex items-center gap-0.5 tabular-nums ${tone}`}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {d.text}
      {suffix && d.text !== '新增' && <span className="ml-1 text-label-tertiary">{suffix}</span>}
    </span>
  );
};

export interface Tab {
  dim: string;
  label: string;
  /** 维度值 → 展示名 */
  name?: (v: string) => string;
  empty?: string;
}

/** 数据来自 Vercel 时在卡片底部注明（跳出率、留资等只有采集脚本有，此时不显示） */
const SourceNote: React.FC<{ data: Breakdown | null }> = ({ data }) =>
  data?.source === 'vercel' && data.rows.length ? (
    <p className="mt-4 text-caption text-label-tertiary">来自 Vercel Web Analytics</p>
  ) : null;

const CardBody: React.FC<{ loading: boolean; error: string; ready: boolean; empty: boolean; emptyText: string; children: React.ReactNode }> = ({
  loading,
  error,
  ready,
  empty,
  emptyText,
  children,
}) => {
  if (error) return <p className="py-8 text-center text-caption text-danger">{error}</p>;
  if (!ready) return <div className="flex justify-center py-10">{loading && <Spin />}</div>;
  if (empty) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} style={{ paddingBlock: 24 }} />;
  return <div className="transition-opacity duration-200" style={{ opacity: loading ? 0.55 : 1 }}>{children}</div>;
};

/** 排行列表：名称、访客数与占比、比例条；quality 时再显示环比、跳出率与留资。 */
export const RankList: React.FC<{ data: Breakdown; name?: (v: string) => string; quality?: boolean }> = ({ data, name, quality }) => {
  const max = Math.max(1, ...data.rows.map((r) => r.visitors));
  return (
    <ul className="space-y-4">
      {data.rows.map((r) => {
        const label = name ? name(r.name) : r.name || '未知';
        return (
          <li key={r.name}>
            <div className="flex justify-between gap-4">
              <span className="truncate" title={label}>{label}</span>
              <span className="shrink-0 tabular-nums">
                {r.visitors.toLocaleString()}
                <span className="ml-2 inline-block w-12 text-right text-label-tertiary">
                  {((r.visitors / (data.total || 1)) * 100).toFixed(0)}%
                </span>
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-fill">
              <div className="h-full rounded-full bg-link" style={{ width: `${(r.visitors / max) * 100}%` }} />
            </div>
            <p className="mt-1.5 flex flex-wrap gap-x-3 text-caption text-label-tertiary">
              {r.prevVisitors !== null && <DeltaText d={delta(r.visitors, r.prevVisitors)} />}
              {quality && r.bounceRate !== undefined && <span className="tabular-nums">跳出率 {formatPercent(r.bounceRate, 0)}</span>}
              {quality && !!r.leads && <span className="tabular-nums text-label-secondary">留资 {r.leads}</span>}
            </p>
          </li>
        );
      })}
    </ul>
  );
};

/** 带维度切换的排行卡片（来源、地区、设备等）。 */
export const BreakdownCard: React.FC<{
  title: string;
  siteId: number;
  days: number;
  tabs: Tab[];
  quality?: boolean;
  /** 卡片顶部的补充内容（如 AI 来源的汇总） */
  header?: React.ReactNode;
  emptyExtra?: React.ReactNode;
  limit?: number;
}> = ({ title, siteId, days, tabs, quality, header, emptyExtra, limit = 6 }) => {
  const [dim, setDim] = useState(tabs[0].dim);
  const tab = tabs.find((t) => t.dim === dim) ?? tabs[0];
  const { data, error, loading } = useBreakdown(siteId, days, tab.dim, limit);
  return (
    <Card
      variant="borderless"
      title={title}
      className="h-full"
      extra={
        tabs.length > 1 && (
          <Segmented size="small" aria-label={`${title}维度`} value={dim} onChange={(v) => setDim(v as string)} options={tabs.map((t) => ({ value: t.dim, label: t.label }))} />
        )
      }
    >
      {header}
      <CardBody loading={loading} error={error} ready={!!data} empty={!data?.rows.length} emptyText={tab.empty ?? '暂无数据'}>
        {data && <RankList data={data} name={tab.name} quality={quality} />}
      </CardBody>
      <SourceNote data={data} />
      {!loading && data && !data.rows.length && emptyExtra}
    </Card>
  );
};

const PAGE_TABS = [
  { dim: 'page', label: '热门页面' },
  // 路由（如 /blog/[slug]）只有 Vercel 有
  { dim: 'route', label: '路由', vercel: true },
  { dim: 'entry', label: '入口页' },
  { dim: 'exit', label: '退出页' },
];

/** 页面表：热门页面看浏览量与参与时长，路由把动态页面合成一行（Vercel），入口页看跳出率与留资，退出页看访客从哪里离开。 */
export const PagesCard: React.FC<{ siteId: number; days: number; withRoutes: boolean }> = ({ siteId, days, withRoutes }) => {
  const tabs = PAGE_TABS.filter((t) => !t.vercel || withRoutes);
  const [picked, setDim] = useState('page');
  const dim = tabs.some((t) => t.dim === picked) ? picked : 'page';
  const { data, error, loading } = useBreakdown(siteId, days, dim, 10);
  const num = (v?: number) => <span className="tabular-nums">{(v ?? 0).toLocaleString()}</span>;
  const columns: TableColumnsType<BreakdownRow> = [
    {
      title: dim === 'route' ? '路由' : '页面',
      dataIndex: 'name',
      ellipsis: true,
      render: (v: string) => <span title={prettyPath(v)}>{prettyPath(v)}</span>,
    },
    {
      title: '访客',
      dataIndex: 'visitors',
      align: 'right',
      width: 120,
      render: (_, r) => (
        <div>
          {num(r.visitors)}
          {r.prevVisitors !== null && (
            <p className="text-caption">
              <DeltaText d={delta(r.visitors, r.prevVisitors)} />
            </p>
          )}
        </div>
      ),
    },
    ...(dim === 'page' || dim === 'route'
      ? ([
          { title: '浏览量', dataIndex: 'pageviews', align: 'right', width: 96, render: (v: number) => num(v) },
          // 参与时长来自采集脚本，按路径统计，路由没有
          ...(dim === 'page'
            ? [{ title: '平均参与时长', dataIndex: 'avgEngagedMs', align: 'right', width: 132, render: (v: number | null) => <span className="tabular-nums">{formatDuration(v)}</span> }]
            : []),
        ] as TableColumnsType<BreakdownRow>)
      : ([
          { title: dim === 'entry' ? '进入次数' : '离开次数', dataIndex: 'sessions', align: 'right', width: 104, render: (v: number) => num(v) },
          { title: '跳出率', dataIndex: 'bounceRate', align: 'right', width: 88, render: (v: number | null) => <span className="tabular-nums">{formatPercent(v, 0)}</span> },
          { title: '留资', dataIndex: 'leads', align: 'right', width: 72, render: (v: number) => num(v) },
        ] as TableColumnsType<BreakdownRow>)),
  ];
  return (
    <Card
      variant="borderless"
      title="页面"
      className="h-full"
      styles={{ body: { paddingTop: 4 } }}
      extra={<Segmented size="small" aria-label="页面维度" value={dim} onChange={(v) => setDim(v as string)} options={tabs.map((t) => ({ value: t.dim, label: t.label }))} />}
    >
      <CardBody loading={loading} error={error} ready={!!data} empty={!data?.rows.length} emptyText={dim === 'page' ? '暂无数据' : dim === 'route' ? '暂时读不到 Vercel 的路由数据' : '入口页与退出页从统计升级后开始记录'}>
        <Table<BreakdownRow> size="small" rowKey="name" columns={columns} dataSource={data?.rows ?? []} pagination={false} tableLayout="fixed" scroll={{ x: 560 }} />
      </CardBody>
      {data?.source === 'vercel' && !!data.rows.length && (
        <p className="mt-4 text-caption text-label-tertiary">
          {dim === 'page' ? '访客与浏览量来自 Vercel Web Analytics，平均参与时长来自采集脚本' : '来自 Vercel Web Analytics'}
        </p>
      )}
    </Card>
  );
};
