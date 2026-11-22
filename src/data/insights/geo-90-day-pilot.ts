import type { Insight } from './types';

export const geo90DayPilot: Insight = {
  slug: 'geo-90-day-pilot',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-20',
  updatedAt: '2026-11-20',
  keywords: {
    zh: ['GEO 试点', '90 天 GEO', 'GEO 交付物', 'GEO 怎么验收', 'GEO 项目周期'],
    en: ['GEO pilot', '90-day GEO', 'GEO deliverables', 'how to accept a GEO project', 'GEO project timeline'],
  },
  relatedServices: ['geo', 'seo', 'website'],
  relatedTerms: ['term-geo', 'term-ai-crawlers'],
  relatedLessons: ['lesson-c-3-1', 'lesson-c-10-2'],
  zh: {
    title: '2026 年 90 天 GEO 试点交付什么？怎么验收',
    description:
      '90 天 GEO 试点按周写清时间线与交付物：先测基线，再修技术、写内容、建第三方来源，三次复测后交接。验收分交付物与效果指标，并列出企业需配合的事项。',
    answer:
      '90 天 GEO 试点分三段：第 1～2 周测基线，第 3～12 周规划、修技术、写内容、建第三方来源并每月复测，第 13 周总结交接。验收分两部分：交付物按清单逐项核对，效果指标与基线对比并如实汇报，不承诺 AI 一定推荐。',
    body: `## 试点的目标：用 90 天证明方向对不对

试点要回答一个问题：按这套方法做，买家问 AI 时，你的品牌有没有出现得更多、被引用得更准。90 天够做完一轮“测基线、改资料、建来源、复测”，也够得到三次对照数据。它不是完整项目，也不替代长期积累。

下面是典型安排。具体排期按官网现状、产品线数量与目标市场，在方案规划里确定。

## 按周的时间线与交付物

| 周 | 做什么 | 交付物 |
|---|---|---|
| 第 1～2 周 | **基线与诊断**：用固定问题集在 ChatGPT、Perplexity、Gemini 上测试；检查官网的技术底座（AI 爬虫权限、服务端正文、结构化数据、实体信息）；盘点可公开的资料 | 基线报告（含各平台原始回答）、技术检查清单、经你确认的问题集 |
| 第 3～4 周 | **规划**：整理买家的问题簇，定重点产品线，规划内容与第三方来源，启动技术修复；第 4 周末第一次复测 | 内容与来源计划（含排期）、第一次复测报告 |
| 第 5～8 周 | **内容与技术**：改写核心产品页与技术文章，补结构化数据，统一各平台的公司信息；第 8 周末第二次复测 | 已发布的页面与文章、实体信息统一记录、第二次复测报告 |
| 第 9～12 周 | **第三方来源与迭代**：在行业媒体、行业目录、认证机构数据库等建立可查证的公开来源，并根据复测结果调整；第 12 周末第三次复测 | 第三方来源登记表（网址、日期、对应问题簇）、第三次复测报告 |
| 第 13 周 | **总结与交接**：汇总 90 天数据，交接资产，提出下一阶段建议 | 90 天总报告、资产交接清单、下一阶段建议 |

官网的技术修复由谁做，要在启动时说清：属于网站或 SEO 服务范围的，我们一并完成；不属于的，我们给出逐项清单，由你的技术团队或其他服务商按清单修复。

## 验收一：交付物（按清单核对）

交付物验收看“有没有、能不能复核”，不看主观感受。

| 交付物 | 验收标准 |
|---|---|
| 基线报告 | 含问题清单、各平台原始回答、提问日期与引用来源，你可以自己复核 |
| 问题集 | 经你确认；90 天内措辞不变 |
| 技术检查清单 | 逐项标明通过或不通过及原因 |
| 页面与文章 | 已发布、能在公网访问；英文经审校，技术参数经你的工程师确认 |
| 第三方来源登记表 | 每条有网址、发布日期、对应的问题簇 |
| 三次复测报告 | 同一问题集、同一口径、保留原始回答 |
| 资产交接清单 | 内容见[网站、内容、数据和账号归谁](/insights/chingeo-asset-ownership) |

## 验收二：效果指标（与基线对比，不设保证值）

效果指标用来判断方向，口径见[GEO 效果怎么衡量](/insights/how-to-measure-geo-results)：

- **提及率、推荐率与排位**：重点问题簇里，与基线相比有没有提高；
- **引用率与新增来源**：AI 引用你官网的比例，以及被收录的新第三方来源数量；
- **AI 引荐访问与询盘**：来自 AI 助手的访问与询盘，来源以表单自述和销售确认为准。

规则有三条：

1. **启动时书面写下判断标准**，例如“重点问题簇里提及率高于基线”，具体门槛在方案里约定；
2. **不设保证数值，也不承诺 AI 一定推荐**。AI 的回答由平台生成，会随时间与地区变化；
3. **没有改善的指标，报告里也要写**，并说明可能的原因和下一步。收录与引用需要时间，90 天内可能只看到方向性的变化。

## 企业需要配合什么

GEO 靠的是你的真实资料，企业配合得越到位，结果越可靠。

1. **指定一位对接人**，并在启动会上约定固定的沟通节奏；
2. **工程师确认技术内容**：参数、公差、材料、应用场景，写错的技术内容不会被 AI 采信，也会伤害信任；
3. **提供可查证的资料**：认证证书、检测报告、专利、真实的工程案例；
4. **书面确认哪些客户信息可以公开**，没有授权的案例不写；
5. **授权账号**：用企业主体注册并授权的 Search Console、GA4、Bing Webmaster 工具与域名、托管账号；
6. **网站修改权限**，或一位能按清单修改网站的技术对接人。

## 90 天之后

试点结束时，你手里有一份基线、三次复测、一批已发布的内容与第三方来源，以及所有资产。是继续做、扩到更多产品线或市场，还是停下来自己维护，由你决定。

想先知道基线，可以直接[做一次免费测评](/audit)；我们的[出海 GEO 服务](/services/geo)就按这套流程交付。关于怎么评估一家 GEO 服务商，见[8 个评估问题](/insights/geo-agency-selection)；想先理解概念，读术语 [GEO](/glossary/geo)。`,
    faqs: [
      {
        q: '为什么试点是 90 天？',
        a: '90 天够完成一轮测基线、改资料、建来源，并有三次复测对照；更短的周期看不出趋势。AI 的回答有波动，需要多次测量才能判断方向。',
      },
      {
        q: '90 天内能保证被 ChatGPT 推荐吗？',
        a: '不能。AI 的回答由平台生成，会随时间、地区和账号变化，没有人能保证。验收看交付物是否齐全，以及效果指标与基线对比的真实结果。',
      },
      {
        q: '试点的费用怎么算？',
        a: '官网不展示价格。费用取决于产品线数量、目标市场与现有基础，请先做测评，再在诊断会上按交付物清单讨论。',
      },
      {
        q: '官网本身有技术问题，试点还能做吗？',
        a: '可以，但要先修技术底座。属于网站或 SEO 服务范围的我们一并修复，否则给出逐项清单，由你的技术团队按清单处理。',
      },
    ],
  },
  en: {
    title: 'What does a 90-day GEO pilot deliver in 2026, and how is it accepted?',
    seoTitle: 'A 90-day GEO pilot in 2026: deliverables and acceptance',
    description:
      'A week-by-week 90-day GEO pilot plan: baseline, technical fixes, content, third-party sources and three re-tests. Acceptance covers deliverables and metrics.',
    answer:
      'A 90-day GEO pilot runs in three parts: weeks 1 to 2 set the baseline; weeks 3 to 12 plan, fix the site, write content, build third-party sources and re-test monthly; week 13 wraps up and hands over. Acceptance has two parts: deliverables checked against a list, and metrics compared with the baseline and reported honestly, with no promise that AI will recommend you.',
    body: `## What the pilot is for: proving the direction in 90 days

The pilot answers one question: if we follow this method, does your brand appear more often, and get cited more accurately, when buyers ask AI? Ninety days is enough for one round of "measure the baseline, fix the material, build sources, re-test", and enough for three comparison points. It is not a full programme and does not replace long-term accumulation.

What follows is a typical schedule. The actual plan depends on the state of your site, the number of product lines and your target markets, and is set during planning.

## Week-by-week timeline and deliverables

| Week | What happens | Deliverables |
|---|---|---|
| 1 to 2 | **Baseline and diagnosis**: test a fixed question set on ChatGPT, Perplexity and Gemini; check the site’s technical foundation (AI crawler access, server-rendered text, structured data, entity details); take stock of material that can be made public | Baseline report with raw answers per platform, technical checklist, a question set you have confirmed |
| 3 to 4 | **Planning**: map buyer question clusters, pick priority product lines, plan content and third-party sources, start technical fixes; first re-test at the end of week 4 | Content and source plan with a schedule, first re-test report |
| 5 to 8 | **Content and technical work**: rewrite core product pages and technical articles, add structured data, align company details across platforms; second re-test at the end of week 8 | Published pages and articles, a record of aligned entity details, second re-test report |
| 9 to 12 | **Third-party sources and iteration**: build verifiable public sources in trade media, directories and certification databases, and adjust based on re-test results; third re-test at the end of week 12 | Third-party source register (URL, date, question cluster), third re-test report |
| 13 | **Wrap-up and handover**: consolidate 90 days of data, hand over assets, recommend next steps | 90-day report, asset handover list, next-step recommendations |

Who fixes the site’s technical problems needs to be stated at kick-off. If it falls within a website or SEO service, we do it as part of the work; if not, we give you an itemised list for your own team or another vendor to work through.

## Acceptance, part one: deliverables (checked against a list)

Deliverable acceptance asks "does it exist, and can it be checked", not "how does it feel".

| Deliverable | Acceptance standard |
|---|---|
| Baseline report | Contains the question list, raw answers per platform, the date asked and cited sources, so you can check it yourself |
| Question set | Confirmed by you; wording unchanged for the 90 days |
| Technical checklist | Each item marked pass or fail, with the reason |
| Pages and articles | Published and publicly reachable; English reviewed, technical parameters confirmed by your engineers |
| Third-party source register | Each entry has a URL, a publication date and the question cluster it serves |
| Three re-test reports | Same question set, same definitions, raw answers kept |
| Asset handover list | Contents described in [who owns the website, content, data and accounts](/insights/chingeo-asset-ownership) |

## Acceptance, part two: metrics (compared with the baseline, no guaranteed values)

Metrics show direction. The definitions are in [how to measure GEO results](/insights/how-to-measure-geo-results):

- **Mention rate, recommendation rate and position**: in the priority question clusters, are they higher than the baseline?
- **Citation rate and new sources**: the share of answers citing your site, and how many new third-party sources have been indexed.
- **AI referral visits and enquiries**: visits and enquiries from AI assistants, with the source confirmed through form answers and sales follow-up.

Three rules apply:

1. **Write the judgement criteria down at kick-off**, for example "mention rate in the priority clusters is above the baseline", with the exact thresholds agreed in the plan.
2. **No guaranteed values, and no promise that AI will recommend you.** Answers are generated by the platform and change with time and region.
3. **Metrics that did not improve are reported too**, with the likely reasons and the next step. Indexing and citation take time, and within 90 days you may only see a change of direction.

## What you need to provide

GEO runs on your real material, and the more fully you take part, the more reliable the result.

1. **Name a contact person**, and agree a regular rhythm for check-ins at kick-off.
2. **Have your engineers confirm technical content**: parameters, tolerances, materials and applications. Wrong technical content will not be trusted by AI and damages credibility.
3. **Supply verifiable material**: certificates, test reports, patents and real engineering cases.
4. **Confirm in writing which customer details may be made public.** Cases without permission are not written.
5. **Authorise accounts**: Search Console, GA4, Bing Webmaster Tools, the domain and hosting accounts, registered under your company.
6. **Give website edit access**, or name a technical contact who can work through the checklist.

## After the 90 days

At the end you hold a baseline, three re-tests, a set of published content and third-party sources, and every asset. Whether to continue, extend to more product lines or markets, or stop and maintain it yourself is your decision.

To see your baseline first, [run a free audit](/audit). Our [export GEO service](/services/geo) is delivered on this process. For how to evaluate any GEO provider, see [8 questions to ask](/insights/geo-agency-selection), and for the concept, the glossary entry on [GEO](/glossary/geo).`,
    faqs: [
      {
        q: 'Why is the pilot 90 days?',
        a: 'Ninety days covers one round of baseline, material fixes and source building, with three re-tests to compare. A shorter period shows no trend. AI answers fluctuate, so you need several measurements to see a direction.',
      },
      {
        q: 'Can you guarantee ChatGPT will recommend us within 90 days?',
        a: 'No. Answers are generated by the platform and change with time, region and account, so nobody can guarantee it. Acceptance looks at whether the deliverables are complete and at the real metrics compared with the baseline.',
      },
      {
        q: 'How is the pilot priced?',
        a: 'We do not show prices on the website. The cost depends on the number of product lines, target markets and your starting point. Run an audit first, then discuss it against the deliverables list at a diagnosis call.',
      },
      {
        q: 'Can the pilot go ahead if our website has technical problems?',
        a: 'Yes, but the technical foundation has to be fixed first. If it falls within a website or SEO service we fix it as part of the work; otherwise we give you an itemised list for your own team to work through.',
      },
    ],
  },
};
