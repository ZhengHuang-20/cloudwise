# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

「云端智荐」—— 面向中国出海企业的 AI 售前支持系统与能力样板间（独立站 / SEO / GEO / AI 客服 / FDE 驻场五项服务），同时承载客户后台（访问统计、线索）。技术栈：**Next.js 16（App Router）+ React 19 + TypeScript 7 + Tailwind CSS v4**（登录页与客户后台另用 **antd 6**），部署在 **Vercel**，数据库为 **Neon Postgres**；AI 能力来自服务端调用的 Gemini（REST）。界面文案全部为简体中文，新增文案请保持中文。

**任何 UI 改动前先读 [`DESIGN.md`](./DESIGN.md)**（设计规范：token、组件、页面模板、文案与无障碍规则），改动后按其第 8 节评审清单自查。后台（`#/login`、`#/console/*`）用 antd，规则见 DESIGN.md 第 10 节；官网页面不要引入 antd。

## 常用命令

仓库使用 `bun.lock`，用 bun 安装依赖（npm 也可运行 scripts）。

```bash
bun install
bun run dev          # next dev，默认 http://localhost:3000
bun run lint         # tsc --noEmit —— 唯一的静态检查，没有 ESLint/Prettier
bun run build        # 先跑数据库迁移（未配置数据库时跳过），再 next build
bun run start        # next start（需先 build）
bun run db:migrate   # 只跑迁移（db/migrations/*.sql）
bun run create-admin <email>   # 创建管理员并打印一次性初始密码
```

- 项目**没有测试框架和测试用例**；改动后用 `bun run lint` + `bun run build` 验证，涉及 API 时启动后 `curl localhost:3000/api/health`。UI 改动还应在 390px 与 1440px 两个宽度下截图检查（环境里有全局 Playwright，页面可直接用 `http://localhost:3000/#/<tab>` 打开）。
- **类型检查只靠 `bun run lint`**：仓库用 TypeScript 7（原生编译器，没有 JS API），Next 构建期的类型检查无法使用，所以 `next.config.mjs` 设了 `typescript.ignoreBuildErrors`。`tsconfig.json` 的 `strict` 要显式保留为 `true`（Next 首次构建会尝试写成 false，TS 7 在 strict=false 下反而会报一批函数参数类型错误）。
- `bun.lock` 是 `lockfileVersion: 2`（bun 1.4+ 生成）。增删依赖要用 bun ≥ 1.4；旧版 bun（如 1.3）会把整个 lockfile 重写成旧格式，这种改动不要提交。
- 环境变量：复制 `.env.example` 为 `.env.local`（`.env*` 已被 gitignore；Next 与 `scripts/*.ts` 都会读取）。所有变量均可缺省：不配 `GEMINI_API_KEY` 时 AI 接口走确定性 fallback，不配 `DATABASE_URL` 时账号/后台接口返回 503。本地数据库可以用 Neon 的开发分支，也可以用本机 Postgres（`postgresql://user@127.0.0.1:5432/cloudwise`）。

## 架构

### 部署（Vercel + Neon）

