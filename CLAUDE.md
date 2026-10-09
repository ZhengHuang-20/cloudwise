# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

「云端智荐」（英文名 **ChinGEO**，正式域名 https://chingeo.com）—— 面向中国出海企业的 AI 售前支持系统与能力样板间（独立站 / SEO / GEO / AI 客服 / FDE 驻场五项服务），同时承载客户后台（访问统计、线索）。技术栈：**Next.js 16（App Router）+ React 19 + TypeScript 7 + Tailwind CSS v4**（登录页与客户后台另用 **antd 6**），部署在 **Vercel**，数据库为 **Neon Postgres**；AI 能力来自服务端调用的 Gemini（REST）。界面默认为简体中文，官网同时提供英文（见下文「多语言」），新增文案需同时写中英文。

**任何 UI 改动前先读 [`DESIGN.md`](./DESIGN.md)**（设计规范：token、组件、页面模板、文案与无障碍规则），改动后按其第 8 节评审清单自查。后台（`/login`、`/console/*`）用 antd，规则见 DESIGN.md 第 10 节；官网页面不要引入 antd。

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

- 项目**没有测试框架和测试用例**；改动后用 `bun run lint` + `bun run build` 验证，涉及 API 时启动后 `curl localhost:3000/api/health`。UI 改动还应在 390px 与 1440px 两个宽度下截图检查（环境里有全局 Playwright，页面直接用路径打开，如 `http://localhost:3000/services/geo`）。涉及页面结构时再用 `curl` 看一眼服务端 HTML：正文、`<title>`、canonical、hreflang 与 JSON-LD 都应该在里面。
- **类型检查只靠 `bun run lint`**：仓库用 TypeScript 7（原生编译器，没有 JS API），Next 构建期的类型检查无法使用，所以 `next.config.mjs` 设了 `typescript.ignoreBuildErrors`。`tsconfig.json` 的 `strict` 要显式保留为 `true`（Next 首次构建会尝试写成 false，TS 7 在 strict=false 下反而会报一批函数参数类型错误）。
- `bun.lock` 是 `lockfileVersion: 2`（bun 1.4+ 生成）。增删依赖要用 bun ≥ 1.4；旧版 bun（如 1.3）会把整个 lockfile 重写成旧格式，这种改动不要提交。
- 环境变量：复制 `.env.example` 为 `.env.local`（`.env*` 已被 gitignore；Next 与 `scripts/*.ts` 都会读取）。所有变量均可缺省：不配 `GEMINI_API_KEY` 时 AI 接口走确定性 fallback，不配 `DATABASE_URL` 时账号/后台接口返回 503。本地数据库可以用 Neon 的开发分支，也可以用本机 Postgres（`postgresql://user@127.0.0.1:5432/cloudwise`）。

## 架构

### 部署（Vercel + Neon）

- Vercel 通过 Git 集成自动部署（push 到 `main` 即生产部署，其他分支为预览部署），框架自动识别为 Next.js，不需要 `vercel.json`。仓库里没有 Dockerfile、服务器部署脚本或 GitHub Actions 部署工作流。
- 数据库在 Vercel 项目里连接 Neon（Storage / Integrations），会自动注入 `DATABASE_URL`（pooled，运行时用）与 `DATABASE_URL_UNPOOLED`（直连，迁移用）；连接时设了变量前缀的（如 `STORAGE_DATABASE_URL`）也能识别（`src/server/config.ts` 的 `databaseUrls`）。**生产环境必须连上数据库**，否则 `/api/health` 的 `dbStatus` 为 `unconfigured`，账号后台不可用。若开启 Neon 的预览分支，每个预览部署有独立的数据库分支。
- 构建命令就是 `bun run build`：先执行 `scripts/migrate.ts`（advisory lock 防并发，每个迁移文件一个事务；迁移失败会让部署失败），再 `next build`。设置 `SKIP_DB_MIGRATE=1` 可跳过迁移。迁移后若设置了 `CW_ADMIN_EMAIL` / `CW_ADMIN_PASSWORD`，会创建首个管理员（只创建不修改）。
- 其余运行时配置（Gemini / OpenRouter / OpenAI / Perplexity 的 key 与模型、`GEMINI_AUDIT_DAILY_LIMIT`、`SHOW_FDE`、`NEXT_PUBLIC_SITE_URL`、各站长平台验证码）都在 Vercel 的 Environment Variables 里配置，清单见 `.env.example`。改了环境变量要重新部署才生效（页面是构建时静态生成的）。
- 预览部署（`VERCEL_ENV=preview`）的 robots.txt 整站 `Disallow` 并加 `X-Robots-Tag: noindex`，只有生产部署允许收录；canonical 一律指向正式域名。
- `/api/health` 返回 `hasGeminiKey`、`auditEngines`（实际启用的测评平台）、`hasDatabase`、`dbStatus`（`unconfigured` / `ok` / `failed`）与 `dbIssue`（阶段 + SQLSTATE，不含敏感信息），部署后用它确认配置是否生效。

