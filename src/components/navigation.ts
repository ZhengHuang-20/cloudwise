import { SERVICE_COUNT_CN, SHOW_FDE } from '../lib/features';

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
  label: string;
  /** 页脚与移动端菜单中的完整名称 */
  fullLabel: string;
  desc: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: '了解',
    items: [
      {
        id: 'services',
        label: '服务',
        fullLabel: `${SERVICE_COUNT_CN}项服务`,
        desc: SHOW_FDE ? '独立站、SEO、GEO、AI 客服与 FDE 驻场' : '独立站、SEO、GEO 与 AI 客服',
      },
      { id: 'cases', label: '案例', fullLabel: '标杆案例', desc: '爱康医疗、泰宁科创实战拆解' },
      { id: 'academy', label: '学院', fullLabel: '出海学院', desc: `${SERVICE_COUNT_CN}门专业课，按角色学习` },
      { id: 'resources', label: '资源', fullLabel: '模板与术语', desc: '实战模板、白皮书与术语百科' },
    ],
  },
  {
    title: '决策',
    items: [
      { id: 'configurator', label: '规划', fullLabel: '方案规划', desc: '组合服务，查看周期与交付物' },
      { id: 'deal-room', label: '方案空间', fullLabel: '方案空间', desc: '行动计划、答疑与在线签约' },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

// 账号相关页面不进导航，入口在 Header 右侧的「登录 / 客户后台」
const HIDDEN_TITLES: Partial<Record<TabId, string>> = { login: '登录', console: '客户后台' };

const TAB_IDS: string[] = ['home', ...NAV_ITEMS.map((item) => item.id), ...Object.keys(HIDDEN_TITLES)];

export const isTabId = (value: string): value is TabId => TAB_IDS.includes(value);

export const tabTitle = (tab: TabId) => NAV_ITEMS.find((item) => item.id === tab)?.fullLabel ?? HIDDEN_TITLES[tab];
