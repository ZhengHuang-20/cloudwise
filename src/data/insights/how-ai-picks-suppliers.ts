import type { Insight } from './types';

export const howAiPicksSuppliers: Insight = {
  slug: 'how-ai-picks-suppliers',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-20',
  updatedAt: '2026-11-20',
  keywords: {
    zh: ['ChatGPT 怎么推荐供应商', 'AI 怎么选供应商', 'Gemini 推荐供应商依据', '工业企业 GEO', 'AI 推荐供应商'],
    en: ['how does ChatGPT recommend suppliers', 'how AI chooses suppliers', 'Gemini supplier recommendations', 'GEO for manufacturers'],
  },
  relatedServices: ['geo', 'seo', 'website'],
  relatedTerms: ['term-geo', 'term-ai-crawlers', 'term-entity', 'term-eeat'],
  relatedLessons: ['lesson-c-1-1', 'lesson-c-3-1'],
  zh: {
    title: '2026 年 ChatGPT 和 Gemini 怎么挑选推荐供应商？工业企业能做什么',
    seoTitle: '2026 年 ChatGPT、Gemini 怎么推荐供应商？',
    description:
      'AI 推荐供应商是先检索再归纳，不是打分排序。本文按被抓到、被看懂、被信任、被选择四个环节，讲清 Gemini、ChatGPT 的资料来源、中国工厂常见扣分项，以及为何不承诺排名。',
    answer:
      'AI 推荐供应商是先联网检索，再从查到的资料里归纳成名单。能不能出现取决于四个环节：页面能不能被抓到、内容能不能被看懂、信息能不能被信任、买家会不会选你。Google 与 Bing 的基础 SEO 是前提，但没有人能保证被推荐。',
    body: `## 先说结论：AI 不是给供应商打分排序

开启联网后，AI 回答供应商问题的过程是：判断要不要搜索，生成查询，读取检索结果，再把能查到的资料归纳成回答并附上来源。Google 对 Gemini 的[官方说明](https://ai.google.dev/gemini-api/docs/google-search)就是这样描述的。你出现在名单里，是因为你的资料在这一链条的每一步都没有掉队。

我们把这条链条拆成四个环节：

| 环节 | AI 在做什么 | 你的资料要做到 | 对应我们诊断里的卡点 |
|---|---|---|---|
| 被抓到 | 检索并读取页面 | 能被搜索引擎与 AI 爬虫访问、读取 | 看不见 |
| 被看懂 | 把页面内容理解成事实 | 正文清楚、参数完整、语言地道 | 读不懂 |
| 被信任 | 判断来源是否可靠、信息是否一致 | 有可查证的第三方来源，各平台信息一致 | 不被信 |
| 被选择 | 在候选里归纳出推荐名单 | 规格、认证、条件与买家的问题匹配 | 结果，不是单独的动作 |

## 技术事实：不同 AI 的资料从哪里来

AI 平台没有公开完整的检索细节，下面只写官方说过的，没说过的写“官方未公开”。

| 平台 | 官方说明 | 对你意味着什么 |
|---|---|---|
| Gemini | Google 的开发者文档说明，开启 Google 搜索工具后，由模型决定是否搜索、执行查询，再基于结果作答并给出来源 | 页面要先被 Google 收录、排得上；这是文档对 Gemini API 的说明，Gemini 应用与 AI 概览的细节以 [Google 的说明](https://developers.google.com/search/docs/appearance/ai-features)为准 |
| ChatGPT 搜索 | OpenAI 在[帮助文档](https://help.openai.com/en/articles/9237897-chatgpt-search)中说明会使用第三方搜索服务与合作方内容；同时有自己的爬虫 OAI-SearchBot，见[爬虫说明](https://platform.openai.com/docs/bots) | 第三方搜索服务具体是谁、各占多少，官方未公开；外界常提到 Bing，但那是观察，不是 OpenAI 的名单。所以 Google、Bing 的基础 SEO 都要做，并放行 OAI-SearchBot |
| Perplexity | 有自己的爬虫 PerplexityBot | robots.txt 同样要放行 |

结论很实际：**无法确认每个平台的完整来源时，就把能控制的底座做全**，也就是 Google 与 Bing 都能收录、AI 爬虫都能读取、不执行 JavaScript 也能看到正文。细节见 [AI 爬虫](/glossary/ai-crawlers)与 [GEO 和 SEO 的区别](/insights/geo-vs-seo)。

## 环节一：被抓到

页面进不了检索，后面都谈不上。工业企业常见的问题：

- **robots.txt 或防火墙拦截**：不少网站为防采集，把 AI 爬虫一并挡了。先逐个检查 OAI-SearchBot、GPTBot、PerplexityBot、ClaudeBot、Google-Extended 是否被放行。
- **服务器在国内**：海外爬虫访问国内服务器，可能变慢或被网络拦截，抓取失败的页面进不了检索结果。用海外节点或 CDN，并在海外网络下实际打开自己的网站。
- **正文靠 JavaScript 渲染**：部分 AI 爬虫不执行 JavaScript，看到的是空壳。要在服务器端把正文渲染出来。

## 环节二：被看懂

被抓到的页面，AI 还要能读懂并复述。常见问题：

- **英文是机器翻译**：术语不是行业用法，参数单位混乱，AI 很难把它和买家的提问对应起来。
- **关键参数藏在 PDF 画册或图片里**：页面正文没有型号、尺寸、材料、公差、认证编号。
- **没有清晰的产品页**：一个页面堆几十个型号，问题和答案对不上。

产品页怎么写，见 [6 项自查清单](/insights/ai-supplier-search-product-page-checklist)。

## 环节三：被信任

AI 倾向于引用能互相印证的来源。扣分项集中在三处：

- **实体信息不统一**：官网写一个英文名，LinkedIn、行业目录、B2B 平台各写各的，AI 难以判断它们是不是同一家公司。统一公司英文全称、简称、地址与联系方式，见[实体](/glossary/entity)。
- **只留 +86 座机**：海外买家无法直接联系，也缺少“这家公司真实存在、可以沟通”的信号。补上带国际区号的手机或 WhatsApp、企业域名邮箱和完整地址。
- **没有可查证的第三方来源**：认证机构的公开数据库、行业协会目录、行业媒体、展会名录，这些独立来源比自己网站上的说法更有分量，这也是 [E-E-A-T](/glossary/eeat) 里“可信”的含义。

## 环节四：被选择

当 AI 列出几家候选时，买家看的是规格是否匹配、认证是否齐全、起订量与交期是否清楚、案例是否真实。这些写得清楚的页面，更容易被 AI 当作答案的一部分。但最后怎么排序、列几家，由平台生成，你控制不了。

## 工业企业可以按这个顺序做

1. **先自测**：用[免费测评](/audit)看官网的技术底座与各平台的回答，记下基线。
2. **修技术底座**：放行爬虫，服务器端渲染正文，确认海外能打开。
3. **统一实体信息**：公司名、地址、联系方式、认证编号在各平台保持一致。
4. **重写核心产品页**：参数完整、有出处，英文由懂行业的人审校，工程师确认技术内容。
5. **建立第三方来源**：认证数据库、行业协会、行业媒体里留下可查证的记录。
6. **每月复测**：用固定问题集，口径见[GEO 效果怎么衡量](/insights/how-to-measure-geo-results)。

## 我们不承诺排名

我们不承诺“保证排名第一”或“保证 AI 推荐”，原因有三：

1. 回答由平台生成，取决于它的检索与模型，我们看不到也控制不了；
2. 同一个问题，在不同时间、地区、账号下回答会变；
3. Google 在[聘请 SEO 的官方指南](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)里也写明，没有人能保证排名第一，并提醒警惕做出这种保证的服务商。

我们能承诺的是过程：做哪些事、怎么复测、如实汇报，包括没有改善的月份。怎么判断服务商靠不靠谱，见[GEO 服务商怎么选](/insights/geo-agency-selection)。我们的[出海 GEO 服务](/services/geo)就按这四个环节展开；想先知道自己卡在哪一环，可以[做一次免费测评](/audit)，或读术语 [GEO](/glossary/geo)。`,
    faqs: [
      {
        q: 'ChatGPT 推荐供应商的依据是什么？',
        a: '开启搜索后，ChatGPT 会检索网页再归纳成回答。OpenAI 说明会用第三方搜索服务与合作方内容，并有自己的爬虫 OAI-SearchBot，具体比例官方未公开。所以 Google、Bing 的基础 SEO 和放行 OAI-SearchBot 都要做。',
      },
      {
        q: '服务器在国内，会影响 AI 推荐吗？',
        a: '可能会。海外爬虫访问国内服务器可能变慢或被拦截，抓取失败的页面进不了检索结果。建议使用海外节点或 CDN，并在海外网络下实际打开网站确认。',
      },
      {
        q: '做好 SEO 就够了吗？',
        a: 'SEO 是底座，但不够。AI 还要读懂并信任你的资料，需要完整的参数、一致的实体信息和第三方来源，见 GEO 与 SEO 的区别。',
      },
      {
        q: '能保证 ChatGPT 或 Gemini 推荐我们吗？',
        a: '不能。回答由平台生成，并随时间、地区、账号变化。能做的是把四个环节做扎实，每月复测，并如实汇报。',
      },
    ],
  },
  en: {
    title: 'How do ChatGPT and Gemini pick suppliers in 2026? What manufacturers can do',
    seoTitle: 'How ChatGPT and Gemini pick suppliers in 2026',
    description:
      'AI recommends suppliers by retrieving, then summarising. Four stages, what Gemini and ChatGPT say about their sources, and what costs Chinese factories.',
    answer:
      'AI recommends suppliers by searching the web first, then summarising what it finds into a shortlist. Whether you appear depends on four stages: can your pages be crawled, understood and trusted, and will buyers choose you. Basic SEO on Google and Bing is the prerequisite, but nobody can guarantee a recommendation.',
    body: `## The short answer: AI does not score and rank suppliers

With search on, an AI answers a supplier question like this: it decides whether to search, writes queries, reads the results, then summarises what it found into an answer with sources. Google’s [documentation for Gemini](https://ai.google.dev/gemini-api/docs/google-search) describes it in exactly those terms. You appear on the list because your material did not drop out at any step of that chain.

We split the chain into four stages:

| Stage | What the AI is doing | What your material must do | Matching bottleneck in our diagnosis |
|---|---|---|---|
| Crawled | Retrieving and reading pages | Be accessible to search engines and AI crawlers | Invisible |
| Understood | Turning page content into facts | Clear body text, complete parameters, natural language | Hard to read |
| Trusted | Judging whether sources are reliable and consistent | Verifiable third-party sources, consistent details across platforms | Not trusted |
| Chosen | Summarising candidates into a shortlist | Specifications, certifications and terms that match the buyer’s question | The outcome, not a separate action |

## Technical facts: where each AI gets its material

The platforms do not publish full retrieval details. We only state what they have said officially and mark the rest "not published".

| Platform | What the vendor says | What it means for you |
|---|---|---|
| Gemini | Google’s developer documentation says that with the Google Search tool on, the model decides whether to search, runs the queries, then answers from the results and returns sources | Your pages need to be indexed and rank on Google first. That documentation covers the Gemini API; for the Gemini app and AI Overviews, follow [Google’s own explanation](https://developers.google.com/search/docs/appearance/ai-features) |
| ChatGPT search | OpenAI’s [help article](https://help.openai.com/en/articles/9237897-chatgpt-search) says it uses third-party search providers and partner content, and it runs its own crawler, OAI-SearchBot (see the [bot documentation](https://platform.openai.com/docs/bots)) | Which providers, and in what proportion, is not published. Outside observers often mention Bing, but that is observation, not an OpenAI list. So do basic SEO for both Google and Bing, and allow OAI-SearchBot |
| Perplexity | Runs its own crawler, PerplexityBot | Allow it in robots.txt as well |

The practical conclusion: **when you cannot confirm every platform’s sources, make the foundation you control complete.** That means both Google and Bing can index you, AI crawlers can read you, and the body text is visible without JavaScript. See [AI crawlers](/glossary/ai-crawlers) and [GEO vs SEO](/insights/geo-vs-seo).

## Stage 1: being crawled

If a page never enters retrieval, nothing later matters. Common problems for manufacturers:

- **robots.txt or firewall blocks**: many sites block scrapers and catch AI crawlers in the same rule. Check OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot and Google-Extended one by one.
- **Servers in mainland China**: overseas crawlers may meet slow responses or network blocks, and a page that fails to fetch never reaches retrieval. Use overseas nodes or a CDN, and open your site from an overseas network to check.
- **Body text rendered by JavaScript**: some AI crawlers do not run JavaScript and see an empty shell. Render the main content on the server.

## Stage 2: being understood

A fetched page still has to be read and restated. Common problems:

- **Machine-translated English**: terms are not the industry’s own, units are inconsistent, and the AI struggles to match the page to a buyer’s question.
- **Key parameters locked in PDF catalogues or images**: the page body has no model numbers, dimensions, materials, tolerances or certificate numbers.
- **No clear product page**: dozens of models on one page, so questions and answers do not line up.

For how to write a product page, see the [6-point checklist](/insights/ai-supplier-search-product-page-checklist).

## Stage 3: being trusted

AI leans on sources that confirm one another. The deductions cluster in three places:

- **Inconsistent entity details**: your site uses one English name while LinkedIn, trade directories and B2B platforms each use another, so the AI cannot tell they are the same company. Align the full English name, short name, address and contact details; see [entity](/glossary/entity).
- **Only a +86 landline**: overseas buyers cannot reach you directly, and there is no signal that the company is real and can be talked to. Add a mobile or WhatsApp number with the international prefix, a company-domain email and a full address.
- **No verifiable third-party sources**: certification bodies’ public databases, trade association directories, trade media and exhibitor lists carry more weight than your own claims. This is what the "trust" in [E-E-A-T](/glossary/eeat) means.

## Stage 4: being chosen

When an AI lists a few candidates, buyers look at whether specifications match, certifications are complete, minimum order quantity and lead time are clear, and cases are real. Pages that state these clearly are easier for an AI to use in its answer. But the final ordering and how many suppliers are listed are generated by the platform, and you do not control them.

## A sensible order of work for manufacturers

1. **Self-test first**: use the [free audit](/audit) to see your site’s technical foundation and how each platform answers, and record the baseline.
2. **Fix the foundation**: allow the crawlers, render body text on the server, confirm the site opens overseas.
3. **Align entity details**: company name, address, contacts and certificate numbers consistent everywhere.
4. **Rewrite the core product pages**: complete parameters with sources, English reviewed by someone who knows the industry, technical content confirmed by your engineers.
5. **Build third-party sources**: verifiable records in certification databases, trade associations and trade media.
6. **Re-test monthly**: with a fixed question set; the definitions are in [how to measure GEO results](/insights/how-to-measure-geo-results).

## We do not promise rankings

We do not promise "guaranteed #1" or "guaranteed AI recommendation", for three reasons:

1. Answers are generated by the platform from its own retrieval and model, which we cannot see or control.
2. The same question gets a different answer at a different time, in a different region, or on a different account.
3. Google’s [guidance on hiring an SEO](https://developers.google.com/search/docs/fundamentals/do-i-need-seo) also says no one can guarantee a #1 ranking and warns against anyone who claims otherwise.

What we can promise is process: what we do, how we re-test, and honest reporting, including the months with no improvement. For how to judge any agency, see [how to choose a GEO agency](/insights/geo-agency-selection). Our [export GEO service](/services/geo) follows these four stages. To find out which stage you are stuck at, [run a free audit](/audit), or read the glossary entry on [GEO](/glossary/geo).`,
    faqs: [
      {
        q: 'What does ChatGPT base supplier recommendations on?',
        a: 'With search on, ChatGPT retrieves web pages and summarises them. OpenAI says it uses third-party search providers and partner content and has its own crawler, OAI-SearchBot; the proportions are not published. So do basic SEO for both Google and Bing, and allow OAI-SearchBot.',
      },
      {
        q: 'Does hosting in mainland China hurt AI visibility?',
        a: 'It can. Overseas crawlers may meet slow responses or blocks, and pages that fail to fetch never reach retrieval. Use overseas nodes or a CDN and check the site from an overseas network.',
      },
      {
        q: 'Is good SEO enough?',
        a: 'SEO is the foundation but not enough. AI also has to understand and trust your material, which needs complete parameters, consistent entity details and third-party sources. See GEO vs SEO.',
      },
      {
        q: 'Can you guarantee that ChatGPT or Gemini will recommend us?',
        a: 'No. Answers are generated by the platform and change with time, region and account. What we can do is make the four stages solid, re-test monthly and report honestly.',
      },
    ],
  },
};
