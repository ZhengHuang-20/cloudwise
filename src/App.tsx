import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AiConsultantModal } from './components/AiConsultantModal';
import { BookingModal } from './components/BookingModal';
import { MySpaceModal } from './components/MySpaceModal';
import { SalesConsoleModal } from './components/SalesConsoleModal';
import { SupabaseModal } from './components/SupabaseModal';

// Views
import { HomeView } from './views/HomeView';
import { ServicesView } from './views/ServicesView';
import { AcademyView } from './views/AcademyView';
import { DiagnosisCenter } from './views/DiagnosisCenter';
import { ConfiguratorView } from './views/ConfiguratorView';
import { SandboxView } from './views/SandboxView';
import { CasesView } from './views/CasesView';
import { DealRoomView } from './views/DealRoomView';
import { ResourcesView } from './views/ResourcesView';

import { Bot, Sparkles, Sliders } from 'lucide-react';

function MainApp() {
  const { setAiAdvisorOpen, isAiAdvisorOpen, setIsInspectorMode, isInspectorMode, toastMessage } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMySpaceOpen, setIsMySpaceOpen] = useState(false);
  const [isSalesConsoleOpen, setIsSalesConsoleOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [configuratorPrefill, setConfiguratorPrefill] = useState<any>(null);

  const handleNavigateToConfigurator = (prefill?: any) => {
    if (prefill) {
      setConfiguratorPrefill(prefill);
    }
    setCurrentTab('configurator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white relative">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openBookingModal={() => setIsBookingOpen(true)}
        openMySpaceModal={() => setIsMySpaceOpen(true)}
        openSalesConsoleModal={() => setIsSalesConsoleOpen(true)}
        openSupabaseModal={() => setIsSupabaseOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            openBookingModal={() => setIsBookingOpen(true)}
          />
        )}

        {currentTab === 'services' && (
          <ServicesView
            onGoToCourse={(code) => {
              setCurrentTab('academy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToDiagnosis={(toolId) => {
              setCurrentTab('diagnosis');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToConfigurator={(combo) => handleNavigateToConfigurator({ packageType: combo })}
          />
        )}

        {currentTab === 'academy' && (
          <AcademyView
            onGoToTool={(toolId) => {
              setCurrentTab('diagnosis');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentTab === 'diagnosis' && (
          <DiagnosisCenter
            onGoToConfigurator={handleNavigateToConfigurator}
            onGoToBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentTab === 'configurator' && (
          <ConfiguratorView
            onGoToDealRoom={() => {
              setCurrentTab('deal-room');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToBooking={() => setIsBookingOpen(true)}
            initialParams={configuratorPrefill}
          />
        )}

        {currentTab === 'sandbox' && (
          <SandboxView onGoToConfigurator={() => handleNavigateToConfigurator({ packageType: 'package-single' })} />
        )}

        {currentTab === 'cases' && (
          <CasesView
            onGoToDiagnosis={() => {
              setCurrentTab('diagnosis');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToCourse={(code) => {
              setCurrentTab('academy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'deal-room' && (
          <DealRoomView onGoToBooking={() => setIsBookingOpen(true)} />
        )}

        {currentTab === 'resources' && (
          <ResourcesView
            onGoToLesson={(lessonId) => {
              setCurrentTab('academy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Apple-style Refined Minimalist Footer */}
      <footer className="bg-black border-t border-white/[0.08] text-[#86868b] py-12 px-4 sm:px-6 lg:px-8 text-xs relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-white tracking-tight">云端智荐</span>
            <span>·</span>
            <span>AI 出海售前支持系统与能力样板间</span>
            <span>·</span>
            <span className="text-[#6e6e73] font-mono">Build 2026.09 Pro</span>
          </div>

          <div className="flex items-center gap-6 text-[#86868b]">
            <button
              onClick={() => setIsSalesConsoleOpen(true)}
              className="hover:text-white transition-colors"
            >
              售前 CRM 工作台
            </button>
            <button
              onClick={() => setIsSupabaseOpen(true)}
              className="hover:text-white transition-colors"
            >
              Supabase 数据库设置
            </button>
            <span className="text-[#6e6e73]">苏ICP备20260928号-1</span>
          </div>
        </div>
      </footer>

      {/* Floating Apple Island Action Button */}
      {!isAiAdvisorOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => {
              setIsInspectorMode(true);
              setAiAdvisorOpen(true);
            }}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#2997ff] rounded-full text-xs font-medium backdrop-blur-xl shadow-lg transition-all"
            title="开启 AI 知识库与 CRM 探针透视"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>CRM 探针透视</span>
          </button>

          <button
            onClick={() => setAiAdvisorOpen(true)}
            className="apple-glass hover:bg-white/[0.12] border border-white/15 px-4 py-2.5 text-white rounded-full font-medium text-xs sm:text-sm shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <div className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
            <Bot className="w-4 h-4 text-[#2997ff]" />
            <span className="tracking-tight">AI 售前顾问</span>
          </button>
        </div>
      )}

      {/* Global Modals */}
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

      {/* Apple Dynamic Island Style Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-black/85 border border-white/15 text-white text-xs font-medium rounded-full shadow-2xl backdrop-blur-2xl flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />
          <span className="tracking-tight">{toastMessage}</span>
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