### 服务端（`app/api/**` + `src/server/`）

- `app/` 的结构：两个根布局 `app/(zh)/layout.tsx`（中文，`<html lang="zh-CN">`）与 `app/(en)/layout.tsx`（英文，页面在 `/en` 下），都转发到 `src/site/RootLayout.tsx`；页面是 `app/(zh)/[[...slug]]/page.tsx` 与 `app/(en)/en/[[...slug]]/page.tsx` 两个可选 catch-all，只转发到 `src/site/page.tsx`；另有 `not-found.tsx`、`robots.ts`、`sitemap.ts`、`llms.txt` / `llms-full.txt` / `en/llms-full.txt` 三个 route handler，以及 `api/**/route.ts`。api 的 route 文件只做一行 re-export，处理逻辑都在 `src/server/routes/*.ts`；新增接口时同样在 `app/api` 下按路径建 `route.ts` 并从 routes 导出。未定义的 `/api/*` 由 `app/api/[...path]` 返回 JSON 404。
- `src/server/` 只在服务端使用，不要从前端代码 import：`config.ts`（环境变量）、`db.ts`（`pg` 连接池 + `attachDatabasePool`，`query` / `queryOne` / `exec` / `tx`；BIGINT 已解析为 number）、`http.ts`（`route()` 包装、`json` / `apiError`、`readJSON`、`clientIP`）、`auth.ts`（argon2id、会话、`authed()` 鉴权包装、`siteAccess`）、`ratelimit.ts`、`channels.ts`（访问来源归类）、`useragent.ts`（设备 / 浏览器 / 系统 / 爬虫识别）、`vercel.ts`（Vercel Web Analytics 汇总，参考用）、`gemini.ts`、`knowledge.ts`、`engines.ts`、`audit*.ts`、`migrate.ts`。
- 错误响应统一为 `{ error: 中文说明, code }`，前端 `src/lib/api.ts` 依赖这个格式。处理函数里 `throw new HttpError(...)` 或直接 `return apiError(...)`；其他异常由 `route()` 记日志并返回 500。
- **Serverless 约束**：函数实例之间不共享内存（创建测评的 POST 与轮询的 GET 常落在不同实例），所以限流计数（`rate_limits` 表）、测评任务状态（`audits` 表）都放数据库；测评必须配置数据库（联系方式要入库，未配置时 POST 返回 503），所以不再有进程内的测评实现，任务状态一律走数据库。不要再引入只存内存、却需要跨请求一致的状态。
- 接口：`GET /api/health`、`POST /api/gemini/chat`（AI 售前顾问）、`POST /api/gemini/visibility-test`（旧的模拟测评，前端已不调用）、`/api/auth/*`（登录、登出、me、改密）、`/api/sites`（我的站点）、`/api/admin/*`（公司、账号、站点、授权）、`/api/public/*`（采集、线索、测评）。

### AI 售前顾问

