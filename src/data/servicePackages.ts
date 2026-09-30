import { SHOW_FDE } from '../lib/features';

export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  solvesFrictions: string[];
  durationWeeks: [number, number];
  isPopular?: boolean;
  coreDeliverables: string[];
  teamComposition: string[];
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'package-starter',
    name: '起步深度诊断包',
    tagline: '找出五个卡点里哪几个最薄弱，得到一份书面诊断',
    solvesFrictions: ['五个卡点全面摸排'],
    durationWeeks: [1, 2],
    coreDeliverables: [
      '五个卡点的诊断报告',
      'AI 可见性（ChatGPT / Perplexity）30 组探针实测明细',
      '现有官网技术 SEO 与 Core Web Vitals 缺陷清单',
      '60 分钟 1 对 1 诊断会'
    ],
    teamComposition: ['资深售前架构师 1 人', 'GEO 评测分析师 1 人']
  },
  {
    id: 'package-single',
    name: '单项专项突破',
    tagline: '只解决一个环节，例如独立站重构或智能客服',
    solvesFrictions: ['按选定服务定制'],
    durationWeeks: [4, 8],
    coreDeliverables: [
      '所选服务的完整交付物',
      '按服务内容：系统接口对接，或公开来源建设',
      '团队使用培训与源码/文档移交'
    ],
    teamComposition: ['项目经理 1 人', '专项工程师 1-2 人']
  },
  {
    id: 'package-acquisition',
    name: '获客增长组合（独立站 + SEO + GEO）',
    tagline: '把建站、搜索和 AI 推荐放在同一套资料上做，让海外买家找得到、读得懂、信得过',
    solvesFrictions: ['读不懂', '看不见', '不被信'],
    durationWeeks: [8, 12],
    isPopular: true,
    coreDeliverables: [
      '三读者架构的海外独立站（含多语种与 CDN 加速）',
      '60 组 Google 英文核心词库与对应内容',
      '海外决策者研究、年度技术白皮书与第三方来源规划',
      '每月 AI 可见性复测报告，并据此调整'
    ],
    teamComposition: ['出海解决方案架构师 1 人', '独立站全栈工程师 1 人', '海外母语内容总监 1 人', 'GEO 算法专家 1 人']
  },
  {
    id: 'package-full',
    name: SHOW_FDE ? '整体全案服务（五项全做 + FDE 驻场）' : '整体全案服务（获客 + AI 客服 + 系统对接）',
    tagline: SHOW_FDE
      ? '从获客、转化到企业内部的标准化、信息化、智能化，由 FDE 驻场落地'
      : '从获客、转化到企业 CRM、ERP 系统对接，一次覆盖',
    solvesFrictions: ['看不见', '读不懂', '不被信', '接不住', '连不上'],
    durationWeeks: [12, 16],
    coreDeliverables: [
      '独立站、SEO、GEO 全部交付',
      '7×24 小时 AI 智能客服与企业知识库建设',
      '对接企业 CRM、ERP、邮件与企业微信/钉钉',
      SHOW_FDE ? 'FDE 驻场推进三层建设，每周交付可用成果，源码与数据全部归企业所有' : '每周迭代交付可用成果，源码与数据全部归企业所有'
    ],
    teamComposition: ['首席出海架构师 1 人', SHOW_FDE ? '全栈 FDE 驻场工程师 2 人' : '全栈交付工程师 2 人', '内容与合规顾问 1 人', '交付项目总监 1 人']
  }
];

export interface ConfiguratorInput {
  packageType: string;
  // 独立站参数
  sitePagesLevel: 'standard' | 'medium' | 'large'; // 10页 / 30页 / 60页+
  siteSkus: number; // 20 / 100 / 500+
  languagesCount: number; // 1 / 3 / 6+
  // SEO 参数
  seoTargetMarkets: number; // 1 / 3 / 5+
  seoKeywordsGroups: number; // 30 / 60 / 120
  // GEO 参数
  geoDecisionPersonas: number; // 2 / 4 / 7
  geoAnnualContentCount: number; // 30 / 60 / 91 (爱康医疗为91)
  // AI 客服参数
  inquiryChannels: string[]; // 官网, WhatsApp, 邮件, LinkedIn
  integratedSystems: string[]; // 无CRM, 现有CRM, ERP, 企业微信
  // FDE 参数
  needFdeOnsite: boolean;
  needPrivateDeploy: boolean;
}

