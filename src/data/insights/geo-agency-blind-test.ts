import type { Insight } from './types';

/**
 * 2026-11-25 新增：给出一套「同题比选」的做法，让采购方自己比较 GEO 服务商，而不是看任何一家的自我排名。
 * 按 docs/geo-content-guide.md：不点名其他公司、不写价格、不承诺结果、不写没有出处的数据；FDE 不出现。
 * 文中没有任何统计数据与客户成果。与 geo-agency-selection（8 个面谈问题）的区别：那篇讲「问什么」，这篇讲「怎么出题、收什么、怎么打分」。
 */
export const geoAgencyBlindTest: Insight = {
  slug: 'geo-agency-blind-test',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-25',
  updatedAt: '2026-11-25',
  keywords: {
    zh: ['GEO 服务商对比', '怎么比较 GEO 服务商', 'GEO 服务商比选', '制造业出海 GEO 选型', 'GEO 方案评分表'],
    en: ['compare GEO agencies', 'GEO agency RFP', 'GEO vendor scorecard', 'manufacturer export GEO agency selection'],
  },
  relatedServices: ['geo', 'seo-website'],
  relatedTerms: ['term-geo', 'term-ai-crawlers', 'term-structured-data', 'term-entity'],
  relatedLessons: ['lesson-c-3-1', 'lesson-c-1-2'],
  zh: {
    title: '制造业出海怎么比较 GEO 服务商？用同一道题做比选',
    seoTitle: '怎么比较 GEO 服务商？同题比选的做法',
    description:
      '别看服务商的自我排名：给每家发同一份 90 天需求，收同样六项材料，再按固定维度打分。附题目原文、六项提交物和评分表。',
    answer:
      '比较 GEO 服务商最可靠的办法是同题比选：给每家发同一份需求，要求提交同样的材料，再按事先定好的维度打分。看材料能不能核实、验收口径是否清楚、有没有承诺做不到的结果，比看谁的宣传更响更有用。',
    body: `## 先说结论

市面上的“服务商对比”大多出自某一家服务商自己或其合作方之手，口径各异，很难拿来做决定。更稳妥的做法是**自己出一道题，让几家服务商回答同一道题**，再用同一张表打分。

这篇文章给出三样东西：题目原文、要求每家提交的六项材料、评分表。本文不点名比较任何一家公司：我们自己也是 GEO 服务商，由我们来评价同行并不公平，而且没有可核实的公开资料，就不应该下结论。你可以让包括我们在内的任意几家参加，用同一套标准看。

## 一、先把需求写清楚

比选之前，企业内部先确认四件事，否则题目会变成泛泛而谈：

1. **目标市场与买家**：哪些国家，买家是谁（工程公司、分销商、终端工厂）。
2. **要被找到的产品线**：先选 1～2 条，不要一次全放进来。
3. **能公开的资料**：认证证书、检测报告、专利、工程案例、产品参数里，哪些允许写到公开网页上。
4. **谁来承接询盘**：有没有人能用英文及时回复海外买家。没有的话，再好的曝光也接不住。

## 二、题目原文

下面这段可以直接发给服务商，括号里按自己的情况替换：

> 一家中国（工业设备）制造企业，计划开拓（美国、德国、英国）市场，产品有（CE、ISO 认证）、（专利）和（多个工程案例）。请给出 90 天的方案，目标是让 ChatGPT、Gemini、Perplexity 等海外 AI 在回答采购问题时更准确、更常提到这家企业，并带来可追踪的海外询盘。请按下列六项提交材料。

注意最后一句里有“可追踪”，没有写“保证”。没有人能保证 AI 的推荐结果。如果某家服务商在这道题里承诺“保证推荐”“保证排名”，这本身就是该扣分的信号。

## 三、要求每家提交的六项材料

| 序号 | 提交物 | 要看什么 |
|---|---|---|
| 1 | **90 天执行计划**：按周写清楚做什么、谁做、产出什么 | 是否具体到可以检查，而不是“内容优化、持续运营”这类说法 |
| 2 | **海外 AI 搜索优化方案**：涉及哪些平台，技术与内容各做什么 | 是否分平台说明，是否包含官网技术检查（爬虫权限、不依赖脚本的正文、结构化数据） |
| 3 | **基线测试**：用约 20 个英文采购问题，在各平台实际提问，交原始回答 | 问题是否贴近真实买家、是否保留原始回答和日期，而不是只给一个分数 |
| 4 | **信源建设清单**：打算在哪些第三方渠道建立可核实的公开资料 | 是否列出具体的渠道类型与选择理由，是否避开刷量、买链接等做法 |
| 5 | **交付物与验收指标**：每个阶段交什么，用什么口径判断 | 指标有没有基数、期间、数据来源；是否包含复测 |
| 6 | **收费方式与有效询盘的定义** | 看口径，不看数字：按服务付费还是按线索付费，什么算有效线索，谁来判定，未达预期怎么处理 |

第 3 项是最能拉开差距的一项：做过基线测试的服务商能拿出原始回答，没做过的只能给方法描述。如果想自己先测一遍，可以用本站的 [AI 可见性测评](/audit)。

## 四、评分表

打分前先定权重，再收材料，避免看了方案再调权重。下表是一个起点，按企业情况调整：

| 维度 | 看什么 | 建议权重（合计 100） |
|---|---|---|
| 行业与市场理解 | 对你的产品、认证、买家决策链的理解是否准确，英文问题是否像真实采购人员会问的 | 15 |
| 技术基础与资料结构化 | 是否把认证、参数、案例整理成 AI 读得懂、能被核实的形式 | 20 |
| 分平台测量能力 | 是否按平台测、保留原始回答、固定口径复测 | 20 |
| 第三方信源思路 | 渠道是否真实可核实，是否有风险意识 | 10 |
| 询盘承接 | 是否考虑官网转化与回复，而不只是曝光 | 10 |
| 验收与合同口径 | 指标、周期、收费口径、有效线索定义是否清楚 | 15 |
| 资产归属与可迁移 | 内容、账号、数据合作结束后归谁 | 10 |

打分时遵守三条：**没有证据的一律按“未核实”处理，不按有能力给分**；所有分数写明依据（对应材料的哪一页）；两个人独立打分后再对。

## 五、几类红旗

出现下面任何一种，建议直接降级或追问：

- 承诺“保证 AI 推荐”“保证排名第一”或保证询盘数量。
- 给出的数据没有基数、期间和来源，例如“增长数倍”却不说比什么。
- 案例没有可核对的公开链接，或者客户名称、成果无法确认。
- 方案是“每个问法做一个页面”“批量发稿”这类规模化手法。
- 不愿意交出基线测试的原始回答，或者不同意合作结束后交还内容与数据。

## 六、这套比选的局限

- 同题比选看的是**方案质量**，不等于交付质量。方案写得好的服务商，不一定做得好，所以建议在比选之后先做一个短周期试点，再决定长期合作，试点怎么设计见 [90 天 GEO 试点](/insights/geo-90-day-pilot)。
- AI 的回答每次都会变化，基线测试只能反映提问当时的情况，要用固定问题集多次复测，见 [怎么衡量 GEO 的效果](/insights/how-to-measure-geo-results)。
- 面谈时具体问什么，见 [GEO 服务商怎么选](/insights/geo-agency-selection)。合作结束后的资产归属，见 [资产归属说明](/insights/chingeo-asset-ownership)。

如果想了解我们的做法，可以先看 [GEO 服务](/services/geo)，也欢迎我们用同一道题参加你的比选。`,
    faqs: [
      {
        q: '为什么不直接给出几家 GEO 服务商的排名？',
        a: '我们自己也是服务商，由我们给同行排名既不公平，也缺少可核实的公开资料。同题比选让每家用自己交出的材料说话，结论更可靠。',
      },
      {
        q: '同题比选最少要几家参加？',
        a: '三家左右比较合适：太少看不出差异，太多会拖长周期。参加者的材料格式一致，比较起来才不费力。',
      },
      {
        q: '基线测试要多少个问题？',
        a: '建议约 20 个英文采购问题，覆盖产品、认证、应用场景和供应商比较，并保留每个平台的原始回答与日期，之后用同一组问题复测。',
      },
      {
        q: '能要求服务商保证 AI 推荐或询盘数量吗？',
        a: '不建议。AI 的回答由平台决定，没有人能保证。更合理的是约定可检查的交付物、固定口径的复测，以及有效询盘的定义与判定方式。',
      },
    ],
  },
  en: {
    title: 'How do you compare GEO agencies? Run one brief past all of them',
    seoTitle: 'How to compare GEO agencies: one brief for all',
    description:
      'Do not trust any agency’s own ranking. Send every candidate the same 90-day brief, ask for the same six deliverables, and score them on a fixed sheet. Brief text included.',
    answer:
      'The most reliable way to compare GEO agencies is to give each one the same brief, ask for the same set of deliverables, and score them against criteria you fixed beforehand. Whether the material can be verified, whether acceptance is clearly defined and whether the agency promises outcomes it cannot control tell you more than any marketing claim.',
    body: `## The short answer

Most "agency comparisons" you can find were written by one of the agencies or its partners, and each uses its own yardstick. A steadier approach is to **write one brief yourself, have several agencies answer it, and score all of them on the same sheet**.

This article gives you three things: the brief itself, the six deliverables to request from each agency, and a scoring sheet. It does not rank or describe any named company. We are a GEO agency ourselves, so judging peers would not be fair, and without verifiable public information we should not draw conclusions. You can invite any number of agencies, including us, and apply the same standard to all.

## 1. Settle your own requirements first

Before you invite anyone, agree four things internally. Otherwise the brief turns vague:

1. **Target markets and buyers**: which countries, and who buys (engineering firms, distributors, end-user plants).
2. **Product lines to be found**: choose one or two, not the whole catalogue.
3. **Material you can publish**: which certificates, test reports, patents, project references and specifications may go on public pages.
4. **Who answers enquiries**: someone who can reply to overseas buyers in English, promptly. Without that, extra visibility has nowhere to land.

## 2. The brief

You can send this as is, replacing the brackets with your own details:

> A Chinese (industrial equipment) manufacturer plans to enter the (US, German and UK) markets. It holds (CE and ISO certification), (patents) and (several project references). Please propose a 90-day plan so that overseas AI assistants such as ChatGPT, Gemini and Perplexity describe the company more accurately and mention it more often when buyers ask procurement questions, and so that it receives overseas enquiries that can be traced. Please submit the six items below.

Note the words "can be traced" rather than "guaranteed". Nobody can guarantee what an AI assistant says. An agency that promises a guaranteed recommendation or ranking in response to this brief has already told you something.

## 3. The six deliverables to request

| # | Deliverable | What to look for |
|---|---|---|
| 1 | **90-day plan**: week by week, who does what and what is produced | Specific enough to check, rather than phrases like "content optimisation and ongoing operation" |
| 2 | **Overseas AI search approach**: which platforms, what technical work and content work | Platform-by-platform, and includes a site technical check (crawler access, text readable without scripts, structured data) |
| 3 | **Baseline test**: about 20 English buyer questions asked on each platform, with raw answers | Questions that sound like real buyers; raw answers and dates kept, not just a single score |
| 4 | **Third-party source list**: where verifiable public material will be built | Named channel types with reasons, and no link buying or fake volume |
| 5 | **Deliverables and acceptance metrics**: what is handed over at each stage and how it is judged | Metrics have a baseline, a period and a data source; re-tests are included |
| 6 | **Pricing model and the definition of a valid enquiry** | Compare definitions, not figures: pay for service or pay per lead, what counts as valid, who decides, what happens if targets are missed |

Item 3 separates agencies best. One that has run a baseline can show you raw answers; one that has not can only describe a method. If you want to run a baseline yourself first, you can use our [AI visibility audit](/audit).

## 4. The scoring sheet

Fix the weights before you read any proposal, so you do not adjust them to favour a candidate. Use the table below as a starting point and adapt it:

| Criterion | What to check | Suggested weight (total 100) |
|---|---|---|
| Sector and market understanding | Does the agency understand your products, certifications and buyer decision chain, and do the English questions sound like real buyers | 15 |
| Technical foundation and structured information | Are certificates, specifications and projects turned into forms AI can read and verify | 20 |
| Per-platform measurement | Are results measured per platform, raw answers kept, and re-tests run on fixed questions | 20 |
| Third-party source approach | Are the channels real and verifiable, and is there awareness of risk | 10 |
| Enquiry handling | Does the plan consider site conversion and replies, not just exposure | 10 |
| Acceptance and contract terms | Are metrics, periods, pricing model and the valid-enquiry definition clear | 15 |
| Asset ownership and portability | Who owns content, accounts and data when the work ends | 10 |

Three rules for scoring: **treat anything without evidence as "unverified" rather than giving credit for assumed ability**; write down the evidence for every score (the page of the submission it comes from); and have two people score independently before comparing.

## 5. Red flags

If you see any of the following, lower the score or ask follow-up questions:

- A promise of "guaranteed AI recommendation", "guaranteed first place" or a guaranteed number of enquiries.
- Figures without a baseline, a period or a source, such as "several times higher" with no comparison.
- Case studies with no public link you can check, or client names and results you cannot confirm.
- A plan built on one page per question variant or on mass-produced posts.
- Unwillingness to hand over raw baseline answers, or to return content and data when the contract ends.

## 6. Limits of this method

- A same-brief comparison measures the **quality of the proposal**, not the quality of delivery. A strong proposal can still be poorly executed, so run a short pilot before committing long term; see [the 90-day GEO pilot](/insights/geo-90-day-pilot) for how to set one up.
- AI answers change from run to run. A baseline reflects the moment of asking, so re-test repeatedly on a fixed question set; see [how to measure GEO results](/insights/how-to-measure-geo-results).
- For the questions to ask in meetings, see [how to choose a GEO agency](/insights/geo-agency-selection). For ownership of assets after the contract ends, see [asset ownership](/insights/chingeo-asset-ownership).

To see how we work, start with [our GEO service](/services/geo). We would also be glad to answer the same brief as part of your comparison.`,
    faqs: [
      {
        q: 'Why not simply rank a few GEO agencies?',
        a: 'We are an agency ourselves, so ranking peers would not be fair, and there is little verifiable public information. A same-brief comparison lets each agency be judged on what it submits.',
      },
      {
        q: 'How many agencies should take part?',
        a: 'About three. Fewer gives little contrast, and more stretches the process. Keep the submission format identical so the proposals are easy to compare.',
      },
      {
        q: 'How many questions should the baseline test use?',
        a: 'Around 20 English buyer questions covering products, certifications, applications and supplier comparison, with raw answers and dates kept for each platform, then re-tested with the same set.',
      },
      {
        q: 'Can I ask an agency to guarantee AI recommendations or enquiry volume?',
        a: 'We advise against it. Platforms decide what AI says, so nobody can guarantee it. Agree instead on checkable deliverables, re-tests on a fixed method, and a definition of a valid enquiry and who judges it.',
      },
    ],
  },
};
