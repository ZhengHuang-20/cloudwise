# 云端智荐官网 SEO / GEO 方案

> 状态：第一阶段（技术底座）与第二阶段的页面框架已实现（见 §0）；内容扩充与站外 GEO 持续进行。日期：2026-10-08。
> 目标：让搜索引擎（Google、Bing、百度）和生成式引擎（ChatGPT、Perplexity、Gemini / AI Overviews、Copilot、DeepSeek、豆包、Kimi、元宝）都能**读到、读懂、愿意引用**本站，在「出海 GEO / SEO / 独立站 / AI 客服 / FDE」相关问题里稳定出现。

---

## 0. 已确认的决策与实施进度

| 事项 | 决定 |
|---|---|
| 正式域名 | https://chingeo.com（已有 ICP 备案：苏ICP备20260928号-1） |
| 英文品牌名 | ChinGEO（避开与“云智慧 Cloudwise”重名），中文名仍为云端智荐 |
| 市场 | 国内外都做；国内 GEO 要照顾豆包（字节系）的收录 |
| 资源下载 | 没有真实文件的模板与白皮书全部删除 |
| 内容生产 | 用定时任务每周自动写 GEO 文章，以 PR 形式提交，人工审核后合并 |

**本次已实现**（对应 §3、§4 的大部分条目）：

- hash 单页应用改为真实路径 + 构建时静态生成：中文 56 个页面、英文 48 个页面，首屏 HTML 含完整正文。旧 `#/` 链接自动跳转。
- 每页独立的标题、描述、canonical、hreflang（zh-CN / en / x-default）、Open Graph 与分享图；后台与方案空间 noindex。
- `robots.txt`（明确放行搜索与 AI 爬虫，含 Bytespider、Doubaobot；预览部署整站禁止）、`sitemap.xml`（含 hreflang 与课程视频）、`llms.txt`、`llms-full.txt`（中英文）。
- JSON-LD：Organization、WebSite、WebPage、BreadcrumbList、Service、Article、Course、LearningResource、VideoObject、DefinedTerm、FAQPage、WebApplication。
- 新页面：5 个服务详情页（含常见问题）、2 个案例页、2 个行业方案页、5 个课程页、15 个课时页（视频封面 + B 站链接）、4 个术语页、GEO 洞察栏目（首批 4 篇中英文文章）、AI 可见性测评独立页 `/audit`、关于我们 `/about`。
- 导航与页脚改为真实链接；站长平台验证码走环境变量（Google、Bing、百度、头条、360、搜狗）。
- 写作规范 `docs/geo-content-guide.md`，定时任务按它写稿。

**还需要你做的**：在 Vercel 绑定 chingeo.com 并设为主域名（`www` 与 `*.vercel.app` 301 到主域名）；开通各站长平台、把验证码填进环境变量后重新部署、提交 sitemap（见 §3.6）；审核并合并定时任务提交的文章 PR；开通并登记官方账号（§5.2、§5.3）。

---

## 1. 现状诊断：问题在技术底座

站内测评工具会检查「AI 爬虫权限、不执行 JS 时的正文、JSON-LD、sitemap、llms.txt」，但本站这几项**几乎全部不合格**。拿自己的测评工具测自己的官网，分数大概率很低。这是做 GEO 服务的公司最不该有的问题，所以要最先修。

