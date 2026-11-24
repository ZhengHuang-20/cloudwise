/**
 * 站点功能开关。前端各 view、数据文件与服务端 src/server（AI 顾问知识库与 fallback）共用；
 * 服务端可用 SHOW_FDE 环境变量覆盖。
 *
 * SHOW_FDE：是否对外展示 FDE 驻场服务。为 false 时，服务页、首页、课程 E、术语、资源、
 * 方案规划、AI 顾问与页面 description（app/layout.tsx）都不再出现 FDE，“五项服务”相应变为“四项服务”。
 * FDE 的文案与数据全部保留。
 */
export const SHOW_FDE = false;

/**
 * 对外展示的核心服务数：GEO、SEO 与建站、AI 客服（开启 FDE 时再加一项）。
 * 注意：学院课程仍是按 A–D（E）分开的，课程数见 COURSE_COUNT_*。
 */
export const SERVICE_COUNT_CN = SHOW_FDE ? '四' : '三';

/** 英文文案里的服务数：Four / Three（句中用 toLowerCase()） */
export const SERVICE_COUNT_EN = SHOW_FDE ? 'Four' : 'Three';

/** 学院课程数：独立站、SEO、GEO、AI 客服各一门（开启 FDE 时加课程 E） */
export const COURSE_COUNT_CN = SHOW_FDE ? '五' : '四';
export const COURSE_COUNT_EN = SHOW_FDE ? 'Five' : 'Four';
