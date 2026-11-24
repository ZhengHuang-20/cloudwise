import type { Insight } from './types';

export const inquiryAiAutoReply: Insight = {
  slug: 'inquiry-ai-auto-reply',
  topic: 'ai-customer-service',
  author: 'founder',
  publishedAt: '2026-11-23',
  updatedAt: '2026-11-23',
  keywords: {
    zh: ['外贸询盘 AI 自动回复', '询盘自动回复能做什么', '外贸 AI 客服局限', '询盘 AI 什么时候转人工'],
    en: [
      'AI auto-reply for export inquiries',
      'B2B inquiry auto response limits',
      'AI customer service for exporters',
      'when should AI hand off inquiries to sales',
    ],
  },
  relatedServices: ['ai-customer-service', 'seo-website'],
  relatedTerms: ['term-structured-data'],
  relatedLessons: ['lesson-d-1-2', 'lesson-d-9-2'],
  zh: {
    title: '外贸询盘 AI 自动回复：能做什么、不能做什么',
    seoTitle: '外贸询盘 AI 自动回复：能做什么、不能做什么（2026）',
    description:
      '海外询盘能不能交给 AI 自动回复？本文按问题类型列出哪些可以自动回、哪些必须转人工，以及上线前要准备的知识库、更新责任人、转人工时限和对话复核。',
    answer:
      'AI 自动回复适合做询盘的首次响应和资料整理：多语种确认收到，按已核实的参数和认证资料答疑，抽取规格、数量、目的港等信息，再交给销售。价格、交期、产能、定制可行性、合同条款和投诉不能由 AI 承诺，知识库没有写明的问题要转人工，而不是让它猜。',
    body: `## 先说结论

AI 自动回复能接住询盘的“前五分钟”，接不住商业承诺。它的价值是让买家在你下班后也能马上得到一个专业、准确的回应，并把询盘整理成销售第二天就能直接跟进的样子；报价、交期、认证范围、定制和合同，仍然要由人来答。

判断一个问题能不能自动回，只看一条：**答案是否已经写在企业审定过的资料里，而且答错了不会形成承诺**。两个条件都满足，可以自动回；缺一个，就转人工。

## 能自动回复的事：首响、已核实资料内的问答、整理询盘

AI 能可靠完成的，都是“依据现成资料”或“整理对方说的话”的工作。

- **多语种首次响应**：用买家来信的语言确认收到，说明销售会在什么时间跟进。欧美买家的工作时间常常是北京时间的夜里（纽约上午 9 点，在美国夏令时期间是北京时间晚上 9 点，冬令时是晚上 10 点），这段时间有一个及时、像样的回复，比一封“已离线，请留言”体面得多。
- **回答资料里已经写明的问题**：产品规格与公差范围、材质、已取得的认证及其覆盖型号、标准包装、企业已经对外公开的起订量。前提是这些内容来自企业维护的资料，而不是模型自己的“常识”。
- **抽取询盘字段**：产品型号、数量、关键规格、认证要求、目的港、贸易术语、期望交期、应用场景。整理成表，销售打开就能看到全貌。
- **追问缺失信息**：对方只写了“please quote”，AI 可以礼貌地问清型号、数量和目的港，下一封邮件就能直接报价。
- **区分意向并转交**：按资料完整度与需求明确程度给询盘分级，高意向的即时推送到企业微信或 CRM，由销售接手。

## 不能自动回复的事：凡是承诺，都要人来做

AI 不能替销售做商业承诺，也不能替工程师做判断。下面几类问题，即使模型“看起来会答”，也不应该让它答：

- **价格、折扣与付款条件**：报价取决于数量、规格、汇率、原材料和客户关系，是销售的判断，不是资料查询。
- **精确交期与产能**：交期取决于当前排产和库存，资料里最多写“标准交期范围”，具体到某个订单能不能按期交，要问生产。
- **认证状态的边界**：证书有有效期和覆盖范围。资料里列明的可以答，对方问的型号或市场没有列明时，AI 不能推断“应该也符合”。
- **定制可行性**：改尺寸、改材质、做非标件，需要工程师评估。
- **合同条款与书面承诺**：质保责任、违约条款、对方要求的书面确认，都要由有权限的人签发。
- **投诉、质量事故与索赔**：情绪、责任和后续处理都需要人来接。

原因不在于模型“不够聪明”。OpenAI 在 2025 年发布的研究说明里写道，语言模型产生幻觉的一个重要原因，是常见的训练与评测方式奖励猜测，而不是承认不确定（[原文](https://openai.com/index/why-language-models-hallucinate/)）。Anthropic 的开发文档建议允许模型说“我不知道”、限定只用提供的资料作答，同时提醒这些做法能明显减少幻觉，但不能完全消除，关键信息仍要核验（[原文](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)）。询盘里的价格和交期正是“关键信息”，猜错一次，就是一个对外的承诺。

## 一张表：问题类型 → 怎么处理 → 原因

这张表是我们按上面的判断标准整理的分工，可以直接拿去和销售、客服对一遍。

| 问题类型 | 处理方式 | 原因 |
|---|---|---|
| 确认收到、说明跟进时间 | 自动回复 | 不涉及承诺，越快越好 |
| 资料里写明的规格、公差、材质 | 自动回复，附产品页链接 | 答案有出处，可核对 |
| 已取得的认证、列明的覆盖型号 | 自动回复，写明证书名称 | 资料里有，且标了有效期 |
| 没列明的型号或市场是否符合某认证 | 转人工 | 推断“应该符合”就是承诺 |
| 价格、折扣、付款条件 | 转人工，AI 先收集数量与目的港 | 商业判断，不是资料查询 |
| 某批订单的具体交期、产能 | 转人工，AI 可说明标准交期范围 | 取决于当前排产 |
| 非标定制、改设计 | 转人工，AI 先收集图纸与参数 | 需要工程评估 |
| 合同条款、书面承诺、质保责任 | 转人工 | 需要有权限的人签发 |
| 投诉、质量问题、索赔 | 立即转人工 | 涉及责任与客户关系 |
| 问题含糊、资料里查不到 | 先追问一次，仍不清楚就转人工 | 不让模型猜 |

## 转人工不是“我不知道”就结束

转人工的回复本身也要写好。对方需要知道三件事：问题已经收到、谁会跟进、大约什么时候。比较稳妥的写法是：“这个问题需要我们的销售工程师确认，他会在北京时间工作时间内回复您；为了一次答清，请补充型号和数量。”时限按企业自己做得到的写，不要为了好看写一个做不到的时间。

需要立即转人工的信号可以写成规则：出现价格、折扣、交期承诺、合同、索赔等关键词；对方连续追问同一个问题；对方明确要求和真人沟通；知识库检索不到相关资料。

## 上线前要具备的四个条件

自动回复的效果，取决于资料是否完整、转人工是否及时、销售是否真正跟进，而不是“装上了”本身。

1. **知识库来自企业自己的资料**：参数表、认证清单（证书名称、覆盖型号、有效期）、标准交期范围说明、常见问题。官网可以作为对外资料的基准来源：产品页、认证页上写清楚的内容，客服知识库与之读取同一份数据，避免官网和客服说法不一致。用定制 Next.js 独立站时，产品数据、[结构化数据](/glossary/structured-data)、客服知识库和 CRM 可以由同一份数据生成；产品页怎么写清这些信息，见[产品页自查清单](/insights/ai-supplier-search-product-page-checklist)，平台怎么选见[独立站什么时候需要定制](/insights/b2b-website-platform-choice)。
2. **每类资料有人负责更新**：参数谁改、证书到期谁下线、交期范围谁维护，写进流程。过期的证书留在知识库里，比没有知识库更危险。
3. **转人工有时限和值班安排**：夜里转出去的询盘第二天谁先看、多久内回复，要有明确的人和时间。
4. **定期复核对话日志**：每周抽查一批对话，标出答错的、该转没转的、资料缺的，补进知识库或调整规则。

另外，面向欧盟买家时要注意告知义务：欧盟委员会对 AI 法案的说明写到，使用聊天机器人等 AI 系统时，应让人知道自己是在和机器交流，透明度规则于 2026 年 8 月起适用（[欧盟委员会说明](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)）。简单的做法是在对话开头说明“这是 AI 助手，复杂问题会转给销售”。其他市场的要求各不相同，具体合规问题请咨询法律顾问。

## 常见误区

- **以为装了自动回复就能成交**：自动回复只负责接住和整理，成交靠销售第二天的报价和跟进。只看“回复率”不看后续，看不出真实效果。
- **让 AI“先报个大概价格”**：一个大概的数字在买家眼里就是报价，之后很难收回。
- **资料一次录入后不再更新**：产品改型、证书到期、交期变化，知识库不跟着改，AI 就会用过期资料回答得很自信。
- **不追踪人工接手**：转人工之后有没有人回、多久回，要能在系统里查到。转出去没人接，比不回复更伤信任。

## 我们自己的做法

本站右下角的 AI 售前顾问按同样的规则运行：提示词规定不给出任何金额，不知道的就说不知道，并引导到方案规划与诊断会；模型调用失败时，回到按关键词匹配的固定回答，不让它在没有资料时自由发挥。这是我们自己网站的做法，不代表客户项目的效果。

想把询盘的首次响应、字段整理和转人工规则搭起来，可以看看 [AI 智能客服与系统对接](/services/ai-customer-service) 的交付内容。有些买家在发询盘之前会先问 AI 找供应商；想知道 AI 现在怎么介绍你的企业，可以先做一次 [AI 可见性测评](/audit)。`,
    faqs: [
      {
        q: '外贸询盘可以完全交给 AI 自动回复吗？',
        a: '不可以。AI 适合做首次响应、按已核实资料回答和整理询盘信息；价格、交期、定制、合同和投诉需要转给销售或工程师。',
      },
      {
        q: 'AI 自动回复什么时候应该转人工？',
        a: '问题涉及价格、交期承诺、合同或索赔，知识库里查不到相关资料，问题追问后仍然含糊，或者对方要求和真人沟通时，都应该转人工。',
      },
      {
        q: 'AI 客服的知识库应该放哪些资料？',
        a: '放企业自己维护、审定过的资料：参数表、认证清单（含覆盖型号与有效期）、标准交期范围和常见问题。每类资料要有人负责更新。',
      },
      {
        q: '装了 AI 自动回复，询盘转化就会提高吗？',
        a: '不一定。效果取决于资料是否完整、转人工是否及时、销售是否真正跟进，需要上线后按对话日志和跟进记录复核。',
      },
    ],
  },
  en: {
    title: 'What AI auto-replies can and cannot do for export inquiries',
    seoTitle: 'AI auto-replies for export inquiries: the limits (2026)',
    description:
      'Can you hand overseas B2B inquiries to an AI auto-reply? Which questions it can answer, which must go to a person, and what to set up before launch.',
    answer:
      'An AI auto-reply is good at the first response and the paperwork: acknowledging an inquiry in the buyer’s language, answering from your verified specs and certifications, capturing quantity, specs and destination port, and routing the lead to sales. It should never commit to prices, lead times, capacity, custom feasibility, contract terms or complaint outcomes. If the answer is not in your approved material, hand it to a person.',
    body: `## The short answer

An AI auto-reply can cover the first few minutes of an inquiry. It cannot make commercial commitments. Its job is to give an overseas buyer a fast, accurate response while your team is asleep, and to turn the inquiry into something a salesperson can act on the next morning. Quotes, lead times, certification scope, custom work and contracts still need a person.

One test decides whether a question can be answered automatically: **is the answer already in material your company has approved, and would a wrong answer stop short of being a commitment?** If both are true, let the AI answer. If either fails, hand it off.

## What it can handle: first response, verified answers, structured capture

AI does this part reliably because the work is either looking something up in your own material or organising what the buyer said.

- **First response in the buyer's language.** Confirm receipt and say when sales will follow up. A US or European working morning often lands in the Beijing evening. 9 am in New York is 9 pm in Beijing during US daylight time and 10 pm in winter. A prompt, professional reply in that window beats an "offline, leave a message" box.
- **Questions your material already answers.** Specifications and tolerance ranges, materials, certifications you hold and the models they cover, standard packaging, any minimum order quantity you already publish. The answers must come from material your company maintains, not from the model's general knowledge.
- **Capturing the inquiry.** Model, quantity, key specs, certification requirements, destination port, Incoterm, target delivery date, application. Sales opens one record and sees the whole request.
- **Asking for what is missing.** When a buyer writes only "please quote", the AI can ask for the model, quantity and port so the next email can carry a real quote.
- **Grading and routing.** Score each inquiry on how complete and specific it is, and push the strong ones straight to WeCom or your CRM.

## What it must not handle: anything that is a promise

AI should not make commitments on behalf of sales or judgements on behalf of engineering, even when the model sounds as if it knows.

- **Prices, discounts and payment terms.** A quote depends on volume, specs, exchange rates, material costs and the relationship. That is a sales decision, not a lookup.
- **Exact lead times and capacity.** These depend on the current production schedule and stock. Your material can state a standard range. Whether a particular order ships on time is a question for production.
- **The edges of a certification.** Certificates expire and cover specific models. If the model or market the buyer asks about is not listed, the AI must not infer that it "should also comply".
- **Custom feasibility.** Changed dimensions, other materials or non-standard parts need an engineer.
- **Contract terms and written assurances.** Warranty liability, penalty clauses and written confirmations need someone with authority to sign.
- **Complaints, quality incidents and claims.** These involve responsibility and a relationship, and a person has to own them.

This is not about the model being clever enough. OpenAI's 2025 research post argues that language models hallucinate partly because common training and evaluation methods reward guessing over admitting uncertainty ([source](https://openai.com/index/why-language-models-hallucinate/)). Anthropic's developer documentation recommends letting the model say "I don't know" and restricting it to the documents provided, and notes that these techniques reduce hallucinations without eliminating them, so critical information should still be checked ([source](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)). In an inquiry, price and lead time are exactly that kind of critical information. One wrong guess goes out as a commitment.

## Who answers what

We put the test above into a working split. Go through it with your sales and service teams before launch.

| Question type | Handling | Why |
|---|---|---|
| Acknowledgement and follow-up time | Auto-reply | No commitment involved; speed matters |
| Specs, tolerances and materials in your material | Auto-reply with a product page link | The answer has a source the buyer can check |
| Certifications held, models listed | Auto-reply naming the certificate | Documented, with an expiry date on file |
| Whether an unlisted model or market complies | Hand off | "It should comply" is a promise |
| Price, discount, payment terms | Hand off; AI first collects quantity and port | Commercial judgement |
| Lead time or capacity for a specific order | Hand off; AI may state the standard range | Depends on the live schedule |
| Custom or modified designs | Hand off; AI first collects drawings and specs | Needs engineering review |
| Contract terms, written assurances, warranty | Hand off | Needs signing authority |
| Complaints, defects, claims | Hand off immediately | Responsibility and the relationship |
| Vague question, nothing in the material | Ask once, then hand off | Do not let the model guess |

## A handoff is more than "I don't know"

The handoff message deserves as much care as any answer. The buyer needs three things: the question was received, who will reply, and roughly when. Something like: "A sales engineer needs to confirm this and will reply during Beijing business hours. To answer in one go, could you share the model and quantity?" Only promise a response time your team actually meets.

Write the handoff triggers down as rules: keywords such as price, discount, delivery commitment, contract or claim; the buyer repeating the same question; an explicit request for a human; or no relevant result in the knowledge base.

## Four things to have in place before launch

Results depend on how complete your material is, how fast handoffs are picked up and whether sales follows through. Installing the tool does not produce them.

1. **A knowledge base built from your own material.** Spec sheets, a certification list with certificate names, covered models and expiry dates, standard lead-time ranges and FAQs. Your website can be the public source of truth: what the product and certification pages state, the assistant reads from the same data, so the site and the chat never disagree. On a custom Next.js site, product data, [structured data](/glossary/structured-data), the assistant's knowledge base and the CRM can all be generated from one dataset. For what a product page should state, see our [product page checklist](/insights/ai-supplier-search-product-page-checklist); for platform choices, see [when a B2B site needs a custom build](/insights/b2b-website-platform-choice).
2. **An owner for every kind of material.** Who edits specs, who removes an expired certificate, who keeps lead-time ranges current. An expired certificate left in the knowledge base is worse than having no knowledge base.
3. **Handoff deadlines and cover.** For inquiries handed off overnight, name the person who picks them up and the time they reply by.
4. **Regular log reviews.** Each week, sample conversations and flag wrong answers, missed handoffs and missing material, then fix the knowledge base or the rules.

If you sell into the EU, there is also a disclosure duty. The European Commission's AI Act overview says that people using AI systems such as chatbots should be made aware they are interacting with a machine, and that the transparency rules apply from August 2026 ([European Commission](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)). The simple fix is an opening line such as "This is an AI assistant; complex questions go to our sales team." Rules differ in other markets, so take legal advice on your specific case.

## Common mistakes

- **Expecting the auto-reply to close deals.** It catches and organises inquiries. Deals come from the quote and follow-up sales sends the next day. A reply rate on its own tells you little.
- **Letting the AI give a rough price.** To a buyer, a rough number is a quote, and it is hard to walk back.
- **Loading the material once and never updating it.** Products change, certificates expire and lead times move. A stale knowledge base produces confident, outdated answers.
- **Not tracking the human handoff.** You should be able to see whether each handed-off inquiry got a reply and how long it took. A handoff nobody picks up damages trust more than no reply at all.

## How we run our own assistant

The AI pre-sales advisor on this site follows the same rules. Its instructions forbid quoting any amount and tell it to say when it does not know and point visitors to a planning session. If the model call fails, it falls back to fixed keyword-matched answers instead of improvising. This describes our own website, not results from a client project.

To set up first responses, inquiry capture and handoff rules, see what our [AI customer service and system integration](/services/ai-customer-service) work includes. Some buyers ask an AI assistant to find suppliers before they send an inquiry. To see how AI describes your company today, start with an [AI visibility audit](/audit).`,
    faqs: [
      {
        q: 'Can export inquiries be handled entirely by an AI auto-reply?',
        a: 'No. AI suits the first response, answers from verified material and capturing inquiry details. Prices, lead times, custom work, contracts and complaints need a salesperson or engineer.',
      },
      {
        q: 'When should an AI auto-reply hand off to a person?',
        a: 'When the question involves price, a delivery commitment, a contract or a claim; when the knowledge base has nothing relevant; when the question stays vague after one follow-up; or when the buyer asks for a human.',
      },
      {
        q: 'What belongs in the knowledge base?',
        a: 'Material your company maintains and has approved: spec sheets, a certification list with covered models and expiry dates, standard lead-time ranges and FAQs. Each kind of material needs a named owner.',
      },
      {
        q: 'Will an AI auto-reply improve inquiry conversion?',
        a: 'Not on its own. It depends on how complete the material is, how quickly handoffs are picked up and whether sales follows through, so review conversation logs and follow-up records after launch.',
      },
    ],
  },
};