| # | 问题 | 现状（代码位置） | 影响 |
|---|---|---|---|
| 1 | **纯客户端渲染** | `app/page.tsx` → `ClientApp.tsx` 用 `dynamic(..., { ssr: false })`，首屏 HTML 只有空壳 | GPTBot、ClaudeBot、PerplexityBot 等 AI 爬虫基本**不执行 JS**，看到的是空页面；百度渲染能力弱；Google 要排队二次渲染 |
| 2 | **hash 路由** | `#/services`、`#/cases` 等（`App.tsx`） | 搜索引擎会忽略 `#` 之后的部分，全站只有**一个 URL** 能被收录 |
| 3 | 全站共用一个 title / description | `app/layout.tsx` 写死；切页只在浏览器里改 `document.title` | 爬虫看到的每个页面标题都一样，也不知道页面有什么内容 |
| 4 | 英文版爬虫看不到 | 语言存在 `localStorage`（`cw_lang`），URL 不变 | 英文内容不能被收录，也没有 hreflang |
| 5 | 没有 robots.txt、sitemap.xml、llms.txt、canonical | `public/` 和 `app/` 都没有 | 爬虫不知道该抓哪些页面；预览部署和 `*.vercel.app` 可能被当成重复站点收录 |
| 6 | 没有结构化数据 | 术语数据里写了 `schemaType: 'DefinedTerm'`，但页面没有输出 JSON-LD | 实体识别和富结果都没有 |
| 7 | 站内链接是按钮，不是链接 | `Header.tsx` / `Footer.tsx` 导航全是 `<button onClick>` | 爬虫无法通过链接发现页面，内链权重不传递 |
| 8 | 内容资产没有独立 URL | 15 节带视频的课、术语、2 个案例、2 个行业方案、12 份资源都塞在弹窗或 tab 里 | 最适合拿排名、被 AI 引用的长尾内容，在搜索引擎眼里不存在 |
| 9 | 没有分享图 | `twitter: summary_large_image` 但没有图 | 微信、LinkedIn、X 分享没有预览图 |
| 10 | 资源下载是假的 | `ResourcesView` 点击「下载」只弹 toast，`downloadCount` 是写死的数字 | 影响信任（E-E-A-T），被人发现会损害品牌；需要先确认 |

**结论**：内容素材已经不少，真正卡住的是渲染方式和 URL 结构。第一阶段的工作量最大，收益也最大。

---

## 2. 目标与衡量

| 维度 | 指标 | 工具 |
|---|---|---|
| 可抓取 | 所有公开页 `curl` 拿到的 HTML 就有完整正文、title、canonical、JSON-LD；站内测评工具测本站拿到满分 | `curl`、本站测评工具、Rich Results Test |
| 收录 | Google / Bing / 百度的收录页数 ≈ sitemap 页数 | Search Console、Bing Webmaster Tools、百度搜索资源平台 |
| 性能 | 移动端 LCP < 2.5s、INP < 200ms、CLS < 0.1 | PageSpeed Insights、Vercel Speed Insights |
| 搜索排名 | 核心词表（见 §4.1）进入前 10 的数量、自然点击量 | Search Console、百度资源平台 |
| AI 可见性 | 固定的 30 个买家问题，在 8 个 AI 平台上的提及率、排位、引用本站 URL 的次数 | 本站测评引擎（加一个内部监测任务）+ 每月人工抽测国内 AI |
| 业务 | AI 平台引荐流量（chatgpt.com、perplexity.ai 等 referrer）、测评提交数、预约数 | Vercel Analytics、`audit_contacts` 表 |

---

## 3. 第一阶段：技术底座（最优先，约 4～6 个 PR）

### 3.1 改为真实路径 + 服务端渲染

把 hash 路由改成 App Router 的真实路径。公开页面在服务端渲染（能静态生成的就静态生成），交互部分（测评、配置器、AI 顾问、弹窗）做成客户端组件嵌在里面。

**URL 设计**（中文无前缀，英文加 `/en`）：

| 页面 | 中文 | 英文 | 索引 |
|---|---|---|---|
| 首页 | `/` | `/en` | ✅ |
| 服务总览 | `/services` | `/en/services` | ✅ |
| 单项服务（5 个） | `/services/website`、`/seo`、`/geo`、`/ai-customer-service`、`/fde` | 同上加 `/en` | ✅（FDE 跟随 `SHOW_FDE`） |
| 案例列表 / 详情 | `/cases`、`/cases/ak-medical`、`/cases/tide-lion` | 同上 | ✅ |
| 行业方案 | `/solutions/medical`、`/solutions/environmental` | 同上 | ✅ |
| 学院 / 课程 / 单节课 | `/academy`、`/academy/geo`、`/academy/geo/c-1-1` | 同上 | ✅ |
| 术语百科 | `/glossary`、`/glossary/geo` | 同上 | ✅ |
| 资源 | `/resources`、`/resources/<id>` | 同上 | ✅ |
| AI 可见性测评 | `/audit`（独立落地页，首页保留区块）、`/audit/methodology`（测评方法与口径） | 同上 | ✅ |
| 关于我们 / 团队 | `/about`（新增） | `/en/about` | ✅ |
| 方案规划 | `/configurator` | `/en/configurator` | ✅（工具页，内容薄，优先级低） |
| 方案空间 | `/deal-room` | — | ❌ noindex |
| 登录 / 后台 | `/login`、`/console/*` | — | ❌ noindex + robots 屏蔽 |