- Gemini 只在服务端调用（`src/server/gemini.ts`，REST + `x-goog-api-key`），key 不暴露给前端。模型默认 `gemini-3.1-flash-lite`（`GEMINI_MODEL` 可覆盖），使用 `responseMimeType: 'application/json'`，提示词中内嵌期望的 JSON 结构。
- **每个 Gemini 接口都有确定性 fallback**：key 缺失（或仍为占位值 `MY_GEMINI_API_KEY`）、调用报错或 JSON 解析失败时，返回关键词匹配（chat）或固定 mock（visibility-test）的结果。因此不配 key 应用也能完整运行。
- 修改 chat 响应字段时需同步三处：`src/server/routes/ai.ts` 里提示词的 JSON 模板、`chatFallback`、前端消费方（`src/components/AiConsultantModal.tsx` 的 `ChatMessage`）。
- `src/server/knowledge.ts` 的 `systemKnowledge` 是 AI 顾问的「知识库」（服务、案例、报价规则、话术规则）。同样的业务事实还散落在 fallback 文案、`src/data/servicePackages.ts`、`src/data/caseStudiesData.ts` 和各 view 的文案中——改服务或案例时要一并更新。
- **站点不展示任何价格**：服务、套餐、方案空间、课程与 AI 顾问都不出现金额、预算区间、折扣或付款比例；知识库要求模型不报价，问到费用时引导到方案规划与诊断会。新增内容也不要写价格。

### 账号与客户后台

