import { SHOW_FDE } from '../lib/features';
import { GLOSSARY_EN } from './en/glossary';

export interface GlossaryTerm {
  id: string;
  term: string;
  englishTerm: string;
  category: 'SEO/GEO' | '技术底座' | '交付与架构' | '智能客服';
  questionTitle: string; // 问句式标题
  oneLineDefinition: string; // 一句话直答
  detailedExplanation: string;
  realWorldExample: string;
  commonPitfalls: string[];
  relatedTerms: string[];
  relatedLessonId?: string;
  schemaType: 'DefinedTerm';
}

const ALL_GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'term-geo',
    term: 'GEO (生成式引擎优化)',
    englishTerm: 'Generative Engine Optimization',
    category: 'SEO/GEO',
    questionTitle: '什么是出海 GEO（生成式引擎优化）？',
    oneLineDefinition: 'GEO 是把企业资料整理成 AI 能查证、愿意引用的公开来源，提高 ChatGPT、Perplexity、Gemini 等在回答海外采购问题时提到你的机会。',
    detailedExplanation: `不同于传统 SEO 仅关注关键词在搜索结果列表中的排序，GEO 面向的是能综合多个来源生成回答的大语言模型。大模型在面对“推荐几家亚洲高质量骨科植入物供应商”等采购问题时，会基于训练数据及实时检索结果，抓取具备明确定义、可信数值表格与权威第三方引用的实体知识。GEO 就是通过决策者建模、技术白皮书、行业权威信源铺设与月度监测，让 AI 在回答时引用你的资料。`,
    realWorldExample: '爱康医疗通过 GEO 实施，在 ChatGPT 与 Perplexity 提问亚洲 3D 打印多孔钛骨科耗材时，从最初没有被提及，变为在多次测试中位于前三位，并附上技术指南链接。',
    commonPitfalls: [
      '误以为 GEO 是通过黑客手段给大模型“投毒”或刷单，合规的 GEO 必须建立在真实公开的权威技术证据链上。',
      '以为只要在官网用 AI 批量生成成百上千篇低质文章就能提升 GEO，实际上低质洗稿文章会被搜索引擎降权，AI 同样拒绝引用。'
    ],
    relatedTerms: ['SEO', 'RAG', 'AI Overview', 'E-E-A-T'],
    relatedLessonId: 'lesson-c-1-1',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-fde',
    term: 'FDE (前线部署工程师)',
    englishTerm: 'Forward Deployed Engineer',
    category: '交付与架构',
    questionTitle: '什么是 FDE（前线部署工程师）？',
    oneLineDefinition: 'FDE 是驻场在企业业务一线、对业务结果负责的工程师：用 AI 把一线经验写成标准、把标准装进系统，再让 AI 在系统上执行，离场时把能力留给企业。',
    detailedExplanation: `FDE 诞生于 Palantir，内部分为懂行业的 Echo 与写代码的 Delta：普通工程师把一个功能做给很多客户，FDE 为一个客户把很多能力做通。2024 年后，OpenAI、Anthropic 等 AI 公司相继组建 FDE 团队，因为企业 AI 项目卡住的往往不是模型，而是模型进不了真实的流程、数据和系统。对中国外贸企业，这个问题更靠前：很多流程写在老业务员的经验和微信聊天里，而不在系统里。所以 FDE 自下而上推进三层建设：先标准化（把经验写成规则），再信息化（把规则装进系统），最后智能化（让 AI 在系统上干活）。每一层都用 AI 提速，每周一轮“观察-原型-试用-沉淀”，离场时标准、系统、数据和会用的人都留在企业。`,
    realWorldExample: '示例：驻场第一周，FDE 发现业务员判断询盘值不值得跟全凭经验。于是用 AI 从近三个月的询盘邮件中归纳出分级规则，经销售总监审定后写进 CRM 意向字段，再让 AI 按规则给新询盘自动打标，业务员只需确认或纠正，纠正过的案例每周写回规则。',
    commonPitfalls: [
      '把 FDE 当成驻场外包或人力派遣。外包对需求文档负责，FDE 对业务结果负责，并要把能力留给企业。',
      '跳过标准化和信息化直接上 AI。没有清晰的规则和干净的数据，AI 只能做演示，上线后答错了没人兜底。',
      '只让 IT 部门对接 FDE。业务负责人和一线业务员不参与每周的试用与拍板，做出来的系统没人用。'
    ],
    relatedTerms: ['知识资产', '敏捷原型', '私有化部署'],
    relatedLessonId: 'lesson-e-1-1',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-eeat',
    term: 'E-E-A-T 质量框架',
    englishTerm: 'Experience, Expertise, Authoritativeness, Trustworthiness',
    category: 'SEO/GEO',
    questionTitle: '什么是 Google E-E-A-T 质量评估框架？',
    oneLineDefinition: 'Google 质量评估指南里用来评价内容可信度的框架，即：真实经验 (Experience)、专业水准 (Expertise)、行业权威度 (Authoritativeness) 与最高核心原则——可信赖度 (Trustworthiness)。',
    detailedExplanation: `在出海 B2B 工业品与医疗领域，海外采购属于重大商业决策。Google 的质量评估会参考 E-E-A-T 信号。企业必须在网站上展示具备真实手术经验或工程应用的项目照片、技术作者的认证背景、国际权威检测实验室的报告，以及严密的隐私与防伪政策。`,
    realWorldExample: '泰宁科创将国内参编国标的行业地位，改写为符合英国工程标准的权威技术报告，补充了可核查的标准依据。',
    commonPitfalls: [
      '把纯宣传口号（如“世界领先、品质第一”）当成专业证据，缺乏可查验的第三方测试报告。'
    ],
    relatedTerms: ['SEO', 'GEO', 'Schema 结构化数据'],
    relatedLessonId: 'lesson-b-1-3',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-core-web-vitals',
    term: 'Core Web Vitals (核心网页性能指标)',
    englishTerm: 'Core Web Vitals',
    category: '技术底座',
    questionTitle: '什么是 Core Web Vitals？为什么外贸站必须过关？',
    oneLineDefinition: 'Google 衡量网页用户体验的三大硬性技术指标，涵盖最大内容绘制时间 (LCP)、下一次交互延迟 (INP) 和累积布局偏移 (CLS)。',
    detailedExplanation: `对于出海网站而言，买家分布在欧美、中东等不同大洲。如果服务器仅部署在国内或未经全球 CDN 优化，海外访问可能明显变慢。Google 把页面体验（含 Core Web Vitals）作为排名参考之一：速度差会影响体验，也可能影响排名，但不是唯一因素。`,
    realWorldExample: '通过静态渲染与全球 Anycast CDN 边缘加速，将海外平均首屏 LCP 控制在 1.8 秒以内。',
    commonPitfalls: [
      '在首页堆砌未压缩的数十兆大尺寸高清轮播视频，导致移动端严重卡顿。'
    ],
    relatedTerms: ['技术 SEO', '服务端渲染', 'CDN'],
    relatedLessonId: 'lesson-a-1-4',
    schemaType: 'DefinedTerm'
  }
];