要点：

- **旧链接兼容**：hash 不会发到服务端，在首页加一小段客户端脚本，把 `/#/services` 用 `location.replace` 跳到 `/services`、`#/console/leads` 跳到 `/console/leads`，已经分享出去的链接不会失效。
- **语言来自 URL**：`LanguageContext` 改成从路由读取语言，`localStorage` 只用来记住偏好（第一次访问 `/` 时可以提示切到英文，但**不自动跳转**，避免爬虫被重定向）。切换语言按钮变成指向对应语言 URL 的链接。`<html lang>` 在服务端就输出正确值。
- **导航用 `<Link href>`**：Header、Footer、页面间跳转改成真实链接，`onGoToAudit` 之类的回调改成 `href="/audit"` 或 `/#audit`。
- **SSR 安全**：`AppContext`、`LanguageContext` 里在渲染阶段读 `window` / `localStorage` 的地方移到 `useEffect`，避免水合不一致。
- **后台不动逻辑**：`/login`、`/console/*` 保持客户端渲染（antd、需要登录），只是从 hash 改为路径。
- 实施前按 CLAUDE.md 要求先读 `node_modules/next/dist/docs/` 里 Next 16 的路由、metadata、`proxy`（原 middleware）文档，以文档为准选择具体目录写法（例如 `app/[locale]/...` 加 rewrite，或者中英文各一棵目录树共享组件）。

### 3.2 每页独立的 metadata

每个页面用 `generateMetadata` 输出：

- `title`（含核心词，中文 ≤ 30 字、英文 ≤ 60 字符）、`description`（中文 70～80 字、英文 ≤ 155 字符）。
- `alternates.canonical` 指向正式域名的绝对地址。
- `alternates.languages`：`zh-CN`、`en`、`x-default`（指向中文）。
- Open Graph / Twitter 卡片，配合 `opengraph-image.tsx` 按页面自动生成分享图（标题 + 品牌标识，符合 DESIGN.md 的配色）。
- `metadataBase` 从环境变量 `NEXT_PUBLIC_SITE_URL` 读取（新增到 `.env.example`）。

### 3.3 robots.txt / sitemap.xml / llms.txt

- **`app/robots.ts`**：
  - 明确**允许**搜索和 AI 爬虫：Googlebot、Bingbot、Baiduspider、Sogou、360Spider、YisouSpider、GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、Claude-SearchBot、PerplexityBot、Google-Extended、Applebot-Extended、Bytespider、meta-externalagent 等。对做 GEO 的公司来说，**允许训练抓取**也是加分项（进入模型的长期记忆）。
  - 屏蔽 `/api/`、`/console`、`/login`、`/deal-room`。
  - 非生产环境（`VERCEL_ENV !== 'production'`）整站 `Disallow: /`，同时在 `next.config.mjs` 给预览部署加 `X-Robots-Tag: noindex`，避免 `*.vercel.app` 被当成重复站点。
- **`app/sitemap.ts`**：从数据文件（服务、案例、课程、术语、资源）生成，包含中英文 URL 与 `alternates`，`lastModified` 取内容的真实更新日期（给数据加 `updatedAt` 字段）。课程视频另出 video sitemap（或在 sitemap 条目里带 video 信息）。
- **`/llms.txt`**（按 llmstxt.org 格式）：公司一句话简介、五项服务、核心页面链接与一句话说明、案例与数据口径、联系方式。另外提供 **`/llms-full.txt`**：把服务说明、案例、术语、课程正文拼成一份纯文本，方便 AI 一次读完。两者都用 route handler 从数据文件生成，内容和页面保持一致，不需要手动维护。
- 可选：每个内容页提供 `.md` 版本（如 `/glossary/geo.md`），在 `<link rel="alternate" type="text/markdown">` 里声明。

### 3.4 结构化数据（JSON-LD）

写一个 `src/lib/schema.ts` 统一生成，在各页面服务端输出 `<script type="application/ld+json">`：

