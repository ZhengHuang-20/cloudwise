---
name: seo-geo-audit
description: 维护 chingeo.com 时验证 SEO / GEO 基线——路由表、标题、JSON-LD、Markdown 镜像、sitemap、robots、llms.txt、IndexNow 的一致性检查与修复指引。
whenToUse: 在本仓库改路由、页面标题描述、JSON-LD、sitemap / robots / llms.txt、分享图，或新增文章、课时、术语、案例之后；发布前自查；线上出现收录 / 富结果 / AI 引用异常时。
---

# SEO / GEO 基线检查

`scripts/seo-audit.ts` 是本仓库唯一的 SEO / GEO 回归检查：静态模式不联网、不需要构建，直接跑生成逻辑；
`--live` 再抓线上实际输出。规范本身写在 `src/site/{links,routes,meta,schema,llms,markdown}.ts` 与
`app/{sitemap,robots}.ts`，**脚本只读不写**。

## 什么时候跑

- 改了 `src/site/routes.ts`、`links.ts`、`meta.ts`、`schema.ts`、`app/sitemap.ts`、`app/robots.ts`、`src/site/llms.ts`
- 新增 / 删除页面、文章、课时、术语、案例、服务
- 改标题、描述、更新日期（`PAGE_UPDATED` / `updatedAt`）
- 发布前：`bun run seo:audit`；改版后或怀疑线上不对时：`bun run seo:audit:live`

```bash
bun run seo:audit              # 静态检查，秒级；有 error 时退出码 1
bun run seo:audit:live         # 再抓 https://chingeo.com 的 robots / sitemap / llms / 抽样页
bun run seo:audit --live=http://localhost:3000   # 本地 dev 起在 3000 时
bun run seo:audit --gsc        # 再加 Search Console 的真实收录数据（需要服务账号 key）
bun run seo:audit:full         # = --live --gsc，发布后跑这个
bun run seo:audit --json       # 机器可读，供 CI 或后续处理
bun run seo:audit --strict     # warn 也算失败
```

没有 bun 时用 `npx tsx scripts/seo-audit.ts`（参数相同）。注意脚本按 `NEXT_PUBLIC_SITE_URL`、缺省
`https://chingeo.com` 判断绝对地址，验本地时两边要一致。

## 怎么读结果

`✗` 是错误：会直接影响收录、富结果或 AI 引用，发布前必须清零。`⚠` 是提醒：可能是有意为之，逐条判断。

