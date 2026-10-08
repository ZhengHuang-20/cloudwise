import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SERVICE_IDENTITY } from '../components/ui/serviceIdentity';
import { useLang } from '../context/LanguageContext';
import { CONTACTS, formatPhone } from '../data/contactsData';
import { SERVICES } from '../data/servicesData';
import { caseList } from '../data/caseStudiesData';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';
import { BRAND, ICP_RECORD, SAME_AS, SITE_URL } from '../lib/site';
import { caseSlug } from '../site/routes';
import { splitName } from './CasesView';

/** 关于我们 /about：公司是谁、做什么、怎么做、怎么联系。只写可核实的事实 */
export const AboutView: React.FC = () => {
  const { t, tb, lang, path } = useLang();
  const cases = caseList(lang);

  return (
    <div>
      <PageHeader
        eyebrow={t('关于我们', 'About us')}
        title={t(`${BRAND.zh}（${BRAND.en}）`, `${BRAND.en} (${BRAND.zh})`)}
        intro={t(
          `${BRAND.zh}是面向中国出海企业的 AI 售前支持团队，用独立站、SEO、GEO、AI 客服${SHOW_FDE ? '与 FDE 驻场' : ''}${SERVICE_COUNT_CN}项服务，帮助制造企业让海外买家找得到、读得懂、信得过，询盘来了有人接。`,
          `${BRAND.en} is an AI pre-sales support team for Chinese companies going global. Through ${SERVICE_COUNT_EN.toLowerCase()} services, websites, SEO, GEO, AI customer service${SHOW_FDE ? ' and FDE on-site engineering' : ''}, we help manufacturers get found, read and trusted by overseas buyers, and answer every enquiry.`
        )}
      />

      <div className="layout-text space-y-5 pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <section className="tile" aria-labelledby="facts-title">
          <h2 id="facts-title" className="text-title-2">
            {t('基本信息', 'At a glance')}
          </h2>
          <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-caption text-label-secondary">{t('中文名', 'Chinese name')}</dt>
              <dd className="mt-1 text-body">{BRAND.zh}</dd>
            </div>
            <div>
              <dt className="text-caption text-label-secondary">{t('英文名', 'English name')}</dt>
              <dd className="mt-1 text-body">{BRAND.en}</dd>
            </div>
            <div>
              <dt className="text-caption text-label-secondary">{t('官网', 'Website')}</dt>
              <dd className="mt-1 text-body">{SITE_URL.replace(/^https:\/\//, '')}</dd>
            </div>
            <div>
              <dt className="text-caption text-label-secondary">{t('ICP 备案号', 'ICP licence')}</dt>
              <dd className="mt-1 text-body">{ICP_RECORD}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-caption text-label-secondary">{t('服务对象', 'Who we serve')}</dt>
              <dd className="mt-1 text-body">
                {t(
                  '需要开拓海外市场的中国制造企业，尤其是医疗器械、工业装备、环保工程等 B2B 行业。',
                  'Chinese manufacturers expanding overseas, especially in B2B sectors such as medical devices, industrial equipment and environmental engineering.'
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="tile" aria-labelledby="services-title">
          <h2 id="services-title" className="text-title-2">
            {t('我们做什么', 'What we do')}
          </h2>
          <ul className="mt-6 divide-y divide-separator border-t border-separator">
            {SERVICES.map((svc) => {
              const identity = SERVICE_IDENTITY[svc.key];
              const Icon = identity.icon;
              return (
                <li key={svc.slug}>
                  <Link href={path(`/services/${svc.slug}`)} className="group flex items-start gap-4 py-4">
                    <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${identity.text}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body text-label">{t(identity.name, identity.nameEn)}</span>
                      <span className="mt-0.5 block text-caption text-label-secondary">{tb(svc.oneLiner)}</span>
                    </span>
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-label-tertiary" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="tile" aria-labelledby="principles-title">
          <h2 id="principles-title" className="text-title-2">
            {t('我们的做事原则', 'How we work')}
          </h2>
          <ul className="mt-6 space-y-4 text-body text-label-secondary">
            <li>
              <span className="font-semibold text-label">{t('写清口径。', 'State the basis. ')}</span>
              {t(
                '每个数字都注明来源与测量方法，两个站点的对比就写明是两个站点。',
                'Every figure states its source and how it was measured; a comparison of two sites says it is two sites.'
              )}
            </li>
            <li>
              <span className="font-semibold text-label">{t('不承诺 AI 一定推荐。', 'No promise that AI will recommend you. ')}</span>
              {t(
                '我们提高被引用的机会，并每月用同一组问题复测、如实汇报。',
                'We raise the chance of being cited, then re-test every month with the same questions and report honestly.'
              )}
            </li>
            <li>
              <span className="font-semibold text-label">{t('能力留给企业。', 'The capability stays with you. ')}</span>
              {t('源码、数据与文档归企业，并培养企业自己的人。', 'Source code, data and documentation belong to you, and we train your own people.')}
            </li>
          </ul>
        </section>

        <section className="tile" aria-labelledby="cases-title">
          <h2 id="cases-title" className="text-title-2">
            {t('服务过的企业', 'Companies we have worked with')}
          </h2>
          <ul className="mt-6 space-y-3">
            {cases.map((c) => (
              <li key={c.id}>
                <Link href={path(`/cases/${caseSlug(c.id)}`)} className="link text-body">
                  {splitName(c.clientName).primary} · {c.industry}
                  <ChevronRight />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="tile" aria-labelledby="contact-title">
          <h2 id="contact-title" className="text-title-2">
            {t('联系我们', 'Contact us')}
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {CONTACTS.map((c) => (
              <li key={c.phone}>
                <p className="text-caption text-label-secondary">{t(c.title, c.titleEn)}</p>
                <p className="mt-1 text-body">{t(c.name, c.nameEn)}</p>
                <a href={`tel:${c.phone}`} className="link tabular-nums">
                  {formatPhone(c.phone)}
                </a>
              </li>
            ))}
          </ul>
          {SAME_AS.length > 0 && (
            <p className="mt-8 text-caption text-label-secondary">
              {t('官方账号：', 'Official accounts: ')}
              <a href={SAME_AS[0]} target="_blank" rel="noopener noreferrer" className="link">
                {t('B 站 · 云端智荐出海学院', 'Bilibili · ChinGEO Export Academy')}
              </a>
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