| 页面 | Schema 类型 |
|---|---|
| 全站 | `Organization`（名称、中英文别名 `alternateName`、logo、`contactPoint` 取自 `contactsData.ts`、`sameAs` 指向 B 站、知乎、公众号、LinkedIn 等）+ `WebSite` |
| 服务页 | `Service`（`provider` 指向 Organization、`serviceType`、`areaServed`、`audience`），**不写 `offers` / 价格** |
| 案例页 | `Article`（作者、发布与更新日期）+ 提及客户的 `Organization`，数据口径声明放正文 |
| 课程 / 单节课 | `Course` + `VideoObject`（需要封面图、时长、上传日期，并用 `sameAs` / `embedUrl` 关联 B 站对应视频） |
| 术语 | `DefinedTermSet` + `DefinedTerm`（数据里已有字段） |
| 有问答的页面 | `FAQPage`（Google 现在只对少数网站展示 FAQ 富结果，但对 AI 引用和 Bing 仍然有用） |
| 所有二级以下页面 | `BreadcrumbList` |

上线后用 Google Rich Results Test 和 Schema.org Validator 逐类型验证。

### 3.5 性能（Core Web Vitals）

- SSR 后首屏有内容，LCP 会明显改善；首屏不要依赖 `motion` 的入场动画（`Reveal` 在服务端输出可见状态）。
- 课程视频 `preload="none"` + 封面图；首页不加载视频。
- 检查各页 JS 体积：antd 只在后台加载（现在已拆分，迁移时保持）；`VisibilityAudit.tsx`（近 1000 行）按需加载。
- 图片统一用 `next/image`，提供尺寸避免布局偏移。

### 3.6 域名与收录

> 范围说明：这里只讲 chingeo.com 自身被豆包等国内平台收录的措施，是网站技术与运营工作，不对外写文章。对外的 GEO 内容只面向海外买家。

- 正式域名 chingeo.com：在 Vercel 的 Domains 里设为主域名，`www.chingeo.com` 与 `*.vercel.app` 301 到它。
- 开通并提交 `https://chingeo.com/sitemap.xml`：Google Search Console、**Bing Webmaster Tools**（Bing 索引同时供 Copilot 和 ChatGPT 搜索使用，比 Google 更直接影响 GEO）、百度搜索资源平台、**头条搜索站长平台**（字节系，与豆包同一生态）、360 与搜狗站长平台。各平台选“HTML 标签”验证，把验证码填进对应环境变量（见 `.env.example`）后重新部署即可。
- 接入 **IndexNow**（Bing、Yandex 等）：内容更新时主动推送；百度用其「普通收录」API 推送。可以放在构建完成后的脚本里。

---

## 4. 第二阶段：内容与站内优化

### 4.1 关键词与问题地图

每个 URL 只对应一个主意图，避免多个页面抢同一个词。初步词表（实施前用百度指数、5118、Google Keyword Planner、Search Console 数据校准）：

| 意图 | 中文核心词 | 英文核心词 | 落地页 |
|---|---|---|---|
| GEO 服务 | GEO 优化、生成式引擎优化、AI 搜索优化、让 ChatGPT 推荐我的品牌、DeepSeek 优化 | GEO agency, generative engine optimization services, AI search visibility | `/services/geo` |
| SEO 服务 | 外贸 SEO、谷歌 SEO 优化、外贸网站优化 | B2B SEO for manufacturers, Google SEO China exporters | `/services/seo` |
| 独立站 | 外贸独立站建设、B2B 独立站、出海官网建设 | B2B website for Chinese manufacturers | `/services/website` |
| AI 客服 | 外贸 AI 客服、多语言智能客服、询盘自动回复 | AI customer service for B2B export | `/services/ai-customer-service` |
| FDE | FDE 驻场、前线部署工程师、企业 AI 落地 | forward deployed engineer, enterprise AI deployment | `/services/fde` |
| 工具 | AI 可见性检测、GEO 检测工具、品牌 AI 排名查询 | AI visibility checker, GEO audit tool | `/audit` |
| 知识 | 什么是 GEO、GEO 和 SEO 区别、llms.txt 是什么、AI Overviews 怎么优化…… | what is GEO, GEO vs SEO, … | `/glossary/*`、`/academy/*` |

### 4.2 页面写法：先给答案，再讲细节

AI 引用的是「能直接回答问题的段落」，所以所有内容页统一按下面的结构写：

