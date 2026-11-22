import type { Insight } from './types';

export const howToMeasureGeoResults: Insight = {
  slug: 'how-to-measure-geo-results',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-20',
  updatedAt: '2026-11-20',
  keywords: {
    zh: ['GEO 效果怎么衡量', 'GEO 指标', 'AI 提及率', 'AI 引用率', 'AI 询盘怎么统计'],
    en: ['how to measure GEO results', 'GEO metrics', 'AI mention rate', 'AI citation rate', 'track AI referral enquiries'],
  },
  relatedServices: ['geo', 'website'],
  relatedTerms: ['term-geo', 'term-ai-crawlers'],
  relatedLessons: ['lesson-c-3-1', 'lesson-c-10-2'],
  zh: {
    title: 'GEO 效果怎么衡量？2026 年看提及率、推荐率、引用率与 AI 询盘',
    seoTitle: '2026 年 GEO 效果怎么衡量？四个指标',
    description:
      'GEO 效果可以量化：提及率、推荐率、引用率看 AI 的回答，AI 询盘看业务结果。本文给出四个指标的定义与公式、问题集设计、测试方法、询盘追踪办法，并说明抽样测试的局限。',
    answer:
      'GEO 效果用四个指标衡量：提及率（回答提到你的比例）、推荐率（被列入推荐名单的比例）、引用率（回答引用你官网的比例）和 AI 询盘数。前三个用固定问题集定期抽样测试，第四个靠来源追踪。AI 回答会波动，结果只能叫“抽样观察”。',
    body: `## 四个指标的定义与公式

先把口径写死，后面每个月才有可比性。

| 指标 | 定义 | 公式 | 回答什么问题 |
|---|---|---|---|
| 提及率 | 不带品牌名的买家问题里，回答提到了你的品牌 | 提到你的回答数 ÷ 有效回答总数 | 买家问到品类时，你在不在场 |
| 推荐率 | 回答把你列入推荐或对比名单 | 把你列入名单的回答数 ÷ 有效回答总数 | 被提到之外，是否被当作候选供应商；同时记录排位 |
| 引用率 | 回答附带的引用来源里出现你的官网 | 引用你官网的回答数 ÷ 有效回答总数 | AI 的依据是不是你自己的资料 |
| AI 询盘 | 来源能确认是 AI 助手的询盘 | 周期内的询盘数，及占全部询盘的比例 | 业务上有没有结果 |

几点说明：

- **有效回答**指成功返回、没有报错或中断的回答；失败的不计入分母。
- **提及率只统计不带品牌名的问题**。直接问“介绍一下某某公司”，AI 几乎一定会提到它，混进来会把数字抬高。
- 三个 AI 指标都要**分平台**记录，再看平均。不同平台的检索来源不同，平均数会掩盖某个平台是零的事实。
- 我们的[AI 可见性测评](/audit)报告给出提及率、引用率与平均排位，口径见[测评方法](/insights/ai-visibility-audit-methodology)。

## 问题集怎么设计

问题集决定了测试有没有意义。设计时守四条：

1. **用目标市场的语言和买家的问法**。美国采购商用英文问，就用英文问；带上规格、认证、起订量、交期、应用场景，而不是只写品类名。
2. **覆盖不同意图**：供应商推荐、同类对比、规格选型、认证合规、采购条件。每种各写几条。
3. **以不带品牌名的问题为主**，少量带品牌名的问题用来看 AI 对你的认知是否准确。起步可以用 20～30 个问题，按买家角色（工程师、采购、分销商）分簇。
4. **定下来就不改措辞**。每月换问法，数字就不能比较；要加新问题，单独记，不混进原来的分母。

问题写法示例（把方括号里换成你的产品）：

| 意图 | 示例 |
|---|---|
| 供应商推荐 | Who are reliable manufacturers of [产品] in China that export to the US? |
| 对比 | What is the difference between [A 工艺] and [B 工艺] for [应用]? |
| 规格选型 | Which [产品] meets [标准或认证] for [应用场景]? |
| 认证合规 | Which suppliers of [产品] have [认证] certification? |
| 采购条件 | Who supplies [产品] with low minimum order quantity and short lead time? |

## 怎么测：平台、地区、次数、记录

- **平台**：ChatGPT（开启搜索）、Gemini、Perplexity，可以再加 Google AI 概览。分平台记录。
- **地区与语言**：用目标市场的语言，并尽量在目标市场的网络环境下提问；用未登录或新建的账号，关闭个性化记忆，每次新开对话，避免上一轮对话影响回答。
- **次数**：同一个问题在同一平台至少问 3 次，用比例而不是单次结果；次数越多，波动越小。
- **记录**：日期、平台与模式、地区、完整问题、完整回答、引用链接、品牌出现的位置。保留原始回答，别人才能复核。

原始记录的格式如下（**仅为格式示例，不是真实测评数据**）：

| 日期 | 平台 | 地区与语言 | 问题 | 是否提到 | 排位 | 引用来源 |
|---|---|---|---|---|---|---|
| YYYY-MM-DD | 平台 A | 美国 / 英文 | （问题原文） | 是 / 否 | 第 N 位 / 未列出 | （引用网址） |

## AI 询盘怎么追踪

AI 带来的询盘，只能靠多种来源信息拼起来，没有单一的准确数字。

1. **GA4 单独统计来源**：在流量获取报告里看会话来源，建一个自定义渠道组，把 chatgpt.com、perplexity.ai、gemini.google.com、copilot.microsoft.com、claude.ai 等归为“AI 助手”。ChatGPT 搜索回答里的链接常带 utm_source=chatgpt.com，也可以按这个参数筛。
2. **表单里加来源题**：“您是怎么找到我们的？”选项里放“AI 助手（ChatGPT、Gemini、Perplexity 等）”，并留一个自填项。
3. **CRM 打标签**：询盘进入时记录来源渠道，销售首次沟通时再向买家确认一次，以确认为准。
4. **看品牌词搜索量**：在 Search Console 里看品牌名相关查询的展示与点击。买家在 AI 回答里看到你的品牌后，可能转去搜索品牌名，它是辅助指标，不能单独说明问题。

要注意：不少 AI 引荐访问没有来源信息，会被记成“直接访问”，所以 GA4 里的 AI 流量是**下限**；表单自述和销售确认用来补足。我们给客户接入的访问统计，把 AI 助手单列为来源渠道，也包含这类参数。

## 测试的局限

- **只能叫抽样观察**：AI 的回答会随模型版本、账号、地区、时间变化，同一个问题多问几次结果也不同。我们没有大样本，也不做显著性检验，所以不能说“统计显著”。
- **看趋势，不看单次涨跌**：用同一问题集、同一方法连续测几个月，波动在合理范围内就不下结论。
- **问题集本身有偏差**：问题是人设计的，未必覆盖所有真实采购场景，需要随买家反馈补充。
- **提及不等于询盘**：被提到、被引用是过程指标，最终要回到 AI 询盘与成交。

## 怎么读结果

每月复测一次，三个月看一次趋势，并与竞品对比：重点问题簇里提及率有没有高于基线，被引用的来源是官网还是第三方，AI 询盘占比有没有变化。哪个平台长期为零，就回头查技术底座，见[AI 是怎么挑选推荐供应商的](/insights/how-ai-picks-suppliers)。

试点阶段每个指标怎么验收，见[90 天 GEO 试点交付什么](/insights/geo-90-day-pilot)。想先知道自己的基线，可以直接[做一次免费测评](/audit)；我们的[出海 GEO 服务](/services/geo)也按这套口径每月复测。想先理解概念，可以读术语 [GEO](/glossary/geo)。`,
    faqs: [
      {
        q: '提及率、推荐率、引用率有什么区别？',
        a: '提及率看回答里有没有你的名字；推荐率看你是不是被列入候选供应商名单，并记录排位；引用率看回答引用的网页里有没有你的官网。被提到不一定被推荐，被推荐也不一定引用你自己的网站。',
      },
      {
        q: '每个问题要问几次才可靠？',
        a: '同一平台至少 3 次，用比例看结果。次数越多波动越小，但仍然是抽样，不能当作统计显著的结论。',
      },
      {
        q: 'GA4 里看不到 AI 流量，是没有吗？',
        a: '不一定。部分 AI 引荐不带来源信息，会被记成直接访问。建议同时用表单来源题和销售确认补足，GA4 的数字当作下限。',
      },
      {
        q: '多久复测一次合适？',
        a: '每月一次，用同一问题集与同一方法。观察三个月以上的趋势再判断，期间不要频繁改问题措辞。',
      },
    ],
  },
  en: {
    title: 'How to measure GEO results in 2026: mention, recommendation, citation',
    seoTitle: 'How to measure GEO results in 2026: four metrics',
    description:
      'Measure GEO with four metrics: mention, recommendation and citation rates plus AI-referred enquiries. Formulas, question design, test method and limits.',
    answer:
      'Measure GEO with four metrics: mention rate (answers that name you), recommendation rate (answers that list you as a candidate), citation rate (answers that cite your website) and AI-referred enquiries. The first three come from a fixed question set tested at intervals; the fourth comes from source tracking. AI answers vary, so call it sampling, not statistics.',
    body: `## The four metrics, with formulas

Fix the definitions first, so every month is comparable with the last.

| Metric | Definition | Formula | What it tells you |
|---|---|---|---|
| Mention rate | The answer to an unbranded buyer question names your brand | Answers that name you ÷ valid answers | Whether you are in the room when buyers ask about your category |
| Recommendation rate | The answer lists you as a recommended or compared supplier | Answers that list you ÷ valid answers | Whether you are treated as a candidate, not just named; record the position too |
| Citation rate | Your website appears among the sources the answer cites | Answers citing your site ÷ valid answers | Whether the AI is relying on your own material |
| AI-referred enquiries | Enquiries whose source is confirmed as an AI assistant | Enquiries in the period, and their share of all enquiries | Whether there is a business result |

A few notes:

- **Valid answers** are those that returned without an error or interruption; failed ones stay out of the denominator.
- **Mention rate counts unbranded questions only.** If you ask "tell me about Company X", the AI will almost always name it, and mixing those in inflates the number.
- Record the three AI metrics **per platform** and then average them. Platforms retrieve from different sources, and an average can hide a platform where you are at zero.
- Our [AI visibility audit](/audit) reports mention rate, citation rate and average position; the definitions are in [how the audit works](/insights/ai-visibility-audit-methodology).

## How to design the question set

The question set decides whether the test means anything. Four rules:

1. **Use the target market’s language and the way buyers phrase things.** If US buyers ask in English, test in English, and include specifications, certifications, minimum order quantity, lead time and application, not just the category name.
2. **Cover different intents**: supplier recommendations, comparisons, specification and selection, certification and compliance, purchasing terms. Write several of each.
3. **Mostly unbranded questions**, plus a few branded ones to see whether the AI describes you correctly. 20 to 30 questions is a workable start, grouped by buyer role (engineer, purchaser, distributor).
4. **Never reword once fixed.** If the wording changes every month, the numbers cannot be compared. New questions are tracked separately and kept out of the old denominator.

Example phrasing (replace the brackets with your product):

| Intent | Example |
|---|---|
| Supplier recommendation | Who are reliable manufacturers of [product] in China that export to the US? |
| Comparison | What is the difference between [process A] and [process B] for [application]? |
| Specification | Which [product] meets [standard or certification] for [use case]? |
| Certification | Which suppliers of [product] have [certification]? |
| Purchasing terms | Who supplies [product] with low minimum order quantity and short lead time? |

## How to test: platforms, region, repeats, records

- **Platforms**: ChatGPT (with search on), Gemini and Perplexity, plus Google AI Overviews if you like. Record each separately.
- **Region and language**: use the target market’s language and, where you can, a network in that market. Use a logged-out or fresh account with personalised memory off, and start a new conversation every time so earlier turns do not colour the answer.
- **Repeats**: ask each question at least 3 times on each platform and use the proportion, not a single result. More repeats means less noise.
- **Records**: date, platform and mode, region, the full question, the full answer, cited links and where your brand appears. Keep the raw answers so someone else can check them.

The record format looks like this (**a format example only, not real audit data**):

| Date | Platform | Region and language | Question | Mentioned | Position | Cited source |
|---|---|---|---|---|---|---|
| YYYY-MM-DD | Platform A | US / English | (full question) | Yes / No | #N / not listed | (cited URL) |

## How to track AI-referred enquiries

There is no single exact number; you assemble it from several signals.

1. **Track the source in GA4**: look at session sources in the acquisition report and create a custom channel group that puts chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai and similar into "AI assistants". Links in ChatGPT search answers often carry utm_source=chatgpt.com, which you can also filter on.
2. **Add a source question to your forms**: "How did you find us?", with an option such as "AI assistant (ChatGPT, Gemini, Perplexity and so on)" and a free-text field.
3. **Tag it in the CRM**: record the source channel when the enquiry arrives, and have sales confirm it with the buyer in the first conversation. The confirmed answer wins.
4. **Watch branded search**: look at impressions and clicks for queries containing your brand name in Search Console. A buyer who sees your name in an AI answer may go on to search for it. It is a supporting metric and cannot stand alone.

Keep in mind that many AI referrals arrive with no source information and are logged as direct traffic, so the AI traffic in GA4 is a **floor**. Form answers and sales confirmation fill the gap. The visitor analytics we set up for clients lists AI assistants as their own source channel and recognises those parameters.

## Limits of this kind of testing

- **It is sampling, not statistics.** AI answers change with model version, account, region and time, and repeated runs of the same question differ. We do not have large samples and do not run significance tests, so we never say "statistically significant".
- **Read trends, not single moves.** Use the same question set and method for several months in a row, and draw no conclusion from changes within normal noise.
- **The question set is biased.** People wrote the questions, and they may miss real buying scenarios. Update them from buyer feedback.
- **A mention is not an enquiry.** Mentions and citations are process metrics; the end point is AI-referred enquiries and orders.

## How to read the results

Re-test monthly, review the trend every three months, and compare with competitors. Did mention rate in the priority question clusters rise above the baseline? Are the cited sources your site or third parties? Has the share of AI-referred enquiries moved? If one platform stays at zero, go back to the technical foundation; see [how AI picks suppliers](/insights/how-ai-picks-suppliers).

How each metric is accepted in a pilot is covered in [what a 90-day GEO pilot delivers](/insights/geo-90-day-pilot). To see your own baseline first, [run a free audit](/audit). Our [export GEO service](/services/geo) also re-tests monthly on these definitions. For the concept itself, read the glossary entry on [GEO](/glossary/geo).`,
    faqs: [
      {
        q: 'What is the difference between mention, recommendation and citation rate?',
        a: 'Mention rate asks whether your name appears in the answer. Recommendation rate asks whether you are listed as a candidate supplier, and records the position. Citation rate asks whether your website is among the pages the answer cites. Being mentioned does not mean being recommended, and being recommended does not mean your own site is cited.',
      },
      {
        q: 'How many times should each question be asked?',
        a: 'At least 3 times per platform, and read the proportion. More repeats reduce noise, but it is still sampling and cannot be called statistically significant.',
      },
      {
        q: 'GA4 shows no AI traffic. Does that mean there is none?',
        a: 'Not necessarily. Some AI referrals carry no source and are logged as direct. Add a source question on your forms and have sales confirm it, and treat the GA4 figure as a floor.',
      },
      {
        q: 'How often should we re-test?',
        a: 'Monthly, with the same question set and method. Judge the trend over three months or more, and avoid rewording questions in between.',
      },
    ],
  },
};
