import React, { useState } from 'react';
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Select, type MenuProps } from 'antd';
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  Code,
  Globe,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ADMIN_SECTIONS, isSection, SECTION_TITLE, SITE_SECTIONS, useConsole } from './ConsoleContext';
import { CONSOLE_COLORS } from './theme';

const ICON = 16;

const Nav: React.FC<{ onPick: () => void; onGoHome: () => void }> = ({ onPick, onGoHome }) => {
  const { isAdmin, section, go } = useConsole();
  const items: MenuProps['items'] = [
    {
      type: 'group',
      label: '站点数据',
      children: [
        { key: 'overview', icon: <LayoutDashboard size={ICON} />, label: SECTION_TITLE.overview },
        { key: 'leads', icon: <Inbox size={ICON} />, label: SECTION_TITLE.leads },
        { key: 'install', icon: <Code size={ICON} />, label: SECTION_TITLE.install },
      ],
    },
    ...(isAdmin
      ? [
          {
            type: 'group' as const,
            label: '系统管理',
            children: [
              { key: 'orgs', icon: <Building2 size={ICON} />, label: SECTION_TITLE.orgs },
              { key: 'users', icon: <Users size={ICON} />, label: SECTION_TITLE.users },
              { key: 'sites', icon: <Globe size={ICON} />, label: SECTION_TITLE.sites },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-6">
        <img src="/brand/logo-mark.png" alt="" className="h-7 w-auto" />
        <span className="text-body font-semibold">云端智荐</span>
        <span className="rounded-full bg-fill px-2 py-0.5 text-caption leading-tight text-label-secondary">
          {isAdmin ? '管理' : '后台'}
        </span>
      </div>
      <nav aria-label="后台功能" className="min-h-0 flex-1 overflow-y-auto pt-2">
        <Menu
          mode="inline"
          selectedKeys={[section]}
          items={items}
          onClick={({ key }) => {
            if (isSection(key)) go(key);
            onPick();
          }}
        />
      </nav>
      <div className="shrink-0 border-t border-separator p-3">
        <Button type="text" block icon={<ArrowLeft size={ICON} />} onClick={onGoHome} className="justify-start!">
          返回官网
        </Button>
      </div>
    </div>
  );
};

/** 后台外壳：左侧导航（小屏为抽屉），顶栏放站点切换与账号菜单。 */
export const ConsoleLayout: React.FC<{ onGoHome: () => void; onLoggedOut: () => void; children: React.ReactNode }> = ({
  onGoHome,
  onLoggedOut,
  children,
}) => {
  const { user, isAdmin, sites, site, selectSite, section } = useConsole();
  const { logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const name = user.displayName || user.email;
  const showSitePicker = SITE_SECTIONS.includes(section) && !!sites && sites.length > 0;

  const userMenu: MenuProps['items'] = [
    {
      key: 'me',
      disabled: true,
      label: (
        <div className="py-1">
          <p className="text-label">{name}</p>
          <p className="text-caption text-label-secondary">
            {user.email} · {isAdmin ? '管理员' : '客户'}
          </p>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'password', icon: <KeyRound size={ICON} />, label: '修改密码' },
    { key: 'logout', icon: <LogOut size={ICON} />, label: '退出登录', danger: true },
  ];

  return (
    <Layout hasSider className="min-h-screen">
      <aside
        className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-separator lg:block"
        style={{ background: CONSOLE_COLORS.sider }}
      >
        <Nav onPick={() => {}} onGoHome={onGoHome} />
      </aside>

      <Drawer
        placement="left"
        open={navOpen}
        onClose={() => setNavOpen(false)}
        size={264}
        closable={false}
        styles={{ body: { padding: 0, background: CONSOLE_COLORS.sider } }}
      >
        <Nav onPick={() => setNavOpen(false)} onGoHome={onGoHome} />
      </Drawer>

      <Layout>
        <Layout.Header className="sticky top-0 z-20 flex items-center gap-3 border-b border-separator backdrop-blur-xl">
          <span className="lg:hidden">
            <Button type="text" aria-label="打开导航" icon={<MenuIcon size={20} />} onClick={() => setNavOpen(true)} />
          </span>
          <div className="min-w-0 flex-1">
            {showSitePicker ? (
              <Select
                aria-label="切换站点"
                style={{ width: '100%', maxWidth: 352 }}
                value={site?.id}
                onChange={selectSite}
                prefix={<Globe size={ICON} className="text-label-secondary" />}
                showSearch={{ optionFilterProp: ['label', 'domain'] }}
                popupMatchSelectWidth={false}
                options={sites!.map((s) => ({ value: s.id, label: s.name, domain: s.domain }))}
                optionRender={(o) => (
                  <div className="py-0.5">
                    <div>{o.data.label}</div>
                    <div className="text-caption text-label-secondary">{o.data.domain}</div>
                  </div>
                )}
              />
            ) : (
              <span className="text-label-secondary">
                {ADMIN_SECTIONS.includes(section) ? '系统管理' : '站点数据'}
                <span className="mx-2 text-label-tertiary">/</span>
                <span className="text-label">{SECTION_TITLE[section]}</span>
              </span>
            )}
          </div>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: userMenu,
              onClick: ({ key }) => {
                if (key === 'password') setPwOpen(true);
                if (key === 'logout') logout().finally(onLoggedOut);
              },
            }}
          >
            <button
              type="button"
              aria-label="账号菜单"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-fill"
            >
              <Avatar size={32} style={{ background: CONSOLE_COLORS.accent, fontWeight: 600 }}>
                {name.slice(0, 1).toUpperCase()}
              </Avatar>
              <span className="hidden max-w-40 truncate sm:inline">{name}</span>
              <ChevronDown size={ICON} className="text-label-secondary" />
            </button>
          </Dropdown>
        </Layout.Header>

        <Layout.Content className="px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </Layout.Content>
      </Layout>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </Layout>
  );
};
