import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ListChecks, Lock, Radar } from 'lucide-react';
import { Reveal } from '../components/ui/Reveal';
import { SERVICE_IDENTITY, ServiceKey } from '../components/ui/serviceIdentity';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';
import { Bi, useLang } from '../context/LanguageContext';
import { VisibilityAudit } from './home/VisibilityAudit';
import { useSite } from '../site/SiteContext';
import { SERVICES as SERVICE_DATA } from '../data/servicesData';

interface ServiceCard {
  key: ServiceKey;
  title: Bi;
  desc: Bi;
  link: Bi;
}

const ALL_SERVICES: ServiceCard[] = [
  {
    key: 'site',
    title: { zh: '海外独立站建站', en: 'Overseas websites' },
    desc: {
      zh: '为海外采购主管、技术总监、合规官三类读者设计的独立站：公差、认证编号、技术资料都能在页面上找到，海外访问打开快。',
      en: 'Websites built for three readers: overseas procurement managers, technical directors and compliance officers. Tolerances, certification numbers and technical files are on the page, and the site loads fast overseas.',
    },
    link: { zh: '了解建站方案', en: 'See the website plan' },
  },
  {
    key: 'seo',
    title: { zh: '外贸 SEO 优化', en: 'Export SEO' },
    desc: {
      zh: '按买家的真实搜索词，建 60 组采购相关的核心词库，一个词对应一个页面；目标是让买家搜索时能看到你。',
      en: 'Built from the search terms real buyers use: 60 procurement-related core keyword groups, one page per term, so buyers can find you when they search.',
    },
    link: { zh: '了解 SEO 词库策略', en: 'See the SEO keyword strategy' },
  },
  {
    key: 'geo',
    title: { zh: '出海 GEO 优化', en: 'Export GEO' },
    desc: {
      zh: '海外采购商向 ChatGPT、Perplexity、Google AI 概览询问供应商时，提高你的品牌被引用的机会，并每月复测给你看。',
      en: 'When overseas buyers ask ChatGPT, Perplexity or Google AI Overviews for suppliers, we improve the chance your brand gets cited, and re-test every month so you can see the result.',
    },
    link: { zh: '了解 GEO 信源方案', en: 'See the GEO source plan' },
  },
  {
    key: 'chat',
    title: { zh: 'AI 智能客服与系统对接', en: 'AI customer service and system integration' },
    desc: {
      zh: '依据企业自己的参数库，全天候用多语种解答公差、认证与交期；超出资料范围的问题转给销售；识别询盘意向并同步到 CRM。',
      en: 'Answers multilingual questions about tolerances, certifications and lead times around the clock, based on your own product data. Questions beyond the material go to sales, and buying intent is synced to your CRM.',
    },
    link: { zh: '了解 AI 客服', en: 'See AI customer service' },
  },
  {
    key: 'fde',
    title: { zh: 'FDE 驻场工程师', en: 'FDE on-site engineers' },
    desc: {
      zh: '带着 AI 驻场一线，把业务经验写成标准、装进系统、交给 AI 执行。源码、数据和会用的人都留给企业。',
      en: 'On-site engineers work alongside your business to turn experience into standards, load them into systems and hand them to AI to run. Source code, data and the people who can use it stay with your company.',
    },
    link: { zh: '了解三层建设', en: 'See the three-layer build' },
  },
];
const SERVICES = SHOW_FDE ? ALL_SERVICES : ALL_SERVICES.filter((service) => service.key !== 'fde');

// 售前工具：tab 为 'audit' 时滚动到首页的 AI 可见性测评，其余跳转到对应页面
const TOOLS: {
  tab: 'audit' | 'configurator' | 'deal-room';
  icon: React.ComponentType<{ className?: string }>;
  title: Bi;
  desc: Bi;
  link: Bi;
}[] = [
  {
    tab: 'audit',
    icon: Radar,
    title: { zh: 'AI 可见性测评', en: 'AI visibility audit' },
    desc: {
      zh: '输入官网或品牌名，我们以海外买家身份向 AI 搜索提问，看看你会不会被推荐、卡在哪一步。',
      en: 'Enter your website or brand name. We ask AI search engines questions as an overseas buyer would, and show whether you get recommended and where you drop off.',
    },
    link: { zh: '开始测评', en: 'Start the audit' },
  },
  {
    tab: 'configurator',
    icon: ListChecks,
    title: { zh: '方案组合与交付规划', en: 'Package planning and delivery' },
    desc: {
      zh: `自由组合独立站、SEO、GEO${SHOW_FDE ? '、AI 客服与 FDE 驻场' : ' 与 AI 客服'}，实时得到交付周期、阶段排期与交付物清单。`,
      en: `Combine websites, SEO, GEO${SHOW_FDE ? ', AI customer service and FDE on-site engineering' : ' and AI customer service'}, and get delivery timelines, phased schedules and deliverables instantly.`,
    },
    link: { zh: '规划方案', en: 'Plan a project' },
  },
  {
    tab: 'deal-room',
    icon: Lock,
    title: { zh: '专属方案空间', en: 'Dedicated project room' },
    desc: {
      zh: '保存的方案自动生成共享空间，双方在这里推进行动计划、答疑讨论与在线签约。',
      en: 'Each saved plan gets a shared project room, where both sides track the action plan, answer questions and sign contracts online.',
    },
    link: { zh: '进入方案空间', en: 'Open the project room' },
  },
];

