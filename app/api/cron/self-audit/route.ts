export { selfAudit as GET } from '../../../../src/server/routes/cron';

// 测评在响应返回后继续执行（after），与公开测评接口相同的时长限制，见 src/server/audit.ts
export const maxDuration = 300;