- Vercel 通过 Git 集成自动部署（push 到 `main` 即生产部署，其他分支为预览部署），框架自动识别为 Next.js，不需要 `vercel.json`。仓库里没有 Dockerfile、服务器部署脚本或 GitHub Actions 部署工作流。
- 数据库在 Vercel 项目里连接 Neon（Storage / Integrations），会自动注入 `DATABASE_URL`（pooled，运行时用）与 `DATABASE_URL_UNPOOLED`（直连，迁移用）；连接时设了变量前缀的（如 `STORAGE_DATABASE_URL`）也能识别（`src/server/config.ts` 的 `databaseUrls`）。**生产环境必须连上数据库**，否则 `/api/health` 的 `dbStatus` 为 `unconfigured`，账号后台不可用。若开启 Neon 的预览分支，每个预览部署有独立的数据库分支。
- 构建命令就是 `bun run build`：先执行 `scripts/migrate.ts`（advisory lock 防并发，每个迁移文件一个事务；迁移失败会让部署失败），再 `next build`。设置 `SKIP_DB_MIGRATE=1` 可跳过迁移。迁移后若设置了 `CW_ADMIN_EMAIL` / `CW_ADMIN_PASSWORD`，会创建首个管理员（只创建不修改）。
- 其余运行时配置（Gemini / OpenRouter / OpenAI / Perplexity 的 key 与模型、`GEMINI_AUDIT_DAILY_LIMIT`、`SHOW_FDE`）都在 Vercel 的 Environment Variables 里配置，清单见 `.env.example`。改了环境变量要重新部署才生效。
- `/api/health` 返回 `hasGeminiKey`、`auditEngines`（实际启用的测评平台）、`hasDatabase`、`dbStatus`（`unconfigured` / `ok` / `failed`）与 `dbIssue`（阶段 + SQLSTATE，不含敏感信息），部署后用它确认配置是否生效。

### 服务端（`app/api/**` + `src/server/`）

- `app/` 只有三类文件：`layout.tsx`（`<html lang="zh-CN">`、metadata、全局 CSS、Vercel Analytics）、`page.tsx`（渲染 `src/ClientApp.tsx`，以 `ssr: false` 动态加载整个 SPA）和 `api/**/route.ts`。route 文件只做一行 re-export，处理逻辑都在 `src/server/routes/*.ts`；新增接口时同样在 `app/api` 下按路径建 `route.ts` 并从 routes 导出。未定义的 `/api/*` 由 `app/api/[...path]` 返回 JSON 404。
- `src/server/` 只在服务端使用，不要从前端代码 import：`config.ts`（环境变量）、`db.ts`（`pg` 连接池 + `attachDatabasePool`，`query` / `queryOne` / `exec` / `tx`；BIGINT 已解析为 number）、`http.ts`（`route()` 包装、`json` / `apiError`、`readJSON`、`clientIP`）、`auth.ts`（argon2id、会话、`authed()` 鉴权包装、`siteAccess`）、`ratelimit.ts`、`gemini.ts`、`knowledge.ts`、`engines.ts`、`audit*.ts`、`migrate.ts`。
- 错误响应统一为 `{ error: 中文说明, code }`，前端 `src/lib/api.ts` 依赖这个格式。处理函数里 `throw new HttpError(...)` 或直接 `return apiError(...)`；其他异常由 `route()` 记日志并返回 500。
- **Serverless 约束**：函数实例之间不共享内存（创建测评的 POST 与轮询的 GET 常落在不同实例），所以限流计数（`rate_limits` 表）、测评任务状态（`audits` 表）都放数据库；未配置数据库时退化为进程内实现，测评 POST 会等任务跑完、把结果直接放在响应里返回（前端收到 `report` 就不轮询），避免轮询到别的实例而 404。不要再引入只存内存、却需要跨请求一致的状态。
- 接口：`GET /api/health`、`POST /api/gemini/chat`（AI 售前顾问）、`POST /api/gemini/visibility-test`（旧的模拟测评，前端已不调用）、`/api/auth/*`（登录、登出、me、改密）、`/api/sites`（我的站点）、`/api/admin/*`（公司、账号、站点、授权）、`/api/public/*`（采集、线索、测评）。

### AI 售前顾问

