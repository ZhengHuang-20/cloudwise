import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, ConfigProvider, Empty, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ADMIN_SECTIONS, ConsoleContext, isSection, type ConsoleState, type Section } from './ConsoleContext';
import { ConsoleLayout } from './ConsoleLayout';
import { LoginPage } from './LoginPage';
import { InstallPanel } from './InstallPanel';
import { LeadsPanel } from './LeadsPanel';
import { StatsPanel } from './StatsPanel';
import { OrgsPanel } from './admin/OrgsPanel';
import { SitesPanel } from './admin/SitesPanel';
import { UsersPanel } from './admin/UsersPanel';
import { consoleTheme } from './theme';
import type { Site } from './types';

const SITE_KEY = 'cw_console_site';

/** 后台页面跳转的目标：官网首页、登录页、后台 */
type ConsoleTarget = 'home' | 'login' | 'console';

// 地址为 /console/<section>
const readSection = (): Section => {
  const sub = window.location.pathname.split('/')[2] ?? '';
  return isSection(sub) ? sub : 'overview';
};

const readStoredSite = (): number | null => {
  try {
    return Number(localStorage.getItem(SITE_KEY)) || null;
  } catch {
    return null;
  }
};

const FullscreenSpin: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-canvas">
    <Spin size="large" />
  </div>
);

const ConsoleShell: React.FC<{ onNavigate: (tab: ConsoleTarget) => void }> = ({ onNavigate }) => {
  const { user, loading } = useAuth();
  const { message } = AntApp.useApp();
  const [sites, setSites] = useState<Site[] | null>(null);
  const [siteId, setSiteId] = useState<number | null>(readStoredSite);
  const [section, setSection] = useState<Section>(readSection);

  useEffect(() => {
    const onPop = () => setSection(readSection());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback((next: Section) => {
    const url = `/console/${next}`;
    if (window.location.pathname !== url) window.history.pushState(null, '', url);
    setSection(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const selectSite = useCallback((id: number) => {
    setSiteId(id);
    try {
      localStorage.setItem(SITE_KEY, String(id));
    } catch {
      /* 存储不可用时只在本次会话记住 */
    }
  }, []);

  const reloadSites = useCallback(async () => {
    try {
      const r = await api<{ sites: Site[] }>('/api/sites');
      setSites(r.sites);
      setSiteId((cur) => (cur && r.sites.some((s) => s.id === cur) ? cur : (r.sites[0]?.id ?? null)));
    } catch (e: any) {
      message.error(e.message);
      setSites([]);
    }
  }, [message]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.mustChangePassword) onNavigate('login');
    else reloadSites();
  }, [user, loading, onNavigate, reloadSites]);

  const isAdmin = user?.role === 'admin';
  // 客户访问管理页的地址时回到概览
  const current: Section = !isAdmin && ADMIN_SECTIONS.includes(section) ? 'overview' : section;
  const site = sites?.find((s) => s.id === siteId) ?? null;

  const ctx = useMemo<ConsoleState | null>(
    () =>
      user ? { user, isAdmin, sites, site, selectSite, reloadSites, section: current, go } : null,
    [user, isAdmin, sites, site, selectSite, reloadSites, current, go],
  );

  if (loading || !ctx || user?.mustChangePassword) return <FullscreenSpin />;

  let page: React.ReactNode;
  if (current === 'orgs') page = <OrgsPanel />;
  else if (current === 'users') page = <UsersPanel />;
  else if (current === 'sites') page = <SitesPanel />;
  else if (sites === null) page = <div className="flex justify-center py-24"><Spin /></div>;
  else if (!site)
    page = (
      <div className="rounded-[14px] bg-surface py-20">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            isAdmin ? '还没有接入任何站点。' : '还没有授权给您的站点，请联系云端智荐为您的账号开通。'
          }
        >
          {isAdmin && (
            <Button type="primary" onClick={() => go('sites')}>
              去接入站点
            </Button>
          )}
        </Empty>
      </div>
    );
  else if (current === 'leads') page = <LeadsPanel key={site.id} site={site} />;
  else if (current === 'install') page = <InstallPanel key={site.id} site={site} />;
  else page = <StatsPanel key={site.id} site={site} />;

  return (
    <ConsoleContext.Provider value={ctx}>
      <ConsoleLayout onGoHome={() => onNavigate('home')} onLoggedOut={() => onNavigate('login')}>
        {page}
      </ConsoleLayout>
    </ConsoleContext.Provider>
  );
};

export interface ConsoleAppProps {
  tab: 'login' | 'console';
  onNavigate: (tab: ConsoleTarget) => void;
  onGoToBooking: () => void;
}

/**
 * 后台入口（/login、/console/*）：由 RouteView 懒加载且只在浏览器端渲染，antd 只打进这个分块，官网页面不受影响。
 */
export default function ConsoleApp({ tab, onNavigate, onGoToBooking }: ConsoleAppProps) {
  const toConsole = useCallback(() => onNavigate('console'), [onNavigate]);
  return (
    <ConfigProvider theme={consoleTheme} locale={zhCN} button={{ autoInsertSpace: false }}>
      <AntApp component={false}>
        {tab === 'login' ? (
          <LoginPage onLoggedIn={toConsole} onGoHome={() => onNavigate('home')} onGoToBooking={onGoToBooking} />
        ) : (
          <ConsoleShell onNavigate={onNavigate} />
        )}
      </AntApp>
    </ConfigProvider>
  );
}
