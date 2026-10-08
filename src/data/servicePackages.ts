import { SHOW_FDE } from '../lib/features';
import type { Bi } from '../context/LanguageContext';

export interface ServicePackage {
  id: string;
  name: Bi;
  tagline: Bi;
  solvesFrictions: Bi[];
  durationWeeks: [number, number];
  isPopular?: boolean;
  coreDeliverables: Bi[];
  teamComposition: Bi[];
}

// 五个卡点的双语名称（与 src/data/coursesData.ts 的 frictionPoint 对应）
const READ: Bi = { zh: '读不懂', en: 'Hard to read' };
const SEE: Bi = { zh: '看不见', en: 'Invisible' };
const TRUST: Bi = { zh: '不被信', en: 'Not trusted' };
const REPLY: Bi = { zh: '接不住', en: "Can't keep up" };
const CONNECT: Bi = { zh: '连不上', en: 'Not connected' };

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'package-starter',
    name: { zh: '起步深度诊断包', en: 'Starter diagnosis package' },
    tagline: {
      zh: '找出五个卡点里哪几个最薄弱，得到一份书面诊断',
      en: 'Find which of the five bottlenecks is weakest, and get a written diagnosis',
    },
    solvesFrictions: [{ zh: '五个卡点全面摸排', en: 'A full check of all five bottlenecks' }],
    durationWeeks: [1, 2],
    coreDeliverables: [
      { zh: '五个卡点的诊断报告', en: 'Diagnosis report on the five bottlenecks' },
      { zh: 'AI 可见性（ChatGPT / Perplexity）30 组探针实测明细', en: 'AI visibility (ChatGPT / Perplexity) results from 30 live probe sets' },
      { zh: '现有官网技术 SEO 与 Core Web Vitals 缺陷清单', en: 'List of technical SEO and Core Web Vitals defects on the current site' },
      { zh: '60 分钟 1 对 1 诊断会', en: '60-minute one-to-one diagnosis session' },
    ],
    teamComposition: [
      { zh: '资深售前架构师 1 人', en: '1 senior pre-sales architect' },
      { zh: 'GEO 评测分析师 1 人', en: '1 GEO evaluation analyst' },
    ],
  },
  {
    id: 'package-single',
    name: { zh: '单项专项突破', en: 'Single-service breakthrough' },
    tagline: {
      zh: '只解决一个环节，例如独立站重构或智能客服',
      en: 'Solve one link only, such as a website rebuild or smart customer service',
    },
    solvesFrictions: [{ zh: '按选定服务定制', en: 'Tailored to the chosen service' }],
    durationWeeks: [4, 8],
    coreDeliverables: [
      { zh: '所选服务的完整交付物', en: 'Full deliverables for the chosen service' },
      { zh: '按服务内容：系统接口对接，或公开来源建设', en: 'Depending on scope: system interface integration, or building public sources' },
      { zh: '团队使用培训与源码/文档移交', en: 'Team training, and handover of source code and documents' },
    ],
    teamComposition: [
      { zh: '项目经理 1 人', en: '1 project manager' },
      { zh: '专项工程师 1-2 人', en: '1–2 specialist engineers' },
    ],
  },
  {
    id: 'package-acquisition',
    name: { zh: '获客增长组合（独立站 + SEO + GEO）', en: 'Lead-growth package (website + SEO + GEO)' },
    tagline: {
      zh: '把建站、搜索和 AI 推荐放在同一套资料上做，让海外买家找得到、读得懂、信得过',
      en: 'Build the website, search and AI recommendations on one set of material, so overseas buyers can find you, read you and trust you',
    },
    solvesFrictions: [READ, SEE, TRUST],
    durationWeeks: [8, 12],
    isPopular: true,
    coreDeliverables: [
      { zh: '三读者架构的海外独立站（含多语种与 CDN 加速）', en: 'Three-reader overseas website (multilingual, with CDN acceleration)' },
      { zh: '60 组 Google 英文核心词库与对应内容', en: '60 English Google core keyword groups, with matching content' },
      { zh: '海外决策者研究、年度技术白皮书与第三方来源规划', en: 'Research on overseas decision-makers, an annual technical white paper and a third-party source plan' },
      { zh: '每月 AI 可见性复测报告，并据此调整', en: 'Monthly AI visibility re-test reports, with adjustments based on them' },
    ],
    teamComposition: [
      { zh: '出海解决方案架构师 1 人', en: '1 export solutions architect' },
      { zh: '独立站全栈工程师 1 人', en: '1 full-stack website engineer' },
      { zh: '海外母语内容总监 1 人', en: '1 overseas native-language content director' },
      { zh: 'GEO 算法专家 1 人', en: '1 GEO algorithm specialist' },
    ],
  },
  {
    id: 'package-full',
    name: SHOW_FDE
      ? { zh: '整体全案服务（五项全做 + FDE 驻场）', en: 'Full-service package (all five services + FDE on-site)' }
      : { zh: '整体全案服务（获客 + AI 客服 + 系统对接）', en: 'Full-service package (lead generation + AI customer service + system integration)' },
    tagline: SHOW_FDE
      ? {
          zh: '从获客、转化到企业内部的标准化、信息化、智能化，由 FDE 驻场落地',
          en: 'From lead generation and conversion to standardisation, digitisation and intelligence inside the company, delivered on site by FDEs',
        }
      : {
          zh: '从获客、转化到企业 CRM、ERP 系统对接，一次覆盖',
          en: 'From lead generation and conversion to CRM and ERP integration, all in one',
        },
    solvesFrictions: [SEE, READ, TRUST, REPLY, CONNECT],
    durationWeeks: [12, 16],
    coreDeliverables: [
      { zh: '独立站、SEO、GEO 全部交付', en: 'Website, SEO and GEO all delivered' },
      { zh: '7×24 小时 AI 智能客服与企业知识库建设', en: 'Build 24/7 AI customer service and the company knowledge base' },
      { zh: '对接企业 CRM、ERP、邮件与企业微信/钉钉', en: 'Integration with the CRM, ERP, email, WeCom and DingTalk' },
      SHOW_FDE
        ? {
            zh: 'FDE 驻场推进三层建设，每周交付可用成果，源码与数据全部归企业所有',
            en: 'FDE on-site three-layer build, with usable results every week, and source code and data all owned by the company',
          }
        : {
            zh: '每周迭代交付可用成果，源码与数据全部归企业所有',
            en: 'Weekly delivery of usable results, with source code and data all owned by the company',
          },
    ],
    teamComposition: [
      { zh: '首席出海架构师 1 人', en: '1 chief export architect' },
      SHOW_FDE ? { zh: '全栈 FDE 驻场工程师 2 人', en: '2 full-stack FDE on-site engineers' } : { zh: '全栈交付工程师 2 人', en: '2 full-stack delivery engineers' },
      { zh: '内容与合规顾问 1 人', en: '1 content and compliance adviser' },
      { zh: '交付项目总监 1 人', en: '1 delivery project director' },
    ],
  },
];

