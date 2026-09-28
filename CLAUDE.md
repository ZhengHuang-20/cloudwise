# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

「云端智荐」—— 面向中国出海企业的 AI 售前支持系统与能力样板间（独立站 / SEO / GEO / AI 客服 / FDE 驻场五项服务）。项目由 Google AI Studio 导出（见 `metadata.json`），技术栈：React 19 + TypeScript + Vite 8 + Tailwind CSS v4，后端为同进程的 Express（`server.ts`），AI 能力来自服务端调用的 Gemini（`@google/genai`），Supabase 为可选的云同步。界面文案全部为简体中文，新增文案请保持中文。

## 常用命令

仓库使用 `bun.lock`，用 bun 安装依赖（npm 也可运行 scripts）。

```bash
bun install
bun run dev        # tsx server.ts：Express + Vite 中间件，默认 http://localhost:3000（PORT 可覆盖）
bun run lint       # tsc --noEmit —— 唯一的静态检查，没有 ESLint/Prettier
bun run build      # vite build → dist/
NODE_ENV=production bun run start   # 生产模式：Express 托管 dist/ 并做 SPA 回退
```

- 项目**没有测试框架和测试用例**；改动后用 `bun run lint` + `bun run build` 验证，涉及 API 时启动 dev 后 `curl localhost:3000/api/health`。
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
- `SYSTEM_KNOWLEDGE_INSTRUCTION` 是 AI 顾问的「知识库」（服务、案例、价格区间、话术规则）。同样的业务事实还散落在 fallback 文案、`src/data/pricingRules.ts`、`src/data/caseStudiesData.ts` 和各 view 的文案中——改价格或案例时要一并更新。

### 前端导航（无路由库）

- `src/App.tsx` 用 `currentTab` 字符串状态条件渲染 `src/views/*`；tab id 与导航项定义在 `src/components/Header.tsx`。
- 页面间跳转通过 App 下发的回调 props（`onGoToConfigurator`、`onGoToBooking` 等）完成；`handleNavigateToConfigurator(prefill)` 可向配置器传入初始参数。
- 新增页面需同时改三处：新建 view、在 `App.tsx` 加渲染分支、在 `Header.tsx` 加导航项。
- 全局弹窗都在 `App.tsx` 渲染：`AiConsultantModal` 由 context 控制（`setAiAdvisorOpen` / `triggerAiAdvisorWithQuery(query)` 可带预设问题打开），其余弹窗由 App 本地 state 控制。

### 全局状态与持久化（`src/context/AppContext.tsx`）

- 单一 `AppProvider` / `useApp()` 管理用户、课程进度、诊断记录、方案草案、线索行为、toast 等全部共享状态。
- **本地优先**：所有状态持久化到 `localStorage`（键前缀 `cw_`），首次访问时注入演示数据（访客用户、示例诊断和方案）。
- **Supabase 仅作单向镜像**：写操作在 `getSupabase()` 返回 client 时以 fire-and-forget 方式 insert/upsert，失败只打 `console.warn`，从不从 Supabase 读回。凭据优先取 `localStorage` 的 `cw_supabase_url/key`（由 `SupabaseModal` 设置），其次取 `VITE_SUPABASE_*`；含占位域名时视为未配置。
- 登录是本地模拟的（`login()` 生成 `usr-<timestamp>` 形式的 id，不走 Supabase Auth），而 `supabase_schema.sql` 中 `profiles.id` 为 UUID 且外键指向 `auth.users`，RLS 依赖 `auth.uid()`。所以按现有 schema，云同步写入会被拒绝，接入真实鉴权前这是已知限制。
- 共享领域类型（`UserProfile`、`DiagnosisRecord`、`SavedProposal`、`LessonProgress`）定义在 `src/lib/supabase.ts`，没有单独的 types 文件。

### 线索评分漏斗

`logLeadActivity(action, scoreDelta, meta?)` 是售前漏斗的埋点入口：各 view 在关键交互时调用（诊断、保存方案、预约、高意向对话等）。`leadScore = 25 + Σ scoreDelta`，`currentStage` 据此和诊断/方案数量推导（≥30 为 MQL，≥45 为 SQL，≥60 且有诊断和方案为「商机」），由 `Header` 与 `SalesConsoleModal` 展示。`saveDiagnosis`、`saveProposalDraft`、`markLessonComplete` 内部已自动记录行为，不要在调用方重复记录。

### 静态内容

课程、案例、术语、资源、套餐定价都是 `src/data/*.ts` 中的类型化常量。预算配置器的计算逻辑在 `pricingRules.ts` 的 `calculateProposalEstimate`。内容类改动优先改这些数据文件，不要改组件。

## 样式约定

- Tailwind v4 通过 `@tailwindcss/vite` 引入，没有 `tailwind.config`；主题与自定义类都在 `src/index.css`。
- 仅深色、Apple HIG 风格。优先复用 `index.css` 中的工具类：`apple-glass`、`apple-glass-card`、`apple-blue-btn`、`apple-secondary-btn`、`apple-segmented-track` / `apple-segmented-item-active`、`apple-hero-title`、`apple-section-title`、`apple-eyebrow`、`apple-stat-number` 等。颜色直接写 hex（如 `#2997ff`、`#0071e3`、`#86868b`、`#30d158`）。
- `index.css` 用 `!important` 把 `.text-xs` 和 `.text-[10px]`～`.text-[13px]` 统一强制为 14px（「最小字号 14px」规则），这些类不会让文字变得更小，层级应通过颜色对比区分。
- 图标统一用 `lucide-react`。

## 其他注意事项

- `vite.config.ts` 中 HMR 与文件监听由 `DISABLE_HMR` 控制，这是 AI Studio 环境需要的，注释要求不要修改。
- 路径别名 `@/` 指向**仓库根目录**而不是 `src/`（`vite.config.ts` 与 `tsconfig.json` 一致）；现有代码均使用相对路径导入。
- `bun run build` 会提示主 chunk 超过 500 kB，目前没有代码分割，属已知现象。
