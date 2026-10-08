import React from 'react';
import { NAV_GROUPS, TabId } from './navigation';
import { CONTACTS, formatPhone } from '../data/contactsData';
import { useLang } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (tab: TabId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, tb } = useLang();
  return (
    <footer className="border-t border-separator bg-canvas">
      <div className="layout-wide py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="flex items-center gap-2 text-body font-semibold">
              <img src="/brand/logo-mark.png" alt="" className="h-7 w-auto" />
              {t('云端智荐', 'Cloudwise')}
            </p>
            <p className="mt-2 max-w-60 text-caption text-label-secondary">
              {t(
                'AI 出海售前支持系统与能力样板间。让海外买家找到你，让 AI 替你接住生意。',
                'An AI pre-sales support system and capability showroom for companies going global. Help overseas buyers find you, and let AI take the enquiries.'
              )}
            </p>
          </div>

          {NAV_GROUPS.map((group) => (
            <nav key={group.title.zh} aria-label={t(`页脚 · ${group.title.zh}`, `Footer · ${group.title.en}`)}>
              <h2 className="text-caption font-semibold text-label">{tb(group.title)}</h2>
              <ul className="mt-3 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className="text-caption text-label-secondary transition-colors hover:text-label"
                    >
                      {tb(item.fullLabel)}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <section aria-labelledby="footer-contact" className="col-span-2 md:col-span-1">
            <h2 id="footer-contact" className="text-caption font-semibold text-label">
              {t('联系我们', 'Contact us')}
            </h2>
            <ul className="mt-3 space-y-3">
              {CONTACTS.map((c) => (
                <li key={c.phone} className="text-caption">
                  <p className="text-label-secondary">
                    {t(c.title, c.titleEn)} · {t(c.name, c.nameEn)}
                  </p>
                  <a href={`tel:${c.phone}`} className="link tabular-nums">
                    {formatPhone(c.phone)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-separator pt-6 text-caption text-label-secondary md:flex-row md:items-center md:justify-between">
          <p>{t('Copyright © 2026 云端智荐。保留所有权利。', 'Copyright © 2026 Cloudwise. All rights reserved.')}</p>
          <span>苏ICP备20260928号-1</span>
        </div>
      </div>
    </footer>
  );
};
