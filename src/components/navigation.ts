import { SERVICE_COUNT_CN, SHOW_FDE } from '../lib/features';

/**
 * 全站导航的唯一数据源：Header、Footer、App 的地址同步都从这里取。
 * 顺序按买家旅程分组：了解 → 自测 → 决策（DESIGN.md §5.3）。
 */
export type TabId =
  | 'home'
  | 'services'
  | 'cases'
  | 'academy'
  | 'resources'
  | 'diagnosis'
  | 'sandbox'
  | 'configurator'
  | 'deal-room';

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
    title: '自测',
    items: [
      { id: 'diagnosis', label: '体检', fullLabel: '断点体检', desc: '12 项断点自测与 AI 可见性测评' },
      { id: 'sandbox', label: '体验', fullLabel: '能力体验', desc: '亲手试用 AI 客服与数据看板' },
    ],
  },
  {
    title: '决策',
    items: [
      { id: 'configurator', label: '预算', fullLabel: '预算测算', desc: '组合方案，估算预算与周期' },
      { id: 'deal-room', label: '方案空间', fullLabel: '方案空间', desc: '行动计划、报价与在线签约' },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

const TAB_IDS: string[] = ['home', ...NAV_ITEMS.map((item) => item.id)];

export const isTabId = (value: string): value is TabId => TAB_IDS.includes(value);

export const tabTitle = (tab: TabId) => NAV_ITEMS.find((item) => item.id === tab)?.fullLabel;