const CASES: {
  /** 案例详情页 /cases/<slug> */
  slug: string;
  meta: Bi;
  name: Bi;
  stat: string;
  statUnit: Bi;
  statLabel: Bi;
  desc: Bi;
  pains: Bi;
}[] = [
  {
    slug: 'ak-medical',
    meta: { zh: '港股上市 · 骨科植入物头部企业', en: 'Hong Kong-listed · leading orthopaedic implant maker' },
    name: { zh: '爱康医疗', en: 'Aikang Medical' },
    stat: '47 → 95',
    statUnit: { zh: '分', en: 'pts' },
    statLabel: { zh: 'GEO / SEO 评分 · 国内官网 → 新建海外官网', en: 'GEO / SEO score · domestic site → new overseas site' },
    desc: {
      zh: '新建英文海外官网，按 4 类海外医疗决策者的提问组织内容，规划 91 项年度技术内容。数月内，ChatGPT 与 Perplexity 持续带来引荐访问。',
      en: 'Built a new English overseas site and organised content around the questions of four types of overseas medical decision-makers, with 91 technical content items planned for the year. Within months, ChatGPT and Perplexity were sending referral traffic consistently.',
    },
    pains: { zh: '读不懂 · 不被信', en: 'Hard to read · Not trusted' },
  },
  {
    slug: 'tide-lion',
    meta: { zh: '国家级专精特新“小巨人” · 环保水务', en: 'National "little giant" specialised SME · water environment' },
    name: { zh: '泰宁科创', en: 'Taining Tech' },
    stat: '60',
    statUnit: { zh: '组', en: 'groups' },
    statLabel: { zh: '英文核心词 · Google 欧美排名前两页', en: 'English core keyword groups · Google page one to two in Europe and the US' },
    desc: {
      zh: '围绕英国 SuDS 规范建立 60 组英文核心词，编制英文合规指南，把国内地标工程整理成海外工程师能查证的资料；已进入中东某新城雨水调蓄项目的供应商短名单。',
      en: 'Built 60 English core keyword groups around the UK SuDS standard, wrote an English compliance guide, and turned domestic landmark engineering into material overseas engineers can verify. Now on the supplier shortlist for a rainwater storage project in a new Middle East city.',
    },
    pains: { zh: '看不见 · 接不住', en: "Invisible · Can't keep up" },
  },
];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const serviceSlug = (key: ServiceKey) => SERVICE_DATA.find((svc) => svc.key === key)?.slug ?? '';

