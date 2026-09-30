import React, { useEffect, useState } from 'react';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { api } from '../../lib/api';

interface Stats {
  pv: number;
  uv: number;
  leads: number;
  newLeads: number;
  daily: { date: string; pv: number; uv: number; leads: number }[];
  topPages: { name: string; count: number }[];
  topReferrers: { name: string; count: number }[];
  devices: { name: string; count: number }[];
}

const DEVICE: Record<string, string> = { desktop: '电脑', mobile: '手机', tablet: '平板' };

const StatTile: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="tile">
    <p className="text-caption text-label-secondary">{label}</p>
    <p className="mt-2 text-title-1 tabular-nums">{value}</p>
    {hint && <p className="mt-1 text-caption text-label-secondary">{hint}</p>}
  </div>
);

const RankList: React.FC<{ title: string; items: { name: string; count: number }[]; map?: Record<string, string>; empty: string }> = ({
  title,
  items,
  map,
  empty,
}) => {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="tile">
      <h3 className="text-title-3">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-caption text-label-secondary">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={i.name}>
              <div className="flex justify-between gap-4 text-caption">
                <span className="truncate">{map?.[i.name] ?? i.name}</span>
                <span className="tabular-nums text-label-secondary">{i.count}</span>
              </div>
              <div className="meter mt-1.5"><span style={{ width: `${(i.count / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const StatsPanel: React.FC<{ siteId: number }> = ({ siteId }) => {
  const [days, setDays] = useState<'7' | '30' | '90'>('7');
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setStats(null);
    setError('');
    api<Stats>(`/api/sites/${siteId}/stats?days=${days}`).then(setStats).catch((e) => setError(e.message));
  }, [siteId, days]);

  if (error) return <p role="alert" className="text-center text-caption text-danger">{error}</p>;

  const maxUv = Math.max(1, ...(stats?.daily.map((d) => d.uv) ?? [1]));
  const rate = stats && stats.uv > 0 ? `${((stats.leads / stats.uv) * 100).toFixed(1)}%` : '—';

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <SegmentedControl
          options={[{ id: '7', label: '近 7 天' }, { id: '30', label: '近 30 天' }, { id: '90', label: '近 90 天' }]}
          value={days}
          onChange={setDays}
          ariaLabel="统计范围"
        />
      </div>
      {!stats ? (
        <p className="text-center text-body text-label-secondary">加载中…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="页面浏览量" value={stats.pv.toLocaleString()} />
            <StatTile label="访客数" value={stats.uv.toLocaleString()} hint="按浏览器去重" />
            <StatTile label="线索数" value={stats.leads.toLocaleString()} hint={`其中待跟进 ${stats.newLeads}`} />
            <StatTile label="留资转化率" value={rate} hint="线索 ÷ 访客" />
          </div>

          <div className="tile">
            <h3 className="text-title-3">每日访客</h3>
            <div
              className="mt-6 flex h-40 items-end gap-px sm:gap-1"
              role="img"
              aria-label={`近 ${days} 天每日访客数，最高 ${maxUv}`}
            >
              {stats.daily.map((d) => (
                <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${d.date}：访客 ${d.uv}，浏览 ${d.pv}，线索 ${d.leads}`}>
                  <div className="w-full rounded-t-sm bg-accent" style={{ height: `${Math.max(d.uv > 0 ? 3 : 0, (d.uv / maxUv) * 100)}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-caption tabular-nums text-label-secondary">
              <span>{stats.daily[0]?.date.slice(5)}</span>
              <span>{stats.daily[stats.daily.length - 1]?.date.slice(5)}</span>
            </div>
          </div>

          {stats.pv === 0 && (
            <p className="text-center text-caption text-label-secondary">
              暂无访问数据。请到「接入」页把采集脚本放进网站后再来查看。
            </p>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <RankList title="热门页面" items={stats.topPages} empty="暂无数据" />
            <RankList title="来源网站" items={stats.topReferrers} empty="暂无外部来源（直接访问不计入）" />
            <RankList title="设备" items={stats.devices} map={DEVICE} empty="暂无数据" />
          </div>
        </>
      )}
    </div>
  );
};
