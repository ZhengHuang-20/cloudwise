import type { Insight } from './types';

export const aiSearchSelfTestDecision: Insight = {
  slug: 'ai-search-self-test-decision',
  topic: 'geo',
  publishedAt: '2026-10-26',
  updatedAt: '2026-10-26',
  keywords: {
    zh: ['AI 搜索自测', 'GEO 要不要做', 'AI 推荐供应商', '外贸独立站 AI 搜索', 'ChatGPT 能不能搜到我们公司', 'AI 搜索可见性检测'],
    en: [
      'should we invest in GEO',
      'AI search self-test',
      'does ChatGPT recommend my company',
      'AI search visibility check for exporters',
      'how AI recommends suppliers',
    ],
  },
  relatedServices: ['geo', 'website'],
  relatedTerms: ['term-geo'],
  relatedLessons: ['lesson-c-1-1'],
  zh: {
    title: 'AI 搜索要不要研究？半天自测，按结果决定下一步',
    description:
      '要不要研究 AI 搜索？准备 5 个英文问题，在 ChatGPT 和 Gemini 各问 3 遍，用三个数判断。附问题模板、记录表和三档判读门槛。',
    answer:
      '不用先买工具或服务。准备 5 个英文问题，在 ChatGPT 和 Gemini 各问 3 遍，共 30 条回答，只汇总三个数：品类问题里提到你几次、品牌问题里答对几次、引用网址里有没有你的域名。没有人能保证 AI 推荐你，自测只能告诉你现在 AI 怎么说你。',
    body: `## 先说结论

**做出口的 B2B 站、买家决策周期长的品类，值得花半天测一次。测完再决定要不要继续投入，别反过来。**

测的内容很具体：买家用英文问 AI “谁是靠谱的某某供应商”，AI 会列哪些公司；有人直接问你公司名，AI 说得对不对。三个结果对应三种下一步，见第五步的表。

先纠正一个说法。我们的理解是，AI 是在有人提问时才给出答案。企业能研究的是“问到我这个品类时，AI 怎么描述我、提没提我”。“保证让 AI 推荐你”这种承诺，我们认为无法兑现，遇到可以直接跳过。

## 本周为什么现在说这件事

**前三季度出口增长，来找供应商的人会不会也多？** 新华社 2026-10-14 的报道显示，前三季度货物贸易进出口 39.94 万亿元，同比增长 18.8%，其中出口 23.2 万亿元，增长 16.4%；9 月单月进出口 5.16 万亿元，同比增长 27.5%（[新华社](https://www.news.cn/fortune/20261014/cd4eb95b255243dca3a02a7c2b9c4aac/c.html)）。第 140 届广交会第一期截至 10 月 19 日，共有来自 214 个国家和地区的 18.9 万名境外采购商到会，比上届同期增长 13.3%（[新华社，2026-10-19](https://www.news.cn/fortune/20261019/86b4111cd3da4d5eb7cb8a01b7b3c3b8/c.html)）。第二期 10 月 23 日至 27 日，三期线下展持续到 11 月 4 日。

这些数字说的是外贸整体和展会到会人数，没有一个数字告诉我们这些买家里有多少人用 AI 找供应商。我们没有引用相关统计，也不引用服务商自己做的调查。我们的判断是：到会买家多，展后回去核对、比价的人也会多，核对的渠道里可能有 AI。所以建议你自己测一次，用自己的品类和自己的数据，而不是信一个行业平均数。

**对你意味着什么：** 展会前后询盘多了，正好顺手收集“买家怎么找到我们”的第一手回答。
**你该做什么：** 先做下一节的零成本第一步。

## 第一步（零成本）：先问你的买家用不用 AI

在官网询盘表单加一个选项 “How did you find us?”，选项里列一条 “AI assistant (ChatGPT, Gemini, etc.)”。业务员回复新询盘时，也顺口问一句。我们的判断是，攒一两个月的记录，比读行业文章更能说明你的买家用不用。

没有官网表单的，就在邮件首次回复里加一句。记录只要两列：日期、买家说的渠道原话。

## 第二步：设计 5 个问题

3 个品类问题，不带你的公司名，用买家的口吻。2 个品牌问题，直接问你公司的英文名。括号内替换成你的内容。

**品类问题模板**

> Who are reliable manufacturers of [your product] in China? List 8 with their websites.

> I need a supplier for [custom/OEM version of your product] from China. Which companies would you recommend? Give me 6 names.

> Who are reliable [product] manufacturers in China for export to [your main market]? Give me 8 names with websites.

前两句的句式来自我们 2026-10-16 在 Gemini 上问的阀门问题，第三句是照我们模具问题的套路改的。

**品牌问题模板**

> What do you know about [your company English name]? What do they make and where are they based?

> Is [your company English name] a reliable supplier of [your product]? What certifications do they hold?

品牌问题里的公司名，用你官网和各平台上最常用的那个英文名，不要用简称。

## 第三步：问 30 遍，只记事实

做法：ChatGPT 和 Gemini 各问。每个问题每次新开对话，问 3 遍。5 题 × 2 个助手 × 3 遍 = 30 条回答。

新开对话的原因是上一轮的内容可能影响下一轮回答。每遍都要记下 AI 的名称和模型、是否登录、是否联网。我们的判断是，是否登录、是否开了联网搜索，都可能让回答不同，所以不同条件的结果不要混着算。

记录表（复制到表格里，一行一条回答）：

| 日期 | AI 及模型 | 登录/联网 | 类型 | 问题原文 | 第几遍 | 提到我了吗 | 关于我的信息 | 引用网址里有我的域名吗 |
|---|---|---|---|---|---|---|---|---|
| 【示例】 | 【示例】 | 【示例】 | 品类/品牌 | 【示例】 | 1/2/3 | 是/否 | 对/错/没写 | 是/否 |

“提到”的判断规则要提前定好，不然会越看越松：回答正文里出现你的公司名或域名才算，只出现同行业的泛称不算。

“信息对不对”拿你官网上的事实去对，逐项查：所在城市、主营产品、认证名称、出口市场、成立年份。错的要写错在哪。

我们没有给这套方案计时。30 条回答每一条都要读完再记，留半天比较稳。

## 第四步：汇总三个数

1. 品类问题里被提到几次，满分 18（3 题 × 2 个助手 × 3 遍）。
2. 品牌问题里信息答对几次，满分 12（2 题 × 2 个助手 × 3 遍）。“答对”的意思是你核对的那几项没有错。
3. 引用网址里你的域名出现几次。

## 第五步：按结果走哪条路

下面的门槛是我们自己定的，不是行业标准，也没有大样本验证过。拿它当起点，用一两轮后按自己的情况调。

| 你的结果 | 说明什么 | 下一步 |
|---|---|---|
| 品类问题过半（18 次里至少 10 次）提到你，信息基本没错 | 基础不差 | 每季度用同一批问题复测一次，不必专门投入 |
| 品类问题很少提到你，但品牌问题答得对 | AI 认识你，没把你和这个品类连起来 | 值得研究。方向：产品页上写出可核对的信息（标准编号、认证编号、发证机构），做法见[产品页 6 项自查清单](/insights/ai-supplier-search-product-page-checklist)；检查行业目录、展会名录里的公司介绍是否与官网一致 |
| 品牌问题也答不上，或者答错 | 要先查入口 | 先做下面的“入口检查”，没通之前别谈推荐 |

### 第三档的入口检查（运营能照做的版本）

1. **robots.txt 有没有误拦。** 浏览器打开“你的域名/robots.txt”，看有没有 Disallow: / 之类的整站屏蔽。我们的判断是，可能的原因之一是测试站上线时没删。看不懂规则，把整段内容贴给对话式 AI，让它逐行解释，再请技术同事确认。
2. **页面有没有被谷歌收录。** 用 Google Search Console 的“网址检查”，输入首页和一个主推产品页的网址。搜索框里用 site:你的域名 只能粗看，搜不到不等于没收录，以 Search Console 为准。
3. **关键文字在不在网页代码里。** 打开产品页，按 Ctrl+U（Mac 用 Command+Option+U）打开网页源代码，再按 Ctrl+F 搜一个型号或参数值。搜不到，说明这些信息可能是靠脚本后加载的；如果网站用前端框架搭建，交给建站方确认。
4. **各平台公司信息是否一致。** 官网、阿里国际站、LinkedIn、展会名录里的公司英文名、地址、主营产品，拉成一张表对一遍。我们的判断是，同一家公司的写法越不一致，AI 越容易把信息搞混，这一点没有做过对照实验。

## 我们自己测过的一次，和它说明不了的事

2026 年 10 月 16 日，我们在 Gemini 网页版（已登录，默认模型）新开对话，用英文问了 3 个供应商推荐问题，每题 1 次：中国的闸阀和截止阀制造商（要 8 家）、OEM 非标阀门（要 6 家）、出口欧美的注塑模具制造商（要 8 家）。

结果：三次都按要求列出了具体公司名，合计 22 条描述，涉及 19 家企业。22 条里没有一条附证书编号、发证机构或验厂报告。第一个阀门问题的 8 家里，只有 2 家写了认证名称；模具那题 8 家每家都有认证一行，但只有名称。

这次测试只能说明：AI 确实会回答这类问题，而且会列名字。它说明不了谁被推荐得多，也不能证明“官网写了这些，AI 就会提你”。只有 1 个助手、3 个问题、各 1 次，AI 的回答每次都可能不一样。上面的 30 条方案我们还没完整跑过，所以表里的门槛是待验证的。

## 研究和买服务是两回事

自测、记录、补官网文字、统一各平台信息，企业自己的外贸或市场人员都能做，花的是时间。我们的判断是，下面三种情况才需要考虑外部服务：

- 自测落在第三档，问题出在抓取、渲染这类技术层，内部没人能改；
- 要长期盯很多问题、多个市场、多个 AI，人手不够；
- 内部没有人负责这件事。

即便要找，也先让对方用你的问题当面测一轮，对比他的记录方式和你自己的是否一致。

不想手动问，也可以先做一次 [AI 可见性测评](/audit)：它会以海外买家身份向 ChatGPT、Perplexity、Gemini 提问，并检查官网能不能被 AI 读取，方法见[《AI 可见性测评怎么做》](/insights/ai-visibility-audit-methodology)。需要按固定问题集长期复测，可以了解 [GEO 服务](/services/geo)。`,
    faqs: [
      {
        q: '我们是小公司，没有专人，值得做 AI 搜索自测吗？',
        a: '先做询盘来源记录，几乎不花时间。买家里一直没人提到 AI，可以先放一放。出口、客单价高、买家会提前做功课的品类，再安排半天自测。',
      },
      {
        q: '只测 ChatGPT 或只测 Gemini 行不行？',
        a: '可以先测一个，但不要拿一个助手的结果当结论。我们自己的那次实测只有 Gemini，所以文中写的是“这一次”。',
      },
      {
        q: '每题问 3 遍够吗？',
        a: '3 遍是我们的起点，目的是让你看到同一个问题的回答会变。没有统计依据说 3 遍就够。如果 3 遍里你时有时无，说明结果不稳，下一轮可以加到 5 遍。',
      },
      {
        q: '测出来 AI 没提到我，是不是官网有问题？',
        a: '不一定。原因可能在官网，也可能在 AI 参考的其他网页里没有你。这个测试用来找出可能缺什么，不是给自己排名。',
      },
      {
        q: '改完官网后多久能看到变化？',
        a: '没有固定时间，也没人能保证出现。建议改完后用同一批问题复测，记下日期，前后对比。',
      },
    ],
  },
  en: {
    title: 'Should you invest in AI search? A half-day self-test decides',
    description:
      'Ask 5 English questions, 3 times each in ChatGPT and Gemini, and read three numbers to decide. Includes question templates, a log sheet and three result bands.',
    answer:
      'You do not need to buy tools or services first. Prepare 5 English questions, ask each 3 times in ChatGPT and Gemini (30 answers), and tally three numbers: how often category questions mention you, how often brand questions get you right, and whether your domain appears in cited URLs. Nobody can guarantee AI will recommend you; the test only shows what AI says about you today.',
    body: `## The short version

**If you export B2B products with a long buyer decision cycle, a half-day test is worth it. Test first, then decide whether to invest further, not the other way round.**

The test is concrete: when a buyer asks AI in English "who are reliable suppliers of X", which companies does it list? When someone asks about your company by name, is the answer correct? Three possible results lead to three next steps, shown in the table in step 5.

One correction first. As we understand it, AI produces an answer when someone asks. What a company can study is how AI describes it, and whether it is mentioned, when your category comes up. A promise to "make AI recommend you" is one we believe cannot be kept, so skip anyone who offers it.

## Why now

**Exports are up in the first three quarters. Will more buyers be looking for suppliers?** Xinhua reported on 14 October 2026 that goods trade in the first three quarters reached 39.94 trillion yuan, up 18.8% year on year, with exports at 23.2 trillion yuan, up 16.4%; September alone was 5.16 trillion yuan, up 27.5% ([Xinhua, in Chinese](https://www.news.cn/fortune/20261014/cd4eb95b255243dca3a02a7c2b9c4aac/c.html)). By 19 October, phase one of the 140th Canton Fair had drawn 189,000 overseas buyers from 214 countries and regions, up 13.3% on the previous edition ([Xinhua, in Chinese](https://www.news.cn/fortune/20261019/86b4111cd3da4d5eb7cb8a01b7b3c3b8/c.html)). Phase two runs 23 to 27 October, and the offline fair continues to 4 November.

These figures cover trade overall and fair attendance. None of them says how many of those buyers use AI to find suppliers, and we do not cite any statistic on that, nor surveys run by service providers. Our view: with more buyers attending, more will check and compare after the fair, and AI may be one of the channels they use. So test your own category with your own data instead of trusting an industry average.

**What it means for you:** more enquiries around the fair are a chance to collect first-hand answers on how buyers found you.
**What to do:** start with the zero-cost first step below.

## Step 1 (zero cost): ask your buyers whether they use AI

Add a "How did you find us?" field to your website enquiry form, with an option "AI assistant (ChatGPT, Gemini, etc.)". When sales staff reply to a new enquiry, they can ask the same thing. In our view, a month or two of records says more about your buyers than any industry article.

If you have no form, add one line to your first email reply. Record two columns only: date and the buyer's own words.

## Step 2: write 5 questions

Three category questions that do not name your company, in a buyer's voice. Two brand questions that use your English company name. Replace the brackets with your own details.

**Category question templates**

> Who are reliable manufacturers of [your product] in China? List 8 with their websites.

> I need a supplier for [custom/OEM version of your product] from China. Which companies would you recommend? Give me 6 names.

> Who are reliable [product] manufacturers in China for export to [your main market]? Give me 8 names with websites.

The first two follow the valve questions we asked Gemini on 16 October 2026; the third is adapted from our mould question.

**Brand question templates**

> What do you know about [your company English name]? What do they make and where are they based?

> Is [your company English name] a reliable supplier of [your product]? What certifications do they hold?

Use the English name most common on your website and platforms, not an abbreviation.

## Step 3: ask 30 times and record facts only

Ask in both ChatGPT and Gemini. Start a new chat for every ask and repeat each question 3 times: 5 questions × 2 assistants × 3 runs = 30 answers.

Use a new chat because earlier content can influence the next answer. For every run, note the assistant, the model, whether you were signed in and whether web search was on. Our view: sign-in and web search can both change answers, so do not mix results from different conditions.

Log sheet (copy into a spreadsheet, one row per answer):

| Date | Assistant and model | Signed in / web search | Type | Question text | Run | Mentioned me? | Facts about me | My domain in cited URLs? |
|---|---|---|---|---|---|---|---|---|
| [example] | [example] | [example] | category/brand | [example] | 1/2/3 | yes/no | right/wrong/missing | yes/no |

Fix the rule for "mentioned" in advance, or it will loosen as you read: your company name or domain must appear in the answer text. A generic reference to the industry does not count.

Check "facts" against your own website, item by item: city, main products, certification names, export markets, founding year. For wrong items, write down what was wrong.

We have not timed this method. Every one of the 30 answers has to be read and logged, so set aside half a day.

## Step 4: tally three numbers

1. How many times category questions mention you, out of 18 (3 questions × 2 assistants × 3 runs).
2. How many times brand questions get your facts right, out of 12 (2 questions × 2 assistants × 3 runs). "Right" means none of the items you checked is wrong.
3. How many times your domain appears in the cited URLs.

## Step 5: choose the next step

The thresholds below are our own, not an industry standard, and have not been validated on a large sample. Treat them as a starting point and adjust after a run or two.

| Your result | What it suggests | Next step |
|---|---|---|
| Mentioned in over half of category answers (at least 10 of 18), facts mostly right | A solid base | Re-test each quarter with the same questions; no special investment needed |
| Rarely mentioned in category answers, but brand answers are right | AI knows you but does not connect you to the category | Worth investigating. Put checkable facts on product pages (standard numbers, certificate numbers, issuing bodies); see the [6-point product page checklist](/insights/ai-supplier-search-product-page-checklist). Also check that company profiles in directories and fair listings match your website |
| Brand answers fail or are wrong | Check access first | Run the access checks below. Until they pass, do not talk about recommendations |

### Access checks for the third band (a version operations staff can follow)

1. **Is robots.txt blocking by mistake?** Open "your-domain/robots.txt" in a browser and look for a site-wide block such as Disallow: /. Our view: one possible cause is a test-site setting that was never removed at launch. If you cannot read the rules, paste the whole file into a conversational AI and ask it to explain line by line, then have a technical colleague confirm.
2. **Is the page indexed by Google?** Use the URL Inspection tool in Google Search Console on your home page and one key product page. Searching site:your-domain only gives a rough view, and no result does not prove a page is not indexed; trust Search Console.
3. **Is the key text in the page source?** Open a product page, press Ctrl+U (Command+Option+U on a Mac) to view the page source, then Ctrl+F for a model number or parameter value. If it is missing, the content may be loaded by script after the page opens; if the site uses a front-end framework, ask your site builder to confirm.
4. **Is company information consistent across platforms?** List the company English name, address and main products from your website, Alibaba.com, LinkedIn and fair directories in one table and compare. Our view: the more your company is written differently in different places, the easier it is for AI to mix up details. We have not run a controlled test of this.

## Our own test, and what it cannot show

On 16 October 2026 we opened new chats in the Gemini web app (signed in, default model) and asked three supplier questions in English, once each: gate and globe valve manufacturers in China (8 requested), OEM non-standard valves (6 requested), and injection mould makers exporting to the US and Europe (8 requested).

Result: all three answers listed named companies, 22 descriptions covering 19 companies in total. None of the 22 gave a certificate number, issuing body or factory audit report. In the first valve answer, only 2 of 8 suppliers had certification names; in the mould answer all 8 had a certification line, but names only.

The test shows only that AI does answer this kind of question and does list names. It cannot show who is recommended most, and it does not prove that "if your site says this, AI will mention you". One assistant, three questions, one run each: AI answers can differ every time. We have not yet run the full 30-answer method above, so its thresholds remain unvalidated.

## Researching and buying services are different things

Self-testing, logging, adding text to your website and aligning company details across platforms can all be done by your own export or marketing staff. It costs time. Our view: consider an outside service only in these three cases:

- Your test falls in the third band, the cause is technical (crawling, rendering) and nobody in-house can fix it;
- You need to track many questions, markets and AI assistants over time and lack the people;
- Nobody in-house owns this work.

Even then, ask the provider to test your own questions in front of you first, and compare how they record results with your own method.

If you would rather not ask by hand, you can start with an [AI visibility audit](/audit). It asks ChatGPT, Perplexity and Gemini questions as an overseas buyer and checks whether AI can read your website; the method is explained in [How does an AI visibility audit work?](/insights/ai-visibility-audit-methodology). To re-test with a fixed question set over time, see our [GEO service](/services/geo).`,
    faqs: [
      {
        q: 'We are a small company with no dedicated staff. Is the self-test worth it?',
        a: 'Start with the enquiry source record, which takes almost no time. If no buyer ever mentions AI, you can pause. If you export a high-value category where buyers do their homework, schedule the half-day test.',
      },
      {
        q: 'Can I test only ChatGPT or only Gemini?',
        a: 'You can start with one, but do not treat a single assistant as the conclusion. Our own test used Gemini only, which is why the article says "this one".',
      },
      {
        q: 'Are 3 runs per question enough?',
        a: 'Three is our starting point, meant to show you that answers to one question vary. There is no statistical basis that 3 is enough. If you appear in some runs and not others, results are unstable; try 5 runs next round.',
      },
      {
        q: 'If AI does not mention me, is my website the problem?',
        a: 'Not necessarily. The cause may be your website, or that the other pages AI draws on do not mention you. The test finds what may be missing; it is not a ranking.',
      },
      {
        q: 'How soon will changes to my website show up?',
        a: 'There is no fixed timeline and nobody can guarantee a change will appear. Re-test with the same questions after changes, record the date and compare before and after.',
      },
    ],
  },
};
