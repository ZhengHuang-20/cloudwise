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

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'term-geo',
    term: 'GEO (生成式引擎优化)',
    englishTerm: 'Generative Engine Optimization',
    category: 'SEO/GEO',
    questionTitle: '什么是出海 GEO（生成式引擎优化）？',
    oneLineDefinition: 'GEO 是一种优化企业知识与权威信源的方法，旨在让 ChatGPT、Perplexity、Gemini 等 AI 在生成答案时，将您的企业作为优先供应商名字推荐给海外采购商。',
    detailedExplanation: `不同于传统 SEO 仅关注关键词在搜索结果列表中的排序，GEO 面向的是具备自主综合与推理能力的生成式大语言模型。大模型在面对“推荐几家亚洲高质量骨科植入物供应商”等采购问题时，会基于训练数据及实时检索结果，抓取具备明确定义、可信数值表格与权威第三方引用的实体知识。GEO 就是通过决策者建模、技术白皮书、行业权威信源铺设与月度监测，让 AI 认同并推荐您的品牌。`,
    realWorldExample: '爱康医疗通过 GEO 实施，在 ChatGPT 与 Perplexity 提问亚洲 3D 打印多孔钛骨科耗材时，从最初未被提及转变为稳居前三位推荐并直接附带技术指南信源。',
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
    oneLineDefinition: 'FDE 是一种深入企业业务一线现场，既深度理解外贸销售场景又具备全栈编码能力，每周以敏捷原型解决实际业务断点的工程交付模式。',
    detailedExplanation: `FDE 模式最早由硅谷大数据独角兽 Palantir 发扬光大。传统 SaaS 软件交付只给账号不管落地，传统外包又缺少商业常识。FDE 则直接坐到企业外贸销售和客服身边，观察真实的报价阻碍、库存查询和时差痛点，当周做出可用原型给一线试用，并在当周完成迭代，确保系统真正被用起来，并保证源码与数据资产全部归属于企业。`,
    realWorldExample: 'FDE 驻场期间，发现外贸业务员在半夜需要频繁翻阅 PDF 产品图册核对接口规格，当周在销售企业微信中上线了 AI 知识库小助手，使夜间报价响应时间从 10 小时缩短至 2 分钟。',
    commonPitfalls: [
      '把 FDE 误解为一般的驻场外包劳务。FDE 具备高阶系统架构与业务重构能力。',
      '企业未开放必要的数据与一线配合权限，导致工程实施失去一线场景依托。'
    ],
    relatedTerms: ['私有化部署', '敏捷原型', '知识资产'],
    relatedLessonId: 'lesson-e-1-1',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-eeat',
    term: 'E-E-A-T 质量框架',
    englishTerm: 'Experience, Expertise, Authoritativeness, Trustworthiness',
    category: 'SEO/GEO',
    questionTitle: '什么是 Google E-E-A-T 质量评估框架？',
    oneLineDefinition: 'Google 评估网页可信度与排名的核心标准，即：真实经验 (Experience)、专业水准 (Expertise)、行业权威度 (Authoritativeness) 与最高核心原则——可信赖度 (Trustworthiness)。',
    detailedExplanation: `在出海 B2B 工业品与医疗领域，海外采购属于重大商业决策。Google 与 AI 爬虫极其严格地根据 E-E-A-T 信号筛选内容。企业必须在网站上展示具备真实手术经验或工程应用的项目照片、技术作者的认证背景、国际权威检测实验室的报告，以及严密的隐私与防伪政策。`,
    realWorldExample: '泰宁科创将国内参编国标的行业地位，改写为符合英国工程标准的权威技术报告，显著提升了全站的 E-E-A-T 权威信号。',
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
    detailedExplanation: `对于出海网站而言，买家分布在欧美、中东等不同大洲。如果服务器仅部署在国内或未经全球 CDN 优化，欧美买家打开网页常需 8-10 秒。Google 明确将 Core Web Vitals 作为核心排名算法因子，性能不合格的网站会被直接降权。`,
    realWorldExample: '通过静态渲染与全球 Anycast CDN 边缘加速，将海外平均首屏 LCP 控制在 1.8 秒以内，跳出率直接下降 35%。',
    commonPitfalls: [
      '在首页堆砌未压缩的数十兆大尺寸高清轮播视频，导致移动端严重卡顿。'
    ],
    relatedTerms: ['技术 SEO', '服务端渲染', 'CDN'],
    relatedLessonId: 'lesson-a-1-4',
    schemaType: 'DefinedTerm'
  }
];
