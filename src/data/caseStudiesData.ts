export interface CaseStudy {
  id: string;
  clientName: string;
  industry: string;
  status: string;
  targetMarket: string;
  buyerRoles: string[];
  startingPointFriction: string;
  startingScore: number;
  // 评分对比的口径：两个分数分别测的是哪个站点。缺省时页面显示「改造前 / 改造后」
  scoreComparison?: {
    metric: string;
    beforeLabel: string;
    afterLabel: string;
  };
  whatWeDid: string[];
  results: {
    finalScore: number;
    metrics: string[];
    directOutcome: string;
  };
  dataScopeStatement: string; // 口径声明
  relatedLessons: string[];
  reusableExperience: string[];
  testimonial?: {
    quote: string;
    author: string;
    title: string;
  };
}

export interface IndustrySolution {
  id: string;
  name: string;
  iconName: string;
  description: string;
  overseasDecisionMakers: {
    role: string;
    focusPoints: string[];
  }[];
  typicalProblemClusters: string[];
  recommendedContentFormat: string[];
  complianceNotes: string[];
  relatedCaseId: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-ak-medical',
    clientName: '爱康医疗 (AK Medical)',
    industry: '医疗器械 · 骨科植入物与 3D 打印假体',
    status: '港股上市公司 · 中国骨科关节龙头',
    targetMarket: '西欧、北美、拉美、东南亚主要公立与专科医疗机构',
    buyerRoles: ['骨科专科主刀医生', '医院医疗器械采购委员会主任', '海外区域医药器械分销商', '国家卫生注册审核工程师'],
    startingPointFriction: '现有国内官网 (ak-medical.net) 的英文内容为中文画册机翻，未配置三读者技术架构与结构化知识，GEO / SEO 评分仅 47 分，海外知名度受阻。',
    startingScore: 47,
    scoreComparison: {
      metric: 'GEO / SEO 评分对比',
      beforeLabel: '现有国内官网',
      afterLabel: '新建海外官网',
    },
    whatWeDid: [
      '新建英文海外官网 (ak-medical-global.com)，搭建满足 Core Web Vitals 与多语种标准的海外主阵地',
      '针对四类海外医疗决策者进行深度意图建模，梳理 91 项年度英文高权重技术内容规划',
      '将中国 3D 打印多孔钛临床突破重塑为符合 FDA/CE 技术规范的双语参数对比指南与白皮书',
      '多平台信源权威铺设（学术索引、LinkedIn、行业展会官方目录）与月度探针监测'
    ],
    results: {
      finalScore: 95,
      metrics: [
        '新建海外官网 GEO / SEO 评分 95 分，现有国内官网为 47 分',
        'chatgpt.com、perplexity.ai 数月持续产生引荐访问（平均停留 4 分 35 秒）',
        '海外官网自然询盘量环比增长 320%'
      ],
      directOutcome: '在欧洲与拉美多次医院国际招投标的调研提问中，ChatGPT 与 Perplexity 将其列为亚太地区推荐供应商的前三位。'
    },
    dataScopeStatement: '注：47 分是现有国内官网 (ak-medical.net)、95 分是新建海外官网 (ak-medical-global.com) 的 GEO / SEO 评分，是两个站点的对比，而非同一站点改造前后的变化；两者均由第三方评测工具 arobis.ai 按同一口径（全网站点信号、Schema 定义完整度与信源权重）测得；引荐流量与询盘来源于 Google Analytics 4 与 CRM 真实埋点。',
    relatedLessons: ['lesson-a-1-2', 'lesson-a-7-4', 'lesson-c-1-1', 'lesson-c-10-2'],
    reusableExperience: [
      '先弄清海外买家会问 AI 什么，再写内容',
      '官网作为唯一信源中心：所有第三方媒体报道和 LinkedIn 均反向锚定官网的定义页',
      '专业严谨的口径说明：出海医疗企业更看重真实性，数据不掺水才能赢得国际信赖'
    ],
    testimonial: {
      quote: '“云端智荐帮我们把原本冷冰冰的技术参数，变成了海外医生和采购委员会能在 ChatGPT 里查得到的权威证据。新站上线后，拉美经销商直接主动找上了门。”',
      author: '爱康医疗国际业务部',
      title: '海外市场总监'
    }
  },
  {
    id: 'case-tide-lion',
    clientName: '泰宁科创 (Tide Lion)',
    industry: '环保科技 · 雨水综合利用与市政海绵城市',
    status: '国家级专精特新“小巨人”企业 · 参编数十项国家行业标准',
    targetMarket: '欧洲（英国、德国）、中东、东南亚市政基础设施总包与水务工程',
    buyerRoles: ['跨国企业 ESG 投资官', '欧洲市政雨水管网规划工程师', '海外水利设计院总工', '国际工程总承包商采购总监'],
    startingPointFriction: '在国内拥有水立方、北京大兴机场等顶级标杆案例，但在海外 Google 与 AI 搜索中几乎看不到，英文关键词与海外工程师的用词对不上。',
    startingScore: 38,
    whatWeDid: [
      '梳理覆盖 60 组高商业价值的英文核心词库，覆盖信息型、对比型、采购型三类搜索意图',
      '对照英国 SuDS（可持续排水系统）规范，编制全套英文合规指南与选型计算手册',
      '发布《虹吸排水 vs 重力排水全生命周期成本对比》带交互数据表的技术文章',
      '部署 7×24 小时 AI 智能客服，多语种承接来自中东与欧洲的跨时区工程大宗询价'
    ],
    results: {
      finalScore: 89,
      metrics: [
        '60 组英文核心词在 Google 欧美主要地区排名前两页',
        '英国市政规划相关提问在 Perplexity 搜索中被直接引用为参考信源',
        '非工作时间收到的工程询盘，全部得到首次回复'
      ],
      directOutcome: '进入中东某新城雨水调蓄项目的国际供应商短名单，客户方给出的意向采购额超过 80 万美元。'
    },
    dataScopeStatement: '注：关键词排名通过 Google Search Console 实时监测；Perplexity 引用通过每月空白探针会话实测验证。',
    relatedLessons: ['lesson-b-1-3', 'lesson-b-3-5', 'lesson-d-1-2'],
    reusableExperience: [
      '将中文参编国标的威望，转化为欧美同业工程规范（如 SuDS / ASTM）的合规技术证据',
      '一词一页精准映射，避免公司自己的多个页面争同一个词',
      'AI 客服即时锁定深夜提问的海外工程师，避免在买家初选阶段错过他们的询问'
    ],
    testimonial: {
      quote: '“以前我们在海外参展发册子，展会一过就没声了。现在欧洲的总包工程师在搜 SuDS 解决方案时直接看到了我们的白皮书，这是我们做过最划算的出海投资。”',
      author: '泰宁科创海外事业部',
      title: '副总裁'
    }
  }
];