export const HomeView: React.FC = () => {
  const auditInputRef = useRef<HTMLInputElement>(null);
  const { t, tb, path } = useLang();
  const { openBooking: openBookingModal, navigate } = useSite();

  const scrollToAudit = () => {
    document.getElementById('audit')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    auditInputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div>
      {/* ===================== Hero ===================== */}
      <section className="layout-text pt-[clamp(4rem,2rem+6vw,7.5rem)] text-center">
        <p className="eyebrow">{t('云端智荐 · AI 出海售前系统', 'ChinGEO · AI pre-sales system for going global')}</p>
        <h1 className="mt-4 text-display">
          {t('让海外买家找到你', 'Help overseas buyers find you')}
          <br />
          <span className="text-gradient-ai">{t('让 AI 替你接住生意', 'Let AI take the enquiries')}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-intro text-label-secondary">
          {t(
            `独立站、SEO、GEO、AI 客服与系统对接${SHOW_FDE ? '，以及 FDE 驻场' : ''}。帮中国中型制造企业让海外买家找得到、读得懂、信得过，询盘来了有人接。`,
            `Websites, SEO, GEO, AI customer service and system integration${SHOW_FDE ? ', plus FDE on-site engineering' : ''}. We help mid-sized Chinese manufacturers get found, get read, get trusted, and answer every enquiry.`
          )}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button type="button" onClick={scrollToAudit} className="btn btn-primary btn-lg">
            {t('免费做 AI 可见性测评', 'Run a free AI visibility audit')}
          </button>
          <button type="button" onClick={openBookingModal} className="btn btn-secondary btn-lg">
            {t('预约诊断会', 'Book a diagnosis call')}
          </button>
        </div>
      </section>

      {/* ===================== 即时评估工具 ===================== */}
      <section id="audit" className="scroll-mt-20 pt-16 md:pt-20">
        <VisibilityAudit
          inputRef={auditInputRef}
          openBookingModal={openBookingModal}
          onGoToConfigurator={() => navigate('/configurator')}
        />
      </section>

      {/* ===================== 核心服务 ===================== */}
      <section className="section layout-wide">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">{t('核心服务', 'Core services')}</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">{t(`${SERVICE_COUNT_CN}项服务，`, `${SERVICE_COUNT_EN} services,`)}</span>
            <span className="inline-block">{t('一套获客系统。', 'one lead-generation system.')}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            {t('每一项服务都写明：做什么、交什么、怎样验收。', 'Every service states what we do, what you receive, and how it is accepted.')}
          </p>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-6">
          {SERVICES.map((service, index) => {
            const identity = SERVICE_IDENTITY[service.key];
            const Icon = identity.icon;
            // 五张：前两张各占 3 列、后三张各占 2 列；四张：2 × 2
            const span =
              index < 2 || SERVICES.length === 4
                ? 'lg:col-span-3'
                : index === 4
                  ? 'md:col-span-2 lg:col-span-2'
                  : 'lg:col-span-2';
            return (
              <Link
                key={service.key}
                href={path(`/services/${serviceSlug(service.key)}`)}
                className={`tile interactive group flex flex-col items-start ${span}`}
              >
                <Icon className={`h-8 w-8 ${identity.text}`} />
                <h3 className="mt-6 text-title-2">{tb(service.title)}</h3>
                <p className="mt-3 flex-1 text-body text-label-secondary">{tb(service.desc)}</p>
                <span className="link mt-6 text-body">
                  {tb(service.link)}
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </Reveal>
      </section>

      {/* ===================== 售前工具 ===================== */}
      <section className="section layout-wide pt-0">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">{t('售前工具', 'Pre-sales tools')}</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">{t('见销售之前，', 'Before a sales call,')}</span>
            <span className="inline-block">{t('先看清问题与方案。', 'see the problem and the plan clearly.')}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            {t('面向出海决策人的自助工具，免注册，打开即用。', 'Self-serve tools for export decision-makers. No sign-up, open and use.')}
          </p>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const body = (
              <>
                <Icon className="h-8 w-8 text-label" />
                <h3 className="mt-6 text-title-2">{tb(tool.title)}</h3>
                <p className="mt-3 flex-1 text-body text-label-secondary">{tb(tool.desc)}</p>
                <span className="link mt-6 text-body">
                  {tb(tool.link)}
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </>
            );
            return tool.tab === 'audit' ? (
              <button
                key={tool.tab}
                type="button"
                onClick={scrollToAudit}
                className="tile interactive group flex flex-col items-start"
              >
                {body}
              </button>
            ) : (
              <Link
                key={tool.tab}
                href={path(`/${tool.tab}`)}
                rel={tool.tab === 'deal-room' ? 'nofollow' : undefined}
                className="tile interactive group flex flex-col items-start"
              >
                {body}
              </Link>
            );
          })}
        </Reveal>
      </section>

      {/* ===================== 标杆案例 ===================== */}
      <section className="section layout-wide pt-0">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">{t('标杆案例', 'Case studies')}</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">{t('看制造企业怎样走向海外。', 'See how manufacturers go overseas.')}</span>
          </h2>
          <Link href={path('/cases')} className="link mt-5 text-intro">
            {t('查看全部案例', 'View all cases')}
            <ChevronRight />
          </Link>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {CASES.map((item) => (
            <Link
              key={item.name.zh}
              href={path(`/cases/${item.slug}`)}
              className="tile interactive group flex flex-col items-start"
            >
              <p className="text-caption text-label-secondary">{tb(item.meta)}</p>
              <h3 className="mt-1 text-title-2">{tb(item.name)}</h3>
              <p className="mt-8 text-headline tabular-nums">
                {item.stat}
                <span className="ml-1 text-title-3 text-label-secondary">{tb(item.statUnit)}</span>
              </p>
              <p className="mt-1 text-caption text-label-secondary">{tb(item.statLabel)}</p>
              <p className="mt-6 flex-1 text-body text-label-secondary">{tb(item.desc)}</p>
              <div className="mt-8 flex w-full flex-wrap items-center justify-between gap-3 border-t border-separator pt-5">
                <span className="text-caption text-label-secondary">
                  {t('对应卡点：', 'Pain point: ')}
                  {tb(item.pains)}
                </span>
                <span className="link text-body">
                  {t('阅读案例', 'Read the case')}
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* ===================== 收尾行动 ===================== */}
      <section className="section layout-text pt-0 text-center">
        <Reveal>
          <h2 className="text-headline">
            <span className="inline-block">{t('先看清现状，', 'See where you stand,')}</span>
            <span className="inline-block">{t('再决定做什么。', 'then decide what to do.')}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            {t(
              '先做免费的 AI 可见性测评；想要人工解读，就预约 30 分钟诊断会，会后给出书面的改进清单。',
              'Start with the free AI visibility audit. For a human read-through, book a 30-minute diagnosis call and receive a written improvement list afterwards.'
            )}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button type="button" onClick={scrollToAudit} className="btn btn-primary btn-lg">
              {t('开始 AI 可见性测评', 'Start the AI visibility audit')}
            </button>
            <button type="button" onClick={openBookingModal} className="btn btn-secondary btn-lg">
              {t('预约 30 分钟诊断会', 'Book a 30-minute diagnosis call')}
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
