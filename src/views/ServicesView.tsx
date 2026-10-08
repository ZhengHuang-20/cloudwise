import React from 'react';
import { Check } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SERVICE_IDENTITY, ServiceKey } from '../components/ui/serviceIdentity';
import { FdeBuildLayers } from '../components/FdeBuildLayers';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';
import { Bi, useLang } from '../context/LanguageContext';

interface ServicesViewProps {
  onGoToCourse: (courseCode: string) => void;
  onGoToAudit: () => void;
  onGoToConfigurator: (combo: string) => void;
}

interface Subsystem {
  key: ServiceKey;
  code: string;
  title: Bi;
  friction: Bi;
  oneLiner: Bi;
  desc: Bi;
  deliverables: Bi[];
  courseId: string;
  caseName: Bi;
  judgement: Bi;
}

const ALL_SUBSYSTEMS: Subsystem[] = [
  {
    key: 'site',
    code: 'A',
    title: { zh: '海外独立站（三读者架构）', en: 'Overseas website (three-reader architecture)' },
    friction: { zh: '读不懂', en: 'Hard to read' },
    oneLiner: {
      zh: '为采购主管、技术总监、合规官各自准备他们要找的页面。',
      en: 'Pages built for procurement managers, technical directors and compliance officers, each finding what they need.',
    },
    desc: {
      zh: '很多企业的英文站是中文画册直译，海外工程师找不到公差、标准编号和可下载的资料，也就无从判断你是否可靠。我们把制造能力整理成参数与公差范围、国际标准合规编号和可下载的工程白皮书，让每类读者一眼找到自己要的。',
      en: "Many companies' English sites are literal translations of Chinese brochures. Overseas engineers cannot find tolerances, standard numbers or downloadable material, so they cannot judge whether you are reliable. We turn your manufacturing capability into parameters and tolerance ranges, international standard compliance numbers and downloadable engineering white papers, so each type of reader finds what they need at a glance.",
    },
    deliverables: [
      { zh: '按采购、技术、合规三类读者分流的页面结构', en: 'Page structure routed by procurement, technical and compliance readers' },
      { zh: 'Core Web Vitals 优化，目标：海外主要地区 LCP ≤ 1.8 秒', en: 'Core Web Vitals tuning, target: LCP ≤ 1.8 seconds in key overseas regions' },
      { zh: 'Schema.org 结构化数据，便于搜索引擎与 AI 读取', en: 'Schema.org structured data for search engines and AI to read' },
      { zh: '访客行为与表单线索同步到企业自己的 CRM', en: 'Visitor behaviour and form leads synced to your own CRM' },
    ],
    courseId: 'A',
    caseName: {
      zh: '爱康医疗：新建海外官网 GEO / SEO 评分 95 分（国内官网为 47 分，是两个不同站点）',
      en: 'Aikang Medical: the new overseas site scores 95 on GEO / SEO (the domestic site scored 47; these are two different sites)',
    },
    judgement: {
      zh: '工程师核对不了的参数，不会被当作依据。所以先把能核对的东西摆出来：公差、标准编号、检测报告。',
      en: 'Parameters an engineer cannot verify will not be used as evidence. So we publish what can be checked first: tolerances, standard numbers and test reports.',
    },
  },
  {
    key: 'seo',
    code: 'B',
    title: { zh: '外贸 SEO：采购级核心词库', en: 'Export SEO: a procurement-grade keyword library' },
    friction: { zh: '看不见', en: 'Invisible' },
    oneLiner: {
      zh: '买家搜什么词，你的页面就出现在那个词下面。',
      en: 'Whatever words buyers search for, your page appears under those words.',
    },
    desc: {
      zh: '不堆泛词，不买流量。遵循 Google Search Essentials 与 E-E-A-T，建立信息型、对比型、采购型共 60 组核心词，一个词对应一个页面，让欧美买家在采购搜索中有机会看到你。',
      en: 'No generic keywords, no bought traffic. Following Google Search Essentials and E-E-A-T, we build 60 core keyword groups across informational, comparison and procurement intent, with one page per term, so buyers in Europe and the US have a chance to find you in procurement searches.',
    },
    deliverables: [
      { zh: '60 组外贸核心采购词，一词一页', en: '60 core procurement keyword groups, one page per term' },
      { zh: '技术白皮书与工程规格主题内容', en: 'Technical white papers and engineering specification content' },
      { zh: '行业协会与专业媒体的外部链接（不买卖链接）', en: 'Links from industry associations and trade media (no paid links)' },
      { zh: '用 GA4 追踪询盘来源与转化流失的位置', en: 'GA4 tracking of enquiry sources and where conversions drop off' },
    ],
    courseId: 'B',
    caseName: {
      zh: '泰宁科创：60 组英文核心词在 Google 欧美主要地区排名前两页',
      en: 'Taining Tech: 60 English core keyword groups reach the first two pages of Google in key US and European markets',
    },
    judgement: {
      zh: '买家搜不到你，就不会知道你。所以先弄清他们搜什么词，再让页面对得上。',
      en: 'Buyers who cannot find you will never know you exist. So first work out what they search for, then make your pages match.',
    },
  },
  {
    key: 'geo',
    code: 'C',
    title: { zh: '出海 GEO：让 AI 引用你的资料', en: 'Export GEO: get AI to cite your material' },
    friction: { zh: '不被信', en: 'Not trusted' },
    oneLiner: {
      zh: '把企业的专利、认证与工程案例整理成 AI 能查证、愿意引用的公开资料。',
      en: 'We organise your patents, certifications and engineering cases into public material that AI can verify and is willing to cite.',
    },
    desc: {
      zh: '海外买家向 ChatGPT、Perplexity 或 Google AI 概览询问推荐供应商时，AI 会引用它能查到的公开资料。我们通过第三方学术索引、认证与评测机构、真实工程案例，整理你的证据链，提高被引用的机会。我们无法保证 AI 一定推荐你，所以每月用同一组问题复测并汇报。',
      en: 'When overseas buyers ask ChatGPT, Perplexity or Google AI Overviews to recommend suppliers, the AI cites public material it can find. We build your evidence chain through third-party academic indexes, certification and testing bodies, and real engineering cases, which raises the chance of being cited. We cannot guarantee that AI will recommend you, so we re-test with the same question set every month and report back.',
    },
    deliverables: [
      { zh: '整理海外决策者会问 AI 的问题（问题簇）', en: 'Map the questions overseas decision-makers ask AI (question clusters)' },
      { zh: '全年技术资料与第三方背书规划', en: 'Annual technical content and third-party endorsement plan' },
      { zh: '在行业媒体与评测报告中建立可被引用的公开来源', en: 'Citable public sources built in trade media and test reports' },
      { zh: '每月用固定问题集测试主流 AI 平台，并与竞品对比的月报', en: 'Monthly report testing major AI platforms with a fixed question set, compared against competitors' },
    ],
    courseId: 'C',
    caseName: {
      zh: '爱康医疗：ChatGPT、Perplexity 数月持续带来引荐访问',
      en: 'Aikang Medical: ChatGPT and Perplexity have sent referral traffic consistently for several months',
    },
    judgement: {
      zh: '没有出处的说法，AI 不会引用，采购方也不会采信。',
      en: 'A claim without a source will not be cited by AI, and buyers will not trust it either.',
    },
  },
  {
    key: 'chat',
    code: 'D',
    title: { zh: 'AI 智能客服与系统对接', en: 'AI customer service and system integration' },
    friction: { zh: '接不住', en: "Can't keep up" },
    oneLiner: {
      zh: '欧美买家深夜来信，也能在几秒内得到第一次回复。',
      en: 'When European and US buyers write late at night, they still get a first reply within seconds.',
    },
    desc: {
      zh: '欧美买家在他们的工作时间来信，往往正是北京时间的深夜；等第二天人工回复，买家可能已经联系了别的供应商。AI 客服依据企业自己的技术参数库，用多语种回答公差、认证、交期等问题，提取采购信息并判断意向等级；超出资料范围的问题转给销售。',
      en: 'European and US buyers usually write during their working day, which is often late at night in Beijing. If you reply the next morning, they may already have contacted another supplier. Using your own technical parameter library, the AI customer service answers questions on tolerances, certifications and lead times in several languages, extracts purchase details, grades buying intent, and passes questions beyond the material to sales.',
    },
    deliverables: [
      { zh: '整理企业参数与资质资料，建立多语种知识库', en: 'Product parameters and certifications organised into a multilingual knowledge base' },
      { zh: '官网、邮件、WhatsApp 等渠道接入', en: 'Connected to your website, email, WhatsApp and other channels' },
      { zh: '抽取采购数量、交期、目标港等 12 项询盘信息', en: 'Extracts 12 enquiry fields, including order quantity, lead time and destination port' },
      { zh: '高意向线索即时推送到企业微信与 CRM', en: 'High-intent leads pushed instantly to WeCom (WeChat Work) and your CRM' },
    ],
    courseId: 'D',
    caseName: {
      zh: '示例：凌晨 03:12 收到欧美采购询问，03:14 完成回复并生成线索档案',
      en: 'Example: an overseas purchase enquiry arrives at 03:12, is answered by 03:14, and a lead record is created',
    },
    judgement: {
      zh: '买家等不到回复，就会去问别人。所以第一次回复要快，而且要答对。',
      en: 'Buyers who do not get a reply go elsewhere. So the first reply must be fast, and it must be right.',
    },
  },
  {
    key: 'fde',
    code: 'E',
    title: { zh: 'AI 驱动的三层建设（FDE 驻场）', en: 'AI-driven three-layer build (FDE on-site)' },
    friction: { zh: '连不上', en: 'Not connected' },
    oneLiner: {
      zh: '带着 AI 下到业务一线，把经验写成标准，把标准装进系统，再让 AI 在系统上干活',
      en: 'Go to the front line with AI: write experience down as standards, load the standards into systems, then let AI work on those systems.',
    },
    desc: {
      zh: 'FDE（前线部署工程师）源自 Palantir，如今 OpenAI、Anthropic 也在用它跨越“演示惊艳、上线艰难”的鸿沟。多数外贸企业的流程写在老业务员的经验和微信里，直接上 AI 只能做出演示。FDE 驻场跟岗，用 AI 加速完成标准化、信息化、智能化三层建设，对业务结果负责，离场时把标准、系统、数据和会用的人一起留给企业。',
      en: 'FDE (Forward Deployed Engineer) originated at Palantir, and OpenAI and Anthropic now use it to bridge the gap between an impressive demo and a launch that actually works. Most export businesses keep their processes in veteran salespeople\'s experience and in WeChat chats, so putting AI on top only produces a demo. FDE engineers work on site alongside your team and use AI to speed up three layers of build: standardisation, digitisation and intelligence. They are accountable for business results, and when they leave, the standards, systems, data and trained people stay with your company.',
    },
    deliverables: [
      { zh: '从一个高价值场景切入，2 ~ 4 周跑通第一个闭环', en: 'Start from one high-value scenario and complete the first closed loop in 2 to 4 weeks' },
      { zh: '每周一轮“观察-原型-试用-沉淀”，每周都有可用成果', en: 'One observe–prototype–trial–consolidate cycle each week, with usable output every week' },
      { zh: '按层验收：规则经业务审定、数据自动入库、AI 达到评测指标', en: 'Accepted layer by layer: rules approved by the business, data stored automatically, AI meets evaluation targets' },
      { zh: '源码、数据与文档归企业，同步培养内部 AI 骨干', en: 'Source code, data and documentation belong to your company, and internal AI leads are trained alongside' },
    ],
    courseId: 'E',
    caseName: {
      zh: '示例：一周内，询盘分级从凭经验判断变为 AI 按规则打标',
      en: 'Example: within one week, enquiry grading moves from gut feel to AI tagging by rules',
    },
    judgement: {
      zh: '没有标准化的智能化，只是把混乱自动化。AI 只会放大企业已有的秩序。',
      en: 'Intelligence without standardisation just automates the mess. AI only amplifies the order a company already has.',
    },
  },
];
const SUBSYSTEMS = SHOW_FDE ? ALL_SUBSYSTEMS : ALL_SUBSYSTEMS.filter((svc) => svc.key !== 'fde');

