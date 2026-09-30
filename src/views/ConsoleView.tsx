import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { AdminPanel } from './console/AdminPanel';
import { InstallPanel } from './console/InstallPanel';
import { LeadsPanel } from './console/LeadsPanel';
import { StatsPanel } from './console/StatsPanel';
import { Site } from './console/types';

type Panel = 'stats' | 'leads' | 'install' | 'admin';

/** 客户后台：只展示 /api/sites 返回（即 site_members 授权）的站点。 */
export const ConsoleView: React.FC<{ onNavigate: (tab: 'login') => void }> = ({ onNavigate }) => {
  const { user, loading, logout } = useAuth();
  const [sites, setSites] = useState<Site[] | null>(null);
  const [siteId, setSiteId] = useState<number | null>(null);
  const [panel, setPanel] = useState<Panel>('stats');
  const [error, setError] = useState('');

  const loadSites = useCallback(() => {
    api<{ sites: Site[] }>('/api/sites')
      .then((r) => {
        setSites(r.sites);
        setSiteId((cur) => (cur && r.sites.some((s) => s.id === cur) ? cur : (r.sites[0]?.id ?? null)));
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || user.mustChangePassword) onNavigate('login');
    else loadSites();
  }, [user, loading, onNavigate, loadSites]);

  if (!user || user.mustChangePassword) return <div className="section" />;

  const site = sites?.find((s) => s.id === siteId) ?? null;
  const isAdmin = user.role === 'admin';
  const options = [
    { id: 'stats' as const, label: '数据概览' },
    { id: 'leads' as const, label: '线索' },
    { id: 'install' as const, label: '接入' },
    ...(isAdmin ? [{ id: 'admin' as const, label: '管理' }] : []),
  ];

  return (
    <div className="section">
      <PageHeader
        eyebrow="客户后台"
        title={site ? site.name : '站点数据'}
        intro={site ? site.domain : '查看网站访问统计与客户留下的线索。'}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          {sites && sites.length > 1 && (
            <select
              aria-label="切换站点"
              className="field w-auto"
              value={siteId ?? ''}
              onChange={(e) => setSiteId(Number(e.target.value))}
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}（{s.domain}）</option>
              ))}
            </select>
          )}
          <span className="text-caption text-label-secondary">{user.displayName || user.email}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => logout().then(() => onNavigate('login'))}>
            退出登录
          </button>
        </div>
      </PageHeader>

      <div className="layout-wide mt-10">
        {error && <p role="alert" className="text-center text-caption text-danger">{error}</p>}
        <div className="mb-8 flex justify-center">
          <SegmentedControl options={options} value={panel} onChange={setPanel} ariaLabel="后台功能" size="lg" />
        </div>

        {panel === 'admin' && isAdmin ? (
          <AdminPanel onChanged={loadSites} />
        ) : sites === null ? (
          !error && <p className="text-center text-body text-label-secondary">加载中…</p>
        ) : !site ? (
          <div className="well text-center">
            <p className="text-body">还没有授权给您的站点。</p>
            <p className="mt-2 text-caption text-label-secondary">请联系云端智荐为您的账号开通站点。</p>
          </div>
        ) : (
          <>
            {panel === 'stats' && <StatsPanel key={site.id} siteId={site.id} />}
            {panel === 'leads' && <LeadsPanel key={site.id} siteId={site.id} />}
            {panel === 'install' && <InstallPanel key={site.id} site={site} />}
          </>
        )}
      </div>
    </div>
  );
};