export const GLOSSARY_TERMS: GlossaryTerm[] = SHOW_FDE ? ALL_GLOSSARY_TERMS : ALL_GLOSSARY_TERMS.filter((term) => term.id !== 'term-fde');

/** 分类的英文显示名（内部仍用中文分类做筛选值） */
export const GLOSSARY_CATEGORY_EN: Record<GlossaryTerm['category'], string> = {
  'SEO/GEO': 'SEO / GEO',
  技术底座: 'Technical foundation',
  交付与架构: 'Delivery and architecture',
  智能客服: 'AI customer service',
};

const localizeGlossary = (term: GlossaryTerm): GlossaryTerm => {
  const en = GLOSSARY_EN[term.id];
  if (!en) return term;
  return {
    ...term,
    term: en.term,
    questionTitle: en.questionTitle,
    oneLineDefinition: en.oneLineDefinition,
    detailedExplanation: en.detailedExplanation,
    realWorldExample: en.realWorldExample,
    commonPitfalls: en.commonPitfalls,
    relatedTerms: en.relatedTerms,
  };
};

const GLOSSARY_TERMS_EN = GLOSSARY_TERMS.map(localizeGlossary);

/** 按界面语言取术语列表 */
export const glossaryList = (lang: 'zh' | 'en'): GlossaryTerm[] => (lang === 'en' ? GLOSSARY_TERMS_EN : GLOSSARY_TERMS);

