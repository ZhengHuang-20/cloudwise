import React, { useEffect, useState } from 'react';
import { Menu, Sparkles, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NAV_GROUPS, NAV_ITEMS, TabId } from './navigation';

interface HeaderProps {
  currentTab: TabId;
  onNavigate: (tab: TabId) => void;
  openBookingModal: () => void;
  openMySpaceModal: () => void;
  openSalesConsoleModal: () => void;
  openSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  openBookingModal,
  openMySpaceModal,
  openSalesConsoleModal,
  openSupabaseModal,
}) => {
  const { leadScore, currentStage, supabaseStatus } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            aria-label="云端智荐首页"
          >
            <Sparkles className="h-[18px] w-[18px]" />
            <span className="text-body font-semibold">云端智荐</span>
          </button>

          {/* 桌面导航 */}
          <nav aria-label="主导航" className="hidden flex-1 items-stretch justify-center self-stretch lg:flex">
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
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* 右侧操作 */}
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <button
              type="button"
              onClick={openSalesConsoleModal}
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-caption text-label-secondary transition-colors hover:text-label xl:inline-flex"
              title="打开售前 CRM 工作台"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              <span>{currentStage}</span>
              <span className="tabular-nums text-label">{leadScore}</span>
            </button>

            <button type="button" onClick={openBookingModal} className="btn btn-primary btn-sm">
              预约诊断
            </button>

            <button
              type="button"
              onClick={openMySpaceModal}
              className="btn-icon"
              aria-label="我的空间"
              title="我的空间"
            >
              <User />
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="btn-icon bg-transparent lg:hidden"
              aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
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
          <nav aria-label="主导航" className="layout-wide pb-12 pt-6">
            <button
              type="button"
              onClick={() => go('home')}
              aria-current={currentTab === 'home' ? 'page' : undefined}
              className={`py-2 text-title-2 ${currentTab === 'home' ? 'text-label' : 'text-label-secondary'}`}
            >
              首页
            </button>

            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="mt-8">
                <p className="text-caption text-label-secondary">{group.title}</p>
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
                            {item.fullLabel}
                          </span>
                          <span className="mt-0.5 block text-caption text-label-secondary">{item.desc}</span>
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
                预约专家诊断
              </button>
              <button
                type="button"
                onClick={runAndClose(openMySpaceModal)}
                className="btn btn-neutral btn-lg btn-block"
              >
                我的空间
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-caption text-label-secondary">
              <button
                type="button"
                onClick={runAndClose(openSalesConsoleModal)}
                className="inline-flex items-center gap-2 hover:text-label"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                CRM 评级：{currentStage} · <span className="tabular-nums">{leadScore}</span> 分
              </button>
              <button
                type="button"
                onClick={runAndClose(openSupabaseModal)}
                className="inline-flex items-center gap-2 hover:text-label"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${supabaseStatus.isConfigured ? 'bg-success' : 'bg-warning'}`}
                  aria-hidden="true"
                />
                数据同步：{supabaseStatus.isConfigured ? '已连接 Supabase' : '仅本地保存'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