- 数据库：迁移文件在 `db/migrations/`，按文件名顺序执行，时间一律 `TIMESTAMPTZ`（默认 `now()`）。账号由管理员创建（不开放注册），密码 argon2id（`@node-rs/argon2`，参数与 PHC 格式和原 Go 版一致），会话为 HttpOnly cookie（库里只存令牌的 SHA-256）+ `X-CSRF-Token`，首次登录必须改密，连续 5 次失败锁定 15 分钟。客户只能访问 `site_members` 授权的站点，所有站点数据查询都必须经过它。
- 前端账号页：`/login`、`/console/<section>`（全部在 `src/views/console/`，入口 `ConsoleApp.tsx` 由 `RouteView` 用 `next/dynamic`（`ssr: false`）懒加载、全屏渲染；后台内部切换子页面用 `history.pushState`，不显示官网 Header/Footer；不进导航，入口在 Header 右侧「登录 / 客户后台」）。后台左侧导航分「站点数据」（`overview` 数据概览、`leads` 线索管理、`install` 接入代码）与仅管理员可见的「系统管理」（`orgs` 客户公司、`users` 账号、`sites` 站点与授权）；`ConsoleContext` 提供当前用户、站点列表与切换（`localStorage` 键 `cw_console_site`）、`go(section)`。登录状态在 `src/context/AuthContext.tsx`，请求封装 `src/lib/api.ts`（自动带 CSRF）。账号不开放注册，由管理员在「账号」页开通（可同时授权站点），初始密码只在弹窗里显示一次。
- **客户数据与对外接口**（`src/server/routes/analytics.ts`，迁移 `002_analytics.sql`、`005_analytics_v2.sql`）：其他网站（如爱康医疗官网）通过公开接口写入数据库——`POST /api/public/collect`（页面浏览；`type: 'engage'` 为参与时长与滚动深度的补报）与 `POST /api/public/leads`（线索：姓名/手机/邮箱/公司/留言，手机与邮箱至少一项），靠公开的 `site_key` 识别站点；浏览器请求的 `Origin` 必须匹配站点域名（含子域、www 互换），无 Origin 的服务端调用放行；按 IP 限流，`website` 字段是蜜罐。`/cw.js`（静态文件 `public/cw.js`，缓存 1 小时，改了它所有已接入的网站随之生效；缓存与 CORS 头在 `next.config.mjs`）是嵌入脚本（`<script async src=".../cw.js" data-site="sk_xxx">` 自动上报 PV、会话 ID（存 localStorage，30 分钟无操作或带着站外来源 / 广告参数进站时新开）、浏览器语言，页面切到后台或关闭时用 sendBeacon 补报前台停留时长；带 `data-cw-lead` 的表单自动提交线索；`CloudWise.submitLead()` 可手动调用；`?cw_ignore=1` 排除本浏览器的访问；配置错误、来源不匹配、被 CSP/插件拦截时会在控制台输出 `[CloudWise]` 警告，脚本加 `data-debug` 或页面地址带 `?cw_debug=1` 时打印每一步）。旧版脚本不带会话 ID 时，服务端沿用该访客 30 分钟内的会话。
- **访问分析口径**：每次浏览写一行 `visits`（路径去掉查询串与锚点），同时插入或更新一行 `visit_sessions`（注意与登录会话表 `sessions` 区分），会话的来源渠道、UTM、国家 / 省州（Vercel 的 `x-vercel-ip-country(-region)` 请求头，不存 IP）、设备、浏览器、系统、语言都取第一个页面。渠道归类规则（直接 / 自然搜索 / AI 助手 / 社交 / 外部链接 / 付费 / 邮件，含 ChatGPT 的 `utm_source=chatgpt.com`）只在 `src/server/channels.ts` 维护，渠道中文名在 `src/lib/channels.ts`；爬虫与 `navigator.webdriver` 的请求不入库。跳出 = 只看 1 页、参与时长 < 10 秒且没有留资的会话；留资转化率 = 留下线索的访客 ÷ 访客。线索提交时快照来源（留资所在的会话不是直接访问时用它，否则取 90 天内最近一次非直接访问），并把该会话标记为 `has_lead`。升级前的访问没有会话（`session_id = ''`），只计入访客与浏览量；上一周期含这类访问时，会话类指标与维度不做环比。
- **Vercel 数据为主**（`src/server/vercel.ts`，迁移 `006_sites_vercel.sql`）：托管在 Vercel 上的站点，`sites.vercel_team_id` / `vercel_project_id` 在后台「站点与授权」的「Vercel」里填写（`PATCH /api/admin/sites/{id}`，只允许 `team_` / `prj_` 格式），令牌只读环境变量 `VERCEL_API_TOKEN`（服务端，不加 `NEXT_PUBLIC_`）。关联后「数据概览」以 Vercel Web Analytics 为准、采集脚本为辅（`src/server/routes/stats.ts`）：访客、浏览量、每日趋势（`visits/aggregate?by=day`，按 UTC 日期分天）、AI 访客，以及 `channel` / `source` / `ai`（按 `referrerHostname` × `utmSource` 分组后用 `classify()` 归类，来源是本站域名的算直接访问；Vercel 没有 utm_medium 与广告点击 ID，识别不到付费流量）、`referrer`、`utm_*`、`country`、`device`、`browser`、`os`、`page`（再合并脚本统计的平均参与时长）维度都取 Vercel（维度映射 `VERCEL_BY`）；线索、会话、跳出率、参与时长、`entry` / `exit` / `lang` 只有脚本有。转化率的分母换成 Vercel 的访客。响应里 `source: 'vercel' | 'script'` 标明来源，`/stats` 另带 `script`（脚本统计的访客与浏览量，KPI 卡片里作对照）与 `vercelIssue`（已关联却读不到时的原因，页面显示告警）。Vercel 的核心数据（当前与上一周期的总数和每日序列）任一读不到就整体回退到脚本数据，单个维度读不到时该维度回退。所有请求由 `fetch` 的 `next.revalidate` 缓存 10 分钟。`GET /api/sites/{id}/stats/vercel?days=` 只返回同期总数，用来确认 Vercel 是否接通。
- **客户后台接口**：`GET /api/sites/{id}/stats?days=7|30|90`（当前与上一周期的核心指标 + 两段每日序列，`src/server/routes/stats.ts`）、`GET /api/sites/{id}/stats/breakdown?days=&dim=&limit=`（`dim`：`page`、`entry`、`exit`、`channel`、`source`、`ai`、`referrer`、`utm_source|medium|campaign`、`country`、`lang`、`device`、`browser`、`os`；维度经白名单映射到列名，新增维度只改 `SESSION_DIMS`（有 Vercel 对应维度的再改 `VERCEL_BY`））、`/api/sites/{id}/leads|leads.csv` 与 `PATCH /api/sites/{id}/leads/{leadId}`（`leads` 支持 `page`、`status` 与关键词 `q`，`q` 模糊匹配姓名/手机/邮箱/公司/留言；线索带来源渠道、来源、UTM 活动、落地页与国家），全部经 `withSite`（管理员或 `site_members`）校验，越权一律 404。访问记录只存匿名 visitor_id，不存 IP；脚本统计按北京时间分天（Vercel 为主时访客与浏览量的每日序列按 UTC 日期）。「数据概览」页（`StatsPanel.tsx`，维度卡片在 `Breakdown.tsx`，名称与格式化在 `labels.ts`）每张维度卡片单独请求。后续分期（流量分析下钻、事件与询盘点击、漏斗、实时、Web Vitals、AI 爬虫日志等）见 `docs/analytics-plan.md`。

