import { COURSE_COUNT_CN, COURSE_COUNT_EN } from '../lib/features';
import type { Bi } from '../lib/i18n';

/**
 * 全站导航的唯一数据源：Header、Footer 都从这里取。页面地址与路由表见 src/site/routes.ts。
 * 顶部导航直接列出三项核心服务（NAV_SERVICES，悬停展开简介），其后是案例与免费测评；学院、洞察、术语、方案规划与方案空间放进「更多」。
 */
export type TabId =
  | 'home'
  | 'services'
  | 'cases'
  | 'academy'
  | 'insights'
  | 'glossary'
  | 'audit'
  | 'configurator'
  | 'deal-room'
  | 'login'
  | 'console';

export interface NavItem {
  id: TabId;
  /** 不带语言前缀的地址，用 useLang().path() 加前缀 */
  href: string;
  /** 导航栏短标签：2–4 个字 */
  label: Bi;
  /** 页脚与移动端菜单中的完整名称 */
  fullLabel: Bi;
  desc: Bi;
}

export interface NavGroup {
  title: Bi;
  items: NavItem[];
}

/** 三项核心服务：直接放在顶部导航，悬停或聚焦时展开简介（Header） */
export interface NavService extends NavItem {
  /** 展开面板里的一句话介绍 */
  intro: Bi;
  /** 展开面板里的要点（只写站内已有依据的内容） */
  points: Bi[];
}

export const NAV_SERVICES: NavService[] = [
  {
    id: 'services',
    href: '/services/geo',
    label: { zh: '出海 GEO', en: 'Export GEO' },
    fullLabel: { zh: '出海 GEO', en: 'Export GEO' },
    desc: { zh: '让 ChatGPT、Perplexity、Gemini 引用并推荐你的品牌', en: 'Get ChatGPT, Perplexity and Gemini to cite and recommend your brand' },
    intro: {
      zh: '把专利、认证与工程案例整理成 AI 能查证、愿意引用的公开资料，提高海外买家问 AI 时你被推荐的机会，每月复测。',
      en: 'We turn patents, certifications and engineering cases into public material AI can verify and cite, raising the chance you are recommended when overseas buyers ask AI. Re-tested monthly.',
    },
    points: [
      { zh: '两种合作方式：基础服务费，或按线索收费', en: 'Two ways to work together: a base service fee, or pay per lead' },
      { zh: '六步闭环：诊断、建模、内容、信源、口碑、监测', en: 'Six-step loop: diagnose, model, content, sources, reputation, monitoring' },
    ],
  },
  {
    id: 'services',
    href: '/services/seo-website',
    label: { zh: 'SEO 与建站', en: 'SEO & website' },
    fullLabel: { zh: 'SEO 与建站', en: 'SEO and website' },
    desc: { zh: '海外独立站加外贸 SEO，让买家搜得到、看得懂', en: 'Overseas website plus export SEO, so buyers can find and understand you' },
    intro: {
      zh: '按采购、技术、合规三类读者建设海外独立站，再用一词一页的核心词库做外贸 SEO。官网也是 GEO 的底座。',
      en: 'An overseas website built for procurement, technical and compliance readers, plus export SEO with a one-page-per-term keyword library. The website is also the foundation of GEO.',
    },
    points: [
      { zh: '案例：爱康医疗新建海外官网，Google 搜索近 3 个月 272 次点击（Search Console）', en: 'Case: the new Aikang Medical overseas site, 272 Google Search clicks in 3 months (Search Console)' },
      { zh: '内置结构化数据，Core Web Vitals 达标为目标', en: 'Built-in structured data, with Core Web Vitals as the target' },
    ],
  },
  {
    id: 'services',
    href: '/services/ai-customer-service',
    label: { zh: 'AI 客服', en: 'AI customer service' },
    fullLabel: { zh: 'AI 智能客服', en: 'AI customer service' },
    desc: { zh: '多语种接待海外询盘，识别意向并同步 CRM', en: 'Multilingual replies to overseas enquiries, with intent grading synced to your CRM' },
    intro: {
      zh: '依据企业自己的参数库，用多语种回答公差、认证、交期；超出资料范围的问题转给销售，高意向线索即时推送。',
      en: 'Using your own parameter library, it answers tolerance, certification and lead-time questions in several languages, passes anything beyond the material to sales, and pushes high-intent leads instantly.',
    },
    points: [
      { zh: '官网、邮件、WhatsApp 等渠道接入', en: 'Connects to your website, email, WhatsApp and more' },
      { zh: '线索推送到企业微信与 CRM', en: 'Leads pushed to WeCom and your CRM' },
    ],
  },
];

