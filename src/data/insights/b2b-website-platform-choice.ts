import type { Insight } from './types';

export const b2bWebsitePlatformChoice: Insight = {
  slug: 'b2b-website-platform-choice',
  topic: 'website',
  author: 'founder',
  publishedAt: '2026-11-16',
  updatedAt: '2026-11-16',
  keywords: {
    zh: ['外贸独立站 Next.js', '外贸独立站什么时候需要定制', 'AI 驱动独立站', '独立站平台对比'],
    en: ['custom Next.js B2B website', 'when to build a custom B2B website', 'AI-ready B2B website', 'Shopify vs WordPress vs custom Next.js'],
  },
  relatedServices: ['seo-website', 'ai-customer-service'],
  relatedTerms: ['term-core-web-vitals', 'term-structured-data', 'term-hreflang', 'term-ai-crawlers'],
  relatedLessons: ['lesson-a-1-1', 'lesson-a-1-2', 'lesson-d-1-2'],
  zh: {
    title: '2026 年外贸独立站什么时候需要 Next.js 定制开发？',
    description:
      '外贸独立站什么时候值得做 Next.js 定制？从成交方式、型号规模、系统对接、AI 计划和维护人手判断，说明现成平台更合适的情况、换平台的步骤和云端智荐能提供什么。',
    answer:
      '没有绝对最好的平台。询盘为主、型号不多、没人维护代码时，现成平台往往更合适；需要自定义流程、对接 CRM/ERP 或后续接入 AI 时，Next.js 定制更有余地。云端智荐只做 Next.js 定制独立站。平台本身不决定排名。',
    body: `## 先看结论：平台跟着业务走

选平台是最后一个决定，不是第一个。先把业务问题答清楚：客户是发询盘还是在线下单，型号有多少、参数多复杂，要做几个语种，询盘要不要进 CRM/ERP，以后会不会接入 AI，谁来维护。答案出来，方案往往也就清楚了。

| 方案 | 更适合 | 要注意 |
|---|---|---|
| Shopify | 要在线下单、分级定价，型号标准 | B2B 功能要看套餐，部分固定路径不能自定义 |
| WordPress | 询盘为主、内容更新频繁、有人维护插件 | 多语种靠插件，安全要持续加固 |
| Next.js 定制 | 型号多、参数复杂、要对接系统或后续接入 AI | 需要开发团队，渲染与 SEO 基础要自己做对 |

说明：云端智荐只交付 Next.js 定制独立站，不做 Shopify 或 WordPress 建站。表里的另外两种方案是为了帮你判断，不是我们的服务清单。

## 平台不决定排名

结论：搜索引擎和 AI 看的是页面能不能被抓取、有没有可读的正文、内容是否相关，不看你用什么平台。

Google 的 [Search Essentials 技术要求](https://developers.google.com/search/docs/essentials/technical) 只有三条：Googlebot 没被屏蔽、页面能正常返回（HTTP 200）、页面有可索引的内容。三种方案都能满足，也都可能做砸。

定制站要特别注意一点：如果正文要靠浏览器执行 JavaScript 才出现，有些爬虫读不到。Google 的 [JavaScript SEO 基础](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) 写明，服务端渲染或预渲染仍然值得做，因为它对用户和爬虫都更快，而且不是所有爬虫都能运行 JavaScript。做 GEO 时，也要假设 [AI 爬虫](/glossary/ai-crawlers) 可能读不到只在浏览器里渲染的内容。

## Next.js 定制解决哪四类问题

结论：定制的价值不在于“更高级”，而在于现成平台做不到、或者做起来很别扭的地方。

### 1. 自定义业务流程

询价单按型号、数量、认证要求分字段收集；不同市场显示不同的产品线和资料；经销商登录后看到专属文档。这些在现成平台上往往要叠插件或改主题，定制站可以按你的流程直接建模。

### 2. 对接 CRM / ERP

表单线索直接写入企业自己的 CRM，产品参数从 ERP 或产品数据库同步，减少人工搬运和抄错。WordPress 也有 [REST API](https://developer.wordpress.org/rest-api/) 可以对接，差别在于定制站的数据结构一开始就按你的系统来设计。

### 3. 可控的渲染与性能

Next.js 的页面默认是服务端组件，可以在服务端取数据、渲染 HTML，并减少发给浏览器的 JavaScript（见 [Next.js 文档](https://nextjs.org/docs/app/getting-started/server-and-client-components)）。加载哪些第三方脚本、图片怎么处理、部署在哪些节点，也都由你决定。这是一种能力，不是结果：性能好不好，取决于具体怎么做、上线后加了什么。

### 4. 为 AI 留扩展空间

同一套技术栈里，后续可以按需加入产品问答、选型助手、询盘分级等功能，不必换平台。这些属于定制项目，要先评估数据和需求，网站上线时不会自带。

## 什么时候现成平台更合适

结论：下面几条占多数时，Shopify 或 WordPress 往往更省事，不必为定制承担开发和维护的负担。

- 以询盘为主，没有复杂的业务流程，表单发到邮箱就够用
- 型号不多、参数简单，几十个产品页就能讲清楚
- 公司里没人维护代码，也不打算长期找开发团队
- 近一两年没有对接 CRM/ERP 或接入 AI 的计划

现成平台也有自己的边界，选之前先看官方文档：

- **Shopify**：B2B 功能需要支持 B2B 的套餐，具体功能因套餐而异，单个订单最多 500 个商品行（[B2B 注意事项](https://help.shopify.com/en/manual/b2b/getting-started/considerations)）；/products、/collections 这类固定路径不能设置重定向（[URL 重定向](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)）。
- **WordPress**：官方说明目前不支持开箱即用的多语种，要靠社区插件（[多语种说明](https://developer.wordpress.org/advanced-administration/wordpress/multilingual/)）；主题和插件要持续更新与加固（[安全加固](https://developer.wordpress.org/advanced-administration/security/hardening/)）。

## 用六个问题判断

| 问题 | 偏向现成平台 | 偏向 Next.js 定制 |
|---|---|---|
| 客户怎么成交 | 发询盘，或标准品在线下单 | 询价有多个步骤，要按型号和认证收集信息 |
| 型号与参数 | 几十个型号，参数简单 | 上百个型号，参数表复杂，需要筛选对比 |
| 语种与市场 | 一两个语种 | 多语种、多市场，内容各不相同 |
| 系统对接 | 询盘发邮件即可 | 线索要进 CRM，参数要从 ERP 同步 |
| AI 计划 | 暂时没有 | 打算接入产品问答或询盘分级 |
| 维护人手 | 市场人员自己改内容 | 有开发团队或长期的技术合作方 |

## 按情况选

| 你的情况 | 建议 |
|---|---|
| 询盘为主、型号少、没人维护代码 | 现成平台（WordPress 或 Shopify） |
| 要在线下单、分级定价，型号标准 | Shopify 的 B2B 功能 |
| 内容为主、经常发文章、有人维护插件 | WordPress |
| 型号多、参数复杂，要给工程师核对 | Next.js 定制 |
| 要对接 CRM/ERP，或后续接入 AI | Next.js 定制 |
| 拿不准 | 先做测评，看现有网站卡在哪 |

前三种情况我们不承接建站，建议找对应平台的服务商；后两种是云端智荐在做的事。

## 性能分数怎么看

结论：性能是工程目标，不是排名保证。

- PageSpeed Insights 分别给出移动端和桌面端的结果，两者常常不同；它同时提供实验室数据和真实用户的现场数据，两者有时并不一致（[PSI 说明](https://developers.google.com/speed/docs/insights/v5/about)）。
- 实验室数据分 Performance、Accessibility、Best Practices、SEO 四类，是四个独立的分数，不能合成一个“总分”。
- Performance 分数会随测试时间、设备、网络和第三方脚本（如广告、A/B 测试）变化，Lighthouse 官方说明大部分波动来自这些条件的变化（[Lighthouse 性能评分](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)）。
- Google 说明，[Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) 等页面体验报告表现好，不保证排名靠前；搜索始终优先展示最相关的内容（[页面体验](https://developers.google.com/search/docs/appearance/page-experience)）。

云端智荐把海外主要地区的 [Core Web Vitals](/glossary/core-web-vitals) 列为验收项，目标是 LCP ≤ 1.8 秒，用 PSI 等工具检查。这是交付时对照的工程目标，不是服务承诺，也不代表排名或 AI 引用。

## 换平台怎么不丢排名

结论：排名会不会掉，主要看迁移做得规不规范，而不是新平台是什么。按 Google 的 [网址变更迁移指南](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)：

1. 列出旧站全部 URL，尤其是有流量、有外链的页面
2. 为每个旧 URL 指定新地址，做成对应表
3. 上线时用 301 永久重定向；Google 说明这类重定向不会造成 PageRank 损失
4. 重定向尽量长期保留，一般至少 1 年
5. 更新站内链接、sitemap、canonical 与 [hreflang](/glossary/hreflang)
6. 上线后在 Search Console 观察抓取与收录；中小网站大部分页面完成迁移通常要几周

迁入 Shopify 时，产品和分类页使用 /products、/collections 固定路径，对应表要按这个结构来做。

## 常见误区

- **以为换平台就能涨排名**：平台不决定排名，内容和技术基础才决定。
- **定制站只做前端效果**：正文要靠 JavaScript 才出现，爬虫可能读不到。
- **把产品画册直接翻译上网**：工程师核对不了的参数，不会被当作采购依据。
- **只看一次性能分数**：分数会波动，移动端和桌面端也不同，要看多次结果和现场数据。
- **上线后没人更新**：参数、认证和资料过期，买家和 AI 拿到的都是旧信息。

## 云端智荐提供什么

结论：我们只做 Next.js 定制独立站，下面是能写进方案的部分。

1. **只做 Next.js 定制**：网站、AI 功能与业务系统在同一套技术栈里扩展，后续加功能不必换平台。
2. **写给三类读者**：页面按采购、技术、合规三类读者组织，参数、认证与资料都能被核对（见课程 [为什么一个网站要写给三类读者](/academy/website/a-1-2)）。
3. **服务端渲染或预渲染**：不执行 JavaScript 的爬虫也能读到正文，并配好 [结构化数据](/glossary/structured-data) 与 hreflang。
4. **性能作为工程目标**：Core Web Vitals 列入验收，目标与口径见上文「性能分数怎么看」。
5. **数据进自己的系统**：表单线索同步到企业自己的 CRM，上线后接入访问与线索数据看板。
6. **AI 客服可选接入**：[AI 客服](/services/ai-customer-service) 是单独的服务，提供知识库问答、多语种回复和询盘信息提取，高意向线索推送到企业微信或 CRM，不是每个网站都自带。产品选型助手、询盘分级和更深的系统接口属于定制项目，需要单独评估。

案例：[爱康医疗](/cases/ak-medical) 新建了英文海外官网，按 Core Web Vitals 与多语种标准搭建。

## 怎么开始

1. 先做一次 [AI 可见性测评](/audit)，看现有网站在抓取、正文、结构化数据和 AI 回答里的表现。
2. 对照上面六个问题，确认自己是否真的需要定制。
3. 需要的话，看 [外贸独立站服务](/services/seo-website) 的交付内容与验收方式；还在比较不同建站形式的，可以先读课程 [独立站、平台店铺和电子画册官网的区别](/academy/website/a-1-1)。`,
    faqs: [
      {
        q: '外贸独立站一定要用 Next.js 吗？',
        a: '不一定。询盘为主、型号少、没人维护代码时，现成平台往往更合适；需要自定义流程、对接 CRM/ERP 或后续接入 AI 时，Next.js 定制更有余地。',
      },
      {
        q: '云端智荐也做 Shopify 或 WordPress 建站吗？',
        a: '不做。我们只交付 Next.js 定制独立站；如果你的情况更适合现成平台，我们会直接说明。',
      },
      {
        q: '换平台会丢排名吗？',
        a: '关键看迁移是否规范。Google 说明 301 永久重定向不会造成 PageRank 损失，旧地址要逐一对应并长期保留；新地址在搜索结果里稳定下来通常要几周或更久。',
      },
      {
        q: '网站上线就自带 AI 功能吗？',
        a: '不自带。AI 客服是可选接入的单独服务；产品问答、询盘分级等功能按需定制，要先评估数据和需求。',
      },
      {
        q: '性能分数高能保证排名吗？',
        a: '不能。Google 说明页面体验表现好不保证排名靠前，最相关的内容仍然优先；我们把 Core Web Vitals 作为验收目标，不作为排名承诺。',
      },
    ],
  },
  en: {
    title: 'When does a B2B website need a custom Next.js build in 2026?',
    description:
      'When is a custom Next.js build worth it for a B2B export website? Five questions to decide, when off-the-shelf platforms fit better, and how to migrate safely.',
    answer:
      'There is no single best platform. If enquiries are your main goal, your catalogue is small and nobody on staff maintains code, an off-the-shelf platform often fits better. A custom Next.js build pays off when you need custom workflows, CRM or ERP integration, or room to add AI later. ChinGEO only builds custom Next.js sites. The platform itself does not decide rankings.',
    body: `## Short answer: let the business pick the platform

The platform is the last decision, not the first. Start with how buyers reach you (enquiry or online order), how many models you sell and how complex the specs are, how many languages you need, whether leads must flow into a CRM or ERP, whether you plan to add AI, and who will maintain the site. Once those are answered, the choice is usually obvious.

| Option | Best for | Watch out for |
|---|---|---|
| Shopify | Online ordering, tiered pricing, standard products | B2B features depend on your plan; some fixed paths can't be changed |
| WordPress | Enquiry-led sites, frequent content, someone to manage plugins | Multilingual needs plugins; security needs ongoing hardening |
| Custom Next.js | Large catalogues, complex specs, system integration, AI later | Needs a development team; rendering and SEO basics are on you |

A note on scope: ChinGEO only delivers custom Next.js websites. We don't build on Shopify or WordPress. The other two columns are here to help you decide, not to sell you something.

## The platform doesn't decide rankings

Search engines and AI assistants care whether a page can be crawled, whether its text is readable, and whether it's relevant. Which platform produced it doesn't matter.

Google's [Search Essentials technical requirements](https://developers.google.com/search/docs/essentials/technical) come down to three things: Googlebot isn't blocked, the page works (HTTP 200), and it has indexable content. All three options can meet them, and all three can get them wrong.

Custom builds have one specific trap. If the main text only appears after the browser runs JavaScript, some crawlers won't see it. Google's [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) still recommends server-side rendering or pre-rendering, because it's faster for users and crawlers and not all bots can run JavaScript. For GEO, assume [AI crawlers](/glossary/ai-crawlers) may miss anything rendered only in the browser.

## Four problems a custom Next.js build solves

Custom isn't "more advanced". It's useful where off-the-shelf platforms either can't do the job or make it awkward.

- **Your own workflows.** Quote forms that collect model, quantity and certification needs as separate fields; different product lines for different markets; distributor logins with private documents. On a theme-based platform this usually means stacking plugins. On a custom build it is modelled directly.
- **CRM and ERP integration.** Leads go straight into your CRM, and specs sync from your ERP or product database, so nobody retypes data. WordPress has a [REST API](https://developer.wordpress.org/rest-api/) too; the difference is that a custom site's data model is designed around your systems from day one.
- **Control over rendering and performance.** In Next.js, pages are Server Components by default, so data fetching and HTML rendering happen on the server and less JavaScript reaches the browser ([Next.js docs](https://nextjs.org/docs/app/getting-started/server-and-client-components)). You also decide which third-party scripts load, how images are handled and where the site is deployed. That is a capability, not a result. Actual speed depends on how the site is built and what gets added later.
- **Room for AI.** Product Q&A, a selection assistant or enquiry scoring can be added later on the same stack without replatforming. These are custom projects that start with a look at your data and needs. They don't ship with the site.

## When an off-the-shelf platform is the better call

If most of these apply, Shopify or WordPress will likely serve you better than a custom build:

- Enquiries are the goal and a form that emails sales is enough
- A few dozen products with simple specs
- No one in-house maintains code, and you don't plan to retain developers
- No CRM, ERP or AI plans for the next year or two

Each platform has its own limits, so read the official docs first. Shopify B2B requires a plan that supports it, features vary by plan, and orders cap at 500 line items ([B2B considerations](https://help.shopify.com/en/manual/b2b/getting-started/considerations)). Fixed paths such as /products and /collections can't be redirected ([URL redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)). WordPress doesn't support multilingual sites out of the box and relies on community plugins ([multilingual](https://developer.wordpress.org/advanced-administration/wordpress/multilingual/)), and themes and plugins need ongoing updates ([hardening](https://developer.wordpress.org/advanced-administration/security/hardening/)).

## Six questions to decide

| Question | Leans off-the-shelf | Leans custom Next.js |
|---|---|---|
| How do deals start? | Enquiry, or online order for standard items | Multi-step quotes by model and certification |
| Catalogue | Dozens of models, simple specs | Hundreds of models, filterable spec tables |
| Languages and markets | One or two languages | Several markets with different content |
| Systems | Email is enough | Leads into CRM, specs from ERP |
| AI plans | None yet | Product Q&A or enquiry scoring |
| Maintenance | Marketing edits content | A dev team or long-term technical partner |

## Pick by situation

| Your situation | Suggestion |
|---|---|
| Enquiry-led, small catalogue, no one to maintain code | Off-the-shelf (WordPress or Shopify) |
| Online ordering with tiered pricing, standard products | Shopify B2B |
| Content-heavy, frequent articles, plugin upkeep covered | WordPress |
| Large catalogue, specs engineers need to verify | Custom Next.js |
| CRM/ERP integration or AI on the roadmap | Custom Next.js |
| Not sure | Run an audit to see where your current site stalls |

We don't take on the first three; a specialist for that platform is the better fit. The last two are what ChinGEO does.

## How to read performance scores

Performance is an engineering target. It doesn't guarantee rankings.

- PageSpeed Insights reports mobile and desktop separately, and the two often differ. It also mixes lab data with field data from real users, and the two don't always agree ([about PSI](https://developers.google.com/speed/docs/insights/v5/about)).
- Lab results come in four separate categories: Performance, Accessibility, Best Practices and SEO. They aren't one combined score.
- The Performance score moves with test time, device, network and third-party scripts such as ads or A/B tests. Lighthouse says most of that variance comes from changing conditions, not the tool ([performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)).
- Google says good [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) and page experience results don't guarantee top rankings, and the most relevant content still wins ([page experience](https://developers.google.com/search/docs/appearance/page-experience)).

ChinGEO treats [Core Web Vitals](/glossary/core-web-vitals) in key overseas regions as an acceptance item, with a target of LCP ≤ 1.8 seconds, checked with PSI and similar tools. It's a delivery target, not a service-level promise, and it says nothing about rankings or AI citations.

## Switching platforms without losing rankings

Whether rankings drop depends on how carefully you migrate, not on the new platform. Following Google's [site move guide](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes):

1. List every old URL, especially pages with traffic or backlinks
2. Map each one to a new URL
3. Use 301 permanent redirects at launch; Google says these don't cause PageRank loss
4. Keep redirects as long as possible, generally at least a year
5. Update internal links, the sitemap, canonicals and [hreflang](/glossary/hreflang)
6. Watch crawling and indexing in Search Console; a small to medium site usually takes a few weeks for most pages to move

If you're moving onto Shopify, product and collection pages live under the fixed /products and /collections paths, so build the URL map around them.

## Common mistakes

- **Expecting a new platform to lift rankings.** Content and technical basics do that.
- **Building a custom site as a front-end showcase.** If text needs JavaScript to appear, crawlers may miss it.
- **Translating the brochure and calling it a website.** Specs an engineer can't check won't be used to make a buying decision.
- **Judging by one performance score.** Scores vary run to run and between mobile and desktop; look at repeated runs and field data.
- **Launching and walking away.** Outdated specs and certificates mean buyers and AI assistants get old information.

## What ChinGEO provides

We only build custom Next.js sites. Here is what can go into a proposal:

1. **Custom Next.js only**, so the site, AI features and your business systems grow on one stack without replatforming.
2. **Pages written for three readers**: procurement, engineering and compliance, with specs, certifications and documents they can verify (see the lesson [why one website has to be written for three readers](/academy/website/a-1-2)).
3. **Server-side rendering or pre-rendering**, so crawlers that don't run JavaScript still get the text, plus [structured data](/glossary/structured-data) and hreflang.
4. **Performance as an engineering target**, with Core Web Vitals in the acceptance checklist as described above.
5. **Your data in your systems**: form leads sync to your own CRM, and a visit and lead dashboard is connected after launch.
6. **Optional AI customer service**: [AI customer service](/services/ai-customer-service) is a separate service covering knowledge-base answers, multilingual replies and enquiry extraction, with high-intent leads pushed to WeCom or your CRM. It isn't built into every site. A product selection assistant, enquiry scoring or deeper system integration are custom work, scoped separately.

Case in point: for [Aikang Medical](/cases/ak-medical) we built a new English overseas site to Core Web Vitals and multilingual standards.

## Where to start

1. Run the [AI visibility audit](/audit) to see how your current site does on crawling, readable text, structured data and AI answers.
2. Go through the six questions above and decide whether you really need a custom build.
3. If you do, see what the [export website service](/services/seo-website) delivers and how it's accepted. If you're still comparing site types, start with the lesson on [independent sites vs platform stores vs e-brochure sites](/academy/website/a-1-1).`,
    faqs: [
      {
        q: 'Does a B2B export website have to be built with Next.js?',
        a: 'No. If you mostly take enquiries, have a small catalogue and no one to maintain code, an off-the-shelf platform often fits better. Next.js makes sense when you need custom workflows, CRM/ERP integration or AI later.',
      },
      {
        q: 'Does ChinGEO also build Shopify or WordPress sites?',
        a: "No. We only deliver custom Next.js websites, and if an off-the-shelf platform suits you better, we'll say so.",
      },
      {
        q: 'Will switching platforms cost me my rankings?',
        a: 'It depends on the migration. Google says 301 redirects don\'t cause PageRank loss; map every old URL and keep the redirects for at least a year. New URLs can take a few weeks or more to settle in results.',
      },
      {
        q: 'Does the site come with AI features at launch?',
        a: 'No. AI customer service is a separate, optional service, and features like product Q&A or enquiry scoring are built on demand after scoping your data and needs.',
      },
      {
        q: 'Can a high performance score guarantee rankings?',
        a: "No. Google says good page experience doesn't guarantee top rankings and relevant content comes first. We use Core Web Vitals as an acceptance target, not a ranking promise.",
      },
    ],
  },
};
