import dynamic from 'next/dynamic';

/**
 * 测评组件较大（约 1000 行），单独拆包：只有首页与 /audit 渲染时才加载，其他页面的脚本里不再带着它。
 * 不关 SSR，服务端仍输出完整的测评表单 HTML。
 */
export const VisibilityAudit = dynamic(() => import('./VisibilityAudit').then((m) => m.VisibilityAudit));