### AI 可见性测评（`src/server/audit.ts`、`auditSite.ts`、`auditStore.ts`、`engines.ts`，迁移 `003_audits.sql`）

- `POST /api/public/audits {target, contactName, contactPhone}` 创建异步任务，`GET /api/public/audits/{id}` 轮询进度与报告。联系人姓名与 11 位手机号必填（`src/lib/contact.ts` 前后端共用校验），每次提交都写入 `audit_contacts`（迁移 `004_audit_contacts.sql`，包括复用已有报告的提交），只通过服务端写入、没有公开的读取接口。POST 返回后测评用 Next 的 `after()` 在同一次函数调用里继续执行，受该路由 `maxDuration = 300` 限制：提问最晚在开始后 210 秒截止（未完成的记为超时），整个任务 280 秒内写完结果；超过 6 分钟没有进度更新的任务按「测评超时」失败处理。任务进度、提问日志与报告都写在 `audits` 表，所以轮询可以落在任意实例。
- 输入可以是官网域名或品牌名称（`parseAuditInput`：像 ASCII 域名的按域名处理，否则当作 2～60 字的品牌名）；只给品牌名时第①步先用 Gemini 联网搜索查找官网（`resolveDomain`，排除平台、目录与社交网站），报告的 `domainSource` 标明 `input` / `resolved` / `none`，找不到官网时跳过官网检查、总分只按 AI 部分计算，用户输入的品牌名会加进别名用于匹配。
- 流程：① 抓取官网做确定性检查（AI 爬虫的 robots.txt 权限、不执行 JS 时的正文、语言、JSON-LD、sitemap、llms.txt、首字节耗时；抓取用 `node:http(s)` + 自定义 DNS lookup，只连公网 IP 的 80/443，防 SSRF）→ ② 模型识别品牌/行业/市场 → ③ 生成 6 个不带品牌名的买家问题 + 2 个固定模板的带品牌问题 → ④ 向各探测平台每题问 2 次、每个平台 8 路并发（ChatGPT 用 OpenAI Responses API + `web_search`（默认 `gpt-6-luna`、推理强度 `low`），Perplexity 用 Sonar（可直连，也可经 OpenRouter：`PERPLEXITY_BASE_URL=https://openrouter.ai/api/v1`，模型名自动补 `perplexity/` 前缀），Gemini 用 Google 搜索 grounding；配了 `OPENROUTER_API_KEY` 时三个平台统一经 OpenRouter 提问并优先于直连配置）→ ⑤ Gemini 按平台分组只抽取事实（是否提及、排位、推荐了哪些品牌），代码分平台计算指标，总体指标取各平台平均。
- 品牌识别、出题与分析都依赖 Gemini，未配 `GEMINI_API_KEY` 时其他平台也不启用。报告 `mode`：`live` 真实探测、`sample` 未配 key（AI 部分为示例，前端标注）、`site_only` 提问全部失败。成本控制：按 IP 每小时 6 次、`GEMINI_AUDIT_DAILY_LIMIT`（默认 100）每日真实探测上限（计数在数据库）、同一域名（或同一品牌名）7 天内复用 `live` 结果（平台组合变化后不复用，`engineSet` 签名）、同一目标同时只跑一个任务（`uq_audits_running` 部分唯一索引）。

### 页面与路由（服务端渲染，SEO / GEO 的底座）

