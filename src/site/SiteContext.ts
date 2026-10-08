import { createContext, useContext } from 'react';

/**
 * 官网页面之间的跳转与全局弹窗（SiteShell 提供）。页面在服务端渲染时由 RouteView 选择，
 * 回调不能从服务端组件传下来，所以页面通过 useSite() 取得这些操作。
 */
export interface SiteActions {
  /** 跳到站内路径（不带语言前缀，例如 '/services'） */
  navigate: (path: string) => void;
  openBooking: () => void;
  openMySpace: () => void;
  /** 打开 AI 可见性测评页 */
  goToAudit: () => void;
  /** 带初始参数打开方案规划 */
  goToConfigurator: (prefill?: Record<string, unknown>) => void;
  /** 方案规划的初始参数（跳转前设置，进入页面后读取） */
  configuratorPrefill: Record<string, unknown> | null;
  /** 课程「下一步」与配套工具按目标分流（方案规划 / 预约 / 测评） */
  goToCourseTarget: (targetId: string) => void;
}

export const SiteContext = createContext<SiteActions | null>(null);

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite 必须在 SiteShell 内使用');
  return ctx;
};
