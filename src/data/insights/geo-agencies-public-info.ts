import type { Insight } from './types';

/**
 * 2026-11-25 新增：ChinGEO 与 10 家 GEO / AI 搜索相关服务商的「官网自述」对照。
 * 资料来源：用户提供的整理稿，用户确认已逐家核对（见 docs/fact-check.md「竞品公开信息」）；
 * 不打分、不排名、不评价，只转述对方官网披露的内容；官网没有列出的写「资料中未见」。
 * 不收录第三方企业资料（注册资本、信用代码等）与对方客户名单。更新本文时逐家复核官网，修改 updatedAt。
 */
export const geoAgenciesPublicInfo: Insight = {
  slug: 'geo-agencies-public-info',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-25',
  updatedAt: '2026-11-25',
  keywords: {
    zh: ['GEO 服务商对比', 'GEO 服务商有哪些', 'GEO 公司对比', '海外 GEO 服务商', 'ChinGEO 对比'],
    en: ['GEO agency comparison', 'GEO agencies in China', 'compare GEO providers', 'Chinese GEO service providers'],
  },
  relatedServices: ['geo', 'seo-website'],
  relatedTerms: ['term-geo', 'term-ai-crawlers', 'term-structured-data', 'term-entity'],
  relatedLessons: ['lesson-c-3-1', 'lesson-c-1-2'],
  zh: {
    title: 'ChinGEO 与 10 家 GEO 服务商的官网公开信息对照',
    seoTitle: 'GEO 服务商有哪些？10 家官网公开信息对照',
    description:
      '把 10 家 GEO 及 AI 搜索相关服务商官网自述的服务范围、案例披露和主体信息放在一张表里，不打分、不排名，注明查阅日期，并附我们自己的信息。',
    answer:
      '这篇文章只做一件事：把 10 家 GEO 及 AI 搜索相关服务商在官网上自己写的服务范围、案例披露和公司主体放进同一张表，并附上我们自己。所有内容来自各公司官网，查阅日期为 2026 年 11 月 25 日，不打分、不排名，以对方最新页面为准。',
    body: `## 先说明三件事

1. **我们是其中一家。** ChinGEO（云端智荐）也是 GEO 服务商，所以本文不评价、不打分、不排名，只转述对方官网自己写的内容。
2. **全部是官网自述。** 表里的内容来自各公司官网，没有经过独立验证；官网写了什么就记什么，没有写的写“资料中未见”，这不等于对方没有这项能力。
3. **查阅日期是 2026 年 11 月 25 日。** 网页会改，请以对方最新页面为准。发现和对方官网不一致的地方，请 [联系我们](/about) 更正，我们核实后更新。

## 一、10 家公司官网自述的服务范围

| 公司 | 官网列示的相关服务 | 官网网址 |
|---|---|---|
| 加搜科技 | 面向 ToB 企业的 GTM 咨询、搜索营销、SEO/SEM 策略、内容营销及执行服务；首页标题提到 AI SEO/SEM/GEO，服务栏目主要列示 SEO、SEM 和内容营销 | jiasou.cn |
| 易询盘 GEO | 围绕海外 AI 搜索可见度、采购需求，以及 GEO Site 与 SEO 协同；列示 ChatGPT、Gemini、Google AI Overviews、Claude、Grok 等平台 | melark.com |
| 智推时代 | GEO 与 GEM 两个业务方向：品牌事实、可信信源、自然推荐、监测和效果衡量；介绍其 GENO 系统 | zhituishidai.com |
| 盖立克思 | AI 搜索优化、ChatGPT 优化、Google AI 优化、用户意图场景挖掘、多关键词优化、多语言建站与监测；列示制造业等行业解决方案，并介绍海外 GEO 实施流程 | newgalaxyai.com |
| 百分点科技 | Generforce AI 搜索洞察系统：AI 问答监测、品牌可见性分析、情感倾向分析、引用来源溯源与 GEO 内容优化；列示的平台包括 DeepSeek、豆包、千问、ChatGPT、Gemini | percent.cn |
| 蓝色光标 | 全案推广、广告代理、数字营销、公共关系、活动管理、中国企业出海广告投放与营销科技服务 | bluefocus.com |
| PureblueAI 清蓝 | GEO 服务环节：品牌知识库、用户意图分析、品牌诊断、内容管理、内容分发、数据监控与策略优化；介绍其自研异构模型算法、数字员工平台与 GEO 监测体系 | pureblueai.com |
| 虎博科技 | Tigerobo GEO、TigerBot、智能搜索问答中台、NLP 算法中台、企业知识库和智能舆情系统等产品与服务 | tigerobo.com |
| 泓动数据 | 官网联系页披露公司名称、联系方式与办公地址；本次整理的资料中未摘录其 GEO 服务的具体内容 | hongdongshuju.com |
| 增长超人 | AI 友好型官网、全意图 GEO、SEM、SEO、数字营销与企业出海服务；官网提供《GEO 全意图内容体系白皮书》 | growthman.cn |
| ChinGEO 云端智荐（我们） | 出海 GEO，以及配套的海外独立站、SEO 与 AI 客服，共四项服务 | [chingeo.com](/services/geo) |

## 二、案例与主体信息的披露情况

| 公司 | 官网的案例披露 | 官网披露的公司主体 |
|---|---|---|
| 加搜科技 | 首页有客户与业务介绍、搜索营销数据；资料中未见独立的 GEO 案例页 | 资料中未见 |
| 易询盘 GEO | 首页设“客户案例”栏目；官网说明所披露的集团服务规模不等同于 GEO 产品单独业绩 | 官网称由大鱼致远（广州）科技有限公司与上海特易信息科技有限公司联合研发 |
| 智推时代 | 首页设“代表案例”栏目 | 上海智推时代科技有限公司；官网披露成立于 2025 年 |
| 盖立克思 | 首页设“案例展示”栏目 | 杭州盖立克思人工智能有限公司 |
| 百分点科技 | 行业解决方案与新闻栏目 | 百分点科技集团股份有限公司（官方声明称曾用名为北京百分点科技集团股份有限公司） |
| 蓝色光标 | 业务与新闻栏目；资料中未见独立的 GEO 产品页 | 官网披露 2010 年在深交所上市，股票代码 300058 |
| PureblueAI 清蓝 | 首页展示合作品牌栏目；展示品牌标识不等于这些品牌采购了 GEO 服务 | 资料中未见营业执照全称 |
| 虎博科技 | 资料中未见独立的 GEO 案例页 | 官网备案信息为虎博网络技术（上海）有限公司 |
| 泓动数据 | 资料中未见客户案例页 | 广州泓动数据科技有限公司（官网联系页） |
| 增长超人 | 案例栏目按工业制造、高新科技、企业出海等分类；展示的项目涉及不同业务类型，不等于都是 GEO 项目 | 深圳市赛亚创想科技有限公司 |
| ChinGEO 云端智荐（我们） | [案例页](/cases)，各案例的数据以页面标注的来源和口径为准 | 公司全称等信息见 [关于我们](/about) |

## 三、从这张表能看到什么

只写表里看得到的：

- **服务范围的重心不同。** 有的偏搜索营销（SEO、SEM、内容营销），有的偏 AI 搜索监测与品牌可见性分析，有的偏品牌传播与广告，有的是 GEO 加建站。表面上都叫“GEO”，实际覆盖的环节并不相同。
- **多数官网没有写独立的 GEO 案例。** 这不代表没有案例，只代表官网上看不到可以单独核对的 GEO 案例页。
- **“官网展示的客户”不等于“GEO 客户”。** 展示合作品牌标识、集团规模或其他业务的项目，都不能直接当作 GEO 服务的成果。
- **面向海外买家的程度，官网写法不一。** 本次整理的资料里，明确提到海外 GEO、多语言建站或出海服务的有易询盘 GEO、盖立克思与增长超人；其余各家官网的侧重点是国内平台、品牌传播或通用的 AI 搜索监测。
- **AI 客服与询盘承接，本次整理的资料中没有哪家官网把它列为服务。** 我们把它作为配套服务之一，原因见 [GEO 服务页](/services/geo)。

## 四、怎么用这张表

这张表只能帮你列出初步名单，不能替你做决定。下一步建议：

1. 用同一份需求让几家出方案，做法见 [怎么比较 GEO 服务商](/insights/geo-agency-blind-test)。
2. 面谈时问清楚怎么测量、怎么验收、资产归谁，问题清单见 [GEO 服务商怎么选](/insights/geo-agency-selection)。
3. 先做一个短周期试点再决定长期合作，见 [90 天 GEO 试点](/insights/geo-90-day-pilot)。
4. 想先看自己的现状，可以用 [AI 可见性测评](/audit)。

## 五、资料说明

- 资料范围：各公司官网的首页、服务介绍、关于我们与案例栏目，以 2026 年 11 月 25 日查阅时的页面为准。
- 不收录：第三方企业资料网站的信息、对方的客户名单与未标注出处的数据。
- 更正：对方认为表述与官网不一致，或官网已更新，请联系我们，核实后修改并更新本文日期。`,
    faqs: [
      {
        q: 'GEO 服务商有哪些？',
        a: '本文列出了 10 家官网自述提供 GEO 或 AI 搜索相关服务的公司，并附上我们自己，只转述各自官网披露的内容，不排名。服务范围差别很大，选之前要看对方具体做哪些环节。',
      },
      {
        q: '这篇文章是对这些公司的评价吗？',
        a: '不是。文章没有打分和排名，只记录各公司官网自己写的服务、案例和主体信息，没有独立验证；官网没写的标为“资料中未见”，不代表对方没有。',
      },
      {
        q: '表里的信息过时了怎么办？',
        a: '查阅日期是 2026 年 11 月 25 日，以对方官网最新页面为准。发现不一致可以联系我们，核实后更新。',
      },
      {
        q: '怎么从这些服务商里选？',
        a: '用同一份需求让几家出方案，对比测量方法、验收口径和资产归属，再先做短周期试点。具体做法见站内的比较方法与选型文章。',
      },
    ],
  },
  en: {
    title: 'ChinGEO and 10 GEO providers: what their websites state',
    seoTitle: 'GEO providers in China: what 10 websites state',
    description:
      'Ten GEO and AI-search providers, side by side: the services, case disclosure and legal entity each states on its own website. No scores or rankings. Dated, with our own details.',
    answer:
      'This article does one thing: it puts what ten GEO and AI-search providers say on their own websites about services, case disclosure and company entity into one table, alongside our own. Everything comes from their sites as read on 25 November 2026. There are no scores or rankings, and the provider’s current page prevails.',
    body: `## Three things first

1. **We are one of them.** ChinGEO is also a GEO provider, so this article does not rate, score or rank anyone. It repeats what each company's website says.
2. **Everything is self-description.** The table comes from each company's website and has not been independently verified. Where a site does not say something, the table says "not found in the material". That does not mean the company lacks the capability.
3. **The reading date is 25 November 2026.** Pages change; the provider's current page prevails. If something differs from the company's website, please [contact us](/about) and we will check and update it.

## 1. Services each website lists

| Company | Related services listed on its website | Website |
|---|---|---|
| Jiasou (加搜科技) | GTM consulting for B2B firms, search marketing, SEO/SEM strategy, content marketing and execution; the home page title mentions AI SEO/SEM/GEO, and the service section mainly lists SEO, SEM and content marketing | jiasou.cn |
| EnquiryGEO (易询盘 GEO) | Overseas AI-search visibility and buyer demand, GEO Site and SEO working together; lists ChatGPT, Gemini, Google AI Overviews, Claude and Grok | melark.com |
| GenOptima (智推时代) | Two lines, GEO and GEM: brand facts, credible sources, natural recommendation, monitoring and measurement; describes its GENO system | zhituishidai.com |
| New Galaxy AI (盖立克思) | AI search optimisation, ChatGPT and Google AI optimisation, intent scenario mining, multi-keyword optimisation, multilingual site building and monitoring; lists industry solutions including manufacturing and describes an overseas GEO process | newgalaxyai.com |
| Percent (百分点科技) | Generforce AI search insight system: AI answer monitoring, brand visibility analysis, sentiment analysis, citation tracing and GEO content optimisation; platforms listed include DeepSeek, Doubao, Qwen, ChatGPT and Gemini | percent.cn |
| BlueFocus (蓝色光标) | Integrated campaigns, advertising agency, digital marketing, public relations, event management, advertising for Chinese companies going overseas and marketing technology | bluefocus.com |
| PureblueAI (清蓝) | GEO steps: brand knowledge base, user-intent analysis, brand diagnosis, content management and distribution, data monitoring and strategy optimisation; describes its own heterogeneous-model algorithms, digital-employee platform and GEO monitoring system | pureblueai.com |
| Tigerobo (虎博科技) | Tigerobo GEO, TigerBot, an intelligent search Q&A platform, an NLP algorithm platform, enterprise knowledge bases and a public-opinion system | tigerobo.com |
| Hongdong Data (泓动数据) | The contact page gives the company name, contact details and address; the material gathered did not extract details of its GEO services | hongdongshuju.com |
| GrowthMan (增长超人) | AI-friendly websites, full-intent GEO, SEM, SEO, digital marketing and overseas-expansion services; publishes a white paper on a full-intent GEO content system | growthman.cn |
| ChinGEO (us) | Overseas GEO, plus supporting overseas websites, SEO and AI customer service: four services | [chingeo.com](/services/geo) |

## 2. Case disclosure and company entity

| Company | Cases shown on the website | Entity disclosed on the website |
|---|---|---|
| Jiasou | Client and business introduction and search-marketing figures on the home page; no separate GEO case page found | Not found in the material |
| EnquiryGEO | A "customer cases" section on the home page; the site states that group-level service scale is not the GEO product's own track record | The site says it was developed jointly by Dayu Zhiyuan (Guangzhou) Technology Co., Ltd. and Shanghai Teyi Information Technology Co., Ltd. |
| GenOptima | A "representative cases" section on the home page | Shanghai Zhituishidai Technology Co., Ltd.; the site states it was founded in 2025 |
| New Galaxy AI | A "case showcase" section on the home page | Hangzhou New Galaxy AI Co., Ltd. (杭州盖立克思人工智能有限公司) |
| Percent | Industry solutions and news sections | Percent Technology Group Co., Ltd. (百分点科技集团股份有限公司); an official statement gives its former name as Beijing Percent Technology Group Co., Ltd. |
| BlueFocus | Business and news sections; no separate GEO product page found | The site states a Shenzhen Stock Exchange listing in 2010, stock code 300058 |
| PureblueAI | A section showing partner brands on the home page; showing a brand logo does not mean that brand bought GEO services | Business-licence name not found in the material |
| Tigerobo | No separate GEO case page found | Filing entity on the site: Tigerobo Network Technology (Shanghai) Co., Ltd. (虎博网络技术（上海）有限公司) |
| Hongdong Data | No customer case page found | Guangzhou Hongdong Data Technology Co., Ltd. (广州泓动数据科技有限公司), per its contact page |
| GrowthMan | A case section grouped by industrial manufacturing, high-tech and overseas expansion; the projects shown cover different kinds of work and are not all GEO projects | Shenzhen Saiya Chuangxiang Technology Co., Ltd. (深圳市赛亚创想科技有限公司) |
| ChinGEO (us) | [Case pages](/cases); figures on each page carry the source and basis stated there | Company details on [About](/about) |

## 3. What the table shows

Only what is visible in the table:

- **The centre of gravity differs.** Some lean towards search marketing (SEO, SEM, content), some towards AI-search monitoring and brand-visibility analysis, some towards brand communication and advertising, and some pair GEO with site building. All say "GEO", but they cover different steps.
- **Most websites show no separate GEO case page.** That does not mean no cases exist, only that there is no separately checkable GEO case page on the site.
- **"Clients shown on a website" is not "GEO clients".** Partner logos, group-level scale or projects of other kinds cannot be read as GEO results.
- **How much each site addresses overseas buyers varies.** In the material gathered, EnquiryGEO, New Galaxy AI and GrowthMan explicitly mention overseas GEO, multilingual sites or overseas expansion; the other sites focus on domestic platforms, brand communication or general AI-search monitoring.
- **AI customer service and enquiry handling:** in the material gathered, none of the ten websites lists it as a service. We include it as one of our supporting services; see the [GEO service page](/services/geo).

## 4. How to use this table

It can help you draw up a first list. It cannot make the decision for you. Next steps:

1. Give several providers the same brief; see [how to compare GEO agencies](/insights/geo-agency-blind-test).
2. Ask how they measure, how acceptance works and who owns the assets; see [how to choose a GEO agency](/insights/geo-agency-selection).
3. Run a short pilot before a long commitment; see [the 90-day GEO pilot](/insights/geo-90-day-pilot).
4. To see your own starting point first, use the [AI visibility audit](/audit).

## 5. About the material

- Scope: each company's home page, service pages, About and case sections, as read on 25 November 2026.
- Not included: information from third-party company-data sites, other companies' client lists and figures without a stated source.
- Corrections: if a company believes a statement differs from its website, or its site has changed, please contact us. We will check, amend and update the date.`,
    faqs: [
      {
        q: 'Which GEO providers are there in China?',
        a: 'This article lists ten companies whose websites describe GEO or AI-search services, plus us, repeating only what each site states and without ranking. Their scope varies widely, so check which steps each one actually covers.',
      },
      {
        q: 'Is this article an assessment of these companies?',
        a: 'No. It has no scores or rankings. It records what each website says about services, cases and entity, without independent verification. "Not found in the material" does not mean the company lacks it.',
      },
      {
        q: 'What if the information is out of date?',
        a: 'The reading date is 25 November 2026, and the company’s current website prevails. If you find a difference, contact us and we will check and update.',
      },
      {
        q: 'How do I choose among these providers?',
        a: 'Give several the same brief, compare measurement methods, acceptance terms and asset ownership, then run a short pilot. The method is in our comparison and selection articles.',
      },
    ],
  },
};
