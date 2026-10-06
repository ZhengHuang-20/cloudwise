export { createAudit as POST } from '../../../../src/server/routes/audits';
export { publicPreflight as OPTIONS } from '../../../../src/server/routes/analytics';

// 测评在响应返回后继续执行（after），整个任务需要在这个时长内完成，见 src/server/audit.ts
export const maxDuration = 300;
