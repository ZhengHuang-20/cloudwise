import React, { useEffect, useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { NAV_GROUPS, NAV_ITEMS, TabId } from './navigation';
import { LanguageSwitch } from './LanguageSwitch';

interface HeaderProps {
  currentTab: TabId;
  onNavigate: (tab: TabId) => void;
  openBookingModal: () => void;
  openMySpaceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  openBookingModal,
  openMySpaceModal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t, tb } = useLang();

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

  const go = (tab: TabId) => {
    setIsMenuOpen(false);
    onNavigate(tab);
  };

  const runAndClose = (action: () => void) => () => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <>
      <header className="material sticky top-0 z-40 border-b border-hairline">
        <div className="layout-wide flex h-13 items-center gap-6">
          {/* 品牌 */}
          <button
            type="button"
            onClick={() => go('home')}
            className="flex shrink-0 items-center gap-2 text-label"
            aria-label={t('云端智荐首页', 'Cloudwise home')}
          >
            <img src="/brand/logo-mark.png" alt="" className="h-7 w-auto" />
            <span className="text-body font-semibold">{t('云端智荐', 'Cloudwise')}</span>
          </button>

          {/* 桌面导航 */}
          <nav aria-label={t('主导航', 'Main navigation')} className="hidden flex-1 items-stretch justify-center self-stretch lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center px-3 text-caption whitespace-nowrap transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
                    isActive
                      ? 'text-label after:bg-label'
                      : 'text-label-secondary after:bg-transparent hover:text-label'
                  }`}
                >
                  {tb(item.label)}
                </button>
              );
            })}
          </nav>

          {/* 右侧操作 */}
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <LanguageSwitch className="hidden sm:inline-flex" />

            <button
              type="button"
              onClick={() => go(user ? 'console' : 'login')}
              aria-current={currentTab === 'login' || currentTab === 'console' ? 'page' : undefined}
              className="btn btn-neutral btn-sm hidden sm:inline-flex"
            >
              {user ? t('客户后台', 'Client console') : t('登录', 'Sign in')}
            </button>

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
            <button
              type="button"
              onClick={() => go('home')}
              aria-current={currentTab === 'home' ? 'page' : undefined}
              className={`py-2 text-title-2 ${currentTab === 'home' ? 'text-label' : 'text-label-secondary'}`}
            >
              {t('首页', 'Home')}
            </button>

            {NAV_GROUPS.map((group) => (
              <div key={group.title.zh} className="mt-8">
                <p className="text-caption text-label-secondary">{tb(group.title)}</p>
                <ul className="mt-2">
                  {group.items.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => go(item.id)}
                          aria-current={isActive ? 'page' : undefined}
                          className="w-full py-2.5 text-left"
                        >
                          <span className={`block text-title-2 ${isActive ? 'text-label' : 'text-label-secondary'}`}>
                            {tb(item.fullLabel)}
                          </span>
                          <span className="mt-0.5 block text-caption text-label-secondary">{tb(item.desc)}</span>
                        </button>
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
              <button
                type="button"
                onClick={() => go(user ? 'console' : 'login')}
                className="btn btn-neutral btn-lg btn-block"
              >
                {user ? t('客户后台', 'Client console') : t('客户登录', 'Client sign in')}
              </button>
              <LanguageSwitch size="lg" className="btn-block" />
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
