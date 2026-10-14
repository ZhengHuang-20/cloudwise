// FDE 驻场服务的方法论内容：三层建设、每周闭环与离场设计。
// 服务页的三层图使用这里的数据；AI 顾问的知识库（src/server/knowledge.ts）与课程 E、术语表中的同类表述需保持一致。
import type { Bi } from '../lib/i18n';

export interface FdeLayer {
  step: 1 | 2 | 3;
  name: Bi;
  motto: Bi;
  /** 这一层没做好时，外贸企业的典型现状 */
  pain: Bi;
  /** FDE 在这一层怎样用 AI 提速 */
  aiWork: Bi;
  /** 这一层留给企业的成果 */
  outputs: Bi[];
}

export const FDE_LAYERS: FdeLayer[] = [
  {
    step: 1,
    name: { zh: '标准化', en: 'Standardisation' },
    motto: { zh: '把经验写成规则', en: 'Write experience down as rules' },
    pain: {
      zh: '报价靠老业务员心算，产品参数散在 PDF 和微信里，询盘值不值得跟全凭感觉。',
      en: 'Quotes are worked out in a veteran salesperson’s head, product parameters are scattered across PDFs and WeChat, and whether an enquiry is worth chasing is a gut call.',
    },
    aiWork: {
      zh: '跟岗访谈业务骨干，用 AI 转写录音，从历史邮件、报价单和聊天记录中归纳规则，生成初稿交业务负责人审定。',
      en: 'Shadow the business team, use AI to transcribe interviews and distil rules from historical emails, quotes and chat logs, then draft them for the business lead to approve.',
    },
    outputs: [
      { zh: '业务流程地图与 SOP', en: 'Business process map and SOPs' },
      { zh: '产品参数主数据', en: 'Product parameter master data' },
      { zh: '报价规则与询盘分级标准', en: 'Pricing rules and enquiry-grading criteria' },
    ],
  },
  {
    step: 2,
    name: { zh: '信息化', en: 'Digitisation' },
    motto: { zh: '把规则装进系统', en: 'Load the rules into systems' },
    pain: {
      zh: '客户在 Excel，线索在个人邮箱和 WhatsApp，订单在 ERP，老板看不到一条完整的漏斗。',
      en: 'Customers sit in Excel, leads sit in personal mailboxes and WhatsApp, orders sit in the ERP, and the owner cannot see one complete funnel.',
    },
    aiWork: {
      zh: '用 AI 辅助数据清洗去重、字段映射和接口脚本，把独立站表单、邮件、WhatsApp、CRM 与 ERP 接成一条线。',
      en: 'Use AI to help clean and de-duplicate data, map fields and write interface scripts, connecting website forms, email, WhatsApp, the CRM and the ERP into one flow.',
    },
    outputs: [
      { zh: '全渠道线索自动进 CRM', en: 'All-channel leads flow into the CRM automatically' },
      { zh: '客户与订单主数据', en: 'Customer and order master data' },
      { zh: '权限、操作日志与管理看板', en: 'Permissions, operation logs and a management dashboard' },
    ],
  },
  {
    step: 3,
    name: { zh: '智能化', en: 'Intelligence' },
    motto: { zh: '让 AI 在系统上干活', en: 'Let AI work on the systems' },
    pain: {
      zh: '没有清晰的规则和干净的数据，AI 只能做一场演示，答错了没人发现，也没人兜底。',
      en: 'Without clear rules and clean data, AI can only put on a demo. When it gets something wrong, nobody notices and nobody catches it.',
    },
    aiWork: {
      zh: '在规则和数据之上部署 AI 客服、询盘分级、报价助手与会前商业情报，每个场景配评测集和人工复核点，按周调优。',
      en: 'On top of the rules and data, deploy AI customer service, enquiry grading, quotation assistants and pre-meeting business intelligence. Every scenario has an evaluation set and human review points, and is tuned weekly.',
    },
    outputs: [
      { zh: '场景化 AI 助手', en: 'Scenario-based AI assistants' },
      { zh: '评测集与上线指标', en: 'Evaluation sets and launch metrics' },
      { zh: '会前商业情报', en: 'Pre-meeting business intelligence' },
    ],
  },
];

export const FDE_LOOP: { name: Bi; desc: Bi }[] = [
  { name: { zh: '观察', en: 'Observe' }, desc: { zh: '跟岗一线，记下真实卡点', en: 'Shadow the front line and note real bottlenecks' } },
  { name: { zh: '原型', en: 'Prototype' }, desc: { zh: '当周用 AI 做出能用的原型', en: 'Build a usable AI prototype within the week' } },
  { name: { zh: '试用', en: 'Trial' }, desc: { zh: '业务员拿真实询盘试用', en: 'Salespeople trial it on real enquiries' } },
  { name: { zh: '沉淀', en: 'Consolidate' }, desc: { zh: '有效做法写回标准与系统', en: 'Write what works back into standards and systems' } },
];

