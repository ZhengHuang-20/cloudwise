// FDE 驻场服务的方法论内容：三层建设、每周闭环与离场设计。
// 服务页的三层图使用这里的数据；AI 顾问的知识库（server.ts）与课程 E、术语表中的同类表述需保持一致。

export interface FdeLayer {
  step: 1 | 2 | 3;
  name: string;
  motto: string;
  /** 这一层没做好时，外贸企业的典型现状 */
  pain: string;
  /** FDE 在这一层怎样用 AI 提速 */
  aiWork: string;
  /** 这一层留给企业的成果 */
  outputs: string[];
}

export const FDE_LAYERS: FdeLayer[] = [
  {
    step: 1,
    name: '标准化',
    motto: '把经验写成规则',
    pain: '报价靠老业务员心算，产品参数散在 PDF 和微信里，询盘值不值得跟全凭感觉。',
    aiWork: '跟岗访谈业务骨干，用 AI 转写录音，从历史邮件、报价单和聊天记录中归纳规则，生成初稿交业务负责人审定。',
    outputs: ['业务流程地图与 SOP', '产品参数主数据', '报价规则与询盘分级标准'],
  },
  {
    step: 2,
    name: '信息化',
    motto: '把规则装进系统',
    pain: '客户在 Excel，线索在个人邮箱和 WhatsApp，订单在 ERP，老板看不到一条完整的漏斗。',
    aiWork: '用 AI 辅助数据清洗去重、字段映射和接口脚本，把独立站表单、邮件、WhatsApp、CRM 与 ERP 接成一条线。',
    outputs: ['全渠道线索自动进 CRM', '客户与订单主数据', '权限、操作日志与管理看板'],
  },
  {
    step: 3,
    name: '智能化',
    motto: '让 AI 在系统上干活',
    pain: '没有清晰的规则和干净的数据，AI 只能做一场演示，答错了没人发现，也没人兜底。',
    aiWork: '在规则和数据之上部署 AI 客服、询盘分级、报价助手与会前商业情报，每个场景配评测集和人工复核点，按周调优。',
    outputs: ['场景化 AI 助手', '评测集与上线指标', '会前商业情报'],
  },
];

export const FDE_LOOP: { name: string; desc: string }[] = [
  { name: '观察', desc: '跟岗一线，记下真实卡点' },
  { name: '原型', desc: '当周用 AI 做出能用的原型' },
  { name: '试用', desc: '业务员拿真实询盘试用' },
  { name: '沉淀', desc: '有效做法写回标准与系统' },
];

