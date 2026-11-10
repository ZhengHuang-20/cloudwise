import type { Insight } from './types';

export const geoAgencySelection: Insight = {
  slug: 'geo-agency-selection',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-10',
  updatedAt: '2026-11-10',
  keywords: {
    zh: ['GEO 服务商', 'GEO 优化公司', 'GEO 服务商怎么选', '选 GEO 公司要问什么'],
    en: ['how to choose a GEO agency', 'GEO agency', 'questions to ask a GEO agency', 'generative engine optimization services'],
  },
  relatedServices: ['geo', 'seo', 'website'],
  relatedTerms: ['term-geo', 'term-eeat'],
  relatedLessons: ['lesson-c-3-1', 'lesson-c-1-2'],
  zh: {
    title: 'GEO 服务商怎么选？出海企业的 8 个评估问题',
    description:
      '选 GEO 服务商或 GEO 优化公司前该问什么？本文给出出海企业面谈时可直接使用的 8 个问题，覆盖基线测评、效果口径、交付清单、信源手段与资产归属，并列出要警惕的承诺。',
    answer:
      '选 GEO 服务商，先看对方报方案前会不会用固定问题集测出你在各 AI 平台的现状，再看效果口径、交付清单、第三方信源的做法和资产归属是否写清楚。承诺“保证排名”“保证 AI 推荐”或自称有独家技巧的，可以直接排除。',
    body: `## 先看结论：8 个问题一览

面谈时把下面 8 个问题逐条问完，答不清楚的服务商不必进入下一轮。

| 问题 | 想听到的回答 | 需要警惕的回答 |
|---|---|---|
| 1. 报方案前会先测现状吗 | 用固定问题集测各 AI 平台，给出基线报告 | 不测就报方案，或只给几张截图 |
| 2. 效果怎么衡量 | 提及率、排位、引用来源，口径写进合同 | 只说“曝光量提升”“AI 流量翻倍” |
| 3. 能保证结果吗 | 不能保证，按月复测并如实汇报 | 保证排名第一、保证 AI 推荐 |
| 4. 具体做哪些事 | 能列出交付物清单和排期 | “独家算法”“专门针对 AI 的标记” |
| 5. 第三方信源怎么建 | 行业媒体、评测、认证、真实案例 | 批量发稿、买链接、刷问答 |
| 6. 能写给海外买家吗 | 有英文写作能力，按目标市场选平台 | 把中文稿机翻后发布 |
| 7. 会查技术底座吗 | 检查 AI 爬虫权限、服务端正文、结构化数据 | 只谈内容，不看网站 |
| 8. 结束后资产归谁 | 内容、账号、数据都归企业，可交接 | 账号挂在服务商名下，停了就没了 |

## 1. 报方案之前，会先测我们的现状吗？

靠谱的服务商先测再报方案。GEO 的起点是“买家问 AI 时，你现在出不出现、排第几、AI 引用了谁”，不测这一步，后面的方案就没有依据，效果也无从对比。

可以追问三件事：

- **问题集从哪来**：是否按你的产品、行业和目标市场整理买家会问的问题，而不是只搜品牌名。只搜品牌名，几乎总能搜到自己，看不出真实处境。
- **测哪些平台**：ChatGPT、Perplexity、Gemini、Google AI 概览的检索来源不同，结果也不同，应当分平台给出结果。
- **报告能否复核**：每个问题的原始回答、提问时间和引用来源是否保留。我们自己的做法写在 [AI 可见性测评方法](/insights/ai-visibility-audit-methodology)里，可以作为对照。

## 2. 效果用什么指标、按什么口径衡量？

效果指标必须在合作前写清，并且合作期间不改口径。常见的 GEO 指标有三类：

1. **提及率**：固定问题集里，品牌被 AI 提到的问题占多少。
2. **排位与推荐**：被提到时排在第几，是否被列为推荐供应商。
3. **引用来源**：AI 引用了哪些网页，其中有多少是你的官网或关于你的第三方页面。

再加上业务侧的数据：来自 AI 平台的引荐访问与询盘。只用“曝光量”“覆盖人数”这类无法复核的指标汇报的，要请对方说明数据从哪来。

## 3. 能保证排名或保证 AI 推荐吗？

不能，也不应该承诺。Google 在[聘请 SEO 的官方指南](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)里写明：没有人能保证在 Google 排名第一，并提醒警惕做出这类保证的服务商。AI 的回答取决于它能查到的公开资料，同一个问题在不同时间、不同平台的回答也会变化，更不存在“保证推荐”。

合理的承诺是过程和透明度：做哪些事、多久复测一次、每次汇报哪些数据。

## 4. 具体做哪些事？交付物能列成清单吗？

能把工作拆成交付物和排期的服务商，才是可以验收的服务商。一个完整的 GEO 项目通常覆盖诊断、建模、内容、信源、口碑、监测六步（见课时 [六步闭环总览](/academy/geo/c-3-1)），每一步都应当有看得见的产出，例如问题清单、页面改写稿、第三方发布记录、月度复测报告。

如果对方说有“独家算法”或“专门让 AI 收录的标记”，可以对照官方说法：Google 关于 [AI 功能与网站的说明](https://developers.google.com/search/docs/appearance/ai-features)写明，出现在 AI 概览和 AI 模式里没有额外要求，也不需要特殊的 schema.org 结构化数据，现有的 SEO 基本做法仍然适用。

## 5. 第三方信源怎么建？会用哪些手段？

第三方信源要靠真实、可查证的资料建立，任何批量灌水的手段都会反噬。AI 更愿意引用独立来源，所以信源建设是 GEO 的核心工作，也最容易出问题。

- **可以接受的做法**：行业媒体的报道与技术文章、认证与检测机构的公开记录、学术索引、客户官网上的真实案例、行业目录。
- **应当拒绝的做法**：为了排名买卖链接、批量生成低质量页面、在问答平台刷提问和回答。Google 的[垃圾内容政策](https://developers.google.com/search/docs/essentials/spam-policies)把链接垃圾（link spam）和规模化滥用内容（scaled content abuse）都列为违规，被判定后影响的是整个网站。

请对方举一个他们做过的信源例子，并说明那个来源为什么可信。

## 6. 能写给海外买家吗？

出海企业的 GEO 要用目标市场的语言、按海外买家的问法来写。海外买家用英文问 AI，AI 引用的也多是英文资料，机翻的中文稿很难被当作可信来源。

可以请对方现场改写一段你的产品介绍，看三点：是否先给结论、是否写清参数与出处、是否像目标市场的行业人士写的。同时问清他们会在哪些海外平台发布，这些平台是否是你的买家会看的。

## 7. 会检查官网的技术底座吗？

会查技术底座的服务商，才能避免“内容写了、AI 却读不到”。至少要检查三项：

1. **AI 爬虫权限**：robots.txt 是否放行搜索与 AI 爬虫。以 ChatGPT 为例，OpenAI 的[爬虫说明](https://platform.openai.com/docs/bots)写明，屏蔽 OAI-SearchBot 的网站不会出现在 ChatGPT 的搜索回答里（仍可能作为导航链接出现）。
2. **服务端正文**：页面不执行 JavaScript 时能否看到正文。
3. **结构化数据与实体信息**：公司名称、品牌、联系方式在官网和外部平台是否一致，是否有 Organization 等结构化数据。

这部分和 SEO 共用，详见 [GEO 和 SEO 的区别](/insights/geo-vs-seo)。

## 8. 合作结束后，内容、账号和数据归谁？

合同里要写明：为你创建的内容、外部平台账号、问题集和历次测评数据都归企业所有，合作结束时完整交接。GEO 的积累是长期的，第三方信源和内容一旦挂在服务商名下，换服务商时就要从头再来。

同时约定汇报节奏，例如每月用同一组问题复测并提交报告，报告里保留原始回答，方便你或下一家服务商复核。

## 怎么用这份清单

先自己摸清现状，再拿这 8 个问题去面谈，比较才有基准：

1. **先做一次自测**：用 [AI 可见性测评](/audit)看官网技术底座和各 AI 平台的回答，记下得分和主要问题。
2. **把 8 个问题发给候选服务商**：要求书面回答，重点比较第 1、2、8 题。
3. **看样例报告**：请对方提供脱敏的测评或月报样例，看口径是否一致、能否复核。

我们的 [出海 GEO 服务](/services/geo)也按这些问题写明了做法：先测评，再规划，每月用同一组问题复测并如实汇报，不承诺 AI 一定推荐。想先理解概念的，可以从术语 [GEO](/glossary/geo) 读起。`,
    faqs: [
      {
        q: 'GEO 服务商和 SEO 公司有什么区别？',
        a: 'SEO 公司关注网页在搜索结果里的排名，GEO 服务商关注品牌在 AI 回答里是否被提及、被引用。两者共用技术底座，好的 GEO 服务商也应该懂 SEO。',
      },
      {
        q: '服务商说能保证 AI 推荐我们，可信吗？',
        a: '不可信。AI 的回答取决于它能查到的公开资料，而且会随时间和平台变化，任何人都无法保证。能承诺的是做哪些事、多久复测一次、如何汇报。',
      },
      {
        q: '选 GEO 服务商之前，企业自己要准备什么？',
        a: '先做一次现状自测，整理可被第三方查证的资料：认证与检测报告、产品参数、真实的工程案例。有了基线和资料，才能比较不同服务商的方案。',
      },
      {
        q: 'GEO 服务的费用怎么评估？',
        a: '取决于目标市场、现有基础和工作范围，建议先做测评和方案规划，按交付物清单比较，而不是只比较报价。',
      },
    ],
  },
  en: {
    title: 'How do you choose a GEO agency? 8 questions to ask',
    description:
      'Eight questions to ask before hiring a GEO agency: baselines, metrics, deliverables, third-party sources and ownership, plus promises that rule an agency out.',
    answer:
      'Choose a GEO agency that measures where you stand on each AI platform with a fixed question set before it proposes anything, and that spells out its metrics, deliverables, source-building methods and who owns the work. Rule out anyone who guarantees rankings or AI recommendations, or claims a secret technique.',
    body: `## The short version: eight questions

Ask every candidate these eight questions in the first meeting. An agency that cannot answer them clearly does not need a second meeting.

| Question | A good answer | A warning sign |
|---|---|---|
| 1. Will you measure us first? | A baseline across AI platforms using a fixed question set | A proposal with no measurement, or a few screenshots |
| 2. How do you measure results? | Mention rate, position and cited sources, defined in the contract | "More exposure" or "double your AI traffic" |
| 3. Can you guarantee results? | No; monthly re-tests reported as they are | Guaranteed #1 rankings or AI recommendations |
| 4. What exactly will you do? | A list of deliverables with a schedule | A "proprietary algorithm" or "special AI tags" |
| 5. How do you build third-party sources? | Trade media, reviews, certifications, real cases | Mass press releases, paid links, seeded Q&A |
| 6. Can you write for our buyers? | Native-level English and platforms chosen per market | Machine-translated copy |
| 7. Will you check our website? | AI crawler access, server-rendered text, structured data | Content only, no look at the site |
| 8. Who owns the work afterwards? | You own content, accounts and data, with a handover | Accounts held by the agency and lost when you leave |

## 1. Will you measure where we stand before proposing anything?

A credible agency measures before it proposes. GEO starts from a simple question: when buyers ask AI about your category, do you appear, where, and which sources does the AI cite? Without that baseline, there is nothing to plan against and nothing to compare later.

Three follow-ups are worth asking:

- **Where do the questions come from?** They should reflect how buyers in your market ask about your products, not just your brand name. Searching your own name nearly always finds you and says little about your real position.
- **Which platforms?** ChatGPT, Perplexity, Gemini and Google AI Overviews draw on different sources and give different answers, so results should be reported per platform.
- **Can the report be checked?** Each answer should be kept with the time it was asked and the sources cited. Our own approach is described in [how our AI visibility audit works](/insights/ai-visibility-audit-methodology), which you can use as a reference point.

## 2. Which metrics will you report, and how are they defined?

Agree the metrics before you sign and keep the definitions fixed for the whole engagement. GEO results usually fall into three groups:

1. **Mention rate**: the share of questions in the fixed set where the AI mentions your brand.
2. **Position and recommendation**: where you appear when mentioned, and whether you are listed as a recommended supplier.
3. **Cited sources**: which pages the AI cites, and how many of them are your site or third-party pages about you.

Add the business side as well: referral visits and enquiries that arrive from AI platforms. If an agency reports only "impressions" or "reach" that you cannot verify, ask where those numbers come from.

## 3. Can you guarantee a ranking or an AI recommendation?

No, and nobody should promise one. Google’s [guidance on hiring an SEO](https://developers.google.com/search/docs/fundamentals/do-i-need-seo) states that no one can guarantee a #1 ranking on Google and warns against those who claim to. AI answers depend on what the model can find in public sources, and the same question can get a different answer on another day or another platform, so a guaranteed recommendation is even less realistic.

What an agency can promise is process and transparency: the work it will do, how often it re-tests and what each report contains.

## 4. What exactly will you deliver?

If the work cannot be broken into deliverables and dates, you cannot sign it off. A complete GEO programme usually runs through six steps: diagnosis, modelling, content, sources, reputation and monitoring (see the lesson [the six-step loop](/academy/geo/c-3-1)). Each should leave something you can inspect: a question map, rewritten pages, a log of third-party placements, monthly re-test reports.

Be wary of a "proprietary algorithm" or "special tags that get you into AI". Google’s page on [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) says there are no additional requirements to appear in AI Overviews or AI Mode and no special schema.org markup to add; standard SEO best practices still apply.

## 5. How will you build third-party sources?

Third-party sources have to be built from real, verifiable material; shortcuts tend to backfire. AI leans on independent sources, which makes this the core of GEO and also the part most open to abuse.

- **Acceptable**: coverage and technical articles in trade media, public records from certification and testing bodies, academic indexes, genuine case studies on customers’ sites, industry directories.
- **Unacceptable**: buying or selling links for ranking, mass-producing thin pages, seeding questions and answers on Q&A sites. Google’s [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) list both link spam and scaled content abuse as violations, and the consequences can affect the whole site.

Ask for one source the agency has built for a client and why that source is credible.

## 6. Can you write for our overseas buyers?

For exporters, GEO content has to be written in the buyer’s language and in the way buyers phrase their questions. Overseas buyers ask AI in English, and AI mostly cites English material; machine-translated copy is unlikely to be treated as a credible source.

Ask the agency to rewrite one paragraph of your product description on the spot. Check whether it leads with the answer, states specifications and their sources, and reads like someone from your buyers’ industry wrote it. Then ask which overseas platforms they would publish on, and whether your buyers actually read them.

## 7. Will you check our website’s technical foundation?

An agency that checks the technical foundation avoids the classic failure: good content that AI cannot read. At minimum it should check:

1. **AI crawler access**: whether robots.txt allows search and AI crawlers. OpenAI’s [crawler documentation](https://platform.openai.com/docs/bots), for example, says sites that opt out of OAI-SearchBot will not be shown in ChatGPT search answers, though they can still appear as navigational links.
2. **Server-rendered text**: whether the main content is visible without running JavaScript.
3. **Structured data and entity details**: whether your company name, brand and contact details match across your site and external profiles, and whether Organization markup is in place.

This groundwork is shared with SEO; see [GEO vs SEO](/insights/geo-vs-seo).

## 8. Who owns the content, accounts and data when we part ways?

Put it in the contract: content created for you, external accounts, the question set and every past test result belong to you and are handed over in full at the end. GEO compounds over time, and if your sources and content sit under the agency’s name, switching agencies means starting again.

Agree the reporting rhythm too, such as a monthly re-test with the same questions, with the raw answers kept so you or a future agency can check them.

## How to use this list

Know your own starting point first, so you have something to compare proposals against:

1. **Run a quick self-check**: an [AI visibility audit](/audit) covers your site’s technical foundation and how AI platforms answer about you. Note the score and the main issues.
2. **Send the eight questions to each candidate**: ask for written answers and compare questions 1, 2 and 8 most closely.
3. **Ask for a sample report**: an anonymised audit or monthly report shows whether the definitions are consistent and the results can be checked.

Our [export GEO service](/services/geo) answers these questions the same way: audit first, then plan, re-test monthly with the same questions and report honestly, with no promise that AI will recommend you. If you want the concept first, start with the glossary entry on [GEO](/glossary/geo).`,
    faqs: [
      {
        q: 'How is a GEO agency different from an SEO agency?',
        a: 'An SEO agency works on where your pages rank in search results; a GEO agency works on whether AI answers mention and cite your brand. They share the same technical foundation, so a good GEO agency should also understand SEO.',
      },
      {
        q: 'An agency says it can guarantee AI will recommend us. Should we believe it?',
        a: 'No. AI answers depend on the public sources the model can find and change over time and across platforms, so nobody can guarantee them. An agency can commit to the work, the re-test schedule and how it reports.',
      },
      {
        q: 'What should we prepare before talking to GEO agencies?',
        a: 'Run a baseline self-check and gather material a third party can verify: certifications and test reports, product specifications and real engineering cases. With a baseline and that material, proposals become comparable.',
      },
      {
        q: 'How should we evaluate the cost of GEO services?',
        a: 'It depends on your target markets, starting point and scope. Start with an audit and a plan, then compare proposals by their list of deliverables rather than by the quote alone.',
      },
    ],
  },
};