- Gemini 只在服务端调用（`src/server/gemini.ts`，REST + `x-goog-api-key`），key 不暴露给前端。模型默认 `gemini-3.1-flash-lite`（`GEMINI_MODEL` 可覆盖），使用 `responseMimeType: 'application/json'`，提示词中内嵌期望的 JSON 结构。
- **每个 Gemini 接口都有确定性 fallback**：key 缺失（或仍为占位值 `MY_GEMINI_API_KEY`）、调用报错或 JSON 解析失败时，返回关键词匹配（chat）或固定 mock（visibility-test）的结果。因此不配 key 应用也能完整运行。
- 修改 chat 响应字段时需同步三处：`src/server/routes/ai.ts` 里提示词的 JSON 模板、`chatFallback`、前端消费方（`src/components/AiConsultantModal.tsx` 的 `ChatMessage`）。
- `src/server/knowledge.ts` 的 `systemKnowledge` 是 AI 顾问的「知识库」（服务、案例、报价规则、话术规则）。同样的业务事实还散落在 fallback 文案、`src/data/servicePackages.ts`、`src/data/caseStudiesData.ts` 和各 view 的文案中——改服务或案例时要一并更新。
- **站点不展示任何价格**：服务、套餐、方案空间、课程与 AI 顾问都不出现金额、预算区间、折扣或付款比例；知识库要求模型不报价，问到费用时引导到方案规划与诊断会。新增内容也不要写价格。

### 账号与客户后台

- 数据库：迁移文件在 `db/migrations/`，按文件名顺序执行，时间一律 `TIMESTAMPTZ`（默认 `now()`）。账号由管理员创建（不开放注册），密码 argon2id（`@node-rs/argon2`，参数与 PHC 格式和原 Go 版一致），会话为 HttpOnly cookie（库里只存令牌的 SHA-256）+ `X-CSRF-Token`，首次登录必须改密，连续 5 次失败锁定 15 分钟。客户只能访问 `site_members` 授权的站点，所有站点数据查询都必须经过它。
- 前端账号页：`#/login`、`#/console/<section>`（全部在 `src/views/console/`，入口 `ConsoleApp.tsx` 由 `App.tsx` 懒加载、全屏渲染，不显示官网 Header/Footer；不进导航，入口在 Header 右侧「登录 / 客户后台」）。后台左侧导航分「站点数据」（`overview` 数据概览、`leads` 线索管理、`install` 接入代码）与仅管理员可见的「系统管理」（`orgs` 客户公司、`users` 账号、`sites` 站点与授权）；`ConsoleContext` 提供当前用户、站点列表与切换（`localStorage` 键 `cw_console_site`）、`go(section)`。登录状态在 `src/context/AuthContext.tsx`，请求封装 `src/lib/api.ts`（自动带 CSRF）。账号不开放注册，由管理员在「账号」页开通（可同时授权站点），初始密码只在弹窗里显示一次。
- **客户数据与对外接口**（`src/server/routes/analytics.ts`，迁移 `002_analytics.sql`）：其他网站（如爱康医疗官网）通过公开接口写入数据库——`POST /api/public/collect`（页面浏览）与 `POST /api/public/leads`（线索：姓名/手机/邮箱/公司/留言，手机与邮箱至少一项），靠公开的 `site_key` 识别站点；浏览器请求的 `Origin` 必须匹配站点域名（含子域、www 互换），无 Origin 的服务端调用放行；按 IP 限流，`website` 字段是蜜罐。`/cw.js`（静态文件 `public/cw.js`，缓存与 CORS 头在 `next.config.mjs`）是嵌入脚本（`<script async src=".../cw.js" data-site="sk_xxx">` 自动上报 PV；带 `data-cw-lead` 的表单自动提交线索；`CloudWise.submitLead()` 可手动调用；配置错误、来源不匹配、被 CSP/插件拦截时会在控制台输出 `[CloudWise]` 警告，脚本加 `data-debug` 或页面地址带 `?cw_debug=1` 时打印每一步）。客户登录后用 `/api/sites/{id}/stats|leads|leads.csv` 与 `PATCH /api/sites/{id}/leads/{leadId}` 查看（`leads` 支持 `page`、`status` 与关键词 `q`，`q` 模糊匹配姓名/手机/邮箱/公司/留言），全部经 `withSite`（管理员或 `site_members`）校验，越权一律 404。访问记录只存匿名 visitor_id，不存 IP；统计按北京时间分天。

