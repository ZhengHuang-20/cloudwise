# GEO 内容写作规范

「GEO 洞察」文章（`/insights/<slug>`）与术语百科（`/glossary/<slug>`）的写作与上线规则。人工写作和定时任务自动写作都按这份规范执行。

## 1. 写什么

- **读者**：中国出海企业的决策者、市场负责人、外贸总监；英文版面向海外读者与英文 AI。
- **选题来源**（按优先级）：
  1. 客户会问 AI 或搜索引擎的问题：「怎么让 ChatGPT 推荐我们」「怎么测自己的品牌在 AI 回答里的位置」「外贸独立站怎么验收」。
  2. 站内还没有覆盖的术语：AEO、AI Overviews、实体（Entity）、引用源、零点击搜索、hreflang、Schema、IndexNow、AI 爬虫、llms.txt 等。
  3. 我们自己的方法与数据：测评方法、案例拆解、交付流程（只写能公开、可核实的部分）。
- **服务对象**：文章只面向海外买家、出海企业的 AI 与搜索可见性，即我们的出海 GEO 服务。不写面向国内市场的 GEO 教程，也不写国内 AI 平台（豆包、DeepSeek、Kimi、元宝）的收录与优化方法。网站自身被国内平台收录的措施只放在内部方案文档 `docs/seo-geo-plan.md`，不作为对外文章。
- **不重复**：动笔前看一遍 `src/data/insights/` 与 `src/data/glossaryData.ts`，同一个问题只写一篇；角度不同就在已有文章里补充并更新 `updatedAt`。
- **先定三件事再动笔**：目标词、搜索意图、页面类型（文章 / 术语 / 服务页）。先看目标词在 Google 与 Bing 第 1 页的结果，页面类型以它为准；一个页面只对应一个主词，一个词只写一个页面。
- **选词**：同一类词里，先按最难的那个词定内容深度，再发布最容易拿到排名的页面；没有搜索量、也不会带来买家的词不优先写。

## 2. 怎么写（GEO 写法）

1. **标题**用读者会搜、会问 AI 的说法，最好是问句。中文不超过 30 字，英文不超过 70 个字符。
2. **开头直接回答**（`answer` 字段）：中文 50～120 字、英文 40～80 词，单独读也成立，可以被 AI 原样引用。
3. **正文**（`body`，Markdown 子集，见 `src/lib/markdown.ts`）：
   - 从 `##` 开始分节，不写 H1；每节开头一句话说结论。
   - 多用表格、编号步骤、对比，数字写清出处与口径。
   - 中文 1500～3000 字，英文对应长度；英文不是逐字翻译，要符合英文读者的表达习惯。
   - 站内链接写相对路径（`/services/geo`、`/audit`、`/glossary/geo`），英文版会自动加 `/en`。每篇至少链接 1 个服务页、1 个术语或课程，以及测评页 `/audit`。
   - 外部链接只链权威来源（官方文档、标准原文），用完整的 `https://` 地址。
4. **常见问题**（`faqs`）3～5 条，答案 1～3 句话。
5. **元数据**：`description` 中文 60～90 字、英文 120～160 字符；`keywords` 写 3～6 个目标搜索词或 AI 提问。

## 3. 红线（违反任何一条都不能上线）

- **不写价格**：不出现金额、预算区间、折扣、付款比例；问到费用一律引导到方案规划与诊断会。
- **不编造**：不编造数据、案例、客户、引语、平台规则或“内部消息”。不确定的写“官方未公开”，并说明依据。案例只引用 `src/data/caseStudiesData.ts` 里已有的事实与口径。
- **不承诺结果**：不写“保证排名第一”“保证 AI 推荐”。
- **不点名贬低**竞争对手，不写黑帽手段（刷量、投毒、买链接）。
- **FDE 相关**内容的 `topic` 设为 `fde`，`SHOW_FDE` 关闭时会自动隐藏。
- 对外联系人、电话只引用 `src/data/contactsData.ts`，不在文章里写死。

## 4. 怎么上线

**新文章**：

1. 新建 `src/data/insights/<slug>.ts`（slug 用小写英文与连字符），按 `src/data/insights/types.ts` 的 `Insight` 类型填写中英文。参考现有文章的结构。
2. 在 `src/data/insights/index.ts` 里 import 并加入 `ALL_INSIGHTS` 数组。
3. `relatedServices` / `relatedTerms` / `relatedLessons` 只填已存在的 slug 或 id。

**新术语**：在 `src/data/glossaryData.ts` 的 `ALL_GLOSSARY_TERMS` 里加一条（id 形如 `term-xxx`，URL 为 `/glossary/xxx`），并在 `src/data/en/glossary.ts` 的 `GLOSSARY_EN` 里加对应英文。

**验证**：

```bash
bun run lint
SKIP_DB_MIGRATE=1 bun run build
bun run start   # 另开终端
curl -s localhost:3000/insights/<slug> | grep -o '<title>.*</title>'
curl -s localhost:3000/sitemap.xml | grep <slug>
curl -s localhost:3000/llms.txt | grep <slug>
```

页面、sitemap、`llms.txt` / `llms-full.txt` 与 JSON-LD（Article + FAQPage）都会自动生成，不需要另外改。

**发布节奏与观察期**：

- 新站不批量灌文章：每周 1～2 篇（中英文同时发，算两个 URL），一天最多 1 篇。批量发布的内容在新域名上多半不会被收录。
- 发布后请求收录（Google Search Console、Bing Webmaster Tools），再到 Search Console 看覆盖状态；确认被收录前不算完成。
- 优化一次，然后观察 90 天再判断效果；观察期内反复改标题与正文会让计时重来。发布完的下一步是写下一个词，不是再改这一篇。
- 例外：排名在 5～20 位且有展示量的页面可以优先优化，做法是把目标词原样放进标题开头、从同主题页面补 3～5 条站内链接。改之前先看这个页面已经带来点击的搜索词，别改掉它们。
- 完成前自问：真实读者会读完吗？有署名作者、有出处、有真实截图或数据吗？

**从更正中学习**：被人指出写法或做法有问题时，把规则补进 `docs/seo-lessons.md`（日期、问题、规则）；每次为本站写内容前先读一遍。第一篇做到位的文章可作为模板，后续按它的结构、Schema 和内链方式复制。

**发布后**：在今日头条（头条号）、知乎、微信公众号等平台发布摘要版并链接回官网；英文版可同步到 LinkedIn。每月用固定问题集复测一次，观察是否被 AI 引用。
