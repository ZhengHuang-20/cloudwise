import type { Insight } from './types';

export const llmsTxtGuide: Insight = {
  slug: 'llms-txt-guide',
  topic: 'website',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-08',
  keywords: {
    zh: ['llms.txt 是什么', 'llms.txt 怎么写', 'llms.txt 有用吗', 'GEO 技术优化'],
    en: ['what is llms.txt', 'how to write llms.txt', 'does llms.txt help GEO'],
  },
  relatedServices: ['website', 'geo'],
  relatedTerms: ['term-geo'],
  relatedLessons: ['lesson-a-1-2'],
  zh: {
    title: 'llms.txt 是什么，企业官网要不要做？',
    description:
      'llms.txt 是放在网站根目录、写给大模型看的 Markdown 文件。本文说明它的来历、格式与写法，目前哪些平台会读、哪些不会，以及它在 GEO 里应该放在什么位置。',
    answer:
      'llms.txt 是放在网站根目录（/llms.txt）的 Markdown 文件，用一段简介加若干链接列表，告诉大模型“这个网站是什么、最重要的内容在哪”。它由 Answer.AI 的 Jeremy Howard 在 2024 年 9 月提出，至今仍是社区提议而非正式标准，主流 AI 平台也没有公开确认会在回答时读取它。做一份成本很低，可以做，但它替代不了服务端渲染、结构化数据和第三方信源。',
    body: `## 它解决什么问题

网页是写给人看的：导航、脚本、广告和样式占了大部分字节，真正有用的信息被淹没在里面。llms.txt 的思路是在网站根目录放一份精简的 Markdown 文件，让大模型（尤其是编程助手、智能体等需要临时读取网站资料的工具）快速找到核心内容。

## 格式

按 llmstxt.org 的提议，文件结构如下：

1. 一个一级标题：网站或项目名称（唯一必填项）。
2. 一段引用块：一两句话的简介。
3. 若干段补充说明（可选）。
4. 若干二级标题分组的链接列表，每行写成“- [页面名称](网址): 一句话说明”。
5. 名为 Optional 的分组放次要内容，读取方上下文不够时可以跳过。

很多网站还会提供 llms-full.txt，把核心页面的正文直接拼成一份文件。这是常见做法，但不在提议的规范里。

## 现在有谁在读

- **编程助手与智能体**：一些开发工具会读取文档站的 llms.txt，这是它最常见的用途。
- **搜索与 AI 平台**：主流平台都没有公开确认会在生成回答时读取 llms.txt。据多家 SEO 媒体报道，Google 搜索团队表示不使用它；它不影响 Google 排名。
- **结论**：把 llms.txt 当作低成本的补充，而不是 GEO 的核心手段。

## 在 GEO 里的优先级

| 优先级 | 工作 | 原因 |
|---|---|---|
| 最高 | 服务端输出正文、robots.txt 放行 AI 爬虫 | 读不到页面，其他一切都无效 |
| 高 | 每页独立网址、标题、描述与结构化数据 | 让搜索引擎和 AI 理解每一页讲什么 |
| 高 | 第三方信源与实体信息一致 | AI 更相信独立来源 |
| 补充 | llms.txt / llms-full.txt | 成本低，对部分工具有帮助 |

## 写法建议

- 只列真正重要的页面：服务、案例、产品或课程、常见问题、联系方式。
- 每个链接配一句话说明“这一页回答什么问题”。
- 内容和网站保持同步，最好从网站的数据自动生成，避免过期。
- 不要放网站上没有的信息，也不要堆砌关键词。

本站的 [llms.txt](/llms.txt) 与 [llms-full.txt](/llms-full.txt) 都是从网站数据自动生成的，可以作为参考。`,
    faqs: [
      {
        q: 'llms.txt 和 robots.txt 有什么区别？',
        a: 'robots.txt 告诉爬虫哪些地址可以抓、哪些不可以，是被广泛遵守的规则；llms.txt 是给大模型的内容导读，只是提议中的格式，不控制抓取权限。',
      },
      {
        q: '有了 llms.txt，还需要 sitemap 吗？',
        a: '需要。sitemap 是搜索引擎发现页面的标准方式，主流搜索引擎都支持；llms.txt 无法替代它。',
      },
      {
        q: 'llms.txt 会提升 Google 排名吗？',
        a: '不会。据公开报道，Google 搜索团队表示不使用 llms.txt。',
      },
    ],
  },
  en: {
    title: 'What is llms.txt, and does your company website need one?',
    description:
      'llms.txt is a Markdown file at the root of a website, written for large language models. Where it came from, how to format it, which platforms read it today and which do not, and where it belongs in a GEO plan.',
    answer:
      'llms.txt is a Markdown file at the root of a website (/llms.txt) that uses a short summary and lists of links to tell language models what the site is and where its most important content lives. It was proposed by Jeremy Howard of Answer.AI in September 2024 and is still a community proposal rather than a formal standard; no major AI platform has publicly confirmed reading it when answering. It is cheap to add, so it is worth doing, but it cannot replace server-side rendering, structured data or third-party sources.',
    body: `## The problem it solves

Web pages are written for people: navigation, scripts, ads and styling take up most of the bytes, and the useful information is buried. The idea behind llms.txt is to put a concise Markdown file at the root of the site, so language models (especially coding assistants and agents that read a site on the fly) can find the core content quickly.

## Format

Following the proposal at llmstxt.org, the file is structured like this:

1. One H1 heading with the name of the site or project (the only required part).
2. A blockquote with a one- or two-sentence summary.
3. Optional paragraphs with more detail.
4. Link lists grouped under H2 headings, one per line as "- [Page name](url): one-line note".
5. A section called Optional for secondary content that a reader can skip when context is short.

Many sites also publish llms-full.txt, which concatenates the text of the core pages into one file. This is a common practice, but it is not part of the proposal.

## Who reads it today

- **Coding assistants and agents**: some developer tools read llms.txt on documentation sites, which is its most common use.
- **Search and AI platforms**: no major platform has publicly confirmed reading llms.txt when generating answers. According to several SEO publications, Google’s search team has said it does not use the file, and it does not affect Google rankings.
- **In short**: treat llms.txt as a low-cost extra, not a core GEO technique.

## Where it sits in a GEO plan

| Priority | Work | Why |
|---|---|---|
| Highest | Render body text on the server and allow AI crawlers in robots.txt | If pages cannot be read, nothing else matters |
| High | A separate URL, title, description and structured data for every page | Lets search engines and AI understand what each page is about |
| High | Third-party sources and consistent entity information | AI trusts independent sources more |
| Extra | llms.txt / llms-full.txt | Cheap, and helpful for some tools |

## How to write it

- List only the pages that matter: services, cases, products or courses, FAQs and contact details.
- Give every link a one-line note on what question the page answers.
- Keep it in sync with the site, ideally generated automatically from the site’s data so it never goes stale.
- Do not include anything that is not on the site, and do not stuff keywords.

This site’s [llms.txt](/llms.txt) and [llms-full.txt](/llms-full.txt) are generated automatically from the site’s data and can serve as an example.`,
    faqs: [
      {
        q: 'How is llms.txt different from robots.txt?',
        a: 'robots.txt tells crawlers which addresses they may or may not fetch, and it is widely respected. llms.txt is a content guide for language models in a proposed format, and it does not control crawl permissions.',
      },
      {
        q: 'With llms.txt, do we still need a sitemap?',
        a: 'Yes. A sitemap is the standard way search engines discover pages and every major search engine supports it; llms.txt cannot replace it.',
      },
      {
        q: 'Will llms.txt improve Google rankings?',
        a: 'No. According to public reports, Google’s search team has said it does not use llms.txt.',
      },
    ],
  },
};
