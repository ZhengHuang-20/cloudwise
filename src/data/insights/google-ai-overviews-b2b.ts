import type { Insight } from './types';

export const googleAiOverviewsB2b: Insight = {
  slug: 'google-ai-overviews-b2b',
  topic: 'seo',
  author: 'founder',
  publishedAt: '2026-11-12',
  updatedAt: '2026-11-12',
  keywords: {
    zh: ['AI Overviews 优化', 'AI Overviews B2B', 'Google AI 概览', 'AI 概览会引用哪些网页', 'AI 概览 点击下降'],
    en: ['AI Overviews B2B', 'AI Overviews manufacturers', 'which pages do AI Overviews cite', 'AI Overviews optimization', 'AI Overviews organic clicks'],
  },
  relatedServices: ['seo', 'geo', 'website'],
  relatedTerms: ['term-ai-overviews', 'term-zero-click', 'term-aeo', 'term-eeat', 'term-structured-data'],
  relatedLessons: ['lesson-b-1-3', 'lesson-c-1-1'],
  zh: {
    title: 'Google AI 概览引用哪些网页？B2B 制造商怎么应对',
    description:
      'Google AI 概览会引用哪些网页、点击会少多少、B2B 制造企业该怎么应对？本文依据 Google 官方文档与一项随机对照实验，给出页面写法、衡量口径与应对清单。',
    answer:
      'AI 概览引用的是已被 Google 收录、允许显示摘要、能直接回答子问题的网页，官方说没有特殊优化。概览出现时自然点击减少，而买家“找合格供应商”本身就是信息型问题。制造企业的重点是让品牌出现在概览里，再用产品页、认证页承接来核实的买家。',
    body: `## 先说结论

AI 概览改变的是买家在哪一步看到你，而不是买家要不要核实你。对制造企业，我的判断分三层：

1. **点击会少，但少的主要是信息型搜索的点击。** 一项随机对照实验发现，概览出现时，用户点向外部网站的自然点击减少 38%。买家查品类、查标准、查怎么选供应商，正是概览最常回答的问题。
2. **进入概览没有新套路。** Google 官方写明，出现在 AI 概览和 AI 模式里没有额外要求，也不需要特殊的结构化数据或 AI 专用文件。能被引用的前提，就是传统 SEO 做对。
3. **该优化的是“被摘录”和“被核实”两件事。** 把认证、标准、规格写成可以直接摘出来的答案，争取在概览里被提到；再让产品页和认证页经得起点进来的买家核对。

定义层面的问题（AI 概览是什么、nosnippet 和 Google-Extended 的区别）见术语 [AI Overviews](/glossary/ai-overviews)，本文不再展开。

## 数据与局限：概览出现时，自然点击明显减少

目前最可靠的证据来自一项随机对照实验，它的结论很明确，但适用范围有限。

Saharsh Agarwal（印度商学院）与 Ananya Sen（卡内基梅隆大学）的工作论文 [Google AI Overviews and Publisher Traffic: Evidence from a Field Experiment](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6513059) 用自制的 Chrome 扩展，把用户随机分成两组：一组看正常的 Google 搜索（带 AI 概览），一组看去掉 AI 概览的版本。论文摘要报告的结果如下：

| 指标 | 结果（论文摘要原文口径） |
|---|---|
| 外部网站的自然点击 | 概览出现时减少 38% |
| 零点击搜索的概率 | 概览出现时提高 33% |
| 广告点击、搜索次数 | 没有发现影响 |
| 影响集中在哪里 | 概览出现在页面顶部时，以及排名最靠前的自然结果 |
| 用户体验 | 问卷显示，去掉概览并没有让用户觉得更难找到信息或结果变差 |

读这组数字要注意四点局限：

- **这是工作论文**，2026 年发布在 SSRN，尚未经过同行评审。
- **样本是美国用户。** 作者在 AEA 随机对照试验注册表的[登记](https://www.socialscienceregistry.org/trials/17393)显示，计划样本约 1,500 人、只用 Chrome 浏览器，计划实验期为 2026 年 1 月 7 日至 2 月 7 日；最终样本量以论文正文为准。浏览器扩展只能装在电脑端 Chrome 上，所以结果不代表手机搜索（这一点是我们的推断）。
- **38% 是“概览出现时”的条件结果**，不等于一个网站的总流量会少 38%。Google 的官方说法是，AI 概览只在系统认为对传统搜索有增益时才出现，很多搜索并不触发。
- **研究对象是普通消费者的日常搜索**，不是 B2B 采购。工程采购的搜索行为有没有同样的变化，目前没有可核的公开研究。

Google 自己的说法是另一面：在[官方文档](https://developers.google.com/search/docs/appearance/ai-features)和 2025 年 5 月的 [Search Central 博客](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search)里，它说从带概览的结果页点出去的访问“质量更高”，用户在网站上停留更久。Google 没有公布这句话背后的数据，所以只能当作平台的表述，不能当作已证实的结论。

## 对制造企业：“找合格供应商”本身就是信息型问题

点击减少对 B2B 制造企业的影响，比对电商更早到来。原因在买家的搜索路径上：海外买家在发询盘之前，要先弄清楚品类、标准和怎么筛选供应商，这几步几乎都是信息型问题。

| 买家在做的事 | 典型的英文搜索（示例） | 搜索意图 | 企业要争取的结果 |
|---|---|---|---|
| 了解品类、学会选型 | how to choose a stormwater detention module supplier | 信息型 | 品牌出现在概览的答案或来源里 |
| 核实标准与认证 | how to verify a CE certificate for industrial valves | 信息型 | 认证页、标准说明页被引用 |
| 比较具体供应商 | [品牌名] vs [品牌名]、[品牌名] factory audit | 混合 | 官网与第三方信息一致、可核对 |
| 找到并联系你 | [品牌名] datasheet、[型号] price inquiry | 导航型、交易型 | 产品页、询盘入口直接可达 |

前两行是信息型搜索，也是概览最容易出现、点击最容易被截留的地方。对制造企业来说，这两步决定了你能不能进入候选名单；后两行才是点进官网的时刻。

所以我的核心判断是：**不必去挽回每一口信息型点击，而要让品牌出现在信息型问题的答案里，再让真正要核实的人点进来时看到证据。** 买家在概览里看到你的名字和认证，这次没点，下一步也可能直接搜你的品牌名。这条路径是我们的推断，没有公开数据能量化它，所以衡量时要把品牌词搜索单独拿出来看（见后文）。

## 什么样的网页会被引用：官方条件加上可以摘录的写法

能被引用的前提只有官方写明的那几条，其余都是写法问题。

**官方条件**（来自 Google 的 [AI 功能与网站](https://developers.google.com/search/docs/appearance/ai-features)）：

- 页面要被收录，并且有资格在 Google 搜索里显示摘要；除了搜索的技术要求，没有额外的技术要求。
- 不需要新建机器可读文件、AI 文本文件或特殊标记，也没有必须添加的 schema.org 结构化数据。
- 符合要求也不保证被抓取、收录或展示。
- AI 概览和 AI 模式可能使用“查询扇出”（query fan-out）：围绕子话题和不同数据源同时发出多个相关搜索，再组织回答。

查询扇出对制造企业的含义是我们的解读：买家问“怎么选某类设备的供应商”，系统可能同时去搜认证要求、适用标准、材质差异这些子问题。**被引用的往往不是“公司介绍”，而是恰好回答了某个子问题的那一页。** 与其写一篇大而全的“为什么选择我们”，不如让每个子问题都有一页或一段清楚的回答。下面几类页面最值得改写：

| 页面 | 要回答的子问题 | 能被摘录的写法 |
|---|---|---|
| 产品规格页 | 这款产品的关键参数是什么 | 参数用表格列出，写明单位、测试条件和依据的标准编号 |
| 认证与检测页 | 这家企业有哪些认证，怎么核实 | 写证书名称、编号、发证或检测机构、有效期，以及在哪里能查到 |
| 标准对照页 | 产品符合哪个市场的哪项标准 | 一个标准一段，先写结论（符合哪一级或哪一类），再写检测依据 |
| 工程说明或选型指南 | 什么工况选哪种型号 | 先给选型结论，再给计算或判断方法，写清适用边界 |
| 应用案例页 | 用在过哪里，效果如何 | 只写能公开、能核实的项目事实，不写无法证明的形容词 |

这些写法和 [E-E-A-T](/glossary/eeat) 里的“可信”是同一件事：别人能核对的信息，才值得引用。产品页的具体自查项，可以参考我们之前写的[产品页 6 项自查清单](/insights/ai-supplier-search-product-page-checklist)。

## 点击减少之后，用什么来衡量

只看点击，会把“出现在概览里但没被点”的价值全部记成零。建议把衡量拆成四层：

| 层级 | 看什么 | 从哪里看 |
|---|---|---|
| 曝光 | 网站在 AI 概览和 AI 模式里的展示次数，以及哪些页面被展示 | Search Console 的生成式 AI 效果报告 |
| 搜索表现 | 各页面的展示、点击、点击率 | Search Console 效果报告（网页搜索类型） |
| 品牌需求 | 品牌名、型号的搜索量是否在涨 | Search Console 按查询筛选品牌词 |
| 业务结果 | 落地页、询盘数量与质量 | 网站分析工具与询盘记录 |

关于 Search Console 的口径，有三点要先弄清：

1. **AI 概览的点击和展示计入网页搜索的总数据**，不会单独减掉。Google 的[统计说明](https://support.google.com/webmasters/answer/7042828)写明：概览在结果里只占一个位置，概览里的所有链接都记为同一个排名位置。
2. **2026 年 8 月 31 日起，所有网站都有生成式 AI 效果报告。** 按[帮助文档](https://support.google.com/webmasters/answer/16984139)，它统计的是 AI 概览和 AI 模式里链接到你网站的展示次数，可以按页面、国家、设备和日期查看。帮助文档列出的维度里没有搜索查询，所以它能告诉你哪些页被展示，不能直接告诉你是哪些问题。
3. **同一时间上线的还有生成式 AI 控制项。** 按[帮助文档](https://support.google.com/webmasters/answer/16908024)，它可以把整个网站排除出这些功能。排除后不会再有来自这些功能的展示和流量；它不影响其他搜索结果，也不管模型训练（训练由 Google-Extended 控制）。对需要被买家找到的制造企业，没有理由去关它。

我的建议是把“生成式 AI 展示次数上升、品牌词搜索上升、询盘稳定或上升”当作这件事做对的信号，而不是只看自然点击。

## 应对步骤：四件事，按顺序做

先保证资格，再改内容，然后建立衡量，最后才谈 ChatGPT 等平台的分工。

### 1. 技术资格

- 用 Search Console 的网址检查确认关键页面已被收录，Googlebot 拿到的 HTML 里有正文。
- 检查 robots.txt，以及 CDN、防火墙有没有误拦 Googlebot。
- 检查有没有误加 nosnippet、max-snippet 或 data-nosnippet。限制摘要，等于限制被概览引用。
- 不要误以为屏蔽 Google-Extended 能退出概览，它管的是训练和 Google 其他系统的引用。
- 结构化数据要与页面上看得见的文字一致。

### 2. 内容写法

- 把买家会问的子问题列出来（品类、标准、认证、选型、交付），每个子问题有一页或一段明确回答。
- 每页开头先给结论，参数、标准编号、证书编号写成文字，不要只放在图片或 PDF 里。
- 英文页面按目标市场的行业用语写，标准和单位用对方市场的写法。

### 3. 测量

- 每月导出一次生成式 AI 效果报告，看展示次数最多和最少的页面。
- 单独跟踪品牌词搜索与询盘，和自然点击放在同一张表里看。

### 4. 和 GEO 分工

AI 概览靠 Google 的索引；ChatGPT、Perplexity 等助手的检索来源不同，更依赖第三方信源。两者的关系见 [GEO 和 SEO 的区别](/insights/geo-vs-seo)和课时 [SEO、付费广告与 GEO 的关系](/academy/seo/b-1-3)。

## 不要做的事

这些做法要么没有依据，要么会让情况更糟：

| 做法 | 为什么不要做 |
|---|---|
| 购买“保证进入 AI 概览”的服务 | Google 写明收录和展示都不保证，没有人能承诺被引用 |
| 为 AI 概览添加“专用标记”或 AI 文本文件 | 官方明确说不需要，也没有特殊的 schema.org 标记 |
| 为了“保护内容”给全站加 nosnippet | 同时失去普通搜索结果里的摘要和被概览引用的资格 |
| 把答案藏在表单或下载之后 | 概览摘不到，买家也看不到 |
| 批量生成问答页去覆盖问题 | Google 的[垃圾内容政策](https://developers.google.com/search/docs/essentials/spam-policies)把“规模化内容滥用”列为违规，违规网站可能排名下降或不再出现在结果里 |
| 看到点击下降就停掉内容 | 先看生成式 AI 展示、品牌词搜索和询盘有没有变化 |

## 从哪里开始

先弄清现状：关键页面有没有被收录、Googlebot 能否读到正文、买家的核心问题在你的网站上有没有一段直接的答案。可以先用 [AI 可见性测评](/audit)检查官网的技术底座和各 AI 平台的回答，再决定先改哪几页。需要系统做这件事的，可以看我们的[出海 SEO 服务](/services/seo)。`,
    faqs: [
      {
        q: '想进入 Google AI 概览，需要做专门的优化吗？',
        a: '不需要专门的标记或文件。Google 官方写明，页面被收录并允许显示摘要就有资格，传统 SEO 的基本做法同样适用；剩下的是把内容写成能直接回答问题的段落。',
      },
      {
        q: 'AI 概览会让网站点击减少多少？',
        a: '一项在美国进行的随机对照实验（工作论文，尚未经同行评审）发现，概览出现时外部网站的自然点击减少 38%。这是概览出现时的条件结果，不等于网站总流量减少同样比例，也不代表 B2B 采购搜索。',
      },
      {
        q: '怎么知道自己的网站有没有出现在 AI 概览里？',
        a: '看 Search Console 的生成式 AI 效果报告，它统计网站在 AI 概览和 AI 模式里的展示次数，可以按页面、国家、设备和日期查看。',
      },
      {
        q: '屏蔽 Google-Extended 能让网站退出 AI 概览吗？',
        a: '不能。Google-Extended 管的是模型训练和 Google 其他系统的引用；要退出搜索里的生成式 AI 功能，要用 Search Console 的生成式 AI 控制项或摘要控制。对需要被买家找到的企业，不建议退出。',
      },
      {
        q: '应对 AI 概览要投入多少？',
        a: '取决于网站现状、目标市场和要改写的页面数量。建议先做测评和方案规划，按要改的页面与交付物来评估。',
      },
    ],
  },
  en: {
    title: 'AI Overviews and B2B manufacturers: which pages get cited?',
    description:
      'Which pages Google AI Overviews cite, how much organic clicks fall, and what B2B manufacturers should do, based on Google documentation and a field experiment.',
    answer:
      'AI Overviews cite pages that Google has indexed, that are eligible for a snippet, and that answer a specific sub-question; Google says no special optimisation is needed. When an overview appears, organic clicks fall sharply. For manufacturers, finding a qualified supplier is an informational search, so aim to be named in the overview and let product and certification pages serve buyers who click through to verify.',
    body: `## The short answer

AI Overviews change where a buyer first meets you. They do not change the fact that a buyer has to verify you before sending an enquiry. That leads to three points:

1. **Clicks fall, mainly on informational searches.** In a randomised field experiment, organic clicks to external sites fell by 38% when an AI Overview appeared. Learning a product category, checking a standard and working out how to choose a supplier are exactly the questions overviews answer.
2. **There is no new trick for getting in.** Google states there are no additional requirements to appear in AI Overviews or AI Mode, and no special structured data or AI-specific files to add. Getting cited starts with doing standard SEO properly.
3. **Work on two things: being quotable and being verifiable.** Write certifications, standards and specifications as answers that can be lifted straight into an overview. Then make sure product and certification pages hold up when a buyer clicks through to check.

For definitions, such as what AI Overviews are and how nosnippet differs from Google-Extended, see the glossary entry on [AI Overviews](/glossary/ai-overviews).

## The data and its limits: fewer organic clicks when an overview appears

The best evidence so far comes from one randomised experiment. Its result is clear, but it covers a narrow setting.

In the working paper [Google AI Overviews and Publisher Traffic: Evidence from a Field Experiment](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6513059), Saharsh Agarwal (Indian School of Business) and Ananya Sen (Carnegie Mellon University) used a custom Chrome extension to randomly assign users to the normal Google results page, with AI Overviews, or to a version with the overviews removed. The abstract reports:

| Measure | Result (as stated in the abstract) |
|---|---|
| Organic clicks to external sites | Down 38% when an overview appears |
| Probability of a zero-click search | Up 33% when an overview appears |
| Ad clicks and number of searches | No effect found |
| Where the effect concentrates | When the overview sits at the top of the page, and on the highest-ranked organic results |
| User experience | Survey responses showed removing overviews did not make information harder to find or results worse |

Four limits matter:

- **It is a working paper** posted on SSRN in 2026 and has not been peer reviewed.
- **The users are in the US.** The authors' [registration](https://www.socialscienceregistry.org/trials/17393) in the AEA RCT Registry plans about 1,500 people who use only Chrome, with the intervention running from 7 January to 7 February 2026. The final sample is reported in the full paper. Browser extensions run on desktop Chrome only, so in our reading the result does not cover mobile search.
- **The 38% applies only when an overview appears.** It does not mean a site loses 38% of its traffic. Google says AI Overviews show only when its systems judge them additive to classic Search, and they often do not trigger.
- **The searches are everyday consumer searches**, not B2B procurement. We have found no public study that measures the same effect on engineering or sourcing searches.

Google offers the other side. Its [documentation](https://developers.google.com/search/docs/appearance/ai-features) and a May 2025 [Search Central blog post](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search) say clicks from results pages with AI Overviews are "higher quality", with users more likely to spend more time on the site. Google has not published the data behind that statement, so treat it as the platform's view rather than an established finding.

## For manufacturers, finding a qualified supplier is an informational search

Manufacturers feel the click loss earlier than consumer brands do, because of how buyers search. Before a buyer sends an enquiry, they have to understand the category, the standards and how to screen suppliers. Almost all of that is informational.

| What the buyer is doing | Example search | Intent | What you want |
|---|---|---|---|
| Learning the category and how to specify it | how to choose a stormwater detention module supplier | Informational | Your brand named in the overview or its sources |
| Checking standards and certificates | how to verify a CE certificate for industrial valves | Informational | Your certification or standards page cited |
| Comparing named suppliers | [brand] vs [brand], [brand] factory audit | Mixed | Consistent, checkable facts on your site and elsewhere |
| Finding and contacting you | [brand] datasheet, [model] price inquiry | Navigational or transactional | Product pages and enquiry forms one click away |

The first two rows are where overviews are most likely to appear and where clicks are most likely to stop on the results page. They also decide whether you make the shortlist. Only the last two rows are where buyers come to your site.

So the core judgement is this: **you do not need to win back every informational click. You need to be in the answer to informational questions, and to have the evidence ready when a buyer clicks through to check.** A buyer who sees your name and certifications in an overview may not click this time, but may search your brand name next. That is a navigational search, and those get clicked. This path is our inference and no public data yet measures it, which is why branded searches should be tracked on their own (see below).

## Which pages get cited: Google's conditions, plus writing that can be quoted

Being cited depends on a short list of official conditions. Everything beyond that is about how the page is written.

**Google's conditions**, from [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features):

- The page must be indexed and eligible to be shown in Google Search with a snippet. There are no additional technical requirements.
- You do not need new machine-readable files, AI text files or special markup, and there is no special schema.org structured data to add.
- Meeting every requirement does not guarantee crawling, indexing or serving.
- AI Overviews and AI Mode may use "query fan-out": several related searches across subtopics and data sources, used to build one response.

What fan-out means for a manufacturer is our reading. A buyer asking how to choose a supplier for some type of equipment may trigger searches on certification requirements, applicable standards and material options. **The page that gets cited is often not your company profile, but the page that happens to answer one of those sub-questions.** One broad "why choose us" page does less than a page, or a clear paragraph, for each sub-question.

These page types are worth rewriting first:

| Page | Sub-question it answers | How to make it quotable |
|---|---|---|
| Product specifications | What are the key parameters? | A table with units, test conditions and the standard number each value relies on |
| Certifications and testing | Which certificates do you hold, and how can I check them? | Certificate name, number, issuing or testing body, validity, and where to verify it |
| Standards mapping | Which standard does the product meet in my market? | One standard per section: the conclusion first (class or grade met), then the test basis |
| Engineering or selection guide | Which model fits which operating condition? | The selection answer first, then the method, with clear limits of use |
| Application cases | Where has it been used, with what result? | Only project facts you can disclose and that can be checked |

This is the "trustworthiness" part of [E-E-A-T](/glossary/eeat): information others can check is information worth citing. For a page-level checklist, see our [6-point product page checklist](/insights/ai-supplier-search-product-page-checklist).

## How to measure once clicks fall

If you count only clicks, every time you appear in an overview without a click scores zero. Measure in four layers instead:

| Layer | What to look at | Where |
|---|---|---|
| Visibility | Impressions in AI Overviews and AI Mode, and which pages earn them | Search Console generative AI performance report |
| Search performance | Impressions, clicks and click-through rate by page | Search Console performance report (Web search type) |
| Brand demand | Searches for your brand and model names | Search Console, filtered to branded queries |
| Business results | Landing pages, enquiry volume and quality | Your analytics and enquiry records |

Three things about Search Console's data are worth knowing first:

1. **Clicks and impressions from AI Overviews are part of the overall Web data**, not a separate figure. Google's [counting rules](https://support.google.com/webmasters/answer/7042828) say an overview occupies a single position in the results, and every link inside it is given that same position.
2. **Since 31 August 2026, every site has a generative AI performance report.** According to the [help page](https://support.google.com/webmasters/answer/16984139), it counts impressions of links to your site in AI Overviews and AI Mode, broken down by page, country, device and date. The documented dimensions do not include queries, so it tells you which pages were shown but not for which questions.
3. **A Search generative AI control arrived at the same time.** According to its [help page](https://support.google.com/webmasters/answer/16908024), it can exclude a whole site from these features, after which the site gets no impressions or traffic from them. It does not affect other search results and does not govern model training, which Google-Extended handles. A manufacturer that wants buyers to find it has no reason to switch it off.

Treat rising generative AI impressions, rising branded searches and steady or rising enquiries as the signs that this work is going right, rather than organic clicks alone.

## What to do: four steps, in order

Secure eligibility, then fix content, then set up measurement, and only then divide work with other AI assistants.

### 1. Eligibility

- Use the URL Inspection tool in Search Console to confirm key pages are indexed and that the HTML Googlebot receives contains the main text.
- Check robots.txt, and check that your CDN or firewall does not block Googlebot.
- Look for stray nosnippet, max-snippet or data-nosnippet. Limiting snippets limits citation in overviews.
- Blocking Google-Extended does not take you out of overviews; it covers training and grounding in Google's other systems.
- Keep structured data consistent with the visible text.

### 2. Content

- List the sub-questions buyers ask (category, standards, certification, selection, delivery) and give each one a page or a clearly answered paragraph.
- Lead every page with the answer. Put specifications, standard numbers and certificate numbers in text, not only in images or PDFs.
- Write English pages in the trade vocabulary of your target market, using its conventions for standards and units.

### 3. Measurement

- Export the generative AI performance report monthly and look at the pages with the most and fewest impressions.
- Track branded searches and enquiries alongside organic clicks, in one sheet.

### 4. Dividing work with GEO

AI Overviews run on Google's index, so sound SEO is most of what eligibility needs. ChatGPT, Perplexity and other assistants retrieve from different sources and depend more on third-party coverage and consistent brand information. See [GEO vs SEO](/insights/geo-vs-seo) and the lesson [how SEO, paid ads and GEO fit together](/academy/seo/b-1-3).

## What not to do

These moves either have no basis or make things worse:

| Move | Why not |
|---|---|
| Buying a service that "guarantees" AI Overview placement | Google says indexing and serving are not guaranteed; nobody can promise a citation |
| Adding "AI markup" or AI text files for overviews | Google says none is needed, and there is no special schema.org markup |
| Adding nosnippet site-wide to "protect" content | You lose regular snippets and eligibility for overview citations at once |
| Hiding answers behind forms or downloads | Overviews cannot quote them, and buyers cannot see them |
| Mass-producing Q&A pages to cover every question | Google's [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) list scaled content abuse as a violation; violating sites may rank lower or drop out of results |
| Stopping content work when clicks drop | First check generative AI impressions, branded searches and enquiries |

## Where to start

Start with the basics: are key pages indexed, can Googlebot read the main text, and does your site give a direct answer to each of your buyers' core questions? An [AI visibility audit](/audit) checks your site's technical foundation and how AI platforms answer about you, which helps decide which pages to fix first. If you want this done as a programme, see our [export SEO service](/services/seo).`,
    faqs: [
      {
        q: 'Do I need special optimisation to appear in Google AI Overviews?',
        a: 'No special markup or files are needed. Google says a page that is indexed and eligible for a snippet can be shown, and standard SEO practice applies; what remains is writing paragraphs that answer questions directly.',
      },
      {
        q: 'How much do AI Overviews reduce clicks?',
        a: 'A randomised experiment with US users, published as a working paper and not yet peer reviewed, found organic clicks to external sites fell 38% when an overview appeared. That applies only to searches showing an overview and was not measured on B2B sourcing searches.',
      },
      {
        q: 'How can I tell whether my site appears in AI Overviews?',
        a: 'Use the generative AI performance report in Search Console. It counts your impressions in AI Overviews and AI Mode by page, country, device and date.',
      },
      {
        q: 'Does blocking Google-Extended remove my site from AI Overviews?',
        a: 'No. Google-Extended covers model training and grounding in other Google systems. To leave generative AI features in Search you would use the Search generative AI control or snippet controls, which a manufacturer that wants to be found should not do.',
      },
      {
        q: 'What does it cost to respond to AI Overviews?',
        a: 'It depends on your site, target markets and how many pages need rewriting. Start with an audit and a plan, and assess the work by pages and deliverables.',
      },
    ],
  },
};