### AI 可见性测评（`src/server/audit.ts`、`auditSite.ts`、`auditStore.ts`、`engines.ts`，迁移 `003_audits.sql`）

- `POST /api/public/audits {target}` 创建异步任务，`GET /api/public/audits/{id}` 轮询进度与报告。POST 返回后测评用 Next 的 `after()` 在同一次函数调用里继续执行，受该路由 `maxDuration = 300` 限制：提问最晚在开始后 210 秒截止（未完成的记为超时），整个任务 280 秒内写完结果；超过 6 分钟没有进度更新的任务按「测评超时」失败处理。任务进度、提问日志与报告都写在 `audits` 表，所以轮询可以落在任意实例。
- 输入可以是官网域名或品牌名称（`parseAuditInput`：像 ASCII 域名的按域名处理，否则当作 2～60 字的品牌名）；只给品牌名时第①步先用 Gemini 联网搜索查找官网（`resolveDomain`，排除平台、目录与社交网站），报告的 `domainSource` 标明 `input` / `resolved` / `none`，找不到官网时跳过官网检查、总分只按 AI 部分计算，用户输入的品牌名会加进别名用于匹配。
- 流程：① 抓取官网做确定性检查（AI 爬虫的 robots.txt 权限、不执行 JS 时的正文、语言、JSON-LD、sitemap、llms.txt、首字节耗时；抓取用 `node:http(s)` + 自定义 DNS lookup，只连公网 IP 的 80/443，防 SSRF）→ ② 模型识别品牌/行业/市场 → ③ 生成 6 个不带品牌名的买家问题 + 2 个固定模板的带品牌问题 → ④ 向各探测平台每题问 2 次、每个平台 8 路并发（ChatGPT 用 OpenAI Responses API + `web_search`（默认 `gpt-6-luna`、推理强度 `low`），Perplexity 用 Sonar（可直连，也可经 OpenRouter：`PERPLEXITY_BASE_URL=https://openrouter.ai/api/v1`，模型名自动补 `perplexity/` 前缀），Gemini 用 Google 搜索 grounding；配了 `OPENROUTER_API_KEY` 时三个平台统一经 OpenRouter 提问并优先于直连配置）→ ⑤ Gemini 按平台分组只抽取事实（是否提及、排位、推荐了哪些品牌），代码分平台计算指标，总体指标取各平台平均。
- 品牌识别、出题与分析都依赖 Gemini，未配 `GEMINI_API_KEY` 时其他平台也不启用。报告 `mode`：`live` 真实探测、`sample` 未配 key（AI 部分为示例，前端标注）、`site_only` 提问全部失败。成本控制：按 IP 每小时 6 次、`GEMINI_AUDIT_DAILY_LIMIT`（默认 100）每日真实探测上限（计数在数据库）、同一域名（或同一品牌名）7 天内复用 `live` 结果（平台组合变化后不复用，`engineSet` 签名）、同一目标同时只跑一个任务（`uq_audits_running` 部分唯一索引）。

### 前端导航（无路由库）