- 每个页面有独立路径，构建时静态生成完整 HTML（正文、标题、描述、canonical、hreflang、JSON-LD 都在首屏 HTML 里，不执行 JS 的 AI 爬虫也能读到）。中文无前缀，英文在 `/en` 下，两种语言路径结构一致；后台（`/login`、`/console/*`）只有中文且 noindex。
- **路由表** `src/site/routes.ts`：`Route` 类型、`resolveRoute`（URL → 路由，找不到为 404）、`routePath`、`allRoutes`（静态生成与 sitemap）、`isIndexable` / `hasEnglish`，以及数据 id ↔ slug 的换算（`/services/geo`、`/cases/ak-medical`、`/solutions/medical`、`/academy/geo`、`/academy/geo/c-1-1`、`/insights/<slug>`、`/glossary/geo`、`/audit`、`/about`、`/configurator`、`/deal-room`）。
- **服务端入口** `src/site/page.tsx`：解析路由 → `siteMetadata`（标题模板、canonical、hreflang、Open Graph、noindex）→ 输出 JSON-LD（`src/site/schema.ts`：Organization、WebSite、WebPage、BreadcrumbList，以及 Service、Article、Course、LearningResource、VideoObject、DefinedTerm、FAQPage 等）→ 渲染 `src/site/RouteView.tsx`。每个页面的标题与描述只在 `src/site/meta.ts` 定义。
- **客户端外壳** `src/site/SiteShell.tsx`（`'use client'`，放在根布局里，站内跳转不重置状态）：Provider、Header / Footer、AI 顾问入口、全局弹窗与 Toast；登录与后台是全屏布局，不显示页眉页脚。旧的 hash 地址（`#/services`、`#/resources`、`#/console/leads`）在这里跳到新路径。
- `RouteView`（`'use client'`）按路由渲染 `src/views/*`。views 本身不写 `'use client'`，因为只从 RouteView 引入；它们会在服务端预渲染，所以**渲染阶段不能读 `window` / `localStorage`**（放到 effect 或事件里），日期等也不能用依赖区域设置的格式化，否则水合不一致。服务端代码（`src/site/meta.ts`、`schema.ts`、`llms.ts`、`app/*.ts`）不能 import 调用 `createContext` 的模块，双语类型与 `pick` 从 `src/lib/i18n.ts` 引入。
- 页面间跳转：链接一律用 `next/link` 的 `<Link href={path('/services')}>`（真实 `<a href>`，爬虫能顺着走）；需要逻辑的跳转用 `useSite()`（`src/site/SiteContext.ts`）的 `navigate(path)`、`openBooking`、`goToAudit`（去 `/audit`）、`goToConfigurator(prefill)`、`goToCourseTarget`。学院里的课时链接普通点击打开课程弹窗，新标签页或爬虫进入课时页。
- 导航分组（了解 / 决策）与短标签、全称、`href` 只定义在 `src/components/navigation.ts`，`Header`、`Footer` 共用。
- **站内唯一的自测工具是 AI 可见性测评**（组件 `src/views/home/VisibilityAudit.tsx`，同时用在首页的 `#audit` 区块与独立页 `/audit`；接口封装在 `src/lib/audit.ts`，调用服务端的真实测评；接口不可用时显示错误提示，不展示本地示例报告，避免联系方式没入库却看到结果）。其他页面与课程要引导自测时用 `useSite().goToAudit`（进入 `/audit`）；课程「下一步」的目标由 `goToCourseTarget` 分流（方案规划 / 预约 / 测评）。旧的 `/api/gemini/visibility-test`（让模型“模拟”结果）仍保留，但前端不再调用。
- 新增页面：在 `src/site/routes.ts` 加路由、在 `src/site/meta.ts` 写标题与描述、在 `RouteView` 加渲染分支、新建 view（以 `PageHeader` 开头，详情页传 `breadcrumbs`）；需要结构化数据时在 `schema.ts` 补一类；要进导航再改 `navigation.ts`。sitemap 与 llms.txt 从路由表和数据自动生成。
- 全局弹窗都在 `SiteShell` 渲染，外壳统一用 `src/components/ui/Dialog.tsx`（Esc、焦点圈定、滚动锁定已内置）。`AiConsultantModal` 由 context 控制（`setAiAdvisorOpen` / `triggerAiAdvisorWithQuery(query)` 可带预设问题打开，CRM 透视开关在弹窗标题栏），预约与「我的空间」弹窗由 `useSite()` 打开。
- `Header` 的移动端菜单渲染在 `<header>` 之外：`backdrop-filter` 会让 header 成为 fixed 子元素的定位容器。

