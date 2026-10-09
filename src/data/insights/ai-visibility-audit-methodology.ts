import type { Insight } from './types';

export const aiVisibilityAuditMethodology: Insight = {
  slug: 'ai-visibility-audit-methodology',
  topic: 'audit',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-08',
  keywords: {
    zh: ['AI 可见性测评', 'GEO 检测', '品牌在 ChatGPT 中的排名', 'AI 搜索可见性怎么测'],
    en: ['AI visibility audit', 'GEO audit methodology', 'how to measure brand visibility in ChatGPT'],
  },
  relatedServices: ['geo', 'website'],
  relatedTerms: ['term-geo'],
  relatedLessons: ['lesson-c-10-2', 'lesson-c-3-1'],
  zh: {
    title: 'AI 可见性测评怎么做？我们的测评方法、评分口径与局限',
    description:
      '云端智荐 AI 可见性测评的完整方法：如何抓取官网、如何以海外买家身份向 ChatGPT、Perplexity、Gemini 提问，提及率、引用率、品牌认知与官网可读性怎么计分，以及测评的局限。',
    answer:
      '测评分两部分：一是抓取官网，检查 AI 爬虫能否访问、不执行 JavaScript 时有没有正文、有没有结构化数据等；二是以海外买家身份向 ChatGPT、Perplexity、Gemini 提 8 个问题、每题问 2 次，统计品牌被提及、被引用和被正确介绍的比例。总分 = AI 部分 × 70% + 官网可读性 × 30%。',
    body: `## 测评分五步

1. **找到官网并做技术检查**：输入官网域名，或只输入品牌名（此时先联网搜索查找官网，排除平台、目录与社交网站）。抓取首页、robots.txt、sitemap 与 llms.txt，记录首字节耗时。
2. **识别品牌**：由模型根据官网内容识别品牌名、行业、主营产品与目标市场。
3. **出题**：生成 6 个不带品牌名的海外买家问题（例如“欧洲有哪些可靠的某类产品供应商”），再加 2 个固定模板的带品牌名问题（例如“介绍一下某品牌”）。
4. **向 AI 平台提问**：每个问题在每个平台各问 2 次。ChatGPT 使用联网搜索，Perplexity 使用 Sonar，Gemini 使用 Google 搜索增强，都是开启联网检索的回答方式。
5. **抽取事实并计分**：由模型逐条阅读回答，只抽取事实（是否提到品牌、排在第几位、推荐了哪些品牌、引用了哪些网页），分数由代码按固定公式计算，不让模型直接打分。

## AI 部分怎么计分

| 指标 | 在 AI 部分的权重 | 怎么算 |
|---|---|---|
| 提及率 | 50% | 不带品牌名的问题里，回答提到你的比例 |
| 引用率 | 20% | 回答列出的引用网页中出现你官网的比例 |
| 品牌认知 | 30% | 直接问到你的品牌时，AI 能给出具体产品与资质信息的比例 |

每个平台单独计算，总体指标取各平台平均。我们还会统计不带品牌名的问题里被推荐最多的品牌，作为“声量”对比。

## 官网可读性怎么计分（满分 100）

| 检查项 | 分值 |
|---|---|
| 使用 HTTPS | 10（未使用为 5） |
| robots.txt 允许 OAI-SearchBot、GPTBot、PerplexityBot、ClaudeBot、Google-Extended 抓取 | 25（按允许的数量折算） |
| 不执行 JavaScript 时的正文长度（1500 字符以上满分） | 20 |
| 有英文内容 | 10 |
| Organization 类结构化数据 | 8 |
| Product、Service、FAQPage 等结构化数据 | 5 |
| sitemap | 5 |
| llms.txt | 4 |
| 页面 title 与 description | 5 |
| hreflang 多语言标注 | 3 |
| 首字节耗时（800 毫秒以内满分） | 5 |

总分 = AI 部分 × 70% + 官网可读性 × 30%。75 分以上为“表现良好”，50～74 分为“有基础，仍有明显短板”，50 分以下为“待改进”。只输入品牌名且找不到官网时，总分只按 AI 部分计算。

## 为什么每题问两次

同一个问题，AI 每次的回答都可能不同。每题问两次可以减少一次偶然回答带来的偏差，但仍然只是一次快照。要判断趋势，应该用同一组问题定期复测，这也是我们 [GEO 服务](/services/geo) 每月复测的原因。

## 测评的局限

- **只是快照**：AI 的回答会随时间、地区、账号与模型版本变化，一次测评不能代表长期表现。
- **平台范围**：自动测评目前覆盖 ChatGPT、Perplexity、Gemini 三个平台；豆包、DeepSeek、Kimi、腾讯元宝等国内平台暂未纳入自动测评。
- **问题由模型生成**：买家问题按识别出的行业与市场自动生成，未必覆盖你最关心的采购场景。正式项目会和你一起确定固定问题集。
- **结果复用**：为控制成本，同一官网（或同一品牌名）24 小时内的测评会复用最近一次的真实结果。

## 下一步

想知道自己的品牌在 AI 回答里的位置，可以直接[做一次免费测评](/audit)；看懂报告后仍不确定怎么改，可以预约诊断会，由顾问逐项解读。`,
    faqs: [
      {
        q: '测评需要提供什么信息？',
        a: '官网域名或品牌名，以及联系人姓名和 11 位手机号（必填）。',
      },
      {
        q: '测评需要多长时间？',
        a: '通常几分钟内完成。页面会实时显示进度和每一次提问的状态，最长约 5 分钟。',
      },
      {
        q: '为什么我的品牌在测评里没有被提到？',
        a: '常见原因有三类：官网不能被 AI 爬虫读取（例如纯前端渲染、robots.txt 屏蔽）；公开资料里缺少可查证的产品与资质信息；第三方网站很少提到你。报告会按这三类列出具体问题。',
      },
      {
        q: '测评分数和 SEO 排名是一回事吗？',
        a: '不是。SEO 排名看网页在搜索结果列表中的位置；AI 可见性看 AI 在生成回答时是否提到并引用你。两者相关，但需要分别衡量。',
      },
    ],
  },
  en: {
    title: 'How does an AI visibility audit work? Our method, scoring and limits',
    description:
      'The full method behind the ChinGEO AI visibility audit: how we check your website, how we ask ChatGPT, Perplexity and Gemini questions as an overseas buyer, how mention, citation, brand knowledge and site readability are scored, and the limits.',
    answer:
      'The audit has two parts. First, we check your website: whether AI crawlers can access it, whether it has body text without JavaScript, structured data and so on. Second, we ask ChatGPT, Perplexity and Gemini 8 questions as an overseas buyer, twice each, and measure how often your brand is mentioned, cited and described correctly. Total score = AI part × 70% + site readability × 30%.',
    body: `## Five steps

1. **Find the website and run technical checks**: enter a domain, or just a brand name (we then search the web for the official site, excluding marketplaces, directories and social networks). We fetch the home page, robots.txt, the sitemap and llms.txt, and record time to first byte.
2. **Identify the brand**: a model reads the site and identifies the brand, industry, main products and target markets.
3. **Write the questions**: 6 buyer questions without the brand name (for example "which reliable suppliers of this product serve Europe"), plus 2 templated questions that name the brand (for example "tell me about this brand").
4. **Ask the AI platforms**: every question is asked twice on every platform. ChatGPT uses web search, Perplexity uses Sonar and Gemini uses Google Search grounding, so all answers come with live retrieval.
5. **Extract facts and score**: a model reads each answer and extracts facts only (is the brand mentioned, at what position, which brands are recommended, which pages are cited). Scores are computed by code with fixed formulas; the model never assigns a score directly.

## How the AI part is scored

| Metric | Weight in the AI part | How it is calculated |
|---|---|---|
| Mention rate | 50% | Share of answers to unbranded questions that mention you |
| Citation rate | 20% | Share of answers whose cited pages include your website |
| Brand knowledge | 30% | Share of branded answers that give specific products and credentials |

Each platform is scored separately, and the overall metrics are the average across platforms. We also count which brands are recommended most often for unbranded questions, as a share-of-voice comparison.

## How site readability is scored (out of 100)

| Check | Points |
|---|---|
| HTTPS | 10 (5 without) |
| robots.txt allows OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot and Google-Extended | 25 (pro rata) |
| Body text without JavaScript (full marks from 1,500 characters) | 20 |
| English content | 10 |
| Organization-type structured data | 8 |
| Product, Service, FAQPage or similar structured data | 5 |
| Sitemap | 5 |
| llms.txt | 4 |
| Page title and description | 5 |
| hreflang language annotations | 3 |
| Time to first byte (full marks under 800 ms) | 5 |

Total = AI part × 70% + site readability × 30%. 75 or above is "performing well", 50 to 74 is "a foundation with clear gaps", and below 50 is "needs work". If only a brand name is given and no website can be found, the total uses the AI part only.

## Why each question is asked twice

AI answers vary from one run to the next. Asking twice reduces the effect of a single random answer, but the result is still a snapshot. To see a trend, re-test with the same question set at regular intervals, which is why our [GEO service](/services/geo) re-tests every month.

## Limits

- **A snapshot**: AI answers change with time, region, account and model version, so one audit does not represent long-term performance.
- **Platform coverage**: the automated audit currently covers ChatGPT, Perplexity and Gemini. Chinese platforms such as Doubao, DeepSeek, Kimi and Tencent Yuanbao are not yet included.
- **Model-written questions**: buyer questions are generated from the detected industry and market, and may miss the purchase scenarios you care about most. In a project, we agree a fixed question set with you.
- **Reused results**: to control cost, audits of the same website (or brand name) within 7 days reuse the latest live result.

## Next step

To see where your brand stands in AI answers, [run a free audit](/audit). If you are unsure what to change after reading the report, book a diagnosis call and an advisor will walk you through it.`,
    faqs: [
      {
        q: 'What information does the audit need?',
        a: 'Your website domain or brand name, plus a contact name and an 11-digit mainland China mobile number (required).',
      },
      {
        q: 'How long does the audit take?',
        a: 'Usually a few minutes. The page shows progress and the status of every question live, and it takes about 5 minutes at most.',
      },
      {
        q: 'Why was my brand not mentioned?',
        a: 'There are three common reasons: AI crawlers cannot read the website (for example client-side rendering only, or a robots.txt block); public material lacks verifiable product and credential information; and few third-party sites mention you. The report lists specific issues under each.',
      },
      {
        q: 'Is the audit score the same as an SEO ranking?',
        a: 'No. SEO rankings measure where a page appears in a list of search results. AI visibility measures whether AI mentions and cites you when it writes an answer. They are related, but need to be measured separately.',
      },
    ],
  },
};