1. **H1 用问句或明确的主题**（术语数据已经有 `questionTitle`）。
2. **第一段 40～60 字直接回答**（术语数据已经有 `oneLineDefinition`），能单独被引用。
3. 用 H2 / H3 分节，配**表格、步骤、对比**（AI 偏爱结构化信息）。
4. 写**具体数字和出处**（案例的数据口径声明是很好的范例，保留并推广到所有数字）。
5. 结尾 FAQ（3～5 问）+ 相关术语、课程、案例的内链。
6. 标明作者、发布日期、更新日期。

### 4.3 内容扩充（按优先级）

1. **五个服务详情页**：适合谁、解决什么问题、交付物、流程与周期（取自 `servicePackages.ts` 的 `buildProposalPlan`）、相关案例、相关课程、FAQ。**不写价格**，费用问题引导到诊断会。
2. **术语百科从 4 条扩到 40 条以上**，每条一个页面：GEO、AEO、AI Overviews、llms.txt、JSON-LD、Schema、E-E-A-T、hreflang、Core Web Vitals、RAG、实体（Entity）、引用源（Citation）、零点击搜索、Bing IndexNow、AI 爬虫……这类「是什么 / 有什么区别」的问题，正是 AI 最常被问、也最常引用词条型页面的问题。
3. **15 节课每节一个页面**：视频 + 文字稿（课程数据里已有正文）+ 要点 + FAQ，并链接到 B 站原视频。文字稿是视频内容被搜索和 AI 读到的唯一途径。
4. **案例详情页**：保留现有的数据口径声明，补充时间线、方法、截图与可验证的外部链接。
5. **原创数据报告（GEO 最强的引用磁铁）**：用测评工具积累的数据（只用聚合、匿名的统计，不披露任何单个客户），每季度发布一份《中国出海企业 AI 可见性报告》，例如「各行业品牌在 ChatGPT / Perplexity / Gemini 中被提及的比例」「有 llms.txt / JSON-LD 的官网被引用率差异」。原创数据会被媒体、博客和 AI 反复引用，是建立权威最快的办法。
6. **测评方法页 `/audit/methodology`**：公开测评怎么出题、怎么打分、各平台怎么调用，提高测评报告的可信度，也让 AI 在被问「怎么测 AI 可见性」时引用我们。
7. **关于我们 / 团队页**：真实的人、职务、经历和联系方式（取自 `contactsData.ts`），配 `Person` schema，作为 E-E-A-T 的作者信息来源。
8. **资源页**：要么提供真实文件（可以要求留联系方式再下载，作为线索入口），要么在文件做好前去掉「下载」按钮和下载次数。每份资源配一个公开的 HTML 摘要页，让搜索和 AI 能读到内容。

### 4.4 内链

- 术语 ↔ 课程 ↔ 服务 ↔ 案例互相链接（数据里已有 `relatedLessons`、`relatedTerms`、`relatedLessonId`，直接用起来）。
- 每个内容页底部引导到 `/audit`（测评）和预约。
- 面包屑导航。

---

## 5. 第三阶段：站外 GEO（实体与信源）

AI 判断一个品牌是否可信，主要看**站外**有多少独立来源一致地描述它。

### 5.1 统一实体信息

- 全网统一：中文名「云端智荐」、英文名、一句话定位、五项服务、联系方式。官网 `Organization` schema 的 `sameAs` 列出所有官方账号。
- **英文名**：已改为 **ChinGEO**（与域名 chingeo.com 一致），避开与北京 IT 运维公司「云智慧」英文名 Cloudwise 的重名。所有英文页面与外部资料统一写 ChinGEO，中文写云端智荐，首次出现时写“云端智荐（ChinGEO）”。
- 在 Wikidata 建立公司条目（门槛比维基百科低，是多个 AI 的知识来源），条件成熟后再考虑百度百科。

### 5.2 中文信源（面向国内出海企业客户）

