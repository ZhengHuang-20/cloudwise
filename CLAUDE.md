# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

「云端智荐」—— 面向中国出海企业的 AI 售前支持系统与能力样板间（独立站 / SEO / GEO / AI 客服 / FDE 驻场五项服务）。项目由 Google AI Studio 导出（见 `metadata.json`），技术栈：React 19 + TypeScript + Vite 8 + Tailwind CSS v4，后端为同进程的 Express（`server.ts`），AI 能力来自服务端调用的 Gemini（`@google/genai`），Supabase 为可选的云同步。界面文案全部为简体中文，新增文案请保持中文。

**任何 UI 改动前先读 [`DESIGN.md`](./DESIGN.md)**（设计规范：token、组件、页面模板、文案与无障碍规则），改动后按其第 8 节评审清单自查。

## 常用命令

仓库使用 `bun.lock`，用 bun 安装依赖（npm 也可运行 scripts）。

```bash
bun install
bun run dev        # tsx server.ts：Express + Vite 中间件，默认 http://localhost:3000（PORT 可覆盖）
bun run lint       # tsc --noEmit —— 唯一的静态检查，没有 ESLint/Prettier
bun run build      # vite build → dist/
NODE_ENV=production bun run start   # 生产模式：Express 托管 dist/ 并做 SPA 回退
```