export const INDUSTRY_SOLUTIONS: IndustrySolution[] = [
  {
    id: 'solution-medical',
    name: '医疗器械与高端耗材出海方案',
    iconName: 'Activity',
    description: '面向海外医院、采购委员会与药监合规的获客方案。',
    overseasDecisionMakers: [
      { role: '专科主治医生', focusPoints: ['临床实证数据', '生物相容性', '手术器械手感与操作便捷性'] },
      { role: '采购委员会主任', focusPoints: ['总采购成本', 'FDA/CE 认证编号', '批次稳定性与供应链交付'] },
      { role: '海外区域代理商', focusPoints: ['独家代理保护政策', '起订量', '本地售后与技术培训支持'] }
    ],
    typicalProblemClusters: [
      'What are the clinically proven alternatives to traditional orthopedic titanium implants?',
      'FDA 510(k) certified porous titanium bone graft manufacturers in Asia',
      'Customized 3D printing implant lead time and clinical case studies'
    ],
    recommendedContentFormat: [
      'Peer-reviewed 临床回顾性研究论文引用摘要',
      '带国家注册认证证书下载的产品技术白皮书',
      '多国手术量及临床随访五年生存率数据表格'
    ],
    complianceNotes: ['严格遵循当地广告法，不夸大疗效', '公开 CE MDR 和 FDA 注册号备查'],
    relatedCaseId: 'case-ak-medical'
  },
  {
    id: 'solution-environmental',
    name: '环保科技与市政工程出海方案',
    iconName: 'ShieldCheck',
    description: '帮助国际总承包商、海外市政规划院与水务机构在选型时找到你、信任你。',
    overseasDecisionMakers: [
      { role: '市政工程水务总工', focusPoints: ['暴雨重现期计算依据', '材质抗压等级', 'ASTM 检验报告'] },
      { role: '国际 EPC 总承包采购', focusPoints: ['装箱海运容积率', '现场拼装工时节约', '国际付款条件与质保'] },
      { role: '跨国企业 ESG 专员', focusPoints: ['再生材料占比', '全生命周期碳足迹', 'LEED 绿建认证加分'] }
    ],
    typicalProblemClusters: [
      'How to design stormwater attenuation systems complying with UK SuDS manual?',
      'Cost comparison: Siphonic roof drainage vs conventional gravity system in industrial warehouses',
      'Heavy-duty underground modular rainwater storage tanks manufacturer'
    ],
    recommendedContentFormat: [
      '符合当地规范的工程选型计算器与 CAD 节点图下载',
      '水立方、大兴机场等地标项目的英文施工与运行实测报告',
      '抗压试验及使用寿命第三方检测实验室报告'
    ],
    complianceNotes: ['明确注明适用欧美当地工程标准（BS EN 17152-1, ASTM 等）'],
    relatedCaseId: 'case-tide-lion'
  }
];
