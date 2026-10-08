import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';
import type { Bi } from '../lib/i18n';

/**
 * 全站导航的唯一数据源：Header、Footer 都从这里取。页面地址与路由表见 src/site/routes.ts。
 * 顺序按买家旅程分组：了解 → 决策（DESIGN.md §4.5）。
 */
export type TabId =
  | 'home'
  | 'services'
  | 'cases'
  | 'academy'
  | 'insights'
  | 'glossary'
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

export const NAV_GROUPS: NavGroup[] = [
  {
    title: { zh: '了解', en: 'Learn' },
    items: [
      {
        id: 'services',
        href: '/services',
        label: { zh: '服务', en: 'Services' },
        fullLabel: { zh: `${SERVICE_COUNT_CN}项服务`, en: `${SERVICE_COUNT_EN} services` },
        desc: SHOW_FDE
          ? { zh: '独立站、SEO、GEO、AI 客服与 FDE 驻场', en: 'Websites, SEO, GEO, AI customer service and FDE on-site' }
          : { zh: '独立站、SEO、GEO 与 AI 客服', en: 'Websites, SEO, GEO and AI customer service' },
      },
      {
        id: 'cases',
        href: '/cases',
        label: { zh: '案例', en: 'Cases' },
        fullLabel: { zh: '标杆案例', en: 'Case studies' },
        desc: { zh: '爱康医疗、泰宁科创实战拆解', en: 'Field breakdowns from Aikang Medical and Taining Tech' },
      },
      {
        id: 'academy',
        href: '/academy',
        label: { zh: '学院', en: 'Academy' },
        fullLabel: { zh: '出海学院', en: 'Export Academy' },
        desc: { zh: `${SERVICE_COUNT_CN}门专业课，按角色学习`, en: `${SERVICE_COUNT_EN} courses, learn by role` },
      },
      {
        id: 'insights',
        href: '/insights',
        label: { zh: '洞察', en: 'Insights' },
        fullLabel: { zh: 'GEO 洞察', en: 'GEO insights' },
        desc: { zh: '出海 SEO / GEO 的方法与实操文章', en: 'Methods and practical guides for export SEO and GEO' },
      },
      {
        id: 'glossary',
        href: '/glossary',
        label: { zh: '术语', en: 'Glossary' },
        fullLabel: { zh: '术语百科', en: 'Glossary' },
        desc: { zh: '一问一答讲清 SEO、GEO 与 AI 出海概念', en: 'SEO, GEO and AI export concepts, one question at a time' },
      },
    ],
  },
  {
    title: { zh: '决策', en: 'Decide' },
    items: [
      {
        id: 'configurator',
        href: '/configurator',
        label: { zh: '规划', en: 'Plan' },
        fullLabel: { zh: '方案规划', en: 'Project planner' },
        desc: { zh: '组合服务，查看周期与交付物', en: 'Combine services, review timelines and deliverables' },
      },
      {
        id: 'deal-room',
        href: '/deal-room',
        label: { zh: '方案空间', en: 'Project room' },
        fullLabel: { zh: '方案空间', en: 'Project room' },
        desc: { zh: '行动计划、答疑与在线签约', en: 'Action plan, Q&A and online contract signing' },
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/** 只在页脚出现的页面 */
export const FOOTER_EXTRA: { href: string; label: Bi }[] = [
  { href: '/audit', label: { zh: 'AI 可见性测评', en: 'AI visibility audit' } },
  { href: '/about', label: { zh: '关于我们', en: 'About us' } },
];
