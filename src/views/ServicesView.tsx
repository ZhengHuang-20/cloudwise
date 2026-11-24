import React from 'react';
import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';
import { ServiceProof } from '../components/ServiceProof';
import { PageHeader } from '../components/ui/PageHeader';
import { SERVICE_IDENTITY } from '../components/ui/serviceIdentity';
import { FdeBuildLayers } from '../components/FdeBuildLayers';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';
import { courseSlug } from '../site/links';
import { useLang } from '../context/LanguageContext';
import { SERVICES as SUBSYSTEMS } from '../data/servicesData';
import { useSite } from '../site/SiteContext';


export const ServicesView: React.FC = () => {
  const { t, tb, lang, path } = useLang();
  const { goToConfigurator } = useSite();
  const onGoToConfigurator = (combo: string) => goToConfigurator({ packageType: combo });

  const scrollToService = (code: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`service-${code}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div>
      <PageHeader
        eyebrow={t(`${SERVICE_COUNT_CN}项服务`, `${SERVICE_COUNT_EN} services`)}
        title={t(`${SERVICE_COUNT_CN}项核心服务，各解决一类卡点`, `${SERVICE_COUNT_EN} core services, each solving a bottleneck`)}
        intro={
          SHOW_FDE
            ? t(
                `${SERVICE_COUNT_CN}项核心服务共用同一套企业资料：出海 GEO、FDE 驻场、SEO 与建站、AI 客服，内容可以互相复用。`,
                'The core services share one set of company material: export GEO, FDE on-site engineering, SEO and website, and AI customer service. Content is reused across them.'
              )
            : t(
                `${SERVICE_COUNT_CN}项核心服务共用同一套企业资料：出海 GEO、SEO 与建站、AI 客服，内容可以互相复用。每项都写明做什么、交什么，以及我们已有的案例数据。`,
                'The core services share one set of company material: export GEO, SEO and website, and AI customer service. Content is reused across them, and each one states what we do, what you receive and the case data we already have.'
              )
        }
      >
        {/* 页内索引 */}
        <nav aria-label={t('服务索引', 'Service index')} className="flex flex-wrap justify-center gap-2">
          {SUBSYSTEMS.map((svc) => {
            const identity = SERVICE_IDENTITY[svc.key];
            return (
              <button key={svc.code} type="button" onClick={() => scrollToService(svc.code)} className="chip">
                <span className={`h-2 w-2 rounded-full ${identity.dot}`} aria-hidden="true" />
                {t(identity.name, identity.nameEn)}
              </button>
            );
          })}
        </nav>
      </PageHeader>

      <div className="layout-wide space-y-5 pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {SUBSYSTEMS.map((svc) => {
          const identity = SERVICE_IDENTITY[svc.key];
          const Icon = identity.icon;
          const titleText = tb(svc.title);
          return (
            <article
              key={svc.code}
              id={`service-${svc.code}`}
              aria-labelledby={`service-${svc.code}-title`}
              className="tile grid scroll-mt-20 gap-10 lg:grid-flow-row-dense lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14"
            >
              <div>
                <div className="flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${identity.text}`} />
                  <span className="text-caption text-label-secondary">
                    {t(`对应卡点：${tb(svc.friction)}`, `Pain point: ${tb(svc.friction)}`)}
                  </span>
                </div>
                <h2 id={`service-${svc.code}-title`} className="mt-5 text-title-1">
                  <Link href={path(`/services/${svc.slug}`)} className="transition-colors hover:text-link">
                    {/* 在括注前断行，避免窄屏把词组拆开 */}
                    {(lang === 'zh' ? titleText.split(/(?=（)/) : [titleText]).map((part) => (
                      <span key={part} className="inline-block">
                        {part}
                      </span>
                    ))}
                  </Link>
                </h2>
                <p className="mt-4 text-intro">{tb(svc.oneLiner)}</p>
                <p className="mt-4 text-body text-label-secondary">{tb(svc.desc)}</p>

                <blockquote className="mt-6 border-l-2 border-separator-strong pl-4 text-body text-label-secondary">
                  <span className="font-semibold text-label">{t('我们的判断　', 'Our view: ')}</span>
                  {tb(svc.judgement)}
                </blockquote>

                <h3 className="mt-10 text-title-3">{t('交付标准', 'Deliverables')}</h3>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {svc.deliverables.map((item) => (
                    <li key={item.zh} className="flex gap-3 text-body">
                      <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                      <span>{tb(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 案例数据（Search Console 截图）横跨两栏 */}
              {svc.proof && <div className="lg:col-span-2"><ServiceProof proof={svc.proof} showImages={false} /></div>}

              {/* FDE 需要讲清方法论：三层图横跨两栏，dense 排布让右侧栏回填第一行 */}
              {svc.key === 'fde' && <FdeBuildLayers className="lg:col-span-2" />}

              <aside className="well self-start" aria-label={t(`${titleText}：案例与下一步`, `${titleText}: case and next step`)}>
                <dl>
                  <dt className="text-caption text-label-secondary">{t('案例', 'Case')}</dt>
                  <dd className="mt-1 text-body">{tb(svc.caseName)}</dd>
                  {svc.engagement && (
                    <>
                      <dt className="mt-4 text-caption text-label-secondary">{t('合作方式', 'How we work together')}</dt>
                      <dd className="mt-1 text-body">{tb(svc.engagement.summary)}</dd>
                    </>
                  )}
                </dl>
                <Link href={path(`/services/${svc.slug}`)} className="btn btn-primary btn-block mt-6">
                  {t('查看服务详情', 'Service details')}
                </Link>
                <Link href={path(`/academy/${courseSlug(svc.code)}`)} className="link mt-4 w-full justify-center text-body">
                  {t(`学习课程 ${svc.code}`, `Study course ${svc.code}`)}
                  <ChevronRight />
                </Link>
              </aside>
            </article>
          );
        })}

        {/* 收尾：引导到组合配置 */}
        <section className="pt-[clamp(3.5rem,2rem+4vw,6rem)] text-center">
          <h2 className="text-headline">
            <span className="inline-block">{t('不确定从哪一项开始？', 'Not sure where to start?')}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            {t(
              '常见的起点是“GEO + SEO 与建站”获客组合。组合后可以看到交付周期、阶段排期与交付物清单。',
              'A common starting point is the "GEO + SEO and website" lead-generation package. Once combined, you can see the delivery timeline, phased schedule and deliverables list.'
            )}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => onGoToConfigurator('package-acquisition')}
              className="btn btn-primary btn-lg"
            >
              {t('配置获客组合', 'Configure the lead package')}
            </button>
            <Link href={path('/audit')} className="btn btn-secondary btn-lg">
              {t('先做 AI 可见性测评', 'Run the AI visibility audit first')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
