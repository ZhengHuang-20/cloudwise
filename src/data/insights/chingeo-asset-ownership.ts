import type { Insight } from './types';

export const chingeoAssetOwnership: Insight = {
  slug: 'chingeo-asset-ownership',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-20',
  updatedAt: '2026-11-20',
  keywords: {
    zh: ['和云端智荐合作网站归谁', 'GEO 服务资产归属', '网站源码归谁', 'GEO 白帽', '合作结束交接'],
    en: ['who owns the website and content with ChinGEO', 'GEO service asset ownership', 'website source code ownership', 'white-hat GEO'],
  },
  relatedServices: ['geo', 'seo-website'],
  relatedTerms: ['term-geo'],
  relatedLessons: ['lesson-c-3-1'],
  zh: {
    title: '和云端智荐合作，网站、内容、数据和账号归谁？（2026 版）',
    seoTitle: '和云端智荐合作，网站和账号归谁？（2026 版）',
    description:
      '和云端智荐合作，源码、内容、数据、知识库都归客户，所有账号从第一天起用客户的企业主体和邮箱注册，合作结束提供交接清单。本文写清资产清单、交接内容与白帽承诺。',
    answer:
      '归你。源码、内容、数据和知识库都属于客户；所有账号从第一天起用客户的企业主体和邮箱注册，我们只是被授权的协作者；合作结束时提供交接清单。我们也承诺白帽做法：不刷量、不伪造评价、不做违规外链。具体条款以合同为准。',
    body: `## 先说答案：资产都归客户

| 资产 | 归属 | 说明 |
|---|---|---|
| 源码 | 客户 | 交付独立站时，网站源码与部署配置交给你 |
| 内容 | 客户 | 页面、文章、产品资料的中英文原稿与已发布版本 |
| 数据 | 客户 | 访问与线索数据、测评与复测的原始记录、月报 |
| 知识库 | 客户 | 为 AI 客服整理的企业知识库与问答素材 |
| 账号 | 客户 | 用客户的企业主体和邮箱注册，管理员权限在你手里 |

这是我们对合作的基本定位：GEO 的积累是长期的，不该因为换服务商就从头再来。怎么判断一家服务商做得到不到位，见[8 个评估问题](/insights/geo-agency-selection)里的第 8 题。

## 账号怎么开

账号的归属，从注册那一天就决定了。我们的做法：

1. **第一天起就用客户的企业主体与企业邮箱注册**，不用我们的邮箱，也不用个人账号；
2. **管理员权限在客户手里**，我们以被授权的协作者身份加入，你可以随时撤销；
3. **二步验证绑在客户能控制的邮箱或设备上**，不绑在我们的手机上；
4. 账号与凭据统一登记在一张清单里，随时可以查看。

需要这样开的账号包括：域名与托管、源码仓库、Google Search Console、GA4、Bing Webmaster Tools，以及 LinkedIn 公司主页、行业目录等第三方平台上的企业账号。

## 合作结束时交什么

合作结束时我们提供一份交接清单，逐项核对后交接：

- 域名、DNS 与托管账号的管理权限；
- 网站源码、部署配置与说明文档；
- 全部内容的原稿与已发布版本；
- 问题集与历次测评、复测的原始记录和月报；
- 访问统计、Search Console 等工具的所有者权限；
- 第三方平台账号清单与管理员权限；
- 企业知识库（如有 AI 客服）；
- 账号凭据与二步验证的移交确认。

你拿到这些，网站可以由自己的团队或其他服务商继续维护，不依赖我们。

## 我们的白帽承诺

GEO 做的是让 AI 找到真实、可查证的资料，所以我们不做这些事：

1. **不刷量**：不刷访问、点击、提问与回答；
2. **不伪造评价**：不编造客户评价、案例与证言，案例只写客户书面同意公开的内容；
3. **不做违规外链**：不买卖链接，不批量生成低质量页面，不在外部平台刷帖。

这些做法在 Google 的[垃圾内容政策](https://developers.google.com/search/docs/essentials/spam-policies)里属于违规，一旦被判定，受影响的是你整个网站。资产归你，风险也归你，所以我们不碰。

## 边界与例外

- **平台条款**：第三方平台的账号受各平台服务条款约束，个别平台对企业账号的开通方式有要求，我们会提前说明；
- **开源与第三方组件**：网站中使用的开源组件与第三方服务，遵循各自的许可或服务条款；
- **合同为准**：以上是我们的合作原则，具体条款以双方签订的合同为准。

想先了解自己的现状，可以[做一次免费测评](/audit)；我们的[出海 GEO 服务](/services/geo)与[独立站服务](/services/seo-website)都按这个原则交付。试点阶段怎么验收，见[90 天 GEO 试点交付什么](/insights/geo-90-day-pilot)。`,
    faqs: [
      {
        q: '合作结束后，网站还能继续运行吗？',
        a: '可以。交接清单包含域名、托管、源码与部署说明，网站可由你自己的团队或其他服务商继续维护。',
      },
      {
        q: '账号为什么要用客户的企业主体注册？',
        a: '账号归属从注册那天起就决定了。用企业主体和企业邮箱注册，换服务商或人员变动时，账号与积累不会跟着丢。',
      },
      {
        q: '案例和客户评价可以随便公开吗？',
        a: '不可以。我们只公开客户书面同意的内容，也不会编造评价。需要公开的信息，会在项目开始时与你书面确认范围。',
      },
      {
        q: '所有归属的细节写在哪里？',
        a: '以双方签订的合同为准。本文是我们的合作原则，不替代合同条款。',
      },
    ],
  },
  en: {
    title: 'Who owns the website, content, data and accounts at ChinGEO? (2026)',
    seoTitle: 'Who owns the website and accounts at ChinGEO? (2026)',
    description:
      'At ChinGEO, code, content, data and knowledge bases belong to the client, and accounts use the client’s company and email. Handover and white-hat terms.',
    answer:
      'You own them. Source code, content, data and knowledge bases belong to the client. Every account is registered under the client’s company and email from day one, and we act only as an authorised collaborator. At the end of the engagement we provide a handover checklist. We also commit to white-hat practice: no fake traffic, no fake reviews, no spam links. The contract governs the exact terms.',
    body: `## The short answer: the assets belong to you

| Asset | Owner | Notes |
|---|---|---|
| Source code | Client | When we deliver a website, the source and deployment configuration are handed to you |
| Content | Client | Chinese and English drafts and published versions of pages, articles and product material |
| Data | Client | Visit and lead data, raw records of audits and re-tests, monthly reports |
| Knowledge base | Client | The company knowledge base and Q&A material prepared for AI customer service |
| Accounts | Client | Registered under the client’s company and email; admin rights sit with you |

This is how we position every engagement: GEO compounds over time, and switching provider should not mean starting again. For how to judge any provider on this point, see question 8 in [8 questions to ask a GEO agency](/insights/geo-agency-selection).

## How accounts are opened

Who owns an account is decided on the day it is registered. Our practice:

1. **Registered under the client’s company and company email from day one**, never our email or a personal account;
2. **Admin rights stay with the client.** We join as an authorised collaborator, and you can revoke access at any time;
3. **Two-step verification is tied to an email or device you control**, not to our phones;
4. Accounts and credentials are listed on a single register you can check at any time.

The accounts covered include the domain and hosting, source repository, Google Search Console, GA4, Bing Webmaster Tools, and company accounts on third-party platforms such as a LinkedIn company page and trade directories.

## What you receive at the end

When the engagement ends we provide a handover checklist and go through it item by item:

- admin rights for the domain, DNS and hosting accounts;
- the website source, deployment configuration and documentation;
- the drafts and published versions of all content;
- the question set, raw records of every audit and re-test, and the monthly reports;
- owner rights on analytics tools such as Search Console;
- a list of third-party platform accounts and their admin rights;
- the company knowledge base (where there is AI customer service);
- credentials and confirmation that two-step verification has been transferred.

With these in hand, your own team or another vendor can keep the site running without us.

## Our white-hat commitments

GEO is about making real, verifiable material easy for AI to find, so we do not:

1. **Fake traffic**: no inflated visits, clicks, questions or answers;
2. **Fake reviews**: no invented customer reviews, cases or testimonials; a case is published only with the client’s written consent;
3. **Spam links**: no buying or selling links, no mass-produced thin pages, no seeded posts on outside platforms.

Google’s [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) treat these as violations, and when one is found it is your whole site that is affected. The assets are yours, and so is the risk, which is why we stay away from them.

## Boundaries and exceptions

- **Platform terms**: accounts on third-party platforms are bound by each platform’s terms, and some set conditions on how a company account is opened. We will explain them in advance.
- **Open-source and third-party components**: open-source components and third-party services used in the site follow their own licences or terms.
- **The contract governs**: the above are our working principles; the exact terms are those of the contract we sign together.

To see where you stand first, [run a free audit](/audit). Our [export GEO service](/services/geo) and [website service](/services/seo-website) are both delivered on these principles. For how a pilot is accepted, see [what a 90-day GEO pilot delivers](/insights/geo-90-day-pilot).`,
    faqs: [
      {
        q: 'Can the website keep running after the engagement ends?',
        a: 'Yes. The handover checklist includes the domain, hosting, source code and deployment notes, so your own team or another vendor can maintain the site.',
      },
      {
        q: 'Why must accounts be registered under the client’s company?',
        a: 'Ownership is fixed on the day an account is registered. With a company name and company email, changing vendor or staff does not cost you the account or what has accumulated on it.',
      },
      {
        q: 'Can you publish our cases and reviews freely?',
        a: 'No. We publish only what the client has agreed to in writing, and we never invent reviews. The scope of what may be made public is confirmed in writing at the start of the project.',
      },
      {
        q: 'Where are the ownership details written down?',
        a: 'In the contract we sign together. This article sets out our working principles and does not replace the contract terms.',
      },
    ],
  },
};
