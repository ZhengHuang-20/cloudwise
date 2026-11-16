import type { Insight } from './types';

export const b2bWebsitePlatformChoice: Insight = {
  slug: 'b2b-website-platform-choice',
  topic: 'website',
  author: 'founder',
  publishedAt: '2026-11-16',
  updatedAt: '2026-11-16',
  keywords: {
    zh: ['外贸独立站用什么平台', '独立站平台对比', '外贸独立站 Shopify 还是 WordPress', '外贸独立站建设', 'B2B 独立站选型'],
    en: ['B2B website platform', 'best website platform for manufacturers', 'Shopify vs WordPress for B2B', 'custom website vs Shopify for manufacturers'],
  },
  relatedServices: ['website', 'seo', 'geo'],
  relatedTerms: ['term-hreflang', 'term-core-web-vitals', 'term-structured-data', 'term-ai-crawlers'],
  relatedLessons: ['lesson-a-1-1', 'lesson-a-1-2', 'lesson-a-1-4'],
  zh: {
    title: '外贸独立站用 Shopify、WordPress 还是定制？',
    description:
      '外贸独立站用什么平台？从询盘还是下单、型号规模、语种、系统集成和维护人手五个问题出发，对比 Shopify、WordPress 与定制开发，并给出老站迁移不丢排名的步骤。',
    answer:
      '没有绝对最好的平台。询盘为主、型号不多的工厂，WordPress 或 Shopify 都够用，关键在维护；要在线下单、分级定价，Shopify 的 B2B 功能最省事；型号多、参数复杂、要接 CRM/ERP，定制开发更合适。平台本身不决定排名。',
    body: `## 先看结论：先定业务模式，再选平台

建 B2B 外贸独立站，平台是最后一个决定，不是第一个。先回答五个业务问题：客户是发询盘还是在线下单，有多少型号、参数有多复杂，要做几个语种市场，询盘要不要进 CRM/ERP，以后谁来维护和更新。答案出来，选哪种方案往往就清楚了。

| 方案 | 最适合 | 主要代价 |
|---|---|---|
| Shopify | 要在线下单，给企业客户设账户、价格和付款条件 | 部分 URL 路径固定；B2B 功能随套餐不同 |
| WordPress | 询盘为主、内容多、要页面灵活 | 安全、更新、备份要有人负责；多语言靠插件 |
| 定制开发 | 型号多、参数复杂，或要深度对接 CRM/ERP | 前期要理清产品数据；上线后要有团队接手 |

三条路都走得通。走坏的原因很少是平台本身，而是方案和业务不匹配，或者上线后没人管。

## 平台不决定排名，决定结果的是三件事

制造企业官网的任务，是让海外采购商、搜索引擎和 AI 读懂你做什么、参数是什么、凭什么可信，然后留下询盘。做得好不好取决于下面三项，和平台基本无关。

1. **页面结构**：每个产品系列、每个应用场景有没有独立页面，参数、标准编号、认证是不是写成可以核对的文字和表格。产品页具体怎么写，见 [产品页 6 项自查清单](/insights/ai-supplier-search-product-page-checklist)。
2. **技术资格**：Google 在 [Search Essentials 的技术要求](https://developers.google.com/search/docs/essentials/technical)里只列了三条最低门槛：Googlebot 没有被屏蔽、页面返回 HTTP 200、页面有可索引的内容。在此之上是速度（[Core Web Vitals](/glossary/core-web-vitals)）、多语言的 [hreflang](/glossary/hreflang) 和 [结构化数据](/glossary/structured-data)，三种方案都能做好，也都能做坏。
3. **能否长期更新**：新产品、新认证、新案例能不能在一两天内上线，靠的是后台好不好用、有没有人负责。

速度也不是万能的。Google 在 [Core Web Vitals 说明](https://developers.google.com/search/docs/appearance/core-web-vitals)里建议站长把这几项指标做好，但在 [页面体验说明](https://developers.google.com/search/docs/appearance/page-experience)里也写明，报告得分好并不保证排到前面，Google 会优先展示相关的内容。

用的人多也不等于适合你。按 [W3Techs 的统计](https://w3techs.com/technologies/overview/content_management)（2026 年 11 月 16 日，按网站而非网页计、子域名不单独计），WordPress 用于 38.5% 的网站、占可识别 CMS 的 57.5%，Shopify 分别是 5.5% 和 8.1%。这说明生态成熟、好找人，说明不了哪个适合一家阀门厂。

## 选型前要回答的 6 个问题

把这 6 个问题写成一页纸，和老板、销售、市场负责人一起填完，再去谈方案。

| 问题 | 为什么重要 | 答案会把你推向哪里 |
|---|---|---|
| 1. 客户是发询盘还是在线下单 | 决定网站的核心是内容和表单，还是购物车和结账 | 只要询盘，三者都行；要下单、分级价格，优先看 Shopify |
| 2. 有多少型号，参数有多复杂 | 几百个型号的参数表，靠手工逐页维护会失控 | 参数多、要按参数筛选，倾向定制或在 WordPress 上建产品数据库 |
| 3. 要做几个语种市场 | 每个语种都要独立 URL、互相声明的 hreflang 和翻译流程 | 语种多时重点比较翻译与 URL 方案，而不是模板 |
| 4. 询盘要进哪些系统 | 销售要在 CRM 里看到询盘的来源页面和渠道 | 只发邮件通知，三者都简单；要双向同步 CRM/ERP，定制更可控 |
| 5. 谁来长期维护 | 插件更新、备份、安全和内容上新都要有人负责 | 没有技术人员，优先托管型方案或约定外部维护 |
| 6. 老站有没有排名要保住 | 换平台通常意味着换 URL | 先做 URL 映射，再看新平台的 URL 规则能不能接住 |

## 按业务情形匹配方案

下表是制造企业最常见的六种情形，最后一列是最容易忽略的坑。

| 业务情形 | 推荐方案 | 理由 | 要注意的坑 |
|---|---|---|---|
| 询盘为主，几十个型号，1～2 个语种，没有专职技术 | WordPress（选可靠的托管服务并约定维护）或 Shopify | 页面和文章都好维护，上线快 | WordPress 插件越装越多、更新没人管；Shopify 的询盘表单要靠主题或应用实现 |
| 询盘为主，几百上千个型号，参数表复杂，买家要按参数筛选 | 定制开发，或 WordPress 加自定义字段与产品数据库 | 参数是结构化数据，要能批量导入、按参数筛选、自动生成规格页 | 产品数据建模是最大工作量；页面靠浏览器端渲染会让部分爬虫读不到正文 |
| 备件、样品或复购要在线下单，企业客户价格和付款条件各不相同 | Shopify（B2B 功能） | 企业账户、目录与价格、付款条件都是原生功能 | B2B 功能随套餐不同，部分结账功能与 B2B 不兼容 |
| 面向 4 个以上语种市场 | 三者都可以，按翻译流程和 URL 规则选 | 多语言的难点在翻译管理和 hreflang，不在平台 | 机翻上线、语种之间 hreflang 不互相声明 |
| 询盘必须进 CRM，销售按来源跟进 | 任何方案都要先定好字段和接口；集成多、要双向同步时选定制 | 数据从哪来、进到哪去，比用哪个后台更重要 | 表单只发邮件，来源丢失，无法判断哪类页面带来询盘 |
| 老站有排名，要换平台 | 先做 URL 映射，再决定平台 | 新平台的 URL 规则决定有多少旧地址需要重定向 | 只迁内容、不做重定向，旧排名和外链一起失效 |

## 三种方案的真实代价

### Shopify：交易省心，但 URL 和功能受平台约束

在线交易是业务一部分时，Shopify 最省事。它的 [B2B 功能](https://help.shopify.com/en/manual/b2b)可以为企业客户设置公司账户、专属价格、币种、产品目录、付款与配送方式，并支持对接 ERP 等外部系统；服务器、安全和结账由平台托管。

代价是规则由平台定：

- **B2B 功能随套餐不同**，按 [B2B 的使用要求与注意事项](https://help.shopify.com/en/manual/b2b/getting-started/considerations)，部分套餐不提供 B2B；加速结账、订阅等功能与 B2B 不兼容；单个订单最多 500 个行项目。
- **URL 路径部分固定**：[URL 重定向说明](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)把 /products、/collections 列为固定路径；[多语言要求](https://help.shopify.com/en/manual/international/languages/requirements)也写明，产品地址里的 products 一词不能翻译，各套餐能开的语种数量也有上限。
- **参数表要另做**：产品参数可以用 [metafields 自定义字段](https://help.shopify.com/en/manual/custom-data/metafields)保存并显示在主题里，但几百个型号的字段要事先设计好。

### WordPress：内容灵活，但维护责任在你

内容多、以询盘为主、要页面灵活的企业适合 WordPress。主题、插件和开发者都好找，[REST API](https://developer.wordpress.org/rest-api/) 也让它能和其他系统交换数据。

代价是维护：

- **安全与更新要有人管**：官方的 [安全加固文档](https://developer.wordpress.org/advanced-administration/security/hardening/)提醒，主机只负责一部分安全，大量责任在网站所有者；旧版本不再获得安全更新，插件和主题不要从不可信来源安装。
- **多语言靠插件**：官方 [多语言文档](https://developer.wordpress.org/advanced-administration/wordpress/multilingual/)写明，WordPress 目前不原生支持多语言网站，需要用社区插件或每个语种单独安装。插件选定后再换，成本很高。

### 定制开发：数据和集成最可控，但要有团队接手

产品数据复杂、要深度对接 CRM/ERP、对速度和页面结构要求严格时，定制开发更合适：参数按产品体系建模，规格页、对比页、筛选页从同一份数据生成，询盘字段按销售流程设计。

代价是对规划和团队的要求：

- **前期要把产品数据理清**：型号、参数、单位、标准编号、认证，哪些是公共字段、哪些按系列不同，要在开发前定下来。
- **SEO 基础要自己实现**：hreflang、sitemap、结构化数据、重定向，平台不会替你做。Google 的 [JavaScript SEO 基础](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)建议采用服务端渲染或预渲染，因为并非所有爬虫都能执行 JavaScript。
- **上线后要有人接手**：代码归谁、文档是否完整、换团队能否交接，要在合同里写清。

## 老站迁移不丢排名要做的事

丢排名的通常不是迁移本身，而是漏掉的步骤。下面按 Google 的 [网址变更与网站迁移说明](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)整理：

1. **做一张 URL 映射表**：每个旧地址对应一个新地址，产品页对产品页，不要全部指向首页。
2. **配置 301 永久重定向**：Google 写明，301 等永久重定向不会造成 PageRank 损失。
3. **更新站内信息**：内链、canonical、hreflang 和 sitemap 都改成新地址，并检查新站的 robots.txt 没有误挡要收录的部分。
4. **换域名时提交地址变更**：在 Search Console 为旧站提交 Change of Address。
5. **预期短期波动**：Google 说明迁移期间排名会有暂时波动，中型网站通常要几周或更久，新地址才会逐步替换旧地址。
6. **重定向至少保留一年**：Google 建议尽量长期保留，一般至少 1 年。

迁到 Shopify 时还要注意：它只能为已经返回 404 的地址建重定向，固定路径不能作为重定向来源，映射表要按这些规则做。

迁移不是唯一选择。案例 [爱康医疗](/cases/ak-medical) 保留了国内官网，另建了一个英文海外官网，两个站点分别服务不同读者，没有迁移风险。

## 常见误区

1. **以为换平台就能提升排名**：如果页面结构、内容和技术资格不变，换平台只换了后台。
2. **只看模板好不好看**：采购商和爬虫关心的是参数和证据能不能读到，模板决定不了这些。
3. **忽略谁来维护**：网站上线那天最新，之后每月都在变旧；没人维护的 WordPress 有安全风险，没人更新的 Shopify 也留不住买家。
4. **先建站，再整理产品数据**：几百个型号的参数上线后才整理，页面结构往往要推倒重来。
5. **把多语言当成装个翻译插件**：每个语种都要独立 URL、互相声明的 hreflang 和专人校对，机翻直接上线会拖累可信度。

## 怎么开始

1. **测一次现有网站**：用 [AI 可见性测评](/audit)看 AI 爬虫权限、不执行 JavaScript 时能读到的正文、结构化数据和多语言设置。
2. **填完上面 6 个问题**：第 1、2、5 题基本决定方案方向。
3. **拿决策表比较方案**：请每家方案提供方说明会怎么处理你那一行的坑。

想先了解独立站的分类，可以读课时 [独立站、平台店铺与“电子画册”官网的区别](/academy/website/a-1-1)。如果想在一次诊断会里把这些问题过一遍，我们的 [海外独立站服务](/services/website)也从这几个问题开始，不预设平台。`,
    faqs: [
      {
        q: '外贸 B2B 独立站一定要用 Shopify 吗？',
        a: '不一定。Shopify 的优势在在线交易和托管省心，适合要在线下单、给企业客户分级定价的情形；以询盘为主的制造企业，WordPress 或定制开发同样可行。',
      },
      {
        q: '换建站平台会不会丢掉 Google 排名？',
        a: '按 Google 的迁移说明做好 URL 映射、301 重定向和站内信息更新，可以把损失降到最低，但迁移期间仍会有暂时波动，中型网站通常要几周或更久才稳定。',
      },
      {
        q: '没有技术人员，适合用哪种方案？',
        a: '优先选托管型方案，或在合同里约定外部维护：谁负责更新、备份和安全，出问题多久响应。没人维护是 B2B 官网最常见的失败原因。',
      },
      {
        q: '定制开发和用现成平台，成本差在哪里？',
        a: '影响成本的主要是产品数据的复杂度、语种数量、系统集成深度和后续维护方式，不只是建站本身。建议先做方案规划，按交付物和维护责任比较，而不是只比较报价。',
      },
    ],
  },
  en: {
    title: 'B2B website platform: Shopify, WordPress or custom build?',
    description:
      'Which platform suits a manufacturer’s B2B website? Five business questions to decide between Shopify, WordPress and a custom build, and how to migrate safely.',
    answer:
      'There is no single best platform. An enquiry-led manufacturer with a modest catalogue and no in-house developer can do well on WordPress or Shopify, as long as someone maintains it. If buyers order online at account-specific prices, Shopify B2B fits best. Hundreds of models with complex specs and CRM or ERP integration point to a custom build. The platform itself does not decide rankings.',
    body: `## The short answer: decide the business model, then the platform

For a manufacturer’s B2B website, the platform is the last decision, not the first. Start with five questions: do buyers send enquiries or place orders, how many models do you sell and how complex are the specs, how many language markets do you serve, does every enquiry need to reach a CRM or ERP, and who will maintain the site in two years. Once those are answered, the choice usually makes itself.

| Option | Best fit | Main trade-off |
|---|---|---|
| Shopify | Online ordering with company accounts, price lists and payment terms; no wish to run servers | Built for commerce, with some fixed URL paths; B2B features vary by plan |
| WordPress | Enquiry-led sites with lots of content and flexible page layouts | When self-hosted, security, updates and backups are your job; multilingual needs plugins |
| Custom build | Large catalogues, complex specs, spec-based filtering, deep CRM or ERP integration | Product data must be modelled up front; a technical team has to own it after launch |

Each route works, and each has its failures. Those failures rarely come from the platform. They come from a mismatch with the business, or from nobody looking after the site once it is live.

## Platforms don’t rank; pages do

A manufacturer’s website has one job: help overseas buyers, search engines and AI systems understand what you make, what the specifications are and why you can be trusted, and then capture the enquiry. Three things determine how well it does that, and none of them is tied to a particular platform.

1. **Page structure.** Does each product family and application have its own page? Are specifications, standard numbers and certifications written as checkable text and tables? For the product page itself, see our [6-point product page checklist](/insights/ai-supplier-search-product-page-checklist).
2. **Technical eligibility.** Google’s [Search Essentials technical requirements](https://developers.google.com/search/docs/essentials/technical) set only three minimums: Googlebot is not blocked, the page returns HTTP 200, and it has indexable content. On top of that come speed ([Core Web Vitals](/glossary/core-web-vitals)), [hreflang](/glossary/hreflang) for language versions and [structured data](/glossary/structured-data). All three options can get these right, and all three can get them wrong.
3. **Ongoing updates.** Can a new product, certificate or case study go live within a day or two? That depends on the editing workflow and on whether someone owns it.

Speed is not a shortcut either. Google’s [Core Web Vitals page](https://developers.google.com/search/docs/appearance/core-web-vitals) recommends achieving good scores, while its [page experience guidance](https://developers.google.com/search/docs/appearance/page-experience) notes that good report results do not guarantee top rankings and that relevant content comes first.

Popularity does not settle it. According to [W3Techs](https://w3techs.com/technologies/overview/content_management) (16 November 2026, counting websites rather than pages, with subdomains not counted separately), WordPress runs 38.5% of all websites and holds 57.5% of the CMS market; Shopify’s figures are 5.5% and 8.1%. That tells you both ecosystems are mature and easy to hire for. It does not tell you which one suits a valve manufacturer.

## Six questions to answer before choosing

Put these on one page and fill them in with the owner, the sales lead and whoever runs marketing before you talk to anyone about a build.

| Question | Why it matters | Where the answer points |
|---|---|---|
| 1. Enquiries or online orders? | Decides whether the core is content and forms, or cart and checkout | Enquiries only: any option works. Orders and tiered prices: look at Shopify first |
| 2. How many models, how complex are the specs? | Hand-editing spec tables for hundreds of models does not scale | Many specs and spec-based filtering lean towards custom, or WordPress with a product database |
| 3. How many language markets? | Each language needs its own URLs, reciprocal hreflang and a translation workflow | With many languages, compare translation and URL handling, not themes |
| 4. Which systems must enquiries reach? | Sales need to see the source page and channel of each enquiry in the CRM | Email alerts are easy anywhere; two-way CRM or ERP sync is easier to control in a custom build |
| 5. Who maintains it long term? | Updates, backups, security and new content all need an owner | No developer in-house: choose a hosted option or contract maintenance |
| 6. Is there an old site with rankings to protect? | Changing platform usually means changing URLs | Map URLs first, then check whether the new platform’s URL rules can accommodate them |

## Matching the platform to the situation

The table below covers the six situations we see most often among manufacturers. The last column is the pitfall people tend to miss.

| Situation | Recommended | Why | Watch out for |
|---|---|---|---|
| Enquiry-led, a few dozen models, one or two languages, no developer | WordPress on reliable managed hosting with agreed maintenance, or Shopify | Pages and articles are easy to edit and launch quickly | Plugins pile up and go unpatched on WordPress; on Shopify, enquiry forms rely on the theme or an app |
| Enquiry-led, hundreds or thousands of models, complex specs, buyers filter by spec | Custom build, or WordPress with custom fields and a product database | Specs are structured data that should be imported in bulk, filtered and turned into spec pages automatically | Data modelling is most of the work; client-side rendering can hide content from some crawlers |
| Online ordering for spares, samples or repeat orders, with account-specific prices and terms | Shopify B2B | Company accounts, catalogues, price lists and payment terms are built in | Features vary by plan, and some checkout features are not compatible with B2B |
| Four or more language markets | Any option; choose on translation workflow and URL handling | The hard part is managing translations and hreflang, not the platform | Machine translation pushed live; hreflang tags that don’t point back to each other |
| Every enquiry must reach the CRM with its source | Define fields and integrations first on any option; go custom for many systems or two-way sync | Where data comes from and where it goes matters more than the admin panel | Forms that only send email lose the source, so you never learn which pages produce enquiries |
| An old site with rankings, moving platform | Map URLs before choosing | The new platform’s URL rules decide how many old addresses need redirects | Moving content without redirects, losing rankings and backlinks together |

## What each option really costs you

### Shopify: easy commerce, within the platform’s rules

Shopify is the strongest choice when online transactions are part of the business. Its [B2B features](https://help.shopify.com/en/manual/b2b) let you set up company accounts with their own pricing, currency, catalogues, payment and shipping methods, and Shopify lists ERP and external-system integrations among the tools available. Hosting, security and checkout are managed for you.

The trade-off is that Shopify sets the rules:

- **B2B depends on your plan.** Shopify’s [B2B requirements and considerations](https://help.shopify.com/en/manual/b2b/getting-started/considerations) say B2B is not offered on every plan, that accelerated checkouts and subscriptions are not compatible with B2B, and that an order can have at most 500 line items.
- **Some URL paths are fixed.** The [URL redirect guide](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect) lists /products and /collections as fixed paths, and the [multilingual requirements](https://help.shopify.com/en/manual/international/languages/requirements) note that the word "products" in a URL cannot be translated and that each plan caps the number of languages.
- **Spec tables take planning.** Product specifications can be stored in [metafields](https://help.shopify.com/en/manual/custom-data/metafields) and shown by the theme, but a spec system for hundreds of models needs its fields designed in advance.

### WordPress: flexible content, maintenance on you

WordPress suits content-heavy, enquiry-led sites that want flexible page structures. Themes, plugins and developers are easy to find, and the [REST API](https://developer.wordpress.org/rest-api/) lets it exchange data with other systems.

The trade-off is maintenance:

- **Security and updates need an owner.** The official [hardening guide](https://developer.wordpress.org/advanced-administration/security/hardening/) reminds site owners that hosts cover only part of security and a great deal rests with the owner; older versions stop receiving security updates, and plugins and themes should come only from trusted sources.
- **Multilingual means plugins.** WordPress’s [multilingual documentation](https://developer.wordpress.org/advanced-administration/wordpress/multilingual/) says core does not yet support multilingual sites out of the box, so you rely on community plugins or one installation per language. Switching plugins later is expensive.

### Custom build: full control of data and integration, if a team owns it

A custom build fits complex product data, deep CRM or ERP integration, or strict requirements on speed and page structure. Specs are modelled on your own product system; spec pages, comparison pages and filters are generated from one data source; enquiry fields follow your sales process.

The trade-off is what it demands of planning and people:

- **Product data comes first.** Models, parameters, units, standard numbers and certifications, and which fields are shared or series-specific, must be settled before development starts.
- **SEO basics are your job.** hreflang, sitemaps, structured data and redirects are not provided for you. Google’s [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) recommends server-side rendering or pre-rendering because not all bots can run JavaScript.
- **Someone must own it after launch.** Who owns the code, whether it is documented and whether another team could take it over should all be in the contract.

## Moving an old site without losing rankings

A migration does not have to cost rankings; the skipped steps do. Based on Google’s [site move guide](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes):

1. **Build a URL map.** Every old address gets a matching new one, product page to product page, never everything to the home page.
2. **Use 301 redirects.** Google states that 301 and other permanent redirects do not cause a loss in PageRank.
3. **Update on-site signals.** Point internal links, canonicals, hreflang and sitemaps at the new URLs, and check that the new robots.txt does not block anything you want indexed.
4. **Changing domains? File a Change of Address** for the old site in Search Console.
5. **Expect a dip.** Google warns of temporary ranking fluctuation; for a medium-sized site it can take a few weeks or more before new URLs replace the old ones.
6. **Keep redirects for at least a year**, and longer if you can.

On Shopify, note that redirects can only be created from addresses that already return 404, and fixed paths cannot be used as redirect sources, so build the URL map around those rules.

Migration is not the only route. In our [Aikang Medical case](/cases/ak-medical), the domestic site stayed as it was and a separate English site was built for overseas buyers, so there was no migration risk at all.

## Common mistakes

1. **Expecting a new platform to lift rankings.** If structure, content and technical basics stay the same, only the admin panel changed.
2. **Choosing on the theme.** Buyers and crawlers care whether specs and evidence are readable; a theme cannot supply those.
3. **Ignoring maintenance.** A site is newest on launch day. An unmaintained WordPress site is a security risk; an unupdated Shopify store loses buyers just the same.
4. **Building first, organising product data later.** If specs for hundreds of models are sorted only after launch, the page structure often has to be rebuilt.
5. **Treating multilingual as a plugin install.** Each language needs its own URLs, reciprocal hreflang and a human reviewer. Unedited machine translation damages credibility.

## Where to start

Know your current position before you compare proposals:

1. **Check your current site.** An [AI visibility audit](/audit) looks at AI crawler access, the text visible without JavaScript, structured data and language setup. Note the main issues.
2. **Answer the six questions above**, especially 1, 2 and 5, which set the direction.
3. **Use the decision table to compare proposals.** Ask each provider how they would handle the pitfalls in your row.

For background on the types of overseas website, see the lesson on [websites, marketplace stores and brochure sites](/academy/website/a-1-1). If you would rather work through these questions in one session, our [export website service](/services/website) starts from the same place, without assuming a platform.`,
    faqs: [
      {
        q: 'Does a B2B website have to run on Shopify?',
        a: 'No. Shopify’s strengths are online transactions and managed hosting, which suit buyers who order online at account-specific prices. For enquiry-led manufacturers, WordPress or a custom build works just as well.',
      },
      {
        q: 'Will switching platforms cost us our Google rankings?',
        a: 'Following Google’s site move guidance, with a URL map, 301 redirects and updated internal signals, keeps the loss to a minimum. Expect a temporary dip; a medium-sized site usually needs a few weeks or more to settle.',
      },
      {
        q: 'We have no developer. Which option suits us?',
        a: 'Choose a hosted option or contract maintenance, spelling out who handles updates, backups and security and how fast problems are fixed. A site nobody maintains is the most common way B2B websites fail.',
      },
      {
        q: 'What drives the cost difference between a custom build and an off-the-shelf platform?',
        a: 'Mainly the complexity of your product data, the number of languages, how deep the integrations go and how the site will be maintained, not the build alone. Plan the scope first and compare proposals by deliverables and maintenance responsibility rather than by quote.',
      },
    ],
  },
};