/** 创始人介绍（关于我们页）。项目只写已确认的事实；规模、成果等数据确认后再补 */
export const FOUNDER = {
  name: { zh: '黄拯', en: 'Huang Zheng' },
  title: { zh: '创始人 · 系统架构师', en: 'Founder · Systems architect' },
  intro: {
    zh: '12 年企业系统建设经验。先后在保险、支付、电商平台和教育出海领域主导过多个从 0 到 1 的系统，从需求梳理、架构设计到上线运营全程负责。',
    en: '12 years of building enterprise systems. He has led several zero-to-one systems in insurance, payments, e-commerce platforms and education going global, owning everything from requirements and architecture to launch and operations.',
  },
  projects: [
    {
      name: { zh: '泰康 · 经纪人小程序（0 到 1）', en: 'Taikang · agent mini-program (0 to 1)' },
      desc: {
        zh: '在强监管的保险行业，为经纪人搭建展业系统。客户信息高度敏感，每一项功能都要先过合规这一关。',
        en: 'A sales system for insurance agents in a heavily regulated industry. Customer information is highly sensitive, so every feature had to clear compliance first.',
      },
    },
    {
      name: { zh: '贝壳 · 钱包运营自动化系统（0 到 1）', en: 'Beike · wallet operations automation (0 to 1)' },
      desc: {
        zh: '系统直接处理资金流转。账务不能错，权限要分清，每一笔操作都要可追溯。',
        en: 'The system handles money movement directly. Accounting must be exact, permissions clearly separated, and every operation traceable.',
      },
    },
    {
      name: { zh: '快手 · 商户系统低代码自动化（0 到 1）', en: 'Kuaishou · merchant-system low-code automation (0 to 1)' },
      desc: {
        zh: '把复杂多变的商户业务抽象成可配置的规则和流程，业务人员自己改配置，不必每次排期找开发。',
        en: 'Complex, changing merchant operations were abstracted into configurable rules and workflows, so business staff change configuration themselves instead of queuing for developers.',
      },
    },
    {
      name: { zh: '教育软件出海（多次 0 到 1）', en: 'Education software going global (several 0-to-1 builds)' },
      desc: {
        zh: '从海外用户的视角设计产品，处理多语言、海外部署和当地数据合规要求。',
        en: 'Products designed from the overseas user’s point of view, handling multiple languages, overseas deployment and local data-compliance requirements.',
      },
    },
  ] as { name: Bi; desc: Bi }[],
  common: {
    zh: '这些项目有一个共同点：业务在跑，系统要换；用户是真人，数据不能出错。今天我们为出海制造企业做的，是同一件事。',
    en: 'These projects share one trait: the business keeps running while the system is replaced, users are real people, and the data cannot be wrong. What we do for exporting manufacturers today is the same job.',
  } as Bi,
};

/** FDE 服务页「为什么是我们」 */
export const FDE_WHY: { title: Bi; body: Bi }[] = [
  {
    title: { zh: '创始人亲自驻场', en: 'The founder is on site himself' },
    body: {
      zh: '好的 FDE 要同时懂业务、懂系统、懂 AI，这样的人本身就具备创业者的素质。所以我们不外派新人，由创始人带队驻场，用老板的视角算每一笔投入能换回什么。',
      en: 'A good FDE has to understand the business, the systems and AI at once, and such a person already thinks like an entrepreneur. So we do not send newcomers: the founder leads the on-site team and weighs what every investment will bring back from the owner’s point of view.',
    },
  },
  {
    title: { zh: '业务不停，系统换新', en: 'The business keeps running while systems are renewed' },
    body: {
      zh: '企业的智能化改造，像开着飞机换引擎。报价、接单、发货一天都不能停。我们的做法是：新旧系统并行试运行，按业务线分批切换，每一步都能回滚，旺季不动核心流程。',
      en: 'Making a company intelligent is like changing the engine in flight: quoting, order intake and shipping cannot stop for a day. We run old and new systems in parallel, switch business line by business line, keep every step reversible, and leave core processes alone in peak season.',
    },
  },
  {
    title: { zh: '交付的是能长期运行的系统，不是演示', en: 'We deliver a system that runs for the long term, not a demo' },
    body: {
      zh: '系统是企业日后按标准运营的工具，所以交付清单写得很具体：源码、架构文档、运维手册、监控告警和交接培训，全部归企业所有。离场后由企业内部骨干接手，我们转为顾问。',
      en: 'The system is the tool the company will operate by its standards, so the handover list is specific: source code, architecture documents, operations manual, monitoring and alerts, and handover training, all owned by the company. After we leave, your internal leads take over and we become advisers.',
    },
  },
  {
    title: { zh: '数据安全，按处理资金和保险数据的标准来做', en: 'Data security at the standard used for money and insurance data' },
    body: {
      zh: '客户名单、报价和成本是外贸企业的核心资产。我们沿用在保险和支付系统中的做法：最小权限，开发与生产环境隔离，操作全程留痕；敏感数据可以私有化部署；涉及海外买家个人信息时，按 GDPR 等当地法规处理。',
      en: 'Customer lists, quotes and costs are an exporter’s core assets. We carry over the practice from insurance and payment systems: least privilege, development and production kept apart, every operation logged; sensitive data can be deployed privately; and overseas buyers’ personal information is handled under GDPR and other local rules.',
    },
  },
];
