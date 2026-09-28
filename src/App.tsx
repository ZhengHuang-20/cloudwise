import React, { useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AiConsultantModal } from './components/AiConsultantModal';
import { BookingModal } from './components/BookingModal';
import { MySpaceModal } from './components/MySpaceModal';
import { SalesConsoleModal } from './components/SalesConsoleModal';
import { SupabaseModal } from './components/SupabaseModal';
import { isTabId, TabId, tabTitle } from './components/navigation';

// Views
import { HomeView } from './views/HomeView';
import { ServicesView } from './views/ServicesView';
import { AcademyView } from './views/AcademyView';
import { ConfiguratorView } from './views/ConfiguratorView';
import { CasesView } from './views/CasesView';
import { DealRoomView } from './views/DealRoomView';
import { ResourcesView } from './views/ResourcesView';

const SITE_TITLE = '云端智荐 - AI出海售前支持系统与能力样板间';

// 当前页面与地址栏 hash 同步（#/services），支持浏览器前进后退与分享链接
const readTabFromHash = (): TabId => {
  const value = window.location.hash.replace(/^#\/?/, '');
  return isTabId(value) ? value : 'home';
};

function MainApp() {
  const { setAiAdvisorOpen, isAiAdvisorOpen, toastMessage } = useApp();

  const [currentTab, setCurrentTab] = useState<TabId>(readTabFromHash);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMySpaceOpen, setIsMySpaceOpen] = useState(false);
  const [isSalesConsoleOpen, setIsSalesConsoleOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
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
    const title = tabTitle(currentTab);
    document.title = title ? `${title} - 云端智荐` : SITE_TITLE;
  }, [currentTab]);

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

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas text-label">
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="btn btn-primary btn-sm sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70]"
      >
        跳到主要内容
      </button>

      <Header
        currentTab={currentTab}
        onNavigate={navigate}
        openBookingModal={openBooking}
        openMySpaceModal={() => setIsMySpaceOpen(true)}
        openSalesConsoleModal={() => setIsSalesConsoleOpen(true)}
        openSupabaseModal={() => setIsSupabaseOpen(true)}
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

      <Footer
        onNavigate={navigate}
        openSalesConsoleModal={() => setIsSalesConsoleOpen(true)}
        openSupabaseModal={() => setIsSupabaseOpen(true)}
      />

      {/* AI 售前顾问入口：全站唯一的浮动按钮 */}
      {!isAiAdvisorOpen && (
        <button
          type="button"
          onClick={() => setAiAdvisorOpen(true)}
          className="material fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full border border-hairline px-5 text-body text-label shadow-[0_8px_32px_rgb(0_0_0/0.5)] transition-colors duration-200 hover:bg-surface-hover"
        >
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
          AI 售前顾问
        </button>
      )}

      {/* 全局弹窗 */}
      <AiConsultantModal />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <MySpaceModal
        isOpen={isMySpaceOpen}
        onClose={() => setIsMySpaceOpen(false)}
        openSupabaseModal={() => {
          setIsMySpaceOpen(false);
          setIsSupabaseOpen(true);
        }}
      />
      <SalesConsoleModal isOpen={isSalesConsoleOpen} onClose={() => setIsSalesConsoleOpen(false)} />
      <SupabaseModal isOpen={isSupabaseOpen} onClose={() => setIsSupabaseOpen(false)} />

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
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
