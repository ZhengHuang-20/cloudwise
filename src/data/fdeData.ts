// FDE 驻场服务的方法论内容：三层建设、每周闭环与离场设计。
// 服务页的三层图、体验页的「FDE 的一周」共用这里的数据；AI 顾问的知识库（server.ts）与课程 E、术语表中的同类表述需保持一致。

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

/** 体验页示例：一个场景走完一轮闭环，三层各往前走一步 */
export const FDE_WEEK_EXAMPLE: { loop: string; when: string; layer: string; desc: string }[] = [
  {
    loop: '观察',
    when: '周一 ~ 周二',
    layer: '标准化',
    desc: '跟岗三位业务员，看他们怎样判断一封询盘值不值得跟；用 AI 从近三个月的询盘邮件里归纳出分级规则初稿。',
  },
  {
    loop: '原型',
    when: '周三',
    layer: '信息化',
    desc: '把分级规则变成 CRM 里的意向字段，接通独立站表单与询盘邮箱，新询盘自动入库。',
  },
  {
    loop: '试用',
    when: '周四',
    layer: '智能化',
    desc: 'AI 按规则给新询盘打上高、中、低意向，业务员逐条确认或纠正。',
  },
  {
    loop: '沉淀',
    when: '周五',
    layer: '标准化',
    desc: '把纠正过的案例写回规则和评测集，出一页周报，与业务负责人定下周的场景。',
  },
];

export const FDE_WEEK_OUTPUTS = ['询盘分级规则第一版，写进 SOP', 'CRM 意向字段与询盘自动入库', 'AI 自动打标与首批评测样本'];

