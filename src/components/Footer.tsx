import React from 'react';
import { useApp } from '../context/AppContext';
import { NAV_GROUPS, TabId } from './navigation';

interface FooterProps {
  onNavigate: (tab: TabId) => void;
  openSalesConsoleModal: () => void;
  openSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, openSalesConsoleModal, openSupabaseModal }) => {
  const { supabaseStatus } = useApp();

  return (
    <footer className="border-t border-separator bg-canvas">
      <div className="layout-wide py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          <div className="col-span-2 md:col-span-1">
            <p className="text-body font-semibold">云端智荐</p>
            <p className="mt-2 max-w-60 text-caption text-label-secondary">
              AI 出海售前支持系统与能力样板间。让海外买家找到你，让 AI 替你接住生意。
            </p>
          </div>

          {NAV_GROUPS.map((group) => (
            <nav key={group.title} aria-label={`页脚 · ${group.title}`}>
              <h2 className="text-caption font-semibold text-label">{group.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className="text-caption text-label-secondary transition-colors hover:text-label"
                    >
                      {item.fullLabel}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-separator pt-6 text-caption text-label-secondary md:flex-row md:items-center md:justify-between">
          <p>Copyright © 2026 云端智荐。保留所有权利。</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button type="button" onClick={openSalesConsoleModal} className="transition-colors hover:text-label">
              售前 CRM 工作台
            </button>
            <button
              type="button"
              onClick={openSupabaseModal}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-label"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${supabaseStatus.isConfigured ? 'bg-success' : 'bg-warning'}`}
                aria-hidden="true"
              />
              数据同步设置
            </button>
            <span>苏ICP备20260928号-1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
