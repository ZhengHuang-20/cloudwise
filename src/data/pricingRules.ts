export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  solvesFrictions: string[];
  basePriceRange: [number, number]; // in 万 RMB
  durationWeeks: [number, number];
  isPopular?: boolean;
  coreDeliverables: string[];
  teamComposition: string[];
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'package-starter',
    name: '起步深度诊断包',
    tagline: '摸清五大断点薄弱项，获得定制出海获客诊断书',
    solvesFrictions: ['全断点摸排'],
    basePriceRange: [0, 0.98],
    durationWeeks: [1, 2],
    coreDeliverables: [
      '企业出海五断点深度雷达体检报告',
      'AI 可见性（ChatGPT / Perplexity）30 组探针实测明细',
      '现有官网技术 SEO 与 Core Web Vitals 缺陷清单',
      '1 对 1 专家 60 分钟闭门诊断会'
    ],
    teamComposition: ['资深售前架构师 1 人', 'GEO 评测分析师 1 人']
  },
  {
    id: 'package-single',
    name: '单项专项突破',
    tagline: '针对单一薄弱环节（如独立站重构或智能客服）专项攻坚',
    solvesFrictions: ['按选定服务定制'],
    basePriceRange: [6, 20],
    durationWeeks: [4, 8],
    coreDeliverables: [
      '选定单项服务的完整工业级落地交付物',
      '标准 API 接口对接或信源铺设',
      '团队使用培训与源码/文档移交'
    ],
    teamComposition: ['项目经理 1 人', '专项工程师 1-2 人']
  },
  {
    id: 'package-acquisition',
    name: '获客增长组合（独立站 + SEO + GEO）',
    tagline: '打通“建站-搜索-AI推荐”全域公域流量，建立国际权威品牌',
    solvesFrictions: ['读不懂', '看不见', '不被信'],
    basePriceRange: [22, 38],
    durationWeeks: [8, 12],
    isPopular: true,
    coreDeliverables: [
      '全新三读者海外高转化独立站（含多语种与 CDN 全球加速）',
      '60 组高商业价值 Google 英文核心词库与内容集群',
      '海外决策者建模、年度权威技术白皮书与信源矩阵',
      '每月 AI 可见性多平台自动化监测报告与持续迭代'
    ],
    teamComposition: ['出海解决方案架构师 1 人', '独立站全栈工程师 1 人', '海外母语内容总监 1 人', 'GEO 算法专家 1 人']
  },
  {
    id: 'package-full',
    name: '整体全案服务（五项全做 + FDE 驻场）',
    tagline: '从获客、转化到企业内部的标准化、信息化、智能化，由 FDE 驻场落地',
    solvesFrictions: ['看不见', '读不懂', '不被信', '接不住', '连不上'],
    basePriceRange: [42, 68],
    durationWeeks: [12, 16],
    coreDeliverables: [
      '独立站 + SEO + GEO 获客三驾马车全量交付',
      '7×24 小时 AI 智能客服深度微调与企业私域知识库建设',
      '打通企业 CRM、ERP、邮件与企业微信/钉钉直连链路',
      'FDE 驻场推进三层建设，每周交付可用成果，源码与数据全部归企业所有'
    ],
    teamComposition: ['首席出海架构师 1 人', '全栈 FDE 驻场工程师 2 人', '内容与合规顾问 1 人', '交付项目总监 1 人']
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

export const calculateProposalEstimate = (input: ConfiguratorInput) => {
  let minPrice = 0;
  let maxPrice = 0;
  let minWeeks = 4;
  let maxWeeks = 8;
  const milestones: { week: string; title: string; task: string }[] = [];
  const deliverables: string[] = [];

  if (input.packageType === 'package-starter') {
    minPrice = 0;
    maxPrice = 0.98;
    minWeeks = 1;
    maxWeeks = 2;
    deliverables.push('五断点体检报告', 'AI 可见性探针明细', '技术 SEO 缺陷清单', '60分钟专家诊断会');
    milestones.push(
      { week: '第 1 周', title: '探针测试与数据抓取', task: '无记忆会话提问各大模型，抓取官网技术数据' },
      { week: '第 2 周', title: '专家解读会', task: '出具完整诊断书并召开 60 分钟闭门复盘会' }
    );
  } else if (input.packageType === 'package-acquisition') {
    minPrice = 22;
    maxPrice = 36;
    minWeeks = 8;
    maxWeeks = 12;

    // Adjust by scale
    if (input.siteSkus > 100) {
      minPrice += 2;
      maxPrice += 3;
    }
    if (input.languagesCount > 2) {
      minPrice += 2 * (input.languagesCount - 1);
      maxPrice += 3 * (input.languagesCount - 1);
    }
    if (input.geoAnnualContentCount > 50) {
      minPrice += 4;
      maxPrice += 6;
      maxWeeks += 2;
    }

    deliverables.push(
      `全新三读者架构高转化独立站（支持 ${input.languagesCount} 个语种）`,
      `覆盖 ${input.seoKeywordsGroups} 组核心外贸关键词的 Google 排名体系`,
      `针对 ${input.geoDecisionPersonas} 类海外决策者的权威建模与 ${input.geoAnnualContentCount} 项年度内容规划`,
      '多平台信源搭建与月度 AI 可见性探针跟踪看板'
    );

    milestones.push(
      { week: '第 1-3 周', title: '海外买家建模与架构设计', task: '还原海外采购商意图，设计三读者网站地图与关键词映射' },
      { week: '第 4-7 周', title: '独立站开发与权威内容创作', task: '搭建多语种高性能站点，创作行业英文白皮书与合规对比表' },
      { week: '第 8-10 周', title: '技术 SEO 校验与信源铺设', task: 'Schema 结构化标记部署，学术平台与行业媒体权威信源链接' },
      { week: '第 11-12 周', title: '上线部署与月度 GEO 监测', task: '全站上线，开启跨平台 AI 推荐探针并出具首期月报' }
    );
  } else if (input.packageType === 'package-full') {
    minPrice = 42;
    maxPrice = 65;
    minWeeks = 12;
    maxWeeks = 16;

    if (input.needPrivateDeploy) {
      minPrice += 5;
      maxPrice += 8;
    }

    deliverables.push(
      '全功能海外独立站 + SEO + GEO 获客三驾马车',
      `7×24 小时 AI 智能客服（支持接入 ${input.inquiryChannels.join('/')}）`,
      `企业现有系统打通（对接 ${input.integratedSystems.join('/')}）`,
      'FDE 驻场三层建设：业务标准、系统打通与 AI 场景（每周“观察-原型-试用-沉淀”）',
      '源码、知识库与数据资产 100% 完整移交'
    );

    milestones.push(
      { week: '第 1-2 周', title: '驻场跟岗与标准梳理', task: 'FDE 跟岗销售与客服，用 AI 归纳报价与询盘分级规则，完成知识资产盘点' },
      { week: '第 3-6 周', title: '获客前端与原型验证', task: '同步启动独立站重构与 AI 客服沙盒测试，一线业务员试用' },
      { week: '第 7-10 周', title: '系统对接与知识库微调', task: '打通 CRM/ERP 接口，多语种客服上线并开展压力测试' },
      { week: '第 11-14 周', title: '全域联动与安全合规', task: 'GEO 权威内容铺设，私有化部署合规审计，全量业务切换' },
      { week: '第 15-16 周', title: '能力移交与离场', task: '移交源码、数据与文档，内部 AI 骨干接手日常运营，FDE 转为顾问' }
    );
  } else {
    // Single
    minPrice = 8;
    maxPrice = 18;
    minWeeks = 4;
    maxWeeks = 8;
    deliverables.push('按需定制的单项服务专业交付物', '系统部署与培训移交');
    milestones.push(
      { week: '第 1-2 周', title: '需求确认与架构梳理', task: '锁定业务单点目标' },
      { week: '第 3-6 周', title: '实施与联调', task: '工程化编码与部署' },
      { week: '第 7-8 周', title: '上线与交接', task: '正式上线运行' }
    );
  }

  return {
    budgetRange: `${minPrice.toFixed(1)} ~ ${maxPrice.toFixed(1)} 万元`,
    timelineWeeks: `${minWeeks} ~ ${maxWeeks} 周`,
    deliverables,
    milestones,
    savingsExplanation: input.packageType === 'package-acquisition' || input.packageType === 'package-full'
      ? '相比分别单独采购各项服务，组合方案可节省约 15%~22% 预算，且全站共用同一套高价值企业知识资产！'
      : '单项实施可精准解决当前最紧急断点，后续扩展可无缝接入组合方案。'
  };
};