- 整站是一个客户端 SPA：`app/page.tsx` → `src/ClientApp.tsx`（`ssr: false`）→ `src/App.tsx`。页面与组件不需要 `'use client'`，可以直接用 `window` / `localStorage`。
- `src/App.tsx` 用 `currentTab` 状态条件渲染 `src/views/*`，并与地址栏 hash 同步（`#/services`），支持浏览器前进后退与分享链接；切页时滚到顶部并更新 `document.title`。hash 只取第一段作为 `TabId`，后台子页面（`#/console/leads`）由 `ConsoleApp` 自己解析。
- `TabId` 类型、导航分组（了解 / 决策）与短标签、全称都只定义在 `src/components/navigation.ts`，`Header`、`Footer` 与 App 的 hash 解析共用它。
- 页面间跳转通过 App 下发的回调 props（`onGoToConfigurator`、`onGoToAudit`、`onGoToBooking` 等）完成；`handleNavigateToConfigurator(prefill)` 可向配置器传入初始参数。
- **站内唯一的自测工具是首页的 AI 可见性测评**（`HomeView` 的 `#audit` 区块，组件在 `src/views/home/VisibilityAudit.tsx`，接口封装在 `src/lib/audit.ts`，调用服务端的真实测评；接口不可用时展示标注「示例数据」的本地报告）；原「断点体检」「能力体验」页已删除。其他页面与课程要引导自测时，用 App 的 `goToAudit` 回到首页并滚动到测评区；课程「下一步」的目标由 App 的 `handleCourseTarget` 分流（方案规划 / 预约 / 资源 / 测评）。旧的 `/api/gemini/visibility-test`（让模型“模拟”结果）仍保留，但前端不再调用。
- 新增页面需同时改三处：新建 view（以 `PageHeader` 开头）、在 `App.tsx` 加渲染分支、在 `navigation.ts` 加导航项。
- 全局弹窗都在 `App.tsx` 渲染，外壳统一用 `src/components/ui/Dialog.tsx`（Esc、焦点圈定、滚动锁定已内置）。`AiConsultantModal` 由 context 控制（`setAiAdvisorOpen` / `triggerAiAdvisorWithQuery(query)` 可带预设问题打开，CRM 透视开关在弹窗标题栏），其余弹窗由 App 本地 state 控制。
- `Header` 的移动端菜单渲染在 `<header>` 之外：`backdrop-filter` 会让 header 成为 fixed 子元素的定位容器。

### 全局状态与持久化（`src/context/AppContext.tsx`）

- 单一 `AppProvider` / `useApp()` 管理用户、课程进度、诊断记录、方案草案、线索行为、toast 等全部共享状态。
- **本地优先**：所有状态持久化到 `localStorage`（键前缀 `cw_`），首次访问时注入演示数据（访客用户、示例诊断和方案）。
- 这里的访客「登录」是本地模拟的（`login()` 生成 `usr-<timestamp>` 形式的 id），与客户后台的真实账号（`AuthContext`）无关，也不写数据库。
- 共享领域类型（`UserProfile`、`DiagnosisRecord`、`SavedProposal`、`LessonProgress`）定义在 `src/lib/types.ts`。

### 线索评分漏斗

`logLeadActivity(action, scoreDelta, meta?)` 是售前漏斗的埋点入口：各 view 在关键交互时调用（诊断、保存方案、预约、高意向对话等）。`leadScore = 25 + Σ scoreDelta`，`currentStage` 据此和诊断/方案数量推导（≥30 为 MQL，≥45 为 SQL，≥60 且有诊断和方案为「商机」），只保存在本地状态里，页面上不展示。`saveDiagnosis`、`saveProposalDraft`、`markLessonComplete` 内部已自动记录行为，不要在调用方重复记录。

### 静态内容

课程、案例、术语、资源、服务组合都是 `src/data/*.ts` 中的类型化常量。对外联系人（姓名、职务、手机）只在 `contactsData.ts` 维护，页脚、方案空间、AI 顾问知识库与 chat fallback 都引用它，不要在别处写死电话。FDE 的方法论（标准化 → 信息化 → 智能化三层建设、每周“观察-原型-试用-沉淀”）集中在 `fdeData.ts`，服务页三层图使用它；课程 E、术语表和 `SYSTEM_KNOWLEDGE_INSTRUCTION` 中的同类表述要与之一致。方案规划页（`#/configurator`）的周期、交付物与阶段排期由 `servicePackages.ts` 的 `buildProposalPlan` 生成。内容类改动优先改这些数据文件，不要改组件。

课程视频放在 `public/videos/<课程字母>/<课程编号>.mp4`，由 `coursesData.ts` 的 `Lesson.videoUrl` 引用，课程弹窗直接播放。新增视频建议先压缩（画面流直接复制，音频转 96 kbps AAC，并加 `-movflags +faststart`），B 站投稿清单在 `docs/course-videos.md`（不要放进 `public/`，会被公开访问）。