const ITEM = {
  cases: {
    id: 'cases',
    href: '/cases',
    label: { zh: '案例', en: 'Cases' },
    fullLabel: { zh: '标杆案例', en: 'Case studies' },
    desc: { zh: '爱康医疗、泰宁科创实战拆解', en: 'Field breakdowns from Aikang Medical and Taining Tech' },
  },
  audit: {
    id: 'audit',
    href: '/audit',
    label: { zh: '免费测评', en: 'Free audit' },
    fullLabel: { zh: 'AI 可见性测评', en: 'AI visibility audit' },
    desc: { zh: '免费查看 ChatGPT、Perplexity、Gemini 是否推荐你', en: 'Free check: do ChatGPT, Perplexity and Gemini recommend you' },
  },
  academy: {
    id: 'academy',
    href: '/academy',
    label: { zh: '学院', en: 'Academy' },
    fullLabel: { zh: '出海学院', en: 'Export Academy' },
    desc: { zh: `${COURSE_COUNT_CN}门专业课，按角色学习`, en: `${COURSE_COUNT_EN} courses, learn by role` },
  },
  insights: {
    id: 'insights',
    href: '/insights',
    label: { zh: '洞察', en: 'Insights' },
    fullLabel: { zh: 'GEO 洞察', en: 'GEO insights' },
    desc: { zh: '出海 SEO / GEO 的方法与实操文章', en: 'Methods and practical guides for export SEO and GEO' },
  },
  glossary: {
    id: 'glossary',
    href: '/glossary',
    label: { zh: '术语', en: 'Glossary' },
    fullLabel: { zh: '术语百科', en: 'Glossary' },
    desc: { zh: '一问一答讲清 SEO、GEO 与 AI 出海概念', en: 'SEO, GEO and AI export concepts, one question at a time' },
  },
  configurator: {
    id: 'configurator',
    href: '/configurator',
    label: { zh: '规划', en: 'Plan' },
    fullLabel: { zh: '方案规划', en: 'Project planner' },
    desc: { zh: '组合服务，查看周期与交付物', en: 'Combine services, review timelines and deliverables' },
  },
  'deal-room': {
    id: 'deal-room',
    href: '/deal-room',
    label: { zh: '方案空间', en: 'Project room' },
    fullLabel: { zh: '方案空间', en: 'Project room' },
    desc: { zh: '行动计划、答疑与在线签约', en: 'Action plan, Q&A and online contract signing' },
  },
} satisfies Record<string, NavItem>;

/** 顶部导航：三项服务之后紧跟的入口 */
export const NAV_PRIMARY: NavItem[] = [ITEM.cases, ITEM.audit];

/** 顶部导航「更多」菜单：学习与规划类入口，不占核心导航位置 */
export const NAV_MORE: NavItem[] = [ITEM.academy, ITEM.insights, ITEM.glossary, ITEM.configurator, ITEM['deal-room']];

/** 页脚与移动端菜单的分组 */
export const NAV_GROUPS: NavGroup[] = [
  { title: { zh: '核心服务', en: 'Core services' }, items: NAV_SERVICES },
  { title: { zh: '案例与测评', en: 'Cases and audit' }, items: NAV_PRIMARY },
  { title: { zh: '了解更多', en: 'Learn more' }, items: NAV_MORE },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/** 只在页脚出现的页面 */
export const FOOTER_EXTRA: { href: string; label: Bi }[] = [
  { href: '/about', label: { zh: '关于我们', en: 'About us' } },
];