- 项目**没有测试框架和测试用例**；改动后用 `bun run lint` + `bun run build` 验证，涉及 API 时启动 dev 后 `curl localhost:3000/api/health`。UI 改动还应在 390px 与 1440px 两个宽度下截图检查（环境里有全局 Playwright，页面可直接用 `http://localhost:3000/#/<tab>` 打开）。
- `start` 与 `dev` 是同一条命令，只有设置 `NODE_ENV=production` 才会走静态托管分支，且需先 `build`。
- 不要单独用 `vite` / `vite preview` 调试 AI 功能：`/api/*` 路由只存在于 `server.ts`。
- 环境变量：复制 `.env.example` 为 `.env`（`.env*` 已被 gitignore）。`GEMINI_API_KEY`、`APP_URL`、`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`PORT` 均可缺省。

## 架构

### 服务端（`server.ts`）

单个 Express 进程同时提供 API 和前端：开发模式挂载 Vite middleware（`appType: 'spa'`），生产模式托管 `dist/`。

- `GET /api/health`、`POST /api/gemini/chat`（AI 售前顾问）、`POST /api/gemini/visibility-test`（AI 可见性 / GEO 测评）。
- Gemini 只在服务端调用，API key 不暴露给前端。模型为 `gemini-3.8-flash`，使用 `responseMimeType: 'application/json'`，提示词中内嵌期望的 JSON 结构。
- **每个 Gemini 接口都有确定性 fallback**：当 key 缺失或仍为占位值 `MY_GEMINI_API_KEY`、调用报错或 JSON 解析失败时，返回关键词匹配（chat）或固定 mock（visibility-test）的结果。因此不配 key 应用也能完整运行。
- 修改接口响应字段时需同步三处：提示词里的 JSON 模板、fallback 返回对象、前端消费方（`src/components/AiConsultantModal.tsx` 的 `ChatMessage`、`src/views/DiagnosisCenter.tsx`）。
- `SYSTEM_KNOWLEDGE_INSTRUCTION` 是 AI 顾问的「知识库」（服务、案例、报价规则、话术规则）。同样的业务事实还散落在 fallback 文案、`src/data/servicePackages.ts`、`src/data/caseStudiesData.ts` 和各 view 的文案中——改服务或案例时要一并更新。
- **站点不展示任何价格**：服务、套餐、方案空间、课程与 AI 顾问都不出现金额、预算区间、折扣或付款比例；知识库要求模型不报价，问到费用时引导到方案规划与诊断会。新增内容也不要写价格。

### 前端导航（无路由库）

- `src/App.tsx` 用 `currentTab` 状态条件渲染 `src/views/*`，并与地址栏 hash 同步（`#/services`），支持浏览器前进后退与分享链接；切页时滚到顶部并更新 `document.title`。
- `TabId` 类型、导航分组（了解 / 自测 / 决策）与短标签、全称都只定义在 `src/components/navigation.ts`，`Header`、`Footer` 与 App 的 hash 解析共用它。
- 页面间跳转通过 App 下发的回调 props（`onGoToConfigurator`、`onGoToBooking` 等）完成；`handleNavigateToConfigurator(prefill)` 可向配置器传入初始参数。
- 新增页面需同时改三处：新建 view（以 `PageHeader` 开头）、在 `App.tsx` 加渲染分支、在 `navigation.ts` 加导航项。
- 全局弹窗都在 `App.tsx` 渲染，外壳统一用 `src/components/ui/Dialog.tsx`（Esc、焦点圈定、滚动锁定已内置）。`AiConsultantModal` 由 context 控制（`setAiAdvisorOpen` / `triggerAiAdvisorWithQuery(query)` 可带预设问题打开，CRM 透视开关在弹窗标题栏），其余弹窗由 App 本地 state 控制。
- `Header` 的移动端菜单渲染在 `<header>` 之外：`backdrop-filter` 会让 header 成为 fixed 子元素的定位容器。

### 全局状态与持久化（`src/context/AppContext.tsx`）

- 单一 `AppProvider` / `useApp()` 管理用户、课程进度、诊断记录、方案草案、线索行为、toast 等全部共享状态。
- **本地优先**：所有状态持久化到 `localStorage`（键前缀 `cw_`），首次访问时注入演示数据（访客用户、示例诊断和方案）。
- **Supabase 仅作单向镜像**：写操作在 `getSupabase()` 返回 client 时以 fire-and-forget 方式 insert/upsert，失败只打 `console.warn`，从不从 Supabase 读回。凭据优先取 `localStorage` 的 `cw_supabase_url/key`（由 `SupabaseModal` 设置），其次取 `VITE_SUPABASE_*`；含占位域名时视为未配置。
- 登录是本地模拟的（`login()` 生成 `usr-<timestamp>` 形式的 id，不走 Supabase Auth），而 `supabase_schema.sql` 中 `profiles.id` 为 UUID 且外键指向 `auth.users`，RLS 依赖 `auth.uid()`。所以按现有 schema，云同步写入会被拒绝，接入真实鉴权前这是已知限制。
- 共享领域类型（`UserProfile`、`DiagnosisRecord`、`SavedProposal`、`LessonProgress`）定义在 `src/lib/supabase.ts`，没有单独的 types 文件。

### 线索评分漏斗

`logLeadActivity(action, scoreDelta, meta?)` 是售前漏斗的埋点入口：各 view 在关键交互时调用（诊断、保存方案、预约、高意向对话等）。`leadScore = 25 + Σ scoreDelta`，`currentStage` 据此和诊断/方案数量推导（≥30 为 MQL，≥45 为 SQL，≥60 且有诊断和方案为「商机」），由 `Header` 与 `SalesConsoleModal` 展示。`saveDiagnosis`、`saveProposalDraft`、`markLessonComplete` 内部已自动记录行为，不要在调用方重复记录。

### 静态内容

课程、案例、术语、资源、服务组合都是 `src/data/*.ts` 中的类型化常量。FDE 的方法论（标准化 → 信息化 → 智能化三层建设、每周“观察-原型-试用-沉淀”）集中在 `fdeData.ts`，服务页三层图与体验页「FDE 的一周」共用；课程 E、术语表和 `SYSTEM_KNOWLEDGE_INSTRUCTION` 中的同类表述要与之一致。方案规划页（`#/configurator`）的周期、交付物与阶段排期由 `servicePackages.ts` 的 `buildProposalPlan` 生成。内容类改动优先改这些数据文件，不要改组件。

## 样式约定（完整规范见 `DESIGN.md`）

- Tailwind v4 通过 `@tailwindcss/vite` 引入，没有 `tailwind.config`。设计 token 写在 `src/index.css` 的 `@theme` 中，会自动生成对应的工具类；组件类写在 `@layer components` 中。
- **只用语义 token，不写 hex、不用 Tailwind 默认色板**：颜色用 `bg-canvas` / `bg-surface` / `bg-surface-raised`、`text-label` / `text-label-secondary`、`border-separator`、`text-link`、`bg-accent`、`text-success|warning|danger`；字号用 `text-display|headline|title-1|title-2|title-3|intro|body|caption`（自带行高与字重）；圆角用 `rounded-tile|card|control`；缓动用 `ease-apple`。
- 组件类：`layout-wide|text|reading`、`section`、`page-header`、`eyebrow`、`tile` / `card` / `well`（加 `interactive` 可点击）、`btn` + `btn-primary|secondary|neutral` + `btn-sm|lg|block`、`btn-icon`、`link`、`field` / `field-label`、`chip`（`aria-pressed`）、`choice`（`aria-checked`）、`badge`、`meter`、`avatar`、`material`（仅悬浮层）。
- React 基础组件在 `src/components/ui/`：`Dialog` / `DialogBody`、`SegmentedControl`、`PageHeader`、`Slider`、`ScoreRing`、`Reveal`；分数配色用 `tone.ts` 的 `scoreTone`，五项服务的图标与识别色用 `serviceIdentity.ts`。
- 蓝色只用于可交互元素；卡片是平面纯色，不加描边、阴影、渐变和玻璃效果；数字用 `tabular-nums`，不用 `font-mono`；字重只用 400 / 600。
- 最小字号 14px（`text-caption`）。`index.css` 仍保留把 `.text-xs`、`.text-[10px]`～`.text-[13px]` 强制为 14px 的兜底规则，但新代码不要使用这些类。
- 不加载 Web 字体（Google Fonts 在国内不可用），字体栈为 SF Pro / 苹方 / 微软雅黑；`<html lang="zh-CN">`。
- 图标统一用 `lucide-react`（全局笔画 1.75），不要把图标装进带底色的小方块。

## 其他注意事项

- **FDE 展示开关**：`src/lib/features.ts` 的 `SHOW_FDE`（当前为 `true`，对外展示）同时控制前端与 `server.ts`。关闭时服务页、首页、课程 E、术语、资源、体验页、方案规划与 AI 顾问都不出现 FDE，“五项服务 / 五门课”随 `SERVICE_COUNT_CN` 变为“四”。新增涉及 FDE 或服务数量的文案也要走这个开关；`index.html` 的 description 读不到开关，需手动同步。
- `vite.config.ts` 中 HMR 与文件监听由 `DISABLE_HMR` 控制，这是 AI Studio 环境需要的，注释要求不要修改。
- 路径别名 `@/` 指向**仓库根目录**而不是 `src/`（`vite.config.ts` 与 `tsconfig.json` 一致）；现有代码均使用相对路径导入。
- `bun run build` 会提示主 chunk 超过 500 kB，目前没有代码分割，属已知现象。