### 多语言（中英文）

- 官网支持中文（默认，无前缀）与 English（`/en/*`）：**语言由 URL 决定**，两个根布局分别把 `lang` 传给 `LanguageProvider`。`useLang()` → `{ lang, setLang, t(zh, en), tb({ zh, en }), path(p) }`，`path('/services')` 在英文下返回 `/en/services`。切换按钮（Header 的 `LanguageSwitch`）是指向另一语言同一页面的链接（整页跳转，因为根布局不同），偏好记在 `localStorage`（`cw_lang`），但不做自动跳转。英文品牌名一律写 **ChinGEO**（`src/lib/site.ts` 的 `BRAND`）。
- 组件内文案写成 `t('中文', 'English')`；数据里的标题与描述用 `Bi`（`{ zh, en }`）对象，用 `tb()` 取值。新增页面或文案时两种语言要同时写。
- 数据的英文是覆盖层，按 id 合并到中文数据上，结构保持一致：课程 `src/data/en/courseA–E.ts` 与 `paths.ts`（`courseList(lang)` / `pathList(lang)`）；案例与行业方案 `src/data/en/cases.ts`（`caseList` / `solutionList`）；术语与模板 `src/data/en/resources.ts`（`glossaryList` / `resourceList`）；`contactsData.ts`、`serviceIdentity.ts`、`fdeData.ts`、`servicePackages.ts` 直接带英文字段。改中文数据时要同步英文覆盖层，缺失的 id 会回退到中文。
- 后台（`/login`、`/console/*`）只有中文。AI 顾问的 `/api/gemini/chat` 接收 `lang`，英文时回答全部用英文（提示词指令与 `chatFallbackEn`）。测评报告的分析文本（`audit.ts` 生成的核心发现、建议与探测失败原因）目前仍是中文。
- 英文界面同样不写金额（与中文相同的价格规则）。

### 全局状态与持久化（`src/context/AppContext.tsx`）

- 单一 `AppProvider` / `useApp()` 管理用户、课程进度、诊断记录、方案草案、线索行为、toast 等全部共享状态。
- **本地优先**：所有状态持久化到 `localStorage`（键前缀 `cw_`），首次访问时注入演示数据（访客用户、示例诊断和方案）。页面在服务端渲染，所以首屏与水合时状态为空，挂载后才从 `localStorage` 读取（读取完成前不回写，避免覆盖存档）。
- 这里的访客「登录」是本地模拟的（`login()` 生成 `usr-<timestamp>` 形式的 id），与客户后台的真实账号（`AuthContext`）无关，也不写数据库。
- 共享领域类型（`UserProfile`、`DiagnosisRecord`、`SavedProposal`、`LessonProgress`）定义在 `src/lib/types.ts`。

### 线索评分漏斗

`logLeadActivity(action, scoreDelta, meta?)` 是售前漏斗的埋点入口：各 view 在关键交互时调用（诊断、保存方案、预约、高意向对话等）。`leadScore = 25 + Σ scoreDelta`，`currentStage` 据此和诊断/方案数量推导（≥30 为 MQL，≥45 为 SQL，≥60 且有诊断和方案为「商机」），只保存在本地状态里，页面上不展示。`saveDiagnosis`、`saveProposalDraft`、`markLessonComplete` 内部已自动记录行为，不要在调用方重复记录。

### 静态内容

课程、案例、术语、服务说明（`servicesData.ts`：五项服务的文案、详情页 SEO 标题与常见问题）、服务组合、GEO 洞察文章（`src/data/insights/`）都是 `src/data/*.ts` 中的类型化常量。原来的「模板与白皮书」因为没有可下载的文件已经删除，不要再加没有真实文件的下载项。对外联系人（姓名、职务、手机）只在 `contactsData.ts` 维护，页脚、方案空间、AI 顾问知识库与 chat fallback 都引用它，不要在别处写死电话。FDE 的方法论（标准化 → 信息化 → 智能化三层建设、每周“观察-原型-试用-沉淀”）集中在 `fdeData.ts`，服务页三层图使用它；课程 E、术语表和 `SYSTEM_KNOWLEDGE_INSTRUCTION` 中的同类表述要与之一致。方案规划页（`/configurator`）的周期、交付物与阶段排期由 `servicePackages.ts` 的 `buildProposalPlan` 生成。内容类改动优先改这些数据文件，不要改组件。

