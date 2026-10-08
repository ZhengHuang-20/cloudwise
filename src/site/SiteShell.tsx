'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppProvider, useApp } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { Lang, LanguageProvider, useLang } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AiConsultantModal } from '../components/AiConsultantModal';
import { BookingModal } from '../components/BookingModal';
import { MySpaceModal } from '../components/MySpaceModal';
import { localizePath, splitLocale } from './locale';
import { SiteActions, SiteContext } from './SiteContext';

/**
 * 官网的外壳：Provider、页眉页脚、AI 顾问入口与全局弹窗。放在根布局里，站内跳转时保持状态不重置。
 * 登录与后台（/login、/console/*）是独立的全屏布局，不显示页眉页脚。
 */

// 旧版 hash 地址（#/services、#/console/leads）跳到对应的新路径，已分享出去的链接不失效
const legacyHashPath = (hash: string): string | null => {
  const match = hash.match(/^#\/([a-z-]+(?:\/[a-z0-9-]+)?)/);
  if (!match) return null;
  const path = `/${match[1]}`;
  return path === '/resources' ? '/glossary' : path;
};

function Chrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const { lang, t } = useLang();
  const { setAiAdvisorOpen, isAiAdvisorOpen, toastMessage } = useApp();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMySpaceOpen, setIsMySpaceOpen] = useState(false);
  const [configuratorPrefill, setConfiguratorPrefill] = useState<Record<string, unknown> | null>(null);

  const section = splitLocale(pathname).path.split('/')[1] || 'home';
  const isConsole = section === 'login' || section === 'console';

  useEffect(() => {
    const legacy = legacyHashPath(window.location.hash);
    if (legacy) router.replace(localizePath(legacy, lang));
  }, [router, lang]);

  const navigate = useCallback((path: string) => router.push(localizePath(path, lang)), [router, lang]);

  const actions = useMemo<SiteActions>(() => {
    const openBooking = () => setIsBookingOpen(true);
    const goToAudit = () => navigate('/audit');
    return {
      navigate,
      openBooking,
      openMySpace: () => setIsMySpaceOpen(true),
      goToAudit,
      goToConfigurator: (prefill) => {
        setConfiguratorPrefill(prefill ?? null);
        navigate('/configurator');
      },
      configuratorPrefill,
      goToCourseTarget: (targetId) => {
        if (targetId === 'configurator') navigate('/configurator');
        else if (targetId === 'booking') openBooking();
        else goToAudit();
      },
    };
  }, [navigate, configuratorPrefill]);

  if (isConsole) {
    return (
      <SiteContext.Provider value={actions}>
        {children}
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      </SiteContext.Provider>
    );
  }

  return (
    <SiteContext.Provider value={actions}>
      <div className="relative flex min-h-screen flex-col bg-canvas text-label">
        <a
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('main')?.focus();
          }}
          className="btn btn-primary btn-sm sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70]"
        >
          {t('跳到主要内容', 'Skip to main content')}
        </a>

        <Header currentTab={section === 'solutions' ? 'cases' : section} openBookingModal={actions.openBooking} openMySpaceModal={actions.openMySpace} />

        <main id="main" tabIndex={-1} className="relative flex-1 outline-none">
          {children}
        </main>

        <Footer />

        {/* AI 售前顾问入口：全站唯一的浮动按钮 */}
        {!isAiAdvisorOpen && (
          <button
            type="button"
            onClick={() => setAiAdvisorOpen(true)}
            className="material fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full border border-hairline px-5 text-body text-label shadow-[0_8px_32px_rgb(0_0_0/0.5)] transition-colors duration-200 hover:bg-surface-hover"
          >
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
            {t('AI 售前顾问', 'AI pre-sales advisor')}
          </button>
        )}

        {/* 全局弹窗 */}
        <AiConsultantModal />
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        <MySpaceModal isOpen={isMySpaceOpen} onClose={() => setIsMySpaceOpen(false)} />

        {/* Toast：顶部居中的状态提示 */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="material fixed inset-x-0 top-16 z-[60] mx-auto w-fit max-w-[calc(100vw-2rem)] rounded-[1.375rem] border border-hairline px-5 py-2.5 text-center text-caption text-label shadow-[0_8px_32px_rgb(0_0_0/0.5)] animate-toast-in"
          >
            {toastMessage}
          </div>
        )}
      </div>
    </SiteContext.Provider>
  );
}

export function SiteShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <LanguageProvider lang={lang}>
      <AppProvider>
        <AuthProvider>
          <Chrome>{children}</Chrome>
        </AuthProvider>
      </AppProvider>
    </LanguageProvider>
  );
}
