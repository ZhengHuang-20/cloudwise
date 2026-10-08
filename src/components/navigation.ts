import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';
import { Bi, Lang, pick } from '../context/LanguageContext';

/**
 * 全站导航的唯一数据源：Header、Footer、App 的地址同步都从这里取。
 * 顺序按买家旅程分组：了解 → 决策（DESIGN.md §4.5）。自测工具只有首页的 AI 可见性测评，不单独成页。
 */
export type TabId =
  | 'home'
  | 'services'
  | 'cases'
  | 'academy'
  | 'resources'
  | 'configurator'
  | 'deal-room'
  | 'login'
  | 'console';

export interface NavItem {
  id: TabId;
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
        label: { zh: '服务', en: 'Services' },
        fullLabel: { zh: `${SERVICE_COUNT_CN}项服务`, en: `${SERVICE_COUNT_EN} services` },
        desc: SHOW_FDE
          ? { zh: '独立站、SEO、GEO、AI 客服与 FDE 驻场', en: 'Websites, SEO, GEO, AI customer service and FDE on-site' }
          : { zh: '独立站、SEO、GEO 与 AI 客服', en: 'Websites, SEO, GEO and AI customer service' },
      },
      {
        id: 'cases',
        label: { zh: '案例', en: 'Cases' },
        fullLabel: { zh: '标杆案例', en: 'Case studies' },
        desc: { zh: '爱康医疗、泰宁科创实战拆解', en: 'Field breakdowns from Aikang Medical and Taining Tech' },
      },
      {
        id: 'academy',
        label: { zh: '学院', en: 'Academy' },
        fullLabel: { zh: '出海学院', en: 'Export Academy' },
        desc: { zh: `${SERVICE_COUNT_CN}门专业课，按角色学习`, en: `${SERVICE_COUNT_EN} courses, learn by role` },
      },
      {
        id: 'resources',
        label: { zh: '资源', en: 'Resources' },
        fullLabel: { zh: '模板与术语', en: 'Templates & glossary' },
        desc: { zh: '实战模板、白皮书与术语百科', en: 'Working templates, white papers and a glossary' },
      },
    ],
  },
  {
    title: { zh: '决策', en: 'Decide' },
    items: [
      {
        id: 'configurator',
        label: { zh: '规划', en: 'Plan' },
        fullLabel: { zh: '方案规划', en: 'Project planner' },
        desc: { zh: '组合服务，查看周期与交付物', en: 'Combine services, review timelines and deliverables' },
      },
      {
        id: 'deal-room',
        label: { zh: '方案空间', en: 'Project room' },
        fullLabel: { zh: '方案空间', en: 'Project room' },
        desc: { zh: '行动计划、答疑与在线签约', en: 'Action plan, Q&A and online contract signing' },
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

// 账号相关页面不进导航，入口在 Header 右侧的「登录 / 客户后台」
const HIDDEN_TITLES: Partial<Record<TabId, Bi>> = {
  login: { zh: '登录', en: 'Sign in' },
  console: { zh: '客户后台', en: 'Client console' },
};

const TAB_IDS: string[] = ['home', ...NAV_ITEMS.map((item) => item.id), ...Object.keys(HIDDEN_TITLES)];

export const isTabId = (value: string): value is TabId => TAB_IDS.includes(value);

export const tabTitle = (tab: TabId, lang: Lang): string => {
  const item = NAV_ITEMS.find((i) => i.id === tab);
  if (item) return pick(item.fullLabel, lang);
  const hidden = HIDDEN_TITLES[tab];
  return hidden ? pick(hidden, lang) : '';
};
