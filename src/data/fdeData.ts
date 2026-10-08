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