| 平台 | 原因 | 做法 |
|---|---|---|
| 今日头条（头条号）/ 抖音 | 豆包所在的字节系生态；字节跳动的爬虫 Bytespider 用于头条搜索 | 文章与短视频同步发布并链接回官网；在头条搜索站长平台验证网站、提交 sitemap |
| 微信公众号 | 腾讯元宝的主要信源 | 课程、案例、报告同步发布，文末链回官网 |
| 知乎 | 多个国内 AI 与百度高频引用 | 回答「GEO 是什么」「外贸独立站怎么做」等问题，建专栏 |
| 百家号 / 百度系 | 文心、百度 AI 搜索优先收录 | 同步文章 |
| B 站 | 已有 15 条课程视频 | 简介里放官网课程页链接；官网课程页反链 B 站 |
| 小红书、36氪、雨果网、福步外贸论坛 | 外贸人群聚集、媒体背书 | 投稿报告与案例 |

### 5.3 英文信源（面向海外与英文 AI）

- LinkedIn 公司页与创始人个人号（英文 AI 引用 B2B 服务商的主要来源之一）。
- YouTube 上传英文版课程。
- Clutch、G2、GoodFirms 等服务商目录（ChatGPT 和 Perplexity 回答「推荐 GEO 服务商」时经常引用这类目录）。
- Reddit、Medium、行业媒体投稿（原创数据报告最容易被采用）。

### 5.4 客户案例的双向背书

请爱康医疗、泰宁科创在各自官网的合作伙伴或案例区域写一句并链接回本站（需客户同意）。第三方站点的提及比自己说更有说服力。

---

## 6. 第四阶段：监测与迭代

- **自测**：每周用本站测评引擎测一次自己的官网，结果存档成趋势；把「本站测评分数」当作每次上线的回归检查。
- **问题监测集**：固定 30 个买家问题（例如「中国有哪些做 GEO 的公司」「外贸企业怎么让 ChatGPT 推荐自己」），每月在 ChatGPT、Perplexity、Gemini、Google AI Overviews、Copilot、DeepSeek、豆包、Kimi、元宝上跑一遍，记录是否提及、排位、引用了哪个 URL。前三个平台可以复用测评引擎自动跑，国内平台先人工抽测。
- **AI 引荐流量**：在 Vercel Analytics 里按 referrer 单独看 chatgpt.com、perplexity.ai、gemini.google.com、copilot.microsoft.com 等来源。也可以在官网上嵌入自家的 `cw.js`，把官网当作第一个客户，在后台看 PV 与线索。
- **月度复盘**：哪些页面被收录、被引用；没有被引用的问题补内容；排名下滑的页面更新内容并更新 `dateModified`。

---

## 7. 实施顺序（建议的 PR 拆分）

| 顺序 | PR | 内容 | 依赖 |
|---|---|---|---|
| 1 | 基础配置 | `NEXT_PUBLIC_SITE_URL`、`robots.ts`、`sitemap.ts`（先只有首页）、`llms.txt`、预览部署 noindex、全站 `Organization` / `WebSite` JSON-LD、默认分享图 | 确认正式域名 |
| 2 | 路由迁移 | hash → 真实路径，旧 hash 链接跳转，导航改 `<Link>`，每页 metadata，公开页服务端渲染 | 1 |
| 3 | 英文路径 | `/en/*`、hreflang、语言切换改为链接 | 2 |
| 4 | 内容详情页 | 服务、案例、课程、术语、资源的详情页与对应 JSON-LD；sitemap、llms-full.txt 自动包含 | 2 |
| 5 | 测评落地页 | `/audit`、`/audit/methodology`、`/about` | 2 |
| 6 | 性能与收录 | CWV 优化、IndexNow / 百度推送、各站长平台验证 | 2 |
| 持续 | 内容与站外 | 术语扩充、课程文字稿、季度报告、站外信源铺设、月度监测 | 4 |

每个 PR 都按 CLAUDE.md 验证：`bun run lint`、`bun run build`、390px / 1440px 截图；另外加两项：用 `curl` 检查 HTML 里有正文、title、canonical 和 JSON-LD，用本站测评工具测预览部署。

---

## 8. 仍待确认的事项

1. **内容审核人**：定时任务提交的文章 PR 由谁审核、多久合并一次？
2. **原创数据报告**：是否同意用测评工具积累的聚合、匿名数据发布季度报告（§4.3 第 5 条）？
3. **官方账号**：已开通的公众号、知乎、头条号、LinkedIn、YouTube 账号地址，开通后加进 `src/lib/site.ts` 的 `SAME_AS`。
4. **国内访问速度**：Vercel 在国内访问不稳定，若百度、头条收录慢或国内客户打开慢，再评估国内 CDN 或境内部署。
