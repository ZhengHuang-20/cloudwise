import type { Insight } from './types';

export const doubaoWebsiteVisibility: Insight = {
  slug: 'doubao-website-visibility',
  topic: 'geo',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-08',
  keywords: {
    zh: ['豆包收录网站', '豆包 GEO', '怎么让豆包推荐我的公司', '头条搜索站长平台', 'Bytespider'],
    en: ['Doubao GEO', 'how to get a website cited by Doubao', 'ByteDance Bytespider crawler'],
  },
  relatedServices: ['geo', 'seo'],
  relatedTerms: ['term-geo'],
  relatedLessons: ['lesson-c-1-1'],
  zh: {
    title: '怎么让豆包读到并引用企业官网？做国内 AI 可见性的 6 件事',
    description:
      '字节跳动没有公开豆包联网搜索的收录规则。本文整理目前能确定的信息（Bytespider 爬虫、头条搜索站长平台），以及企业官网想被豆包读到、引用可以做的 6 件事。',
    answer:
      '字节跳动目前没有公开豆包联网搜索的收录与引用规则，所以没有“保证被豆包收录”的办法。能做的是把基础打好：robots.txt 不屏蔽字节跳动的爬虫（Bytespider），页面在服务端输出正文，在头条搜索站长平台提交 sitemap，在今日头条、抖音等字节系平台发布同样的核心内容，并定期在豆包里用固定问题复测。',
    body: `## 目前能确定的信息

- **爬虫**：字节跳动的网页爬虫用户代理（User-Agent）名为 **Bytespider**，UA 里附带头条搜索站长平台（zhanzhang.toutiao.com）的说明链接，用于头条搜索等业务。一些第三方爬虫目录还记录了名为 Doubaobot 的 UA，但目前没有官方说明。
- **站长平台**：头条搜索提供站长平台，可以验证网站归属、提交 sitemap、查看抓取情况。
- **不确定的部分**：豆包联网回答时具体检索哪个索引、如何选择引用来源，官方没有公开。网上“豆包收录规则”一类说法，大多是经验推测，引用前要核实。

## 6 件可以做的事

1. **robots.txt 放行**：不要屏蔽 Bytespider，也不要用“只允许 Googlebot、Baiduspider”的白名单写法把其他爬虫挡在外面。可以在服务器日志里确认它是否来访。
2. **服务端输出正文**：很多爬虫不执行 JavaScript。用“查看网页源代码”检查，正文、标题、描述应该直接出现在 HTML 里，而不是只有一个空的 <div>。
3. **在头条搜索站长平台提交 sitemap**：和百度、Bing 一样，验证网站后提交 sitemap，让新页面更快被发现。
4. **在字节系平台发布核心内容**：把公司介绍、服务说明、案例与常见问题，以文章或短视频的形式发布在今日头条（头条号）、抖音等平台，并链接回官网。豆包所在的生态里有你的内容，被读到的机会更大。
5. **按“先给答案”的方式写**：每篇内容开头一两句话直接回答标题里的问题，用表格和列表写清参数、流程和数据出处。这类段落最容易被 AI 摘录。
6. **固定问题集，定期复测**：整理 10～30 个客户会问的问题，例如“国内有哪些做 GEO 的服务商”，每月在豆包里问一遍，记录是否提到你、引用了哪个网页。没有监测就无法判断哪些动作有效。

## 和海外 AI 平台的区别

做海外市场时，买家主要用 ChatGPT、Perplexity、Gemini 和 Google AI 概览，对应的是 Bing、Google 的索引和英文第三方来源。做国内市场时，要同时照顾百度、头条搜索等国内搜索引擎和豆包、DeepSeek、Kimi、腾讯元宝等国内 AI，以及知乎、微信公众号、今日头条等中文内容平台。两边的技术底座相同，信源平台不同。

想先看看自己官网的技术底座是否合格，可以用 [AI 可见性测评](/audit) 检查爬虫权限、无 JavaScript 正文和结构化数据。`,
    faqs: [
      {
        q: '豆包有官方的收录提交入口吗？',
        a: '目前没有公开的“豆包收录提交”入口。可以做的是在头条搜索站长平台验证网站并提交 sitemap，并确保 robots.txt 不屏蔽 Bytespider。',
      },
      {
        q: '屏蔽了 Bytespider 会有什么影响？',
        a: '字节跳动的爬虫将无法抓取被屏蔽的页面，头条搜索等字节系产品读到你官网内容的机会也会减少。如果担心抓取占用服务器资源，优先考虑限流或缓存，而不是直接屏蔽。',
      },
      {
        q: '豆包和百度的优化方法一样吗？',
        a: '技术底座一样：可抓取、服务端渲染、结构化数据、sitemap。不同在于内容分发：百度系看重百家号等平台，字节系看重今日头条、抖音等平台，建议两边都发布核心内容。',
      },
    ],
  },
  en: {
    title: 'How do you get Doubao to read and cite your website? Six steps for China’s AI assistants',
    description:
      'ByteDance has not published how Doubao’s web search selects sources. Here is what is known (the Bytespider crawler and the Toutiao Search webmaster platform), and six practical steps to help Doubao read and cite your website.',
    answer:
      'ByteDance has not published how Doubao’s web answers choose and cite pages, so nothing can guarantee inclusion. What you can do is get the basics right: do not block ByteDance’s crawler (Bytespider) in robots.txt, render body text on the server, submit a sitemap to the Toutiao Search webmaster platform, publish the same core content on ByteDance platforms such as Toutiao and Douyin, and re-test regularly in Doubao with a fixed set of questions.',
    body: `## What is known today

- **Crawler**: ByteDance’s web crawler identifies itself as **Bytespider**, with a link to the Toutiao Search webmaster platform (zhanzhang.toutiao.com) in its user agent, and is used for Toutiao Search and related products. Some third-party crawler directories also list a user agent called Doubaobot, but there is no official documentation for it.
- **Webmaster platform**: Toutiao Search offers a webmaster platform where you can verify site ownership, submit a sitemap and check crawl activity.
- **What is not known**: which index Doubao searches when it answers with live results, and how it selects sources, has not been made public. Many "Doubao indexing rules" circulating online are guesswork, so verify before relying on them.

## Six steps you can take

1. **Allow the crawler in robots.txt**: do not block Bytespider, and avoid allow-lists that only admit Googlebot and Baiduspider and shut every other crawler out. Check your server logs to confirm it visits.
2. **Render body text on the server**: many crawlers do not run JavaScript. View the page source: the body text, title and description should appear directly in the HTML, not just an empty <div>.
3. **Submit a sitemap to the Toutiao Search webmaster platform**: just as with Baidu and Bing, verify the site and submit a sitemap so new pages are found sooner.
4. **Publish core content on ByteDance platforms**: publish your company profile, service descriptions, cases and FAQs as articles or short videos on Toutiao and Douyin, linking back to your site. Having your content inside Doubao’s own ecosystem improves the chance it is read.
5. **Write answer-first**: open every piece with one or two sentences that answer the question in the title, and use tables and lists for specifications, processes and data sources. These passages are the easiest for AI to quote.
6. **Re-test with a fixed question set**: list 10 to 30 questions your customers ask, such as "which GEO service providers are there in China", ask them in Doubao every month, and record whether you are mentioned and which page is cited. Without monitoring you cannot tell which steps work.

## How this differs from overseas AI platforms

Overseas buyers mainly use ChatGPT, Perplexity, Gemini and Google AI Overviews, which draw on Bing and Google indexes and English-language third-party sources. For the Chinese market you need Baidu and Toutiao Search, Chinese AI assistants such as Doubao, DeepSeek, Kimi and Tencent Yuanbao, and Chinese content platforms such as Zhihu, WeChat Official Accounts and Toutiao. The technical foundation is the same; the source platforms differ.

To check whether your website’s technical foundation is in place, run an [AI visibility audit](/audit), which checks crawler access, body text without JavaScript and structured data.`,
    faqs: [
      {
        q: 'Is there an official way to submit a site to Doubao?',
        a: 'There is no public "submit to Doubao" option today. What you can do is verify your site and submit a sitemap on the Toutiao Search webmaster platform, and make sure robots.txt does not block Bytespider.',
      },
      {
        q: 'What happens if we block Bytespider?',
        a: 'ByteDance’s crawler cannot fetch the blocked pages, which reduces the chance that ByteDance products such as Toutiao Search read your site. If crawl load is the concern, consider rate limiting or caching before blocking it outright.',
      },
      {
        q: 'Is optimising for Doubao the same as optimising for Baidu?',
        a: 'The technical foundation is the same: crawlable pages, server-side rendering, structured data and a sitemap. Distribution differs: Baidu favours platforms such as Baijiahao, while ByteDance favours Toutiao and Douyin, so publish core content on both.',
      },
    ],
  },
};