## 样式约定（完整规范见 `DESIGN.md`）

以下约定针对官网页面。后台用 antd，主题在 `src/views/console/theme.ts`（色值与 `@theme` 对应）；antd 样式优先级高于 Tailwind 工具类，不要在 antd 组件上用 Tailwind 控制宽度、显示或外边距，详见 DESIGN.md 第 10 节。

- Tailwind v4 通过 `@tailwindcss/postcss`（`postcss.config.mjs`）引入，没有 `tailwind.config`；全局样式 `src/index.css` 在 `app/layout.tsx` 中引入。设计 token 写在 `src/index.css` 的 `@theme` 中，会自动生成对应的工具类；组件类写在 `@layer components` 中。
- **只用语义 token，不写 hex、不用 Tailwind 默认色板**：颜色用 `bg-canvas` / `bg-surface` / `bg-surface-raised`、`text-label` / `text-label-secondary`、`border-separator`、`text-link`、`bg-accent`、`text-success|warning|danger`；字号用 `text-display|headline|title-1|title-2|title-3|intro|body|caption`（自带行高与字重）；圆角用 `rounded-tile|card|control`；缓动用 `ease-apple`。
- 组件类：`layout-wide|text|reading`、`section`、`page-header`、`eyebrow`、`tile` / `card` / `well`（加 `interactive` 可点击）、`btn` + `btn-primary|secondary|neutral` + `btn-sm|lg|block`、`btn-icon`、`link`、`field` / `field-label`、`chip`（`aria-pressed`）、`choice`（`aria-checked`）、`badge`、`meter`、`avatar`、`material`（仅悬浮层）。
- React 基础组件在 `src/components/ui/`：`Dialog` / `DialogBody`、`SegmentedControl`、`PageHeader`、`Slider`、`ScoreRing`、`Reveal`；分数配色用 `tone.ts` 的 `scoreTone`，五项服务的图标与识别色用 `serviceIdentity.ts`。
- 蓝色只用于可交互元素；卡片是平面纯色，不加描边、阴影、渐变和玻璃效果；数字用 `tabular-nums`，不用 `font-mono`；字重只用 400 / 600。
- 最小字号 14px（`text-caption`）。`index.css` 仍保留把 `.text-xs`、`.text-[10px]`～`.text-[13px]` 强制为 14px 的兜底规则，但新代码不要使用这些类。
- 不加载 Web 字体（Google Fonts 在国内不可用），字体栈为 SF Pro / 苹方 / 微软雅黑；`<html lang="zh-CN">`。
- 图标统一用 `lucide-react`（全局笔画 1.75），不要把图标装进带底色的小方块。

## 其他注意事项

- **FDE 展示开关**：`src/lib/features.ts` 的 `SHOW_FDE`（当前为 `true`，对外展示）同时控制前端与服务端（服务端可用 `SHOW_FDE` 环境变量覆盖）。关闭时服务页、首页、课程 E、术语、资源、方案规划与 AI 顾问都不出现 FDE，“五项服务 / 五门课”随 `SERVICE_COUNT_CN` 变为“四”。新增涉及 FDE 或服务数量的文案也要走这个开关；页面 description（`app/layout.tsx`）也读取这个开关。
- **Vercel Web Analytics**：`app/layout.tsx` 渲染 `@vercel/analytics/next` 的 `<Analytics />`。项目在 Vercel 开启 Web Analytics 后才会上报；本地 `/_vercel/insights/script.js` 加载失败属正常现象。
- 路径别名 `@/` 指向**仓库根目录**而不是 `src/`（`tsconfig.json`）；现有代码均使用相对路径导入。
- 整站以 `ssr: false` 在浏览器端渲染，首屏 HTML 里没有正文内容（与原 Vite SPA 相同）；需要 SEO 的页面将来可以逐步改为服务端渲染。
- `metadata.json` 是 Google AI Studio 导出时留下的元数据，与部署无关。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
