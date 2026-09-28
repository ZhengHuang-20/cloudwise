/**
 * 站点功能开关。前端各 view、数据文件与 server.ts（AI 顾问知识库与 fallback）共用。
 *
 * SHOW_FDE：是否对外展示 FDE 驻场服务。为 false 时，服务页、首页、课程 E、术语、资源、
 * 方案规划与 AI 顾问都不再出现 FDE，“五项服务”相应变为“四项服务”。FDE 的文案与数据全部保留，
 * 切换时还要手动同步 index.html 的 description（“五项服务 / 四项服务”，静态 HTML 读不到这个开关）。
 */
export const SHOW_FDE = true;

/** 对外展示的服务数（每项服务对应一门学院课程），用于“五项服务”“五门课”这类文案 */
export const SERVICE_COUNT_CN = SHOW_FDE ? '五' : '四';
