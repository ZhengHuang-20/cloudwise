import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Menu, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { FOOTER_EXTRA, NAV_GROUPS, NAV_MORE, NAV_PRIMARY, NAV_SERVICES, type NavItem } from './navigation';
import { LanguageSwitch } from './LanguageSwitch';

interface HeaderProps {
  /** 当前页面所属的导航项（地址的第一段，首页为 home） */
  currentTab: string;
  openBookingModal: () => void;
  openMySpaceModal: () => void;
}

/** 点击导航后让链接失焦，否则 focus-within 会让展开的面板一直开着 */
const blurTarget = (e: React.MouseEvent<HTMLElement>) => e.currentTarget.blur();

const TopLink: React.FC<{ item: NavItem; active: boolean; href: string; label: string; onNavigate: (e: React.MouseEvent<HTMLElement>) => void }> = ({
  active,
  href,
  label,
  onNavigate,
}) => (
  <Link
    href={href}
    onClick={onNavigate}
    aria-current={active ? 'page' : undefined}
    className={`relative flex items-center px-3 text-caption whitespace-nowrap transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
      active ? 'text-link after:bg-accent' : 'text-label-secondary after:bg-transparent hover:text-label'
    }`}
  >
    {label}
  </Link>
);

export const Header: React.FC<HeaderProps> = ({ currentTab, openBookingModal, openMySpaceModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t, tb, path } = useLang();
  // 服务入口共用同一个 tab（services），要按完整地址判断哪一项是当前页
  const pathname = (usePathname() ?? '/').replace(/^\/en(?=\/|$)/, '') || '/';
  const isHere = (item: NavItem) =>
    item.id === 'services' ? pathname === item.href || pathname.startsWith(`${item.href}/`) : currentTab === item.id;
  const moreActive = NAV_MORE.some(isHere) || currentTab === 'about';

  useEffect(() => {
    if (!isMenuOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  // 后台只有中文，不加语言前缀
  const accountHref = user ? '/console' : '/login';

  const runAndClose = (action: () => void) => () => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <>
      <header className="material sticky top-0 z-40 border-b border-hairline">
        <div className="layout-wide flex h-13 items-center gap-6">
          {/* 品牌 */}
          <Link
            href={path('/')}
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-2 text-label"
            aria-label={t('云端智荐首页', 'ChinGEO home')}
          >
            <img src="/brand/logo-mark.png" alt="" width={32} height={28} className="h-7 w-auto" />
            <span className="text-body font-semibold">{t('云端智荐', 'ChinGEO')}</span>
          </Link>

          {/* 桌面导航：三项核心服务直接列出，悬停或聚焦时展开简介；学习与规划类入口收进「更多」 */}
          <nav aria-label={t('主导航', 'Main navigation')} className="hidden flex-1 items-stretch justify-center self-stretch lg:flex">
            <div className="group flex items-stretch">
              {NAV_SERVICES.map((item) => (
                <TopLink key={item.href} item={item} active={isHere(item)} href={path(item.href)} label={tb(item.label)} onNavigate={blurTarget} />
              ))}
              <div className="invisible absolute inset-x-0 top-full border-b border-hairline bg-surface opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="layout-wide py-6">
                  <ul className="grid gap-4 xl:grid-cols-3 lg:grid-cols-3">
                    {NAV_SERVICES.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={path(item.href)}
                          onClick={blurTarget}
                          className="block h-full rounded-card p-4 transition-colors hover:bg-canvas"
                        >
                          <span className="block text-title-3">{tb(item.fullLabel)}</span>
                          <span className="mt-2 block text-caption text-label-secondary">{tb(item.intro)}</span>
                          <ul className="mt-3 space-y-1.5">
                            {item.points.map((point) => (
                              <li key={point.zh} className="flex gap-2 text-caption text-label-secondary">
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                                {tb(point)}
                              </li>
                            ))}
                          </ul>
                          <span className="link mt-3 text-caption">
                            {t('了解详情', 'Learn more')}
                            <ChevronRight />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 px-4 text-caption">
                    <Link href={path('/services')} onClick={blurTarget} className="link">
                      {t('查看全部服务与案例数据', 'All services and case data')}
                      <ChevronRight />
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {NAV_PRIMARY.map((item) => (
              <TopLink key={item.href} item={item} active={isHere(item)} href={path(item.href)} label={tb(item.label)} onNavigate={blurTarget} />
            ))}

            <div className="group relative flex items-stretch">
              <button
                type="button"
                aria-haspopup="true"
                className={`flex items-center gap-1 px-3 text-caption whitespace-nowrap transition-colors duration-200 ${
                  moreActive ? 'text-link' : 'text-label-secondary hover:text-label'
                }`}
              >
                {t('更多', 'More')}
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <ul className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-card border border-hairline bg-surface p-2 opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {[...NAV_MORE, ...FOOTER_EXTRA.map((x) => ({ id: 'about', href: x.href, label: x.label, fullLabel: x.label, desc: { zh: '公司主体与团队', en: 'Company and team' } }))].map((item) => (
                  <li key={item.href}>
                    <Link href={path(item.href)} onClick={blurTarget} className="block rounded-control px-3 py-2 hover:bg-canvas">
                      <span className="block text-body">{tb(item.fullLabel)}</span>
                      <span className="block text-caption text-label-secondary">{tb(item.desc)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* 右侧操作 */}
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <LanguageSwitch variant="text" className="hidden sm:inline-flex" />

            <Link href={accountHref} rel="nofollow" className="nav-text-link hidden sm:inline-flex">
              {user ? t('客户后台', 'Client console') : t('登录', 'Sign in')}
            </Link>

            <button type="button" onClick={openBookingModal} className="btn btn-primary btn-sm">
              {t('预约诊断', 'Book a call')}
            </button>

            <button
              type="button"
              onClick={openMySpaceModal}
              className="btn-icon"
              aria-label={t('我的空间', 'My space')}
              title={t('我的空间', 'My space')}
            >
              <User />
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="btn-icon bg-transparent lg:hidden"
              aria-label={isMenuOpen ? t('关闭菜单', 'Close menu') : t('打开菜单', 'Open menu')}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* 移动端全屏菜单：必须放在 header 之外——header 的 backdrop-filter 会成为 fixed 子元素的定位容器 */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-13 z-[45] overflow-y-auto bg-canvas animate-fade-in lg:hidden"
        >
          <nav aria-label={t('主导航', 'Main navigation')} className="layout-wide pb-12 pt-6">
            <Link
              href={path('/')}
              onClick={closeMenu}
              aria-current={currentTab === 'home' ? 'page' : undefined}
              className={`block py-2 text-title-2 ${currentTab === 'home' ? 'text-label' : 'text-label-secondary'}`}
            >
              {t('首页', 'Home')}
            </Link>

            {NAV_GROUPS.map((group) => (
              <div key={group.title.zh} className="mt-8">
                <p className="text-caption text-label-secondary">{tb(group.title)}</p>
                <ul className="mt-2">
                  {group.items.map((item) => {
                    const isActive = isHere(item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={path(item.href)}
                          onClick={closeMenu}
                          aria-current={isActive ? 'page' : undefined}
                          className="block w-full py-2.5 text-left"
                        >
                          <span className={`block text-title-2 ${isActive ? 'text-label' : 'text-label-secondary'}`}>
                            {tb(item.fullLabel)}
                          </span>
                          <span className="mt-0.5 block text-caption text-label-secondary">{tb(item.desc)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-10 space-y-3 border-t border-separator pt-8">
              <button
                type="button"
                onClick={runAndClose(openBookingModal)}
                className="btn btn-primary btn-lg btn-block"
              >
                {t('预约专家诊断', 'Book an expert diagnosis')}
              </button>
              <button
                type="button"
                onClick={runAndClose(openMySpaceModal)}
                className="btn btn-neutral btn-lg btn-block"
              >
                {t('我的空间', 'My space')}
              </button>
              <Link href={accountHref} rel="nofollow" onClick={closeMenu} className="btn btn-neutral btn-lg btn-block">
                {user ? t('客户后台', 'Client console') : t('客户登录', 'Client sign in')}
              </Link>
              <LanguageSwitch size="lg" className="btn-block" />
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
