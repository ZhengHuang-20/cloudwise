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
- `bun.lock` 是 `lockfileVersion: 2`（bun 1.4+ 生成）。增删依赖要用 bun ≥ 1.4；旧版 bun（如 1.3）会把整个 lockfile 重写成旧格式，这种改动不要提交。
- `start` 与 `dev` 是同一条命令，只有设置 `NODE_ENV=production` 才会走静态托管分支，且需先 `build`。
- 不要单独用 `vite` / `vite preview` 调试 AI 功能：`/api/*` 路由只存在于 `server.ts`。
- 环境变量：复制 `.env.example` 为 `.env`（`.env*` 已被 gitignore）。`GEMINI_API_KEY`、`APP_URL`、`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`PORT` 均可缺省。

## 架构

### 服务端（`server.ts`）

单个 Express 进程同时提供 API 和前端：开发模式挂载 Vite middleware（`appType: 'spa'`），生产模式托管 `dist/`。

- `GET /api/health`、`POST /api/gemini/chat`（AI 售前顾问）、`POST /api/gemini/visibility-test`（AI 可见性 / GEO 测评）。
- Gemini 只在服务端调用，API key 不暴露给前端。模型为 `gemini-3.8-flash`，使用 `responseMimeType: 'application/json'`，提示词中内嵌期望的 JSON 结构。
- **每个 Gemini 接口都有确定性 fallback**：当 key 缺失或仍为占位值 `MY_GEMINI_API_KEY`、调用报错或 JSON 解析失败时，返回关键词匹配（chat）或固定 mock（visibility-test）的结果。因此不配 key 应用也能完整运行。
- 修改接口响应字段时需同步三处：提示词里的 JSON 模板、fallback 返回对象、前端消费方（`src/components/AiConsultantModal.tsx` 的 `ChatMessage`）。
- `SYSTEM_KNOWLEDGE_INSTRUCTION` 是 AI 顾问的「知识库」（服务、案例、报价规则、话术规则）。同样的业务事实还散落在 fallback 文案、`src/data/servicePackages.ts`、`src/data/caseStudiesData.ts` 和各 view 的文案中——改服务或案例时要一并更新。
- **站点不展示任何价格**：服务、套餐、方案空间、课程与 AI 顾问都不出现金额、预算区间、折扣或付款比例；知识库要求模型不报价，问到费用时引导到方案规划与诊断会。新增内容也不要写价格。

### Go 后端（`server/`，迁移中）

正在把后端从 Node（`server.ts`）迁到 Go（标准库 `net/http` + MySQL 8.4），目标是同时承载售前站点与客户后台（访问量、留言）。迁移期间 `server.ts` 与 Go 服务并存，接口路径与响应格式保持一致；前端切换并验证后再删除 `server.ts` 与 Supabase。

- 命令：`bun run dev:api`（Go，默认 `:8080`）、`bun run dev:web`（单独 vite，`/api` 代理到 Go）、`bun run build:api`（产物 `bin/cloudwise-server`）；`cd server && go run . create-admin <email>` 创建管理员并打印一次性初始密码，`go run . migrate` 只跑迁移。
- 配置全走环境变量（见 `.env.example`）：模型统一 `gemini-3.1-flash-lite`（`GEMINI_MODEL` 可覆盖）；未配 `GEMINI_API_KEY` 走与 Node 版一致的确定性 fallback；未配 `MYSQL_DATABASE` 时只提供 AI 接口，账号/后台接口返回 503。`SHOW_FDE` 读环境变量，否则读取 `src/lib/features.ts`。
- 知识库与 fallback 文案在 `server/knowledge.go`、`server/ai.go`，与 `server.ts` 是同一份业务事实，迁移期间改动要两边同步。
- 数据库：迁移文件在 `server/migrations/`，按文件名顺序执行，时间一律 UTC 由 Go 传参。账号由管理员创建（不开放注册），密码 argon2id，会话为 HttpOnly cookie + `X-CSRF-Token`，首次登录必须改密，连续 5 次失败锁定 15 分钟。客户只能访问 `site_members` 授权的站点，所有站点数据查询都必须经过它。
- **部署**：`.github/workflows/deploy.yml` 在 push 到 `main` 时 SSH 到服务器执行强制命令 `deploy`（服务器上的脚本：`git reset --hard origin/main` → `docker compose build` → `up -d --force-recreate` → 健康检查）。构建所需的 `Dockerfile`、`compose.yaml` 在仓库根目录，随 `git reset --hard` 落到服务器，**不需要登录服务器改任何文件**。`compose.yaml` 使用 `network_mode: host`，服务只监听 `127.0.0.1:3000`（反向代理转发），容器里的 `127.0.0.1:3306` 就是服务器上的 MySQL。
- **运行时密钥的传递**：SSH 是强制命令，不能传文件，所以工作流把 GitHub Secrets 编码成 hex 拼在命令后面（`deploy CW_ENV=<hex>`）；服务器脚本运行在该 SSH 会话里，`SSH_ORIGINAL_COMMAND` 被 `docker compose` 继承，经 `compose.yaml` 的 `CW_DEPLOY_ENV` 交给容器，后端启动时解出并保存到 `/state` 卷（`server/config.go` 的 `loadDeployEnv`，仅接受 `GEMINI_` / `MYSQL_` / `CW_ADMIN_` / `COOKIE_` / `TRUST_` / `SHOW_FDE` 前缀）。手动在服务器上重新部署（命令不带密钥）时沿用卷里上次保存的配置。命令里含密钥，工作流和脚本都不能回显它。所需 Secrets 列在 `deploy.yml` 步骤③的注释里：`MYSQL_APP_PASSWORD`、（首次）`MYSQL_ADMIN_USER` / `MYSQL_ADMIN_PASSWORD`、可选 `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` / `GEMINI_API_KEY`。
- **数据库自动初始化**（`server/bootstrap.go`）：有管理员账号时幂等地建库、建专用账号（`cloudwise`，同时建在 `localhost` 与 `127.0.0.1`）并授权，然后跑迁移，再按 `CW_ADMIN_*` 创建首个管理员（只创建不修改）。管理员数据库账号与初始管理员密码只在本次启动生效，不写入 `/state`。初始化失败不会让进程退出：站点与 AI 接口照常提供，`/api/health` 的 `dbStatus` / `dbIssue`（阶段 + MySQL 错误码，不含敏感信息）说明原因，工作流的健康检查会据此让任务失败。
- 已有接口：`/api/auth/*`（登录、登出、me、改密）、`/api/sites`（我的站点）、`/api/admin/*`（公司、账号、站点、授权）。站点访问统计采集（`/collect`）与留言是后续步骤。

### 前端导航（无路由库）

- `src/App.tsx` 用 `currentTab` 状态条件渲染 `src/views/*`，并与地址栏 hash 同步（`#/services`），支持浏览器前进后退与分享链接；切页时滚到顶部并更新 `document.title`。
- `TabId` 类型、导航分组（了解 / 决策）与短标签、全称都只定义在 `src/components/navigation.ts`，`Header`、`Footer` 与 App 的 hash 解析共用它。
- 页面间跳转通过 App 下发的回调 props（`onGoToConfigurator`、`onGoToAudit`、`onGoToBooking` 等）完成；`handleNavigateToConfigurator(prefill)` 可向配置器传入初始参数。
- **站内唯一的自测工具是首页的 AI 可见性测评**（`HomeView` 的 `#audit` 区块，结果为本地模拟数据）；原「断点体检」「能力体验」页已删除。其他页面与课程要引导自测时，用 App 的 `goToAudit` 回到首页并滚动到测评区；课程「下一步」的目标由 App 的 `handleCourseTarget` 分流（方案规划 / 预约 / 资源 / 测评）。`/api/gemini/visibility-test` 接口仍保留，但前端目前没有调用。
- 新增页面需同时改三处：新建 view（以 `PageHeader` 开头）、在 `App.tsx` 加渲染分支、在 `navigation.ts` 加导航项。
- 全局弹窗都在 `App.tsx` 渲染，外壳统一用 `src/components/ui/Dialog.tsx`（Esc、焦点圈定、滚动锁定已内置）。`AiConsultantModal` 由 context 控制（`setAiAdvisorOpen` / `triggerAiAdvisorWithQuery(query)` 可带预设问题打开，CRM 透视开关在弹窗标题栏），其余弹窗由 App 本地 state 控制。
- `Header` 的移动端菜单渲染在 `<header>` 之外：`backdrop-filter` 会让 header 成为 fixed 子元素的定位容器。

### 全局状态与持久化（`src/context/AppContext.tsx`）

- 单一 `AppProvider` / `useApp()` 管理用户、课程进度、诊断记录、方案草案、线索行为、toast 等全部共享状态。
- **本地优先**：所有状态持久化到 `localStorage`（键前缀 `cw_`），首次访问时注入演示数据（访客用户、示例诊断和方案）。
- **Supabase 仅作单向镜像**：写操作在 `getSupabase()` 返回 client 时以 fire-and-forget 方式 insert/upsert，失败只打 `console.warn`，从不从 Supabase 读回。凭据只取构建时的 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`，含占位域名时视为未配置。Supabase 对接不在页面上展示：没有配置入口、同步状态或 CRM 工作台界面。
- 登录是本地模拟的（`login()` 生成 `usr-<timestamp>` 形式的 id，不走 Supabase Auth），而 `supabase_schema.sql` 中 `profiles.id` 为 UUID 且外键指向 `auth.users`，RLS 依赖 `auth.uid()`。所以按现有 schema，云同步写入会被拒绝，接入真实鉴权前这是已知限制。
- 共享领域类型（`UserProfile`、`DiagnosisRecord`、`SavedProposal`、`LessonProgress`）定义在 `src/lib/supabase.ts`，没有单独的 types 文件。

### 线索评分漏斗

`logLeadActivity(action, scoreDelta, meta?)` 是售前漏斗的埋点入口：各 view 在关键交互时调用（诊断、保存方案、预约、高意向对话等）。`leadScore = 25 + Σ scoreDelta`，`currentStage` 据此和诊断/方案数量推导（≥30 为 MQL，≥45 为 SQL，≥60 且有诊断和方案为「商机」），随行为记录同步写入 Supabase 的 `leads` 表，页面上不展示。`saveDiagnosis`、`saveProposalDraft`、`markLessonComplete` 内部已自动记录行为，不要在调用方重复记录。

### 静态内容

课程、案例、术语、资源、服务组合都是 `src/data/*.ts` 中的类型化常量。FDE 的方法论（标准化 → 信息化 → 智能化三层建设、每周“观察-原型-试用-沉淀”）集中在 `fdeData.ts`，服务页三层图使用它；课程 E、术语表和 `SYSTEM_KNOWLEDGE_INSTRUCTION` 中的同类表述要与之一致。方案规划页（`#/configurator`）的周期、交付物与阶段排期由 `servicePackages.ts` 的 `buildProposalPlan` 生成。内容类改动优先改这些数据文件，不要改组件。

课程视频放在 `public/videos/<课程字母>/<课程编号>.mp4`，由 `coursesData.ts` 的 `Lesson.videoUrl` 引用，课程弹窗直接播放。新增视频建议先压缩（画面流直接复制，音频转 96 kbps AAC，并加 `-movflags +faststart`），B 站投稿清单在 `docs/course-videos.md`（不要放进 `public/`，会被公开访问）。

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

- **FDE 展示开关**：`src/lib/features.ts` 的 `SHOW_FDE`（当前为 `true`，对外展示）同时控制前端与 `server.ts`。关闭时服务页、首页、课程 E、术语、资源、方案规划与 AI 顾问都不出现 FDE，“五项服务 / 五门课”随 `SERVICE_COUNT_CN` 变为“四”。新增涉及 FDE 或服务数量的文案也要走这个开关；`index.html` 的 description 读不到开关，需手动同步。
- `vite.config.ts` 中 HMR 与文件监听由 `DISABLE_HMR` 控制，这是 AI Studio 环境需要的，注释要求不要修改。
- **Vercel Web Analytics**：`App.tsx` 根部渲染 `@vercel/analytics/react` 的 `<Analytics />`。这是 Vite + React 项目，不要用 `@vercel/analytics/next`。只有部署在 Vercel 且项目开启 Web Analytics 才会上报；本地与自托管环境下它只是加载失败，不影响页面。
- 路径别名 `@/` 指向**仓库根目录**而不是 `src/`（`vite.config.ts` 与 `tsconfig.json` 一致）；现有代码均使用相对路径导入。
- `bun run build` 会提示主 chunk 超过 500 kB，目前没有代码分割，属已知现象。
