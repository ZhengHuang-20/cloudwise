import React from 'react';
import { NAV_GROUPS, TabId } from './navigation';

interface FooterProps {
  onNavigate: (tab: TabId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
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
          <span>苏ICP备20260928号-1</span>
        </div>
      </div>
    </footer>
  );
};