| 规则 | 含义 | 修哪里 |
|---|---|---|
| `route/roundtrip`、`route/duplicate`、`route/shape` | `routePath` 与 `resolveRoute` 对不上、同一路径两个路由、路径不规范 | `src/site/links.ts` 的 `routePath` + `src/site/routes.ts` 的 `resolveRoute` / `allRoutes` 同步改 |
| `meta/title-missing`、`meta/description-missing` | 某页没有标题或描述 | `src/site/meta.ts` |
| `meta/title-overflow`（warn） | 所有标题候选都超出中文 30 / 英文 60 宽度，`<title>` 会被机器截断 | 英文页优先在 `meta.ts` 的 `EN_SHORT_TITLES` 按路由登记人工短标题（只改 `<title>`，不动 H1）；其他页面加 `shortTitles` 或改短 `title` |
| `meta/description-length`（warn） | 描述过短或过长（中文 40–160、英文 60–180） | `meta.ts` |
| `meta/title-duplicate`、`meta/description-duplicate`（warn） | 两页共用同一标题 / 描述，等于互相竞争 | 改成各自独立的标题与描述 |
| `schema/expected-type` | 该页面类型缺少应有的 `@type`（如课时缺 `LearningResource`） | `src/site/schema.ts` 的 `mainEntities` + 本脚本的 `EXPECTED_TYPES` |
| `schema/dangling-ref` | `{"@id"}` 引用在同一个 `@graph` 里找不到目标 | `schema.ts`：节点 `@id` 与引用一起改 |
| `schema/url-not-absolute` | 结构化数据里出现站内相对地址 | `schema.ts` 统一用 `url()` / `absoluteUrl()` |
| `schema/date-modified` | JSON-LD 的 `dateModified` 与 `routeModified` 不一致 | 只改 `routeModified` 的数据源（`updatedAt` / `PAGE_UPDATED`），不要在 `schema.ts` 写死日期 |
| `schema/page-id`、`schema/page-url` | 页面节点的 `@id` / `url` 不是 `<canonical>#webpage` | `schema.ts` 的 `pageSchema` |
| `md/missing`、`md/heading` | 声明了 Markdown 镜像但取不到，或首行不是一级标题 | `src/site/markdown.ts` 的 `body()` 分支 |
| `md/relative-link`、`llms-full/relative-link`（warn） | 正文里有未绝对化的站内链接 | 文章里写绝对路径时用 `absolutizeLinks` 覆盖的写法，或改正文 |
| `sitemap/missing-url`、`sitemap/extra-url` | sitemap 与「可索引路由」不一致（多出来的通常是 noindex 泄漏） | `app/sitemap.ts` 的过滤条件或 `isIndexable` |
| `sitemap/alternates-*` | hreflang 互指缺失或指错 | `app/sitemap.ts` 的 `alternates`，中英路径要同构 |
| `sitemap/lastmod-*` | `lastmod` 不是 `YYYY-MM-DD` 或在未来 | `routeModified` 的数据源 |
| `sitemap/video-*` | 视频信息挂到了英文页或非课时页 | `app/sitemap.ts` 的 `lessonVideo` 调用条件 |
| `robots/missing-bot`、`robots/wildcard-*`、`robots/preview` | AI 爬虫没放行、通配规则异常、预览环境没整站屏蔽 | `app/robots.ts` |
| `robots/sitemap` | robots.txt 没声明 sitemap | `app/robots.ts` |
| `llms/missing-page` | 可索引正文页没写进 llms.txt | `src/site/llms.ts`（按数据自动生成，通常是新数据没接进去） |
| `llms/noindex-leak` | llms.txt 收录了 noindex 页面 | `llms.ts` |
| `indexnow/key-file`、`indexnow/key-mismatch` | `public/<INDEXNOW_KEY>.txt` 缺失或内容与 `src/lib/site.ts` 不一致 | 补文件，或同步 `INDEXNOW_KEY` |
| `live/*` | 线上实际输出与生成逻辑不一致（常见于线上还是旧部署） | 先确认部署完成；确实不一致再查代码 |
| `gsc/property` | 服务账号看不到 Search Console 属性 | 把服务账号邮箱加进 GSC 用户（权限「完整」） |
| `gsc/sitemap-missing`、`gsc/sitemap-errors` | sitemap 没提交或有错误 | Search Console 重新提交；错误先看抓取报告 |
| `gsc/sitemap-count` | sitemap 提交条数与代码侧可索引页数不一致 | 线上还是旧部署，或 sitemap 缓存未更新 |
| `gsc/indexed-low`、`gsc/indexed-partial` | 已收录页数明显少于可索引页数 | 内容/内链/外链问题，先看哪些页还在队列里 |
| `gsc/pending-index`（warn） | 抽查页是 `Discovered - currently not indexed`，新站常见 | 加内链、提高更新频率、等抓取；不要反复提交 |
| `gsc/canonical-mismatch` | Google 选的 canonical 与页面不一致 | 查 hreflang / 重复内容 / 参数化 URL |

## 修复顺序与边界

1. **先修错误，再逐条判断提醒**。不要为了变绿去放宽规则；规范的唯一来源是上面那几个模块。
2. 改 `schema.ts` 的 `EXPECTED_TYPES` 只在**页面类型本来就应该有该 `@type`** 时才改——那是检查表，不是豁免表。
3. 内容类提醒（标题截断、描述重复、链接未绝对化）改动的是文案，要中英文一起改，并遵守 `docs/geo-content-guide.md`。
4. 更新日期（`lastmod` / `dateModified`）只改实际改了正文的那一类；样式、页脚、脚本改动不动日期，见 `CLAUDE.md` 的 SEO / GEO 一节。
5. 站内不写价格、不编造数据、不承诺排名——检查通过不代表内容合规，真实性红线见 `CLAUDE.md`。

## GSC 接入（`--gsc`）

用服务账号读 Search Console，不经过浏览器授权（OAuth 应用处于 Testing 时 refresh token 只有 7 天，不能用于长期自动化）。

- 凭据：默认 `~/.dsh/credentials/gsc-service-account.json`，可用 `GSC_SERVICE_ACCOUNT` 指定路径
- 属性：默认 `sc-domain:<去掉 www 的域名>`，可用 `GSC_SITE` 覆盖
- 会做的检查：属性可见性、sitemap 提交与错误、提交条数 vs 代码侧可索引页数、5 个抽样页的索引状态与 Google canonical
- 抽查页是「首页 + 服务 + 文章 + 术语 + 课时」各取一个中文页；新增页面类型时同步 `gscSample()`

## 关于那个 `google api key`

Search Console **不能用 API key 认证**（Data API 只接受 OAuth 2.0 或服务账号）：API key 只能访问公开 API，
Search Console 的 `searchanalytics` / `urlInspection` 都会返回 401/403。要接 GSC MCP，需要
服务账号 JSON（并把服务账号邮箱加进 Search Console 的用户，权限「完整」）或 OAuth 客户端密钥。

## 相关文档

- `docs/seo-geo-plan.md`（方案与进度）、`docs/geo-content-guide.md`（写作规范）、`docs/seo-lessons.md`（被更正过的规则）
- `CLAUDE.md` 的「页面与路由」「SEO / GEO」两节是本 skill 的上位说明，冲突时以它为准
