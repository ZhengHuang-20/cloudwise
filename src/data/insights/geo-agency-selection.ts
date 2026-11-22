import type { Insight } from './types';

/**
 * 2026-11-22 改写：从「8 个评估问题」扩展为面向未来三年的选型框架（趋势判断 + 各平台收录规则的现状与预测 + 8 个问题）。
 * 文中「已经发生」的事实都附官方或研究机构原文；「判断」与「预测」是我们基于这些信号的推断，正文里逐条标明把握程度与反证信号。
 * 平台规则变化快：更新本文时逐条复核外部链接与日期，并修改 updatedAt。
 * 按 docs/geo-content-guide.md，只写海外 AI 平台，不写国内平台的收录方法。
 */
export const geoAgencySelection: Insight = {
  slug: 'geo-agency-selection',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-10',
  updatedAt: '2026-11-22',
  keywords: {
    zh: ['GEO 服务商怎么选', 'GEO 服务商', 'B2B 出海 GEO', 'AI 搜索收录规则', 'GEO 未来趋势', '选 GEO 公司要问什么'],
    en: ['how to choose a GEO agency', 'GEO agency for B2B exporters', 'future of AI search for B2B', 'AI search inclusion rules', 'questions to ask a GEO agency'],
  },
  relatedServices: ['geo', 'seo', 'website'],
  relatedTerms: ['term-geo', 'term-ai-crawlers', 'term-structured-data', 'term-entity'],
  relatedLessons: ['lesson-c-3-1', 'lesson-c-1-2'],
  zh: {
    title: '未来 B2B 出海企业 GEO 服务商怎么选？',
    description:
      '结合 AI 搜索现状与未来三年趋势，预测 Google、ChatGPT、Copilot、Perplexity、Claude 的收录规则，给出选 GEO 服务商的框架与 8 个问题。',
    answer:
      '海外买家正把找供应商的第一步交给 AI，平台收录也在转向站长授权、结构化数据和身份验证。选 GEO 服务商看三点：能否分平台测出现状并按固定口径复测；能否把资料做成 AI 读得懂、能核实的形式；能否跟上规则变化，并把资产留在企业名下。',
    body: `## 先看结论

我们对未来三年（2027～2029 年）的判断可以归成三句话：

1. **入口在变**：B2B 采购的第一步正从“搜一组链接”变成“问一个答案”，下一步是“交给代理去办”。被 AI 列进短名单，会成为和搜索排名同样重要的事。
2. **收录规则在变**：各平台正从“爬虫默认抓取”走向分层的规则：训练与检索分开授权，站长在平台后台声明是否参与 AI 功能，商品与企业资料通过结构化数据和身份验证直接提交。
3. **信任的来源在变**：AI 回答引用的多数是第三方资料，平台对“制造出来的信号”也越来越警惕。能被核实的真实资料，分量会继续上升。

所以选服务商的标准也要换：不再比“能发多少稿、做多少词”，而是比**能否建立可被机器核实、可随平台迁移的资产，并分平台持续测量**。

阅读说明：下文标为“事实”的内容都附官方文档或研究机构原文，时间以 2026 年 11 月能查到的公开信息为准；标为“判断”或“预测”的是我们根据这些信号做的推断，每条都写了把握程度，以及出现什么情况说明我们判断错了。

## 一、已经发生的变化：六个可以核实的信号

| 信号 | 事实 | 出处 |
|---|---|---|
| AI 搜索已是主流入口 | 2026 年 5 月的 Google I/O 上，Google 称 AI Mode 上线一年月用户超过 10 亿，AI Overviews 月活用户超过 25 亿 | [Google I/O 2026 主题演讲](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/) |
| 答案替代了点击 | 皮尤研究中心分析 900 名美国成年人 2025 年 3 月的浏览数据：出现 AI 摘要时，用户点击传统搜索结果的访问占 8%，没有 AI 摘要时为 15%；点击摘要内链接的只占 1% | [Pew Research Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) |
| B2B 买家已在用 AI 采购 | Gartner 2025 年 8～9 月调研 646 名 B2B 买家：45% 在最近一次采购中用过 AI，67% 更希望不经过销售代表 | [Gartner，2026-03-09](https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience) |
| 但买家仍要人来核实 | 同期调研的 645 名买家中，69% 会找销售代表核实 AI 给出的信息 | [Gartner，2026-05-20](https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-survey-finds-sixty-nine-percent-of-b-two-b-buyers-turn-to-sales-reps-to-validate-ai-generated-insights) |
| 平台开始给站长“AI 报表” | Google Search Console 推出生成式 AI 效果报告，2026 年 8 月 31 日起向全球网站开放；Bing Webmaster Tools 的 AI Performance 报告（2026 年 2 月公开预览）显示网站在 Copilot 与 Bing AI 摘要中被引用的次数 | [Google Search Central](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)、[Bing Webmaster Blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview) |
| 代理与交易协议落地 | OpenAI 在 2025 年 9 月发布 Agentic Commerce Protocol（ACP）；Google 在 2026 年 1 月发布 Universal Commerce Protocol（UCP）；微软同月在美国上线 Copilot Checkout | [OpenAI](https://openai.com/index/buy-it-in-chatgpt/)、[Google UCP](https://developers.google.com/merchant/ucp)、[Microsoft Advertising](https://about.ads.microsoft.com/en/blog/post/january-2026/conversations-that-convert-copilot-checkout-and-brand-agents) |

两点补充：

- **品牌官网在 AI 引用里只占少数**。麦肯锡 2025 年 10 月的报告《[New front door to the internet](https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/new-front-door-to-the-internet-winning-in-the-age-of-ai-search)》称，品牌自有网站只占 AI 搜索引用来源的 5%～10%，其余来自评测、媒体、联盟网站和用户内容；同一报告称只有 16% 的品牌在系统地追踪 AI 搜索表现。这份研究以消费品牌为主，B2B 的比例未必相同，但方向值得重视：只改官网是不够的。
- **分析机构的预测更激进**。Gartner 在 [2026 年及以后的预测](https://www.gartner.com/en/newsroom/press-releases/2025-10-21-gartner-unveils-top-predictions-for-it-organizations-and-users-in-2026-and-beyond)里写道：到 2028 年，90% 的 B2B 采购将由 AI 代理中介，涉及超过 15 万亿美元的支出，产品信息需要做到机器可读。这是预测而非事实，但它说明主流分析机构判断的方向。

## 二、未来三年的五个判断

### 判断 1：AI 会成为海外买家列短名单的默认起点之一，但成交前的核实仍然靠人

- **依据**：45% 的 B2B 买家已在采购中使用 AI，同时 69% 会找销售核实 AI 的信息（均为上表的 Gartner 调研）。
- **把握程度**：方向较高，速度中等。定制化、需要认证与验厂的工业采购，变化会慢于标准品。
- **说明我们错了的信号**：同类调研里使用 AI 采购的比例连续两年不再上升。
- **对企业的含义**：要同时过两关。第一关是被 AI 列进短名单，靠的是 AI 能查到、能核实的资料；第二关是买家人工核实，官网、第三方平台和销售给出的信息必须一致。

### 判断 2：“被收录”会分成四层，每层有不同的门槛

过去说“被收录”，指的是被搜索引擎抓取并编入索引。现在至少要分四层看：

1. **被抓取**：robots.txt 是否放行对应平台的搜索爬虫。
2. **被索引**：页面是否能被正常解析，正文是否不依赖 JavaScript 也能读到。
3. **被用于回答**：是否满足平台参与 AI 功能的条件（例如 Google 要求页面能被索引、能显示摘要，并在 Search Console 里保持参与生成式 AI 功能）。
4. **被代理调用**：产品、企业资料能否通过结构化数据、商品 feed 或协议被 AI 代理直接读取和操作。

- **把握程度**：较高。前三层已经写在各平台的官方文档里（见第三节），第四层已有 ACP、UCP 等协议。
- **对企业的含义**：服务商只谈内容、不看这四层门槛，做出来的内容可能根本进不了回答。

### 判断 3：机器可读、可核实的资料，会从加分项变成入场券

现有的商品协议都要求结构化数据。以 ChatGPT 的[商品 feed 规范](https://developers.openai.com/commerce/specs/file-upload/products)为例，每个商品都要有编号、标题、描述、链接、图片、库存状态、价格与品牌等字段。

这里有一个对 B2B 出海企业很关键的缺口：**现有协议是为零售设计的**，而多数 B2B 出口企业不公开报价，买家更关心的是规格参数、认证编号、最小起订量、交期和产能。我们的判断是，这类 B2B 字段会先在标准化程度高的品类（标准件、电子元器件、通用工业耗材）里出现在 AI 代理的比价流程中，再扩展到定制化品类。

- **把握程度**：方向较高；B2B 专用协议出现的时间把握较低，目前没有公开的 B2B 采购代理标准。
- **说明我们错了的信号**：三年内 AI 代理在 B2B 场景仍只读网页正文，不读结构化字段。
- **对企业的含义**：现在就把参数表、认证与检测报告编号、公司实体信息整理成统一、可公开核实的格式，放在官网并用结构化数据标注。这一步无论协议怎么演化都不会白做。

### 判断 4：平台会更严格地区分真实信号和制造出来的信号

- **依据**：Google 在 2026 年 5 月发布的[生成式 AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)里明确说，可以忽略内容切块（chunking）、llms.txt 这类文件和不真实的提及（inauthentic mentions），并提醒为每一种问法单独造页面来操纵 AI 回答，可能违反规模化滥用内容政策。ChatGPT 的企业资料认领要求经过身份验证，并写明认领不保证更高的排位（[OpenAI 帮助中心](https://help.openai.com/en/articles/20001635-setting-up-your-business-on-chatgpt)）。OpenAI 还称 ChatGPT 的广告与回答分开生成，广告不影响回答（[OpenAI](https://openai.com/index/our-approach-to-advertising-and-expanding-access/)）。
- **把握程度**：较高。
- **对企业的含义**：批量发稿、在问答平台刷量、按问法批量造页面，这些做法的风险会继续上升；按官方说法，广告也买不到自然回答里的位置。能长期起作用的，是真实存在、可以被第三方核实的资料。

### 判断 5：测量会从“截图”走向“平台报表 + 固定问题集”

- **依据**：Google 与 Bing 都已向站长提供 AI 功能的展示或引用数据（见上表）；ChatGPT 的 Business Hub 也为完成认证的企业提供洞察数据（beta）。
- **把握程度**：较高。我们预测更多平台会提供站长报表，但口径各不相同：Bing 明确说它的引用数据是抽样，引用也不等于点击。
- **对企业的含义**：平台报表只能看自己那一家，跨平台比较仍需要一套固定的买家问题集，按同样的方法定期复测。服务商能否把两者结合起来汇报，是判断专业程度的直接标准。

## 三、主流 AI 应用的收录规则：现状与我们的预测

下表的“现状”来自各平台官方文档（2026 年 11 月查阅），“预测”是我们的判断。

| 平台 | 现在怎么进入回答 | 站长能用的控制与报表 | 我们对未来 12～36 个月的预测 |
|---|---|---|---|
| Google AI Overviews、AI Mode | 基于 Google 搜索现有的排名系统；页面需被索引并可显示摘要，没有额外的特殊要求 | Search Console 的生成式 AI 报告与参与开关；Google-Extended 不影响搜索 | SEO 基础仍是前提；代理功能从消费场景扩展到更多品类，商家资料与商品数据的作用变大（把握较高） |
| ChatGPT | OAI-SearchBot 为搜索功能建索引，屏蔽后不会出现在搜索回答里；商品通过 ACP feed 提交 | robots.txt 分开控制搜索与训练；Business Hub 认领企业资料（beta） | 认领企业资料加提交结构化数据，会成为进入推荐的常规动作；适用的国家与类目从美国电商逐步扩大（把握中等） |
| Microsoft Copilot、Bing | Copilot 与 Bing AI 摘要的引用数据都在 Bing Webmaster Tools 中；Copilot Checkout 目前只面向向美国买家销售的英文商家 | AI Performance 报告：引用次数、引用页面、grounding queries、引用份额 | 采购人员在工作场景里直接用办公软件中的 AI 助手查供应商的情况会增多，Bing 的索引质量对 B2B 更关键（把握中等） |
| Perplexity | PerplexityBot 用于搜索结果，不用于训练基础模型；屏蔽后不索引正文，但可能保留域名、标题和简短的事实摘要 | robots.txt 控制 PerplexityBot；用户触发的 Perplexity-User 一般不受 robots.txt 约束 | 继续以“带出处的回答”为特点，引用来源的可核实性要求更高；适合作为观察 AI 引用了谁的窗口（把握较低） |
| Claude | ClaudeBot（训练）、Claude-SearchBot（搜索索引）、Claude-User（用户触发）三类分开 | robots.txt 分别控制；2026 年 10 月 30 日起识别 IETF 的训练偏好信号 | 训练与检索分开授权成为行业通行做法（把握较高） |

出处：[Google AI 功能与网站](https://developers.google.com/search/docs/appearance/ai-features)、[Google 生成式 AI 优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)、[OpenAI 爬虫说明](https://developers.openai.com/api/docs/bots)、[Bing AI Performance 说明](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c)、[Perplexity 爬虫说明](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)、[Anthropic 爬虫说明](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)。

### Google：SEO 仍是地基，代理是下一层

Google 的口径很明确：AI Overviews 和 AI Mode 建立在现有的搜索排名系统之上，没有额外的收录要求，也不需要特殊的结构化数据。新变化在两处：一是 Search Console 增加了生成式 AI 报告，并在测试站点级的参与开关（[Google 博客](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/)）；二是 2026 年的 I/O 上，Google 宣布 AI Mode 里可以设置持续追踪信息的代理、在部分美国本地服务类目里代用户致电商家，购物功能也建在 UCP 上（[Google 搜索 I/O 2026 更新](https://blog.google/products-and-platforms/products/search/search-io-2026/)）。

我们的判断：对 B2B 企业，Google 这一侧的优先级仍是“先把 SEO 做对”，其次是让公司实体信息和产品参数在官网与第三方保持一致。代理功能目前集中在消费与本地服务，B2B 采购场景尚未公开。

### ChatGPT：从网页检索走向“资料提交 + 身份验证”

OpenAI 把爬虫分成三类：OAI-SearchBot 管搜索，GPTBot 管训练，ChatGPT-User 是用户触发的访问。屏蔽 GPTBot 不影响出现在搜索回答里。商品侧，ACP 已从“在 ChatGPT 里结账”转向以商品发现为主，商家通过 feed 把商品与促销信息送进 ChatGPT（[OpenAI](https://openai.com/index/powering-product-discovery-in-chatgpt/)）；2026 年 11 月又推出企业资料认领（beta）。

我们的判断：ChatGPT 正在建立一套类似“商家资料”的机制，未来企业在 ChatGPT 里的呈现，会部分取决于是否认领资料、提交的数据是否完整一致。目前认领资格受国家与业务类型限制，B2B 出口企业能否认领要以 OpenAI 的实际开放范围为准。

### Microsoft Copilot：被低估的 B2B 入口

Bing Webmaster Tools 的 AI Performance 是目前少数直接给出“被 AI 引用了多少次、因为哪些检索词”的官方报表，2026 年 6 月又增加了意图分类与引用份额（[Bing Search Blog](https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/)）。

我们的判断：海外企业的采购人员每天在办公软件里工作，工作场景中的 AI 助手可能成为他们查供应商的入口之一，这对 B2B 企业的意义可能大于对消费品牌。把握中等，因为微软没有公开这类使用场景的数据。实际动作很简单：在 Bing Webmaster Tools 里验证网站、提交站点地图，开始看引用数据。

### Perplexity 与 Claude：授权规则走在前面

两家都把“搜索用的爬虫”和“用户触发的访问”分开说明，Anthropic 还把训练爬虫单独列出，并在 2026 年 10 月 30 日起识别 IETF AIPREF 的训练偏好信号；Google 也计划在 2027 年初支持同一类信号（[Google Search Central](https://developers.google.com/search/blog/2026/10/ai-training-control)）。

我们的判断：“训练可选、检索放行”会成为企业官网的标准配置：是否允许内容用于训练由企业自己决定，但只要还想出现在 AI 回答里，就不能屏蔽搜索类爬虫。一刀切屏蔽所有 AI 爬虫的做法，会直接把自己移出回答。

## 四、这对选服务商意味着什么

把上面的判断落到服务商身上，市面上的做法大致可以分成三类：

| 类型 | 典型做法 | 现在的效果 | 未来三年的风险 |
|---|---|---|---|
| 发稿型 | 批量发稿、在问答平台铺量、按问法批量造页面 | 短期内可能出现在部分回答里 | 触及平台的规模化滥用与不真实提及规则；内容和账号常挂在服务商名下 |
| 优化型 | 只改官网的技术与内容 | 地基扎实 | 缺少第三方信源与机器可读的资料，也没有分平台的测量 |
| 资产型 | 基线测评、可核实资料、结构化数据、第三方信源、平台报表加固定问题集复测，资产归企业 | 见效较慢，需要几个月的积累 | 规则变化时能迁移，风险相对可控 |

我们的建议是按“资产型”的标准去面谈。具体怎么问，见下面 8 个问题。

## 五、面谈时问的 8 个问题

| 问题 | 想听到的回答 | 需要警惕的回答 |
|---|---|---|
| 1. 报方案前会先测现状吗 | 用固定问题集分平台测，给出可复核的基线报告 | 不测就报方案，或只给几张截图 |
| 2. 效果怎么衡量 | 提及率、排位、引用来源，结合平台报表与 AI 引荐询盘，口径写进合同 | 只说“曝光量提升”“AI 流量翻倍” |
| 3. 能保证结果吗 | 不能保证，按月复测并如实汇报 | 保证排名第一、保证 AI 推荐 |
| 4. 具体做哪些事 | 交付物清单和排期；内容按海外买家的问法用目标市场语言写 | “独家算法”“专门让 AI 收录的标记”，或中文稿机翻 |
| 5. 第三方信源怎么建 | 行业媒体、认证与检测机构记录、真实案例 | 批量发稿、买链接、刷问答 |
| 6. 能把资料做成机器可读的吗 | 参数表、认证编号、公司实体信息用结构化数据标注，按平台开放情况认领企业资料、提交 feed | 只写文章，不碰数据 |
| 7. 怎么跟上平台规则变化 | 有按平台整理的规则清单与变更记录，robots.txt 区分训练与检索 | “规则我们有内部消息”，或一律屏蔽 AI 爬虫 |
| 8. 结束后资产归谁 | 内容、账号、问题集与历次测评数据都归企业，可交接 | 账号挂在服务商名下，停了就没了 |

### 1. 报方案之前，会先测我们的现状吗？

先测再报方案。问题集要按你的产品、行业和目标市场整理买家会问的问题，而不是只搜品牌名；结果要分平台给出，并保留每个问题的原始回答、提问时间和引用来源，方便复核。我们自己的做法写在 [AI 可见性测评方法](/insights/ai-visibility-audit-methodology)里，可以作为对照。

### 2. 效果用什么指标、按什么口径衡量？

三类指标：固定问题集里的提及率、被提到时的排位与是否被推荐、AI 引用了哪些页面。再加上两类数据：Search Console 与 Bing Webmaster Tools 的 AI 报表，以及来自 AI 平台的引荐访问与询盘。口径在合作前写清，合作期间不改。

### 3. 能保证排名或 AI 推荐吗？

不能。Google 在[聘请 SEO 的官方指南](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)里写明，没有人能保证在 Google 排名第一。AI 的回答会随时间和平台变化，更不存在“保证推荐”。合理的承诺是过程与透明度：做哪些事、多久复测一次、每次汇报哪些数据。

### 4. 具体做哪些事？内容是写给谁的？

能拆成交付物和排期的工作，才能验收。完整的 GEO 项目通常覆盖诊断、建模、内容、信源、口碑、监测六步（见课时[六步闭环总览](/academy/geo/c-3-1)）。内容要按海外买家的问法、用目标市场的语言写，可以请对方现场改写一段你的产品介绍，看是否先给结论、写清参数与出处。

### 5. 第三方信源怎么建？

AI 更愿意引用独立来源，这是 GEO 的核心工作，也容易出问题。行业媒体报道、认证与检测机构的公开记录、客户官网上的真实案例都可以接受；为排名买卖链接、批量生成低质量页面，在 Google 的[垃圾内容政策](https://developers.google.com/search/docs/essentials/spam-policies)里都属于违规。

### 6. 能把我们的资料做成 AI 和代理读得懂的形式吗？

这是面向未来的问题。请对方说明会如何处理三类资料：产品参数与认证编号，公司实体信息（名称、品牌、地址、联系方式在官网与外部平台一致，见术语[实体](/glossary/entity)），以及各平台开放的资料入口（企业资料认领、商品 feed、商家中心）。同时问清这些入口目前对中国出口企业是否开放：目前公开的代理结账功能只面向美国等少数市场，把消费类结账协议包装成 B2B 企业必做项目的，要请对方拿出适用条件。

### 7. 怎么跟上各平台的规则变化？

请对方展示按平台整理的规则清单，以及最近几个月的变更记录。至少要覆盖：robots.txt 如何区分训练爬虫与搜索爬虫，正文在不执行 JavaScript 时能否读到，结构化数据是否完整。这部分和 SEO 共用，详见 [GEO 和 SEO 的区别](/insights/geo-vs-seo)与术语 [AI 爬虫](/glossary/ai-crawlers)。

### 8. 合作结束后，内容、账号和数据归谁？

合同里写明：为你创建的内容、外部平台账号、问题集和历次测评数据都归企业所有，合作结束时完整交接。规则每变一次，资产在自己手里的企业只需要调整，资产在服务商手里的企业要从头再来。

## 六、出海企业的分阶段路线

| 阶段 | 企业自己做 | 要求服务商做 |
|---|---|---|
| 现在～3 个月 | 做一次 AI 可见性测评；在 Search Console 与 Bing Webmaster Tools 验证网站；检查 robots.txt 是否放行搜索类 AI 爬虫 | 交付分平台的基线报告与固定问题集 |
| 3～12 个月 | 整理可公开核实的资料：认证、检测报告、参数表、真实案例 | 英文内容、第三方信源、结构化数据，按月用同一组问题复测 |
| 12～36 个月 | 把 AI 渠道的询盘纳入 CRM，按来源核算 | 跟踪企业资料认领、商品数据与代理协议在 B2B 类目的开放情况，按适用条件接入 |

## 这些判断可能错在哪里

- **平台可能减少对网页内容的引用**。版权与监管压力可能让平台更多使用授权内容，回答里的外部链接变少。如果出现这种情况，官网直接流量与授权合作的价值会上升。
- **B2B 代理采购的普及可能慢于预测**。Gartner 自己的调研也显示，多数买家仍要找销售核实。高价值、定制化的采购，人的判断仍占主导。
- **广告与自然回答的边界可能变化**。目前 OpenAI 称广告不影响回答；如果这一原则改变，自然可见性的投入产出需要重新评估。

无论哪种情况发生，第六节第一、二阶段的工作都不会白做：可核实的资料、清楚的实体信息和固定口径的测量，在任何一种情景下都有用。

## 怎么用这篇文章

1. **先摸清现状**：用 [AI 可见性测评](/audit)看官网的技术底座和各 AI 平台的回答，记下主要问题。
2. **把 8 个问题发给候选服务商**：要求书面回答，重点比较第 1、2、6、8 题。
3. **看样例报告**：请对方提供脱敏的测评或月报样例，看口径是否一致、能否复核。

我们的[出海 GEO 服务](/services/geo)按这些问题写明了做法：先测评再规划，每月用同一组问题复测并如实汇报，不承诺 AI 一定推荐。想先理解概念，可以从术语 [GEO](/glossary/geo) 读起。`,
    faqs: [
      {
        q: 'AI 会越来越聪明，未来还需要 GEO 服务商吗？',
        a: 'AI 越依赖可核实的资料，企业越需要有人把资料整理成 AI 能读、能核实的形式，并分平台持续测量。需要的是做资产和测量的服务商，而不是靠批量发稿的服务商。',
      },
      {
        q: '服务商说能保证 AI 推荐我们，可信吗？',
        a: '不可信。AI 的回答取决于它能查到的公开资料，会随时间和平台变化，任何人都无法保证。能承诺的是做哪些事、多久复测一次、如何汇报。',
      },
      {
        q: '为了保护内容，要不要屏蔽所有 AI 爬虫？',
        a: '不建议一刀切。主流平台都把训练爬虫和搜索爬虫分开：是否允许训练可以由企业决定，但屏蔽搜索类爬虫（如 OAI-SearchBot、PerplexityBot、Claude-SearchBot）会让你从对应平台的回答里消失。',
      },
      {
        q: '选 GEO 服务商之前，企业自己要准备什么？',
        a: '先做一次现状测评，再整理可被第三方核实的资料：认证与检测报告、产品参数、真实案例。有了基线和资料，不同服务商的方案才能放在一起比较。',
      },
      {
        q: 'GEO 服务的费用怎么评估？',
        a: '取决于目标市场、现有基础和工作范围，建议先做测评和方案规划，按交付物清单比较，而不是只比较报价。',
      },
    ],
  },
  en: {
    title: 'How should B2B exporters choose a GEO agency for the AI era ahead?',
    seoTitle: 'Choosing a GEO agency: a guide for B2B exporters',
    description:
      'Where AI search is heading, how Google, ChatGPT, Copilot, Perplexity and Claude choose sources, and eight questions B2B exporters should ask a GEO agency.',
    answer:
      'Buyers are handing the first step of supplier search to AI, and platforms are moving from crawling everything to explicit site-owner controls, structured data and verified business profiles. Choose a GEO agency that measures you per platform with a fixed method, makes your information machine-readable and verifiable, keeps up with rule changes, and leaves the assets in your name.',
    body: `## The short version

Our view of the next three years (2027 to 2029) comes down to three shifts:

1. **The entry point is moving.** The first step in B2B sourcing is moving from "search for a list of links" to "ask for an answer", and next to "hand it to an agent". Getting onto an AI-generated shortlist will matter as much as ranking in search.
2. **Inclusion rules are splitting into layers.** Platforms are moving away from "crawl by default" towards separate permissions for training and retrieval, site-level opt-ins in their webmaster tools, and product and business data submitted directly through structured feeds and verified profiles.
3. **Trust is moving to verifiable sources.** Most of what AI answers cite is third-party material, and platforms are getting stricter about manufactured signals. Real, checkable information will keep gaining weight.

That changes what you should look for in an agency. The question is no longer how many articles or keywords it can produce, but **whether it builds machine-verifiable assets that survive platform changes, and measures them platform by platform**.

How to read this piece: anything stated as fact links to official documentation or the original research and reflects what was publicly available in November 2026. Anything labelled a view or forecast is our own inference from those signals, with a confidence level and the evidence that would prove us wrong.

## 1. What has already changed: six verifiable signals

| Signal | Fact | Source |
|---|---|---|
| AI search is mainstream | At I/O in May 2026, Google said AI Mode passed 1 billion monthly users a year after launch, and AI Overviews has over 2.5 billion monthly users | [Google I/O 2026 keynote](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/) |
| Answers replace clicks | In browsing data from 900 US adults in March 2025, users clicked a traditional result on 8% of visits with an AI summary versus 15% without one; links inside the summary got clicks on 1% of visits | [Pew Research Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) |
| B2B buyers already use AI | In a Gartner survey of 646 B2B buyers (August to September 2025), 45% had used AI in a recent purchase and 67% preferred a rep-free experience | [Gartner, 9 March 2026](https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience) |
| But they still verify with people | In the same fieldwork (645 buyers), 69% turn to sales reps to validate AI-generated insights | [Gartner, 20 May 2026](https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-survey-finds-sixty-nine-percent-of-b-two-b-buyers-turn-to-sales-reps-to-validate-ai-generated-insights) |
| Platforms now report AI visibility | Google Search Console's generative AI performance reports reached all websites worldwide on 31 August 2026; Bing Webmaster Tools' AI Performance report (public preview, February 2026) shows citations in Copilot and Bing's AI summaries | [Google Search Central](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports), [Bing Webmaster Blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview) |
| Agent and commerce protocols are live | OpenAI launched the Agentic Commerce Protocol (ACP) in September 2025; Google launched the Universal Commerce Protocol (UCP) in January 2026; Microsoft launched Copilot Checkout in the US the same month | [OpenAI](https://openai.com/index/buy-it-in-chatgpt/), [Google UCP](https://developers.google.com/merchant/ucp), [Microsoft Advertising](https://about.ads.microsoft.com/en/blog/post/january-2026/conversations-that-convert-copilot-checkout-and-brand-agents) |

Two further points:

- **Your own website is a small share of what AI cites.** McKinsey's October 2025 report, [New front door to the internet](https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/new-front-door-to-the-internet-winning-in-the-age-of-ai-search), puts brand-owned sites at 5 to 10% of the sources AI search references, with the rest coming from reviews, publishers, affiliates and user content; the same report says only 16% of brands systematically track AI search performance. The research centres on consumer brands and B2B shares may differ, but the direction is clear: fixing your website alone is not enough.
- **Analysts expect more.** In its [predictions for 2026 and beyond](https://www.gartner.com/en/newsroom/press-releases/2025-10-21-gartner-unveils-top-predictions-for-it-organizations-and-users-in-2026-and-beyond), Gartner forecasts that by 2028, 90% of B2B buying will be intermediated by AI agents, pushing over $15 trillion of spend through agent exchanges, and that products will need to be machine-readable. That is a forecast, not a fact, but it shows where mainstream analysts think this is going.

## 2. Five views on the next three years

### View 1: AI becomes a default starting point for shortlists, but people still verify before they buy

- **Evidence**: 45% of B2B buyers already use AI in purchases, while 69% validate AI output with a sales rep (both Gartner, above).
- **Confidence**: high on direction, medium on pace. Custom, certified and audited industrial purchases will move more slowly than standard goods.
- **What would prove us wrong**: comparable surveys showing no further rise in AI use in purchasing for two years running.
- **What it means for you**: you have two tests to pass. First, getting onto the AI shortlist, which depends on information AI can find and verify. Second, the buyer's own checks, which require your website, third-party profiles and sales team to say the same thing.

### View 2: "Being included" now has four layers, each with its own bar

Being "indexed" used to mean a search engine had crawled and stored your page. Now there are at least four layers:

1. **Crawled**: robots.txt allows each platform's search crawler.
2. **Indexed**: the page parses cleanly and the main text is readable without JavaScript.
3. **Used in answers**: the page meets the platform's conditions for AI features (Google, for example, requires the page to be indexed and snippet-eligible, and the site to remain included in generative AI features in Search Console).
4. **Usable by agents**: product and company information can be read and acted on by AI agents through structured data, product feeds or protocols.

- **Confidence**: high. The first three layers are already in the platforms' official documentation (see section 3), and ACP and UCP cover the fourth.
- **What it means for you**: an agency that talks only about content and ignores these four bars may produce work that never reaches an answer.

### View 3: Machine-readable, verifiable information moves from nice-to-have to entry ticket

Current commerce protocols all depend on structured data. ChatGPT's [product feed specification](https://developers.openai.com/commerce/specs/file-upload/products), for example, asks for an ID, title, description, link, image, availability, price and brand for each item.

Here is the gap that matters for B2B exporters: **these protocols were built for retail**. Most B2B exporters do not publish prices, and buyers care more about specifications, certificate numbers, minimum order quantities, lead times and capacity. Our view is that B2B fields like these will first enter AI agents' comparison workflows in highly standardised categories (fasteners and standard parts, electronic components, general industrial consumables) before reaching custom-made categories.

- **Confidence**: high on direction; low on when a B2B-specific protocol appears. No public standard for B2B purchasing agents exists yet.
- **What would prove us wrong**: AI agents in B2B still reading only page text, not structured fields, three years from now.
- **What it means for you**: start now by putting specifications, certification and test report numbers, and company entity details into one consistent, publicly verifiable format on your website, marked up with structured data. That work pays off whichever way the protocols go.

### View 4: Platforms get stricter about real versus manufactured signals

- **Evidence**: Google's [guide to optimising for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), published in May 2026, says you can ignore tactics such as content chunking, files like llms.txt and inauthentic mentions, and warns that creating separate content for every variation of a query to manipulate AI responses can violate its scaled content abuse policy. Claiming a business in ChatGPT requires identity verification and, in OpenAI's words, does not guarantee higher placement ([OpenAI Help Center](https://help.openai.com/en/articles/20001635-setting-up-your-business-on-chatgpt)). OpenAI also says ads in ChatGPT are selected separately from answers and do not influence them ([OpenAI](https://openai.com/index/our-approach-to-advertising-and-expanding-access/)).
- **Confidence**: high.
- **What it means for you**: mass press releases, seeded Q&A and pages generated for every phrasing carry more risk every year, and by OpenAI's own account ads cannot buy a place in the organic answer. What lasts is real information that third parties can verify.

### View 5: Measurement moves from screenshots to platform reports plus a fixed question set

- **Evidence**: Google and Bing both give site owners data on AI visibility or citations (see the table above), and ChatGPT's Business Hub offers insights to verified businesses (beta).
- **Confidence**: high. We expect more platforms to offer reports, each with its own definitions; Bing, for one, says its citation data is a sample and that a citation is not a click.
- **What it means for you**: each platform report covers only that platform. Comparing across platforms still requires a fixed set of buyer questions re-tested the same way at regular intervals. Whether an agency can report both together is a direct test of competence.

## 3. How the main AI products decide what to include: today and our forecast

"Today" reflects each platform's official documentation as of November 2026. "Forecast" is our view.

| Platform | How content gets into answers today | Controls and reports for site owners | Our forecast for the next 12 to 36 months |
|---|---|---|---|
| Google AI Overviews and AI Mode | Built on Google Search's existing ranking systems; pages must be indexed and snippet-eligible, with no extra requirements | Generative AI reports and an inclusion setting in Search Console; Google-Extended does not affect Search | SEO stays the foundation; agent features spread from consumer use to more categories, and business and product data matter more (high) |
| ChatGPT | OAI-SearchBot indexes for search, and blocking it removes you from search answers; products arrive through ACP feeds | robots.txt controls search and training separately; Business Hub profile claiming (beta) | Claiming a profile and submitting structured data become routine steps for being recommended, with eligibility widening beyond US retail (medium) |
| Microsoft Copilot and Bing | Citations in Copilot and Bing's AI summaries are reported in Bing Webmaster Tools; Copilot Checkout is limited to English-language merchants selling to US buyers | AI Performance report: citations, cited pages, grounding queries, citation share | More buyers look up suppliers through the AI assistant inside their work software, which makes Bing's index more important for B2B (medium) |
| Perplexity | PerplexityBot powers search results and is not used to train foundation models; if blocked, it does not index page text but may keep the domain, headline and a brief factual summary | robots.txt controls PerplexityBot; the user-triggered Perplexity-User generally ignores robots.txt | Keeps differentiating on cited answers, with more weight on verifiable sources; useful as a window on who AI cites (low) |
| Claude | ClaudeBot (training), Claude-SearchBot (search indexing) and Claude-User (user-triggered) are separate | Separate robots.txt rules; recognises the IETF training-preference signal from 30 October 2026 | Separate permissions for training and retrieval become standard across the industry (high) |

Sources: [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [Google's generative AI optimisation guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [Bing AI Performance help](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c), [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers), [Anthropic crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler).

### Google: SEO is still the foundation; agents are the next layer

Google is explicit that AI Overviews and AI Mode sit on its existing ranking systems, with no additional requirements and no special structured data needed. Two things are new. Search Console now has generative AI reports and Google is testing a site-level inclusion setting ([Google blog](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/)). And at I/O 2026 Google announced agents in AI Mode that keep tracking a topic, calls to businesses on the user's behalf in some US local service categories, and shopping features built on UCP ([Google Search at I/O 2026](https://blog.google/products-and-platforms/products/search/search-io-2026/)).

Our view: for B2B companies, the priority on Google is still getting SEO right, followed by making sure company details and product specifications match across your site and third-party sources. Agent features are concentrated in consumer and local services for now; nothing has been announced for B2B purchasing.

### ChatGPT: from crawling pages to submitted data and verified identity

OpenAI separates three crawlers: OAI-SearchBot for search, GPTBot for training and ChatGPT-User for user-initiated visits. Blocking GPTBot does not stop you appearing in search answers. On the commerce side, ACP has shifted from checkout inside ChatGPT towards product discovery, with merchants sending product and promotion feeds into ChatGPT ([OpenAI](https://openai.com/index/powering-product-discovery-in-chatgpt/)); business profile claiming followed in beta in November 2026.

Our view: ChatGPT is building something like a business-listing layer, and how a company appears there will partly depend on whether it has claimed its profile and how complete and consistent its data is. Eligibility currently depends on country and business type, so whether Chinese B2B exporters can claim profiles depends on what OpenAI actually opens up.

### Microsoft Copilot: an underrated B2B entry point

Bing Webmaster Tools' AI Performance report is one of the few official reports that shows how often AI cited you and for which retrieval queries; in June 2026 it added intent categories and citation share ([Bing Search Blog](https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/)).

Our view: buyers spend their working day inside office software, and the AI assistant there may become one of the places they look for suppliers. That could matter more for B2B than for consumer brands. Confidence is medium, because Microsoft has not published usage data for this scenario. The practical step is simple: verify your site in Bing Webmaster Tools, submit your sitemap and start reading the citation data.

### Perplexity and Claude: ahead on permissions

Both document their search crawler separately from user-triggered fetches. Anthropic also lists its training crawler separately and began recognising the IETF AIPREF training-preference signal on 30 October 2026; Google plans to support the same kind of signal in early 2027 ([Google Search Central](https://developers.google.com/search/blog/2026/10/ai-training-control)).

Our view: "training optional, retrieval allowed" will become the standard setting for company websites. Whether your content trains models is your call, but if you want to appear in AI answers you cannot block the search crawlers. Blocking every AI crawler simply removes you from the answers.

## 4. What this means for choosing an agency

Mapped onto agencies, the approaches on the market fall roughly into three types:

| Type | Typical work | Effect today | Risk over the next three years |
|---|---|---|---|
| Volume publishing | Mass press releases, seeding Q&A sites, a page for every phrasing | May appear in some answers in the short term | Runs into platform rules on scaled content and inauthentic mentions; content and accounts often sit in the agency's name |
| Website-only optimisation | Technical and content work on your site alone | A solid foundation | No third-party sources, no machine-readable data, no per-platform measurement |
| Asset building | Baseline audit, verifiable information, structured data, third-party sources, platform reports plus fixed-question re-tests, assets owned by you | Slower; results take months to build | Adapts when rules change; risk is easier to manage |

We suggest interviewing against the asset-building standard. The eight questions below show how.

## 5. Eight questions to ask in the first meeting

| Question | A good answer | A warning sign |
|---|---|---|
| 1. Will you measure us first? | A checkable baseline per platform using a fixed question set | A proposal with no measurement, or a few screenshots |
| 2. How will you measure results? | Mention rate, position and cited sources, plus platform reports and AI-referred enquiries, defined in the contract | "More exposure" or "double your AI traffic" |
| 3. Can you guarantee results? | No; monthly re-tests reported as they are | Guaranteed #1 rankings or AI recommendations |
| 4. What exactly will you do? | Deliverables with a schedule; content written in the buyer's language, the way buyers ask | A "proprietary algorithm", "special AI tags" or machine-translated copy |
| 5. How will you build third-party sources? | Trade media, certification and testing records, real case studies | Mass press releases, paid links, seeded Q&A |
| 6. Can you make our information machine-readable? | Specs, certificate numbers and entity details in structured data; profiles and feeds claimed where platforms allow | Articles only, no data work |
| 7. How do you keep up with platform changes? | A per-platform rule list with a change log; robots.txt that separates training from retrieval | "Inside information on the algorithm", or blocking all AI crawlers |
| 8. Who owns the work afterwards? | You own content, accounts, the question set and every test result, with a handover | Accounts held by the agency and lost when you leave |

### 1. Will you measure where we stand before proposing anything?

Measure first, then propose. The question set should reflect how buyers in your market ask about your products, not just your brand name, and results should be reported per platform with each raw answer, the time it was asked and the sources cited, so they can be checked. Our own approach is described in [how our AI visibility audit works](/insights/ai-visibility-audit-methodology), which you can use as a reference point.

### 2. Which metrics will you report, and how are they defined?

Three metrics: mention rate across the fixed question set, position and whether you are recommended when mentioned, and which pages the AI cites. Add two data sources: the AI reports in Search Console and Bing Webmaster Tools, and referral visits and enquiries from AI platforms. Agree the definitions before you sign and keep them fixed.

### 3. Can you guarantee a ranking or an AI recommendation?

No. Google's [guidance on hiring an SEO](https://developers.google.com/search/docs/fundamentals/do-i-need-seo) states that no one can guarantee a #1 ranking on Google. AI answers change over time and across platforms, so a guaranteed recommendation is even less realistic. What an agency can promise is process and transparency: the work, the re-test schedule and what each report contains.

### 4. What will you deliver, and who is the content for?

If the work cannot be broken into deliverables and dates, you cannot sign it off. A complete GEO programme usually runs through six steps: diagnosis, modelling, content, sources, reputation and monitoring (see the lesson [the six-step loop](/academy/geo/c-3-1)). Content should be written in your buyers' language and the way they phrase questions. Ask the agency to rewrite one paragraph of your product description on the spot and check whether it leads with the answer and states specifications and their sources.

### 5. How will you build third-party sources?

AI leans on independent sources, which makes this the core of GEO and the part most open to abuse. Trade media coverage, public records from certification and testing bodies, and genuine case studies on customers' sites are all fine. Buying links for ranking and mass-producing thin pages are violations under Google's [spam policies](https://developers.google.com/search/docs/essentials/spam-policies).

### 6. Can you make our information readable by AI and agents?

This is the forward-looking question. Ask how the agency would handle three kinds of information: product specifications and certificate numbers; company entity details, with your name, brand, address and contacts consistent across your site and external profiles (see the glossary entry on [entities](/glossary/entity)); and whatever data entry points each platform opens (business profiles, product feeds, merchant centres). Ask too whether those entry points are actually open to Chinese exporters today. The agent checkout features announced so far cover only the US and a few other markets, so if an agency sells a consumer checkout protocol as a must-have for B2B, ask it to show the eligibility conditions.

### 7. How do you keep up with platform changes?

Ask to see a per-platform rule list and the changes logged over recent months. At minimum it should cover how robots.txt separates training crawlers from search crawlers, whether your main text is readable without JavaScript, and whether your structured data is complete. This overlaps with SEO; see [GEO vs SEO](/insights/geo-vs-seo) and the glossary entry on [AI crawlers](/glossary/ai-crawlers).

### 8. Who owns the content, accounts and data when we part ways?

Put it in the contract: content created for you, external accounts, the question set and every past test result belong to you and are handed over in full at the end. Every time the rules change, a company that holds its own assets adjusts; a company whose assets sit with the agency starts again.

## 6. A phased roadmap for exporters

| Phase | What you do | What you ask the agency for |
|---|---|---|
| Now to 3 months | Run an AI visibility audit; verify your site in Search Console and Bing Webmaster Tools; check that robots.txt allows search-type AI crawlers | A per-platform baseline report and a fixed question set |
| 3 to 12 months | Gather publicly verifiable material: certifications, test reports, spec sheets, real case studies | English content, third-party sources, structured data, and a monthly re-test with the same questions |
| 12 to 36 months | Bring AI-sourced enquiries into your CRM and track them by source | Track whether business profiles, product data and agent protocols open up for B2B categories, and connect where you qualify |

## Where these views could be wrong

- **Platforms may cite the open web less.** Copyright and regulatory pressure could push platforms towards licensed content and fewer outbound links. If so, direct traffic to your site and licensing partnerships become more valuable.
- **Agent-led B2B buying may arrive more slowly than forecast.** Gartner's own surveys show most buyers still validate with a sales rep, and high-value, custom purchases remain driven by human judgment.
- **The line between ads and organic answers may move.** OpenAI currently says ads do not influence answers. If that changes, the return on organic visibility needs to be reassessed.

Whichever happens, the work in the first two phases of the roadmap is not wasted: verifiable information, clean entity data and consistent measurement are useful in every scenario.

## How to use this piece

1. **Know your starting point**: an [AI visibility audit](/audit) covers your site's technical foundation and how AI platforms answer about you. Note the main issues.
2. **Send the eight questions to each candidate**: ask for written answers and compare questions 1, 2, 6 and 8 most closely.
3. **Ask for a sample report**: an anonymised audit or monthly report shows whether the definitions are consistent and the results can be checked.

Our [export GEO service](/services/geo) answers these questions the same way: audit first, then plan, re-test monthly with the same questions and report honestly, with no promise that AI will recommend you. For the concept itself, start with the glossary entry on [GEO](/glossary/geo).`,
    faqs: [
      {
        q: 'As AI gets smarter, will we still need a GEO agency?',
        a: 'The more AI relies on verifiable information, the more you need someone to put your information into a form AI can read and check, and to measure results platform by platform. What you need is an agency that builds assets and measures them, not one that relies on publishing volume.',
      },
      {
        q: 'An agency says it can guarantee AI will recommend us. Should we believe it?',
        a: 'No. AI answers depend on the public sources the model can find and change over time and across platforms, so nobody can guarantee them. An agency can commit to the work, the re-test schedule and how it reports.',
      },
      {
        q: 'Should we block all AI crawlers to protect our content?',
        a: 'Not wholesale. The major platforms separate training crawlers from search crawlers. Whether to allow training is your decision, but blocking search crawlers such as OAI-SearchBot, PerplexityBot or Claude-SearchBot removes you from that platform’s answers.',
      },
      {
        q: 'What should we prepare before talking to GEO agencies?',
        a: 'Run a baseline audit and gather material a third party can verify: certifications and test reports, product specifications and real case studies. With a baseline and that material, proposals become comparable.',
      },
      {
        q: 'How should we evaluate the cost of GEO services?',
        a: 'It depends on your target markets, starting point and scope. Start with an audit and a plan, then compare proposals by their list of deliverables rather than by the quote alone.',
      },
    ],
  },
};
