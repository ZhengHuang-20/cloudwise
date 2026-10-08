import React from 'react';
import Link from 'next/link';
import { FOOTER_EXTRA, NAV_GROUPS } from './navigation';
import { CONTACTS, formatPhone } from '../data/contactsData';
import { useLang } from '../context/LanguageContext';
import { ICP_RECORD } from '../lib/site';

export const Footer: React.FC = () => {
  const { t, tb, path } = useLang();
  return (
    <footer className="border-t border-separator bg-canvas">
      <div className="layout-wide py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="flex items-center gap-2 text-body font-semibold">
              <img src="/brand/logo-mark.png" alt="" width={32} height={28} className="h-7 w-auto" />
              {t('云端智荐', 'ChinGEO')}
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
                    <Link
                      href={path(item.href)}
                      className="text-caption text-label-secondary transition-colors hover:text-label"
                    >
                      {tb(item.fullLabel)}
                    </Link>
                  </li>
                ))}
                {group === NAV_GROUPS[NAV_GROUPS.length - 1] &&
                  FOOTER_EXTRA.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={path(item.href)}
                        className="text-caption text-label-secondary transition-colors hover:text-label"
                      >
                        {tb(item.label)}
                      </Link>
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
          <p>{t('Copyright © 2026 云端智荐。保留所有权利。', 'Copyright © 2026 ChinGEO. All rights reserved.')}</p>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer nofollow" className="hover:text-label">
            {ICP_RECORD}
          </a>
        </div>
      </div>
    </footer>
  );
};