/** 配置器里的渠道与系统选项：内部以中文作为值，英文界面显示英文 */
export const OPTION_EN: Record<string, string> = {
  官网在线窗口: 'Website chat',
  海外官方邮件: 'Overseas business email',
  'WhatsApp 业务号': 'WhatsApp Business',
  'LinkedIn 私信': 'LinkedIn messages',
  企业微信: 'WeCom',
  钉钉: 'DingTalk',
  '标准CRM/Excel': 'Standard CRM / Excel',
  Salesforce: 'Salesforce',
  ERP: 'ERP',
};

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
export const buildProposalPlan = (input: ConfiguratorInput, lang: 'zh' | 'en' = 'zh') => {
  const tx = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const optionLabel = (value: string) => (lang === 'en' ? OPTION_EN[value] ?? value : value);

  let minWeeks = 4;
  let maxWeeks = 8;
  const milestones: { week: string; title: string; task: string }[] = [];
  const deliverables: string[] = [];

  if (input.packageType === 'package-starter') {
    minWeeks = 1;
    maxWeeks = 2;
    deliverables.push(
      tx('五个卡点诊断报告', 'Diagnosis report on the five bottlenecks'),
      tx('AI 可见性探针明细', 'AI visibility probe details'),
      tx('技术 SEO 缺陷清单', 'Technical SEO defect list'),
      tx('60 分钟诊断会', '60-minute diagnosis session')
    );
    milestones.push(
      {
        week: tx('第 1 周', 'Week 1'),
        title: tx('测试与数据收集', 'Testing and data collection'),
        task: tx('无记忆会话提问各大模型，抓取官网技术数据', 'Ask the major models in fresh, memory-free sessions, and collect technical data from the website'),
      },
      {
        week: tx('第 2 周', 'Week 2'),
        title: tx('诊断会', 'Diagnosis session'),
        task: tx('出具诊断报告，并召开 60 分钟诊断会', 'Issue the diagnosis report and hold a 60-minute diagnosis session'),
      }
    );
  } else if (input.packageType === 'package-acquisition') {
    minWeeks = 8;
    maxWeeks = 12;

    if (input.geoAnnualContentCount > 50) {
      maxWeeks += 2;
    }

    deliverables.push(
      tx(
        `三读者架构独立站（${input.siteSkus} 款产品、${input.languagesCount} 个语种）`,
        `Three-reader website (${input.siteSkus} products, ${input.languagesCount} languages)`
      ),
      tx(
        `围绕 ${input.seoKeywordsGroups} 组核心外贸关键词建立的页面与内容体系`,
        `Pages and content built around ${input.seoKeywordsGroups} core export keyword groups`
      ),
      tx(
        `针对 ${input.geoDecisionPersonas} 类海外决策者的研究，与 ${input.geoAnnualContentCount} 项年度内容规划`,
        `Research on ${input.geoDecisionPersonas} types of overseas decision-makers, with a ${input.geoAnnualContentCount}-item annual content plan`
      ),
      tx('多平台来源建设与月度 AI 可见性复测看板', 'Multi-platform source building and a monthly AI visibility re-test dashboard')
    );

    milestones.push(
      {
        week: tx('第 1-3 周', 'Weeks 1–3'),
        title: tx('海外买家建模与架构设计', 'Overseas buyer modelling and architecture design'),
        task: tx('还原海外采购商意图，设计三读者网站地图与关键词映射', 'Reconstruct overseas buyers’ intent, and design the three-reader sitemap and keyword mapping'),
      },
      {
        week: tx('第 4-7 周', 'Weeks 4–7'),
        title: tx('独立站开发与权威内容创作', 'Website build and authoritative content'),
        task: tx('搭建多语种高性能站点，创作行业英文白皮书与合规对比表', 'Build a fast multilingual site, and write English industry white papers and compliance comparison tables'),
      },
      {
        week: tx('第 8-10 周', 'Weeks 8–10'),
        title: tx('技术 SEO 校验与信源铺设', 'Technical SEO checks and source building'),
        task: tx('Schema 结构化标记部署，学术平台与行业媒体来源', 'Deploy Schema markup, and build sources on academic platforms and trade media'),
      },
      {
        week: tx('第 11-12 周', 'Weeks 11–12'),
        title: tx('上线部署与月度 GEO 监测', 'Launch and monthly GEO monitoring'),
        task: tx('全站上线，开始每月 AI 可见性复测并出具首期月报', 'Launch the full site, begin monthly AI visibility re-tests and issue the first monthly report'),
      }
    );
  } else if (input.packageType === 'package-full') {
    minWeeks = 12;
    maxWeeks = 16;

    const channels = input.inquiryChannels.map(optionLabel).join('/');
    const systems = input.integratedSystems.map(optionLabel).join('/');
    deliverables.push(
      tx(
        `全功能海外独立站（${input.siteSkus} 款产品、${input.languagesCount} 个语种）+ ${input.seoKeywordsGroups} 组 SEO 核心词 + ${input.geoDecisionPersonas} 类决策者 GEO 建模`,
        `Full-feature overseas website (${input.siteSkus} products, ${input.languagesCount} languages) + ${input.seoKeywordsGroups} SEO core keyword groups + GEO modelling for ${input.geoDecisionPersonas} decision-maker types`
      ),
      tx(`7×24 小时 AI 智能客服（支持接入 ${channels}）`, `24/7 AI customer service (connected to ${channels})`),
      tx(`企业现有系统打通（对接 ${systems}）`, `Integration with existing company systems (connected to ${systems})`),
      ...(SHOW_FDE
        ? [
            tx(
              'FDE 驻场三层建设：业务标准、系统打通与 AI 场景（每周“观察-原型-试用-沉淀”）',
              'FDE on-site three-layer build: business standards, system integration and AI scenarios (a weekly observe–prototype–trial–consolidate cycle)'
            ),
          ]
        : []),
      ...(input.needPrivateDeploy
        ? [tx('知识库与业务数据私有化部署到企业自有服务器', 'Knowledge base and business data deployed privately on the company’s own servers')]
        : []),
      tx('源码、知识库与数据全部移交', 'Source code, knowledge base and data all handed over')
    );

    milestones.push(
      SHOW_FDE
        ? {
            week: tx('第 1-2 周', 'Weeks 1–2'),
            title: tx('驻场跟岗与标准梳理', 'On-site shadowing and standards mapping'),
            task: tx('FDE 跟岗销售与客服，用 AI 归纳报价与询盘分级规则，完成知识资产盘点', 'FDE engineers shadow sales and customer service, use AI to distil quoting and enquiry-grading rules, and take stock of knowledge assets'),
          }
        : {
            week: tx('第 1-2 周', 'Weeks 1–2'),
            title: tx('业务梳理与知识盘点', 'Process review and knowledge audit'),
            task: tx('梳理销售与客服的报价链路，完成知识资产盘点', 'Map the quoting flow of sales and customer service, and take stock of knowledge assets'),
          },
      {
        week: tx('第 3-6 周', 'Weeks 3–6'),
        title: tx('获客前端与原型验证', 'Front-end lead capture and prototype validation'),
        task: tx('同步启动独立站重构与 AI 客服沙盒测试，一线业务员试用', 'Start the website rebuild and the AI customer service sandbox in parallel, and let frontline salespeople trial them'),
      },
      {
        week: tx('第 7-10 周', 'Weeks 7–10'),
        title: tx('系统对接与知识库微调', 'System integration and knowledge base tuning'),
        task: tx('打通 CRM/ERP 接口，多语种客服上线并开展压力测试', 'Connect the CRM and ERP interfaces, launch multilingual customer service and run load tests'),
      },
      {
        week: tx('第 11-14 周', 'Weeks 11–14'),
        title: tx('全域联动与安全合规', 'Cross-channel integration, security and compliance'),
        task: tx('GEO 权威内容铺设，安全与合规检查，全量业务切换', 'Lay GEO authority content, run security and compliance checks, and switch all business over'),
      },
      SHOW_FDE
        ? {
            week: tx('第 15-16 周', 'Weeks 15–16'),
            title: tx('能力移交与离场', 'Handover and exit'),
            task: tx('移交源码、数据与文档，内部 AI 骨干接手日常运营，FDE 转为顾问', 'Hand over source code, data and documents. Internal AI leads take over day-to-day operations, and the FDE becomes an adviser'),
          }
        : {
            week: tx('第 15-16 周', 'Weeks 15–16'),
            title: tx('团队交接与持续运维', 'Team handover and ongoing operations'),
            task: tx('移交源码、数据与文档，完成管理员与业务员培训', 'Hand over source code, data and documents, and train administrators and salespeople'),
          }
    );
  } else {
    // Single
    minWeeks = 4;
    maxWeeks = 8;
    deliverables.push(
      tx('按需定制的单项服务专业交付物', 'Tailored professional deliverables for the single service you choose'),
      tx('系统部署与培训移交', 'System deployment and training handover')
    );
    milestones.push(
      {
        week: tx('第 1-2 周', 'Weeks 1–2'),
        title: tx('需求确认与架构梳理', 'Requirements and architecture review'),
        task: tx('确认要解决的一个问题和验收标准', 'Confirm the one problem to solve and the acceptance criteria'),
      },
      {
        week: tx('第 3-6 周', 'Weeks 3–6'),
        title: tx('实施与联调', 'Implementation and integration'),
        task: tx('开发、联调与部署', 'Development, integration testing and deployment'),
      },
      {
        week: tx('第 7-8 周', 'Weeks 7–8'),
        title: tx('上线与交接', 'Launch and handover'),
        task: tx('上线，并移交文档', 'Go live, and hand over the documents'),
      }
    );
  }

  return {
    timelineWeeks: tx(`${minWeeks} ~ ${maxWeeks} 周`, `${minWeeks} ~ ${maxWeeks} weeks`),
    deliverables,
    milestones,
    note:
      input.packageType === 'package-acquisition' || input.packageType === 'package-full'
        ? tx(
            '组合方案全站共用同一套企业知识资产，独立站、SEO 与 GEO 的内容可以相互复用。',
            'Combined packages share one set of company knowledge assets across the whole site, so website, SEO and GEO content can be reused across them.'
          )
        : tx(
            '单项先解决最紧急的一个卡点；以后需要扩展，可以并入组合方案。',
            'A single service solves the most urgent bottleneck first. If you expand later, it can be folded into a combined package.'
          ),
  };
};
