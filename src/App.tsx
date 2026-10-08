import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLang } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AiConsultantModal } from './components/AiConsultantModal';
import { BookingModal } from './components/BookingModal';
import { MySpaceModal } from './components/MySpaceModal';
import { isTabId, TabId, tabTitle } from './components/navigation';

// Views
import { HomeView } from './views/HomeView';
import { ServicesView } from './views/ServicesView';
import { AcademyView } from './views/AcademyView';
import { ConfiguratorView } from './views/ConfiguratorView';
import { CasesView } from './views/CasesView';
import { DealRoomView } from './views/DealRoomView';
import { ResourcesView } from './views/ResourcesView';

// 后台（登录与客户后台）使用 antd，单独分块按需加载，官网页面不下载
const ConsoleApp = lazy(() => import('./views/console/ConsoleApp'));

const SITE_TITLE = '云端智荐 - AI出海售前支持系统与能力样板间';
const SITE_TITLE_EN = 'Cloudwise - AI pre-sales support for going global';

// 当前页面与地址栏 hash 同步（#/services），支持浏览器前进后退与分享链接；
// 后台的子页面形如 #/console/leads，这里只取第一段
const readTabFromHash = (): TabId => {
  const value = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return isTabId(value) ? value : 'home';
};

function MainApp() {
  const { setAiAdvisorOpen, isAiAdvisorOpen, toastMessage } = useApp();
  const { lang, t } = useLang();

  const [currentTab, setCurrentTab] = useState<TabId>(readTabFromHash);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMySpaceOpen, setIsMySpaceOpen] = useState(false);
  const [configuratorPrefill, setConfiguratorPrefill] = useState<any>(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(readTabFromHash());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const title = tabTitle(currentTab, lang);
    if (lang === 'en') document.title = title ? `${title} - Cloudwise` : SITE_TITLE_EN;
    else document.title = title ? `${title} - 云端智荐` : SITE_TITLE;
  }, [currentTab, lang]);

  const navigate = useCallback((tab: TabId) => {
    const hash = tab === 'home' ? '' : `#/${tab}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash || window.location.pathname + window.location.search);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateToConfigurator = (prefill?: any) => {
    if (prefill) {
      setConfiguratorPrefill(prefill);
    }
    navigate('configurator');
  };

  const openBooking = () => setIsBookingOpen(true);

  // 站内唯一的自测工具是首页的 AI 可见性测评（#audit）
  const goToAudit = () => {
    navigate('home');
    requestAnimationFrame(() => document.getElementById('audit')?.scrollIntoView({ block: 'start' }));
  };

  // 课程「下一步」与配套工具按目标分流
  const handleCourseTarget = (targetId: string) => {
    if (targetId === 'configurator') navigate('configurator');
    else if (targetId === 'booking') openBooking();
    else if (targetId.startsWith('resources')) navigate('resources');
    else goToAudit();
  };

  // 后台是独立的全屏布局，不显示官网的页眉、页脚与 AI 顾问入口
  if (currentTab === 'login' || currentTab === 'console') {
    return (
      <>
        <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
          <ConsoleApp tab={currentTab} onNavigate={navigate} onGoToBooking={openBooking} />
        </Suspense>
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas text-label">
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="btn btn-primary btn-sm sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70]"
      >
        {t('跳到主要内容', 'Skip to main content')}
      </button>

      <Header
        currentTab={currentTab}
        onNavigate={navigate}
        openBookingModal={openBooking}
        openMySpaceModal={() => setIsMySpaceOpen(true)}
      />

      <main id="main" tabIndex={-1} className="relative flex-1 outline-none">
        {currentTab === 'home' && <HomeView onNavigate={navigate} openBookingModal={openBooking} />}

        {currentTab === 'services' && (
          <ServicesView
            onGoToCourse={() => navigate('academy')}
            onGoToAudit={goToAudit}
            onGoToConfigurator={(combo) => handleNavigateToConfigurator({ packageType: combo })}
          />
        )}

        {currentTab === 'academy' && (
          <AcademyView onGoToTool={handleCourseTarget} onGoToBooking={openBooking} />
        )}

        {currentTab === 'configurator' && (
          <ConfiguratorView
            onGoToDealRoom={() => navigate('deal-room')}
            onGoToBooking={openBooking}
            initialParams={configuratorPrefill}
          />
        )}

        {currentTab === 'cases' && (
          <CasesView onGoToAudit={goToAudit} onGoToCourse={() => navigate('academy')} />
        )}

        {currentTab === 'deal-room' && <DealRoomView onGoToBooking={openBooking} />}

        {currentTab === 'resources' && <ResourcesView onGoToLesson={() => navigate('academy')} />}
      </main>

      <Footer onNavigate={navigate} />

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
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </AppProvider>
    </LanguageProvider>
  );
}
