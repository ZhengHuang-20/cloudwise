import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  GraduationCap,
  Activity,
  Calculator,
  Laptop2,
  FolderGit2,
  FileText,
  BookOpen,
  Calendar,
  User,
  Shield,
  Database,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openBookingModal: () => void;
  openMySpaceModal: () => void;
  openSalesConsoleModal: () => void;
  openSupabaseModal: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  isHighlighted?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openBookingModal,
  openMySpaceModal,
  openSalesConsoleModal,
  openSupabaseModal,
}) => {
  const { user, leadScore, currentStage, supabaseStatus } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary navigation items (shown on standard desktop screens)
  const primaryNavItems: NavItem[] = [
    { id: 'home', label: '概览', icon: Compass, desc: '出海战略全景与逻辑公理' },
    { id: 'academy', label: '学懂·破幻', icon: GraduationCap, desc: '五门公开课与认知重构' },
    { id: 'diagnosis', label: '自测·体检', icon: Activity, desc: '12项客观断点因果雷达', isHighlighted: true },
    { id: 'services', label: '看方案·架构', icon: Shield, desc: '五大确定性子系统拓扑' },
    { id: 'sandbox', label: '体验中心', icon: Laptop2, desc: '海外买家互动实景沙盒' },
  ];

  // Secondary items (grouped under "更多" on standard laptops, expanded on 2xl)
  const secondaryNavItems: NavItem[] = [
    { id: 'cases', label: '看实证·案例', icon: FolderGit2, desc: '行业龙头实操案卷拆解' },
    { id: 'deal-room', label: '决策·情报空间', icon: FileText, desc: '高净值商业情报与协同工作台' },
    { id: 'configurator', label: '预算测算', icon: Calculator, desc: '系统组合与成本测算' },
    { id: 'resources', label: '知识资产', icon: BookOpen, desc: '合规白皮书与技术卷宗' },
  ];

  // All navigation items combined for mobile and wide screens
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === currentTab);

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
    setIsMoreDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 apple-header-glass text-[#f5f5f7] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand / Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            onClick={() => handleSelectTab('home')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/20 to-white/5 border border-white/20 p-0.5 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-[#2997ff]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
                云端智荐
              </span>
              <span className="text-[10px] text-[#86868b] border border-white/10 px-1.5 py-0.5 rounded-full font-mono shrink-0">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {/* Ultra-wide screens (>= 1400px): All 9 items displayed */}
          <nav className="hidden 2xl:flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full p-1.5 shadow-inner shrink-0">
            {allNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-3.5 py-1.5 text-[13px] sm:text-sm whitespace-nowrap shrink-0 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm font-semibold backdrop-blur-md border border-white/15'
                      : 'text-[#d2d2d7] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.isHighlighted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Standard Desktop screens (lg to 2xl: 1024px - 1399px): Primary 5 + "更多 ▾" dropdown */}
          <nav className="hidden lg:flex 2xl:hidden items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full p-1.5 shadow-inner shrink-0">
            {primaryNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-3.5 py-1.5 text-[13px] sm:text-sm whitespace-nowrap shrink-0 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm font-semibold backdrop-blur-md border border-white/15'
                      : 'text-[#d2d2d7] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.isHighlighted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* "更多" Dropdown Button */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className={`px-3.5 py-1.5 text-[13px] sm:text-sm whitespace-nowrap shrink-0 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  isSecondaryActive
                    ? 'bg-white/15 text-white shadow-sm font-semibold border border-white/15'
                    : 'text-[#d2d2d7] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>更多</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMoreDropdownOpen ? 'rotate-180 text-white' : 'text-[#a1a1a6]'
                  }`}
                />
              </button>

              {/* Apple Frosted Glass Floating Popover */}
              {isMoreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl apple-card-glass border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-2xl bg-black/95 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-[#86868b] uppercase border-b border-white/[0.06] mb-1">
                    出海协同与知识库
                  </div>
                  <div className="space-y-1">
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center gap-3 ${
                            isActive
                              ? 'bg-white/15 text-white border border-white/10'
                              : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive
                                ? 'bg-[#2997ff]/20 text-[#2997ff]'
                                : 'bg-white/[0.06] text-[#a1a1a6]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-[#86868b] truncate">{item.desc}</div>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Supabase Status Pill */}
            <button
              onClick={openSupabaseModal}
              title={
                supabaseStatus.isConfigured
                  ? 'Supabase 云端数据库已同步 (点击查看配置)'
                  : '未连接 Supabase (使用本地高速缓存，点击配置)'
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] text-[#a1a1a6] hover:text-white hover:border-white/20 transition-all"
            >
              <Database
                className={`w-3.5 h-3.5 shrink-0 ${
                  supabaseStatus.isConfigured ? 'text-[#30d158]' : 'text-[#ff9f0a]'
                }`}
              />
              <span className="hidden md:inline text-[11px] font-mono tracking-tight whitespace-nowrap">
                {supabaseStatus.isConfigured ? 'Supabase' : '云数据库'}
              </span>
            </button>

            {/* Pre-sales Lead Intelligence Pill */}
            <div
              onClick={openSalesConsoleModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] cursor-pointer hover:border-white/20 transition-all shrink-0 whitespace-nowrap"
              title="点击查看售前 CRM 智能评级工作台"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse shrink-0" />
              <span className="text-[11px] text-[#86868b] whitespace-nowrap">{currentStage}</span>
              <span className="text-[11px] font-mono font-medium text-white whitespace-nowrap">
                {leadScore}分
              </span>
            </div>

            {/* Apple Blue Booking CTA Button */}
            <button
              onClick={openBookingModal}
              className="apple-blue-btn px-3 sm:px-3.5 py-1.5 text-xs whitespace-nowrap shrink-0 shadow-md flex items-center gap-1.5 font-medium"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">预约诊断</span>
            </button>

            {/* User Profile / Workspace Button */}
            <button
              onClick={openMySpaceModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-[#f5f5f7] transition-all"
              title="我的学习空间、诊断报告与出海档案"
            >
              <User className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />
              <span className="text-[11px] font-medium whitespace-nowrap">我的空间</span>
            </button>

            {/* Mobile / Tablet Hamburger Toggle (screens < lg: 1024px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#a1a1a6] hover:text-white hover:bg-white/[0.08] transition-all shrink-0 ml-0.5"
              aria-label="切换主导航菜单"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Full Frosted Glass Navigation Sheet */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 z-50 backdrop-blur-3xl bg-black/95 border-t border-white/10 overflow-y-auto px-4 py-6 animate-in slide-in-from-top-4 duration-200">
            <div className="max-w-md mx-auto space-y-6">
              {/* Quick Actions in Mobile Menu */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    openBookingModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="apple-blue-btn py-2.5 text-xs flex items-center justify-center gap-2 font-medium"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">预约专家诊断</span>
                </button>
                <button
                  onClick={() => {
                    openMySpaceModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="apple-btn-secondary py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-[#2997ff] shrink-0" />
                  <span className="whitespace-nowrap">我的出海档案</span>
                </button>
              </div>

              {/* System Intelligence Indicators */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <div
                  onClick={() => {
                    openSalesConsoleModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
                  <div>
                    <div className="text-[11px] text-[#86868b]">CRM 评级</div>
                    <div className="text-xs font-semibold text-white">
                      {currentStage} · {leadScore}分
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => {
                    openSupabaseModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer border-l border-white/10 pl-3"
                >
                  <Database
                    className={`w-4 h-4 ${
                      supabaseStatus.isConfigured ? 'text-[#30d158]' : 'text-[#ff9f0a]'
                    }`}
                  />
                  <div>
                    <div className="text-[11px] text-[#86868b]">数据库</div>
                    <div className="text-xs font-semibold text-white">
                      {supabaseStatus.isConfigured ? 'Supabase 已联' : '本地暂存'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Items List */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] px-3 pb-1">
                  业务与核心功能
                </div>
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-white/15 text-white border border-white/15 font-medium'
                          : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-[#2997ff]/20 text-[#2997ff]'
                              : 'bg-white/[0.06] text-[#86868b]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-white flex items-center gap-1.5">
                            <span className="whitespace-nowrap">{item.label}</span>
                            {item.isHighlighted && (
                              <span className="text-[10px] bg-[#2997ff]/20 text-[#2997ff] border border-[#2997ff]/30 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                                推荐
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#86868b] line-clamp-1">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#2997ff]' : 'text-[#86868b]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