// 按所选组合与规模参数生成交付规划：周期、交付物与阶段排期。站点不展示任何价格，这里也不计算费用
export const buildProposalPlan = (input: ConfiguratorInput) => {
  let minWeeks = 4;
  let maxWeeks = 8;
  const milestones: { week: string; title: string; task: string }[] = [];
  const deliverables: string[] = [];

  if (input.packageType === 'package-starter') {
    minWeeks = 1;
    maxWeeks = 2;
    deliverables.push('五个卡点诊断报告', 'AI 可见性探针明细', '技术 SEO 缺陷清单', '60 分钟诊断会');
    milestones.push(
      { week: '第 1 周', title: '测试与数据收集', task: '无记忆会话提问各大模型，抓取官网技术数据' },
      { week: '第 2 周', title: '诊断会', task: '出具诊断报告，并召开 60 分钟诊断会' }
    );
  } else if (input.packageType === 'package-acquisition') {
    minWeeks = 8;
    maxWeeks = 12;

    if (input.geoAnnualContentCount > 50) {
      maxWeeks += 2;
    }

    deliverables.push(
      `三读者架构独立站（${input.siteSkus} 款产品、${input.languagesCount} 个语种）`,
      `围绕 ${input.seoKeywordsGroups} 组核心外贸关键词建立的页面与内容体系`,
      `针对 ${input.geoDecisionPersonas} 类海外决策者的研究，与 ${input.geoAnnualContentCount} 项年度内容规划`,
      '多平台来源建设与月度 AI 可见性复测看板'
    );

    milestones.push(
      { week: '第 1-3 周', title: '海外买家建模与架构设计', task: '还原海外采购商意图，设计三读者网站地图与关键词映射' },
      { week: '第 4-7 周', title: '独立站开发与权威内容创作', task: '搭建多语种高性能站点，创作行业英文白皮书与合规对比表' },
      { week: '第 8-10 周', title: '技术 SEO 校验与信源铺设', task: 'Schema 结构化标记部署，学术平台与行业媒体来源' },
      { week: '第 11-12 周', title: '上线部署与月度 GEO 监测', task: '全站上线，开始每月 AI 可见性复测并出具首期月报' }
    );
  } else if (input.packageType === 'package-full') {
    minWeeks = 12;
    maxWeeks = 16;

    deliverables.push(
      `全功能海外独立站（${input.siteSkus} 款产品、${input.languagesCount} 个语种）+ ${input.seoKeywordsGroups} 组 SEO 核心词 + ${input.geoDecisionPersonas} 类决策者 GEO 建模`,
      `7×24 小时 AI 智能客服（支持接入 ${input.inquiryChannels.join('/')}）`,
      `企业现有系统打通（对接 ${input.integratedSystems.join('/')}）`,
      ...(SHOW_FDE ? ['FDE 驻场三层建设：业务标准、系统打通与 AI 场景（每周“观察-原型-试用-沉淀”）'] : []),
      ...(input.needPrivateDeploy ? ['知识库与业务数据私有化部署到企业自有服务器'] : []),
      '源码、知识库与数据全部移交'
    );

    milestones.push(
      SHOW_FDE
        ? { week: '第 1-2 周', title: '驻场跟岗与标准梳理', task: 'FDE 跟岗销售与客服，用 AI 归纳报价与询盘分级规则，完成知识资产盘点' }
        : { week: '第 1-2 周', title: '业务梳理与知识盘点', task: '梳理销售与客服的报价链路，完成知识资产盘点' },
      { week: '第 3-6 周', title: '获客前端与原型验证', task: '同步启动独立站重构与 AI 客服沙盒测试，一线业务员试用' },
      { week: '第 7-10 周', title: '系统对接与知识库微调', task: '打通 CRM/ERP 接口，多语种客服上线并开展压力测试' },
      { week: '第 11-14 周', title: '全域联动与安全合规', task: 'GEO 权威内容铺设，安全与合规检查，全量业务切换' },
      SHOW_FDE
        ? { week: '第 15-16 周', title: '能力移交与离场', task: '移交源码、数据与文档，内部 AI 骨干接手日常运营，FDE 转为顾问' }
        : { week: '第 15-16 周', title: '团队交接与持续运维', task: '移交源码、数据与文档，完成管理员与业务员培训' }
    );
  } else {
    // Single
    minWeeks = 4;
    maxWeeks = 8;
    deliverables.push('按需定制的单项服务专业交付物', '系统部署与培训移交');
    milestones.push(
      { week: '第 1-2 周', title: '需求确认与架构梳理', task: '确认要解决的一个问题和验收标准' },
      { week: '第 3-6 周', title: '实施与联调', task: '开发、联调与部署' },
      { week: '第 7-8 周', title: '上线与交接', task: '上线，并移交文档' }
    );
  }

  return {
    timelineWeeks: `${minWeeks} ~ ${maxWeeks} 周`,
    deliverables,
    milestones,
    note: input.packageType === 'package-acquisition' || input.packageType === 'package-full'
      ? '组合方案全站共用同一套企业知识资产，独立站、SEO 与 GEO 的内容可以相互复用。'
      : '单项先解决最紧急的一个卡点；以后需要扩展，可以并入组合方案。'
  };
};