课程视频放在 `public/videos/<课程字母>/<课程编号>.mp4`，由 `coursesData.ts` 的 `Lesson.videoUrl` 引用，课程弹窗与课时页直接播放；同名 `.jpg` 是封面（`ffmpeg -ss 2 -i x.mp4 -frames:v 1 -vf scale=1280:-2 -q:v 5 x.jpg`），时长与上线日期登记在 `src/data/videoMeta.ts`（VideoObject 与 video sitemap 用），对应的 B 站 BV 号登记在 `src/lib/site.ts` 的 `BILIBILI_VIDEOS`。新增视频建议先压缩（画面流直接复制，音频转 96 kbps AAC，并加 `-movflags +faststart`），B 站投稿清单在 `docs/course-videos.md`（不要放进 `public/`，会被公开访问）。

### SEO / GEO

- 方案与进度见 `docs/seo-geo-plan.md`；文章与术语的写作规范见 `docs/geo-content-guide.md`（先给答案、写清出处、中英文同时写、不写价格、不编造）。
- 「GEO 洞察」文章每篇一个文件 `src/data/insights/<slug>.ts`（类型 `types.ts`，在 `index.ts` 登记），正文是 `src/lib/markdown.ts` 支持的 Markdown 子集，站内链接写相对路径。页面、sitemap、llms.txt 与 Article / FAQPage 结构化数据自动生成。
- 站点身份（正式域名、中英文品牌名、一句话定位、ICP 备案号、官方账号 `SAME_AS`）只在 `src/lib/site.ts` 维护；新开官方账号（知乎、公众号、头条号、LinkedIn 等）后加进 `SAME_AS`。
- `app/robots.ts` 明确放行搜索引擎与 AI 爬虫（含 Bytespider、Doubaobot 等字节系爬虫），只挡 `/api/`。不要屏蔽 AI 爬虫。
- 站长平台验证码走环境变量（`GOOGLE_SITE_VERIFICATION`、`BING_SITE_VERIFICATION`、`BAIDU_SITE_VERIFICATION`、`TOUTIAO_SITE_VERIFICATION`、`SO360_SITE_VERIFICATION`、`SOGOU_SITE_VERIFICATION`），在 `src/site/RootLayout.tsx` 输出为 meta 标签。
- 分享图是静态的 `public/og.png`（1200×630）。sitemap 的 `lastModified`：文章取 `updatedAt`，其他页面取 `app/sitemap.ts` 的 `CONTENT_UPDATED`，改了页面内容记得更新。

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

- **FDE 展示开关**：`src/lib/features.ts` 的 `SHOW_FDE`（当前为 `true`，对外展示）同时控制前端与服务端（服务端可用 `SHOW_FDE` 环境变量覆盖）。关闭时服务页（含 `/services/fde`）、首页、课程 E、术语、FDE 主题的洞察文章、方案规划与 AI 顾问都不出现 FDE，“五项服务 / 五门课”随 `SERVICE_COUNT_CN` 变为“四”。新增涉及 FDE 或服务数量的文案也要走这个开关；页面标题与描述（`src/site/meta.ts`）、`TAGLINE`（`src/lib/site.ts`）也读取这个开关。
- **Vercel Web Analytics**：`app/layout.tsx` 渲染 `@vercel/analytics/next` 的 `<Analytics />`。项目在 Vercel 开启 Web Analytics 后才会上报；本地 `/_vercel/insights/script.js` 加载失败属正常现象。
- 路径别名 `@/` 指向**仓库根目录**而不是 `src/`（`tsconfig.json`）；现有代码均使用相对路径导入。
- `metadata.json` 是 Google AI Studio 导出时留下的元数据，与部署无关。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