export const ServicesView: React.FC<ServicesViewProps> = ({
  onGoToCourse,
  onGoToAudit,
  onGoToConfigurator,
}) => {
  const { t, tb, lang } = useLang();

  const scrollToService = (code: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`service-${code}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div>
      <PageHeader
        eyebrow={t(`${SERVICE_COUNT_CN}项服务`, `${SERVICE_COUNT_EN} services`)}
        title={t(`${SERVICE_COUNT_CN}项服务，各解决一个卡点`, `${SERVICE_COUNT_EN} services, each solving one bottleneck`)}
        intro={t(
          `${SERVICE_COUNT_CN}项服务共用同一套企业资料：独立站、搜索、AI 推荐、客服和内部系统，各解决一个卡点，内容可以互相复用。`,
          'The services share one set of company material: websites, search, AI recommendations, customer service and internal systems. Each one solves a single bottleneck, and the content is reused across them.'
        )}
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
                    {t(`服务 ${svc.code} · 对应卡点：${tb(svc.friction)}`, `Service ${svc.code} · Pain point: ${tb(svc.friction)}`)}
                  </span>
                </div>
                <h2 id={`service-${svc.code}-title`} className="mt-5 text-title-1">
                  {/* 在括注前断行，避免窄屏把词组拆开 */}
                  {(lang === 'zh' ? titleText.split(/(?=（)/) : [titleText]).map((part) => (
                    <span key={part} className="inline-block">
                      {part}
                    </span>
                  ))}
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

              {/* FDE 需要讲清方法论：三层图横跨两栏，dense 排布让右侧栏回填第一行 */}
              {svc.key === 'fde' && <FdeBuildLayers className="lg:col-span-2" />}

              <aside className="well self-start" aria-label={t(`${titleText}：案例与下一步`, `${titleText}: case and next step`)}>
                <dl>
                  <dt className="text-caption text-label-secondary">{t('案例', 'Case')}</dt>
                  <dd className="mt-1 text-body">{tb(svc.caseName)}</dd>
                </dl>
                <button type="button" onClick={() => onGoToCourse(svc.courseId)} className="btn btn-secondary btn-block mt-6">
                  {t(`学习课程 ${svc.code}`, `Study course ${svc.code}`)}
                </button>
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
              '常见的起点是“独立站 + SEO + GEO”获客组合。组合后可以看到交付周期、阶段排期与交付物清单。',
              'A common starting point is the "website + SEO + GEO" lead-generation package. Once combined, you can see the delivery timeline, phased schedule and deliverables list.'
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
            <button type="button" onClick={onGoToAudit} className="btn btn-secondary btn-lg">
              {t('先做 AI 可见性测评', 'Run the AI visibility audit first')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
