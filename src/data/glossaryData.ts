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
    relatedTerms: ['SEO', 'AEO', 'AI Overviews', 'E-E-A-T', '实体', 'AI 引用来源'],
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
    relatedTerms: ['知识资产', '敏捷原型', '私有化部署', 'RAG'],
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
    relatedTerms: ['SEO', 'GEO', '结构化数据', '实体'],
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
    relatedTerms: ['技术 SEO', '服务端渲染', 'CDN', '结构化数据'],
    relatedLessonId: 'lesson-a-1-4',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-aeo',
    term: 'AEO (答案引擎优化)',
    englishTerm: 'Answer Engine Optimization',
    category: 'SEO/GEO',
    questionTitle: '什么是 AEO（答案引擎优化）？和 GEO 有什么区别？',
    oneLineDefinition: 'AEO 是让内容被搜索引擎与 AI 助手直接选作“答案”的优化方法：一个页面回答一个问题，开头先给结论，再给依据。它与 GEO 大部分重合，GEO 更强调被生成式 AI 引用和推荐。',
    detailedExplanation: `AEO 这个说法出现得比 GEO 早，最初针对的是 Google 的精选摘要（Featured Snippet）和语音助手：用户提一个问题，系统只给一个答案，谁的内容被选中，谁就拿到全部曝光。生成式 AI 普及之后，“答案引擎”的范围扩大到 ChatGPT、Perplexity、Gemini 与 Google AI 概览，两个词在行业里经常混用。区别主要在侧重点：AEO 关注单个问题的答案由谁来给，做法是问句式标题、开头的直接回答、步骤与表格；GEO 还要处理 AI 综合多个来源时信不信你，所以多出第三方信源、品牌实体与定期复测这几项工作。对出海企业来说不必二选一，按 GEO 的做法做，AEO 的要求已经包含在内。`,
    realWorldExample: '本站的术语与文章都按 AEO 的写法组织：标题是问句，标题下第一段是可以单独摘录的回答，之后才是解释、案例与常见误区，页面同时输出 FAQPage 结构化数据。',
    commonPitfalls: [
      '把 AEO 理解成在页面底部加一组常见问题。答案要放在页面开头，而且要回答买家真正会问的问题。',
      '一个页面想回答十个问题。答案引擎按问题取内容，一页一问更容易被选中。',
      '只改写法、不补依据。没有数据、出处与第三方印证的答案，AI 可以读到，但不会优先引用。'
    ],
    relatedTerms: ['GEO', 'AI Overviews', '零点击搜索', '结构化数据'],
    relatedLessonId: 'lesson-c-1-2',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-ai-overviews',
    term: 'AI Overviews (Google AI 概览)',
    englishTerm: 'Google AI Overviews',
    category: 'SEO/GEO',
    questionTitle: '什么是 Google AI Overviews（AI 概览）？怎样才会被它引用？',
    oneLineDefinition: 'AI Overviews 是 Google 在搜索结果顶部用生成式 AI 写出的摘要，并附上来源链接。要被它引用，页面先要被 Google 正常收录并允许显示摘要，内容要直接回答问题。',
    detailedExplanation: `AI Overviews 的前身是 Google 的搜索生成体验（SGE），2024 年 5 月起在美国正式上线，之后扩展到更多国家和语言。它不是每次搜索都出现，更常见于提问式、需要综合多方信息的搜索，比如“某类设备的供应商怎么选”。Google 的官方说明是：出现在 AI 概览里不需要任何特殊标记，前提是页面已被收录、符合搜索的基本要求、允许显示摘要；传统 SEO 的基础工作在这里同样有效。控制方式也沿用搜索的规则：nosnippet、max-snippet 与 data-nosnippet 可以限制内容被摘录。robots.txt 里的 Google-Extended 管的是 Gemini 的训练与联网引用，不影响 AI 概览，AI 概览用的是 Googlebot 抓取的索引。`,
    realWorldExample: '示例：买家搜索“如何验证骨科植入物供应商的资质”，结果页顶部先出现一段 AI 写的步骤说明，旁边列出几个来源链接。被列为来源的页面通常已经有不错的自然排名，并且有一段话直接回答了这个问题。',
    commonPitfalls: [
      '为了“保护内容”屏蔽 Googlebot 或给全站加 nosnippet，结果同时失去普通搜索结果里的摘要。',
      '以为屏蔽 Google-Extended 就能退出 AI 概览。它只影响 Gemini，不影响搜索。',
      '只盯排名不看展示方式。排在第一页但内容没有直接回答问题的页面，很难被摘进概览。'
    ],
    relatedTerms: ['GEO', 'AEO', '零点击搜索', 'E-E-A-T', '查询扇出'],
    relatedLessonId: 'lesson-c-1-1',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-zero-click',
    term: '零点击搜索 (Zero-click Search)',
    englishTerm: 'Zero-click Search',
    category: 'SEO/GEO',
    questionTitle: '什么是零点击搜索？对外贸独立站意味着什么？',
    oneLineDefinition: '零点击搜索指用户在搜索结果页或 AI 的回答里就得到了答案，没有点进任何网站。对外贸企业来说，衡量标准要从“有多少点击”扩展到“答案里有没有提到你”。',
    detailedExplanation: `造成零点击的是结果页上越来越多的直接答案：精选摘要、知识面板、“大家还在问”，以及 Google AI 概览；ChatGPT、Perplexity 这类 AI 助手更进一步，整个回答都在对话里完成。信息型问题（是什么、怎么选、有哪些）最容易零点击，带明确采购意图的搜索仍然会点进官网看参数、认证和联系方式。所以应对方法不是放弃内容，而是分两层做：信息型内容争取被摘录和引用，让品牌名出现在答案里；产品页、认证页和询盘入口承接愿意点击的买家。衡量上，除了点击量，还要看展示量、品牌词搜索量和 AI 回答中的提及率。`,
    realWorldExample: '示例：采购工程师问 AI“欧洲市场常用的雨水调蓄模块有哪些供应商”，AI 直接给出一份名单。名单里的企业没有得到点击，却进入了买家的候选范围；不在名单里的企业，连被比较的机会都没有。',
    commonPitfalls: [
      '看到点击下降就判断内容没用，停掉内容建设。先看展示量与品牌词搜索是不是在涨。',
      '只统计官网流量，不测 AI 回答里的提及。零点击时代，一部分曝光发生在站外。',
      '把所有内容都写成只能点进来才看得到的“钩子”。答案藏得越深，越不会被摘录。'
    ],
    relatedTerms: ['AI Overviews', 'AEO', 'GEO', 'AI 声量占比'],
    relatedLessonId: 'lesson-c-1-1',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-entity',
    term: '实体 (Entity)',
    englishTerm: 'Entity',
    category: 'SEO/GEO',
    questionTitle: '什么是实体（Entity）？为什么 AI 要先认出你的品牌？',
    oneLineDefinition: '实体是搜索引擎与大模型能唯一识别的“一个东西”：一家公司、一款产品、一个人或一个地点。AI 推荐品牌之前，先要确认这个品牌是谁、做什么、和哪些事实相关。',
    detailedExplanation: `关键词是字符串，实体是字符串背后的对象。Google 的知识图谱和大模型的内部知识都按实体组织：同一家公司的中文名、英文名、简称、官网和各平台账号，要被认定为同一个对象，相关的事实（成立时间、所在地、产品、认证、客户）才会累加到它身上。出海企业常见的问题是实体模糊：中英文名对不上，英文名与别的公司重名，各平台的介绍互相矛盾。这时 AI 要么不提，要么把别人的信息安到你头上。建立清晰的实体靠三件事：全网统一名称与一句话介绍；在官网用 Organization 结构化数据写明法定名称、地址与官方账号（sameAs）；在行业目录、媒体、认证机构等第三方来源留下一致的描述。`,
    realWorldExample: '本站的英文品牌名定为 ChinGEO，就是为了避开与另一家公司英文名 Cloudwise 重名。官网每个页面都输出同一个 Organization 节点，写明公司全称、统一社会信用代码、地址与官方账号。',
    commonPitfalls: [
      '英文名随手起，与海外已有品牌或通用词重名，AI 分不清说的是谁。',
      '官网、B2B 平台、社交账号上的公司介绍各写各的，成立时间与主营产品互相矛盾。',
      '只在自己官网上说自己是谁，没有任何第三方来源能印证。'
    ],
    relatedTerms: ['结构化数据', 'E-E-A-T', 'GEO', 'AI 幻觉'],
    relatedLessonId: 'lesson-c-3-1',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-structured-data',
    term: '结构化数据 (Schema / JSON-LD)',
    englishTerm: 'Structured Data (Schema.org, JSON-LD)',
    category: '技术底座',
    questionTitle: '什么是结构化数据（Schema 与 JSON-LD）？外贸站该加哪些？',
    oneLineDefinition: '结构化数据是写在网页代码里、给机器读的说明：用 Schema.org 的词汇、通常以 JSON-LD 格式，声明这个页面讲的是哪家公司、哪款产品、哪篇文章。它帮助搜索引擎与 AI 准确理解页面。',
    detailedExplanation: `Schema.org 是 Google、微软、雅虎与 Yandex 在 2011 年共同发起的词汇表，定义了 Organization、Product、Article、FAQPage 等几百种类型；JSON-LD 是把这些信息写进页面的一种格式，也是 Google 推荐的写法。外贸 B2B 站最值得加的是：全站的 Organization（公司全称、地址、联系方式、官方账号）、产品页的 Product（型号、规格、认证，B2B 不标价时可以不写价格）、文章的 Article（作者与发布、更新日期）、层级导航的 BreadcrumbList，以及有问答内容时的 FAQPage。两条规则要守住：标记的内容必须和页面上看得见的内容一致；加了标记只代表有资格展示富结果，不保证一定展示。各 AI 平台如何使用结构化数据并没有全部公开，可以确定的是，它让“页面讲的是谁”这件事不再靠猜。`,
    realWorldExample: '本站每个页面都在服务端输出 JSON-LD：全站有 Organization 与 WebSite，服务页是 Service 加 FAQPage，文章是 Article 加作者 Person，术语页是 DefinedTerm，课时页带 VideoObject。',
    commonPitfalls: [
      '标记里写了页面上没有的内容，例如看不到的评分与评论，这违反 Google 的结构化数据规则。',
      '用 JavaScript 在浏览器里才插入 JSON-LD，不执行脚本的爬虫读不到。',
      '以为加了结构化数据排名就会上升。它解决的是“读得懂”，不是“排得前”。'
    ],
    relatedTerms: ['实体', 'E-E-A-T', 'AI 爬虫', 'Core Web Vitals'],
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-ai-crawlers',
    term: 'AI 爬虫 (AI Crawlers)',
    englishTerm: 'AI Crawlers',
    category: '技术底座',
    questionTitle: '什么是 AI 爬虫？GPTBot、ClaudeBot、PerplexityBot 该不该放行？',
    oneLineDefinition: 'AI 爬虫是 AI 公司用来抓取网页的程序，分为训练用、搜索索引用和用户提问时实时读取三类。希望被 AI 推荐的出海企业应当在 robots.txt 里放行它们，并保证不执行脚本也能读到正文。',
    detailedExplanation: `主要的 AI 公司都公布了各自爬虫的名称与用途。OpenAI 有三个：GPTBot 用于模型训练，OAI-SearchBot 为 ChatGPT 搜索建立索引，ChatGPT-User 在用户提问时实时访问页面。Anthropic 对应的是 ClaudeBot、Claude-SearchBot 与 Claude-User；Perplexity 是 PerplexityBot 与 Perplexity-User。Google-Extended 不是独立的爬虫，而是 robots.txt 里的一个开关，控制内容能否用于 Gemini 的训练与联网引用。这些爬虫与搜索引擎爬虫有两点不同。第一，按公开的测试，多数 AI 爬虫不执行 JavaScript，靠浏览器渲染才出现的正文它们读不到。第二，由用户提问触发的实时访问不一定按 robots.txt 的规则处理，以各家文档为准。对想被 AI 引用的企业，屏蔽搜索索引类爬虫等于主动退出 AI 的搜索结果；屏蔽训练类爬虫则会减少品牌进入模型长期知识的机会。`,
    realWorldExample: '本站的 robots.txt 明确放行 GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、PerplexityBot 等爬虫，只屏蔽接口路径；所有页面在服务端生成完整 HTML，并提供 llms.txt 与每个页面的 Markdown 版本。',
    commonPitfalls: [
      '建站模板或安全插件默认拦截“未知爬虫”，把 AI 爬虫一起挡在外面，自己并不知道。',
      'robots.txt 放行了，但 CDN 或防火墙按 User-Agent 返回 403。两处都要检查。',
      '页面是纯前端渲染，爬虫拿到的 HTML 只有空壳，放行了也读不到内容。'
    ],
    relatedTerms: ['结构化数据', 'GEO', 'IndexNow'],
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-hreflang',
    term: 'hreflang (多语言页面标注)',
    englishTerm: 'hreflang',
    category: '技术底座',
    questionTitle: '什么是 hreflang？多语言外贸站怎么写才不出错？',
    oneLineDefinition: 'hreflang 是告诉搜索引擎“同一内容有哪些语言或地区版本”的标注，让德国买家搜到德语页、美国买家搜到英语页。它的作用是把正确的版本展示给对的人，不直接提升排名。',
    detailedExplanation: `hreflang 可以写在三个位置：页面 head 里的 link 标签、HTTP 响应头，或 sitemap.xml，选一种并保持一致即可。值由语言代码（ISO 639-1，如 en、de、zh）加可选的地区代码（ISO 3166-1，如 en-GB、zh-CN）组成，另有 x-default 表示没有匹配版本时的默认页面。写对有三条硬规则。一是互相指向：A 页声明了 B 页，B 页也必须声明 A 页，否则标注会被忽略。二是每个页面要包含指向自己的那一条。三是指向的地址必须是可以正常访问、可被收录的规范地址，不能指向跳转页或被 noindex 的页面。hreflang 主要被 Google 与 Yandex 使用；它不合并内容，只在几个版本之间做替换，所以每个语言版本自身的内容质量仍然要过关。`,
    realWorldExample: '本站中文页面无路径前缀、英文页面在 /en 下，每个页面的 head 与 sitemap 都声明 zh-CN、en 与 x-default 三条 hreflang，并且两种语言互相指向。',
    commonPitfalls: [
      '只在英文页上写了指向德语页的标注，德语页没有回指，整组标注失效。',
      '地区代码写错，比如用 en-UK（正确是 en-GB），或只写地区不写语言。',
      '按访客 IP 自动跳转到对应语言。爬虫大多从美国访问，会永远看不到其他语言版本。',
      '用机器翻译批量生成几十个语言版本再配上 hreflang。低质量的翻译页不会因为有标注而获得排名。'
    ],
    relatedTerms: ['结构化数据', 'Core Web Vitals', 'IndexNow'],
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-indexnow',
    term: 'IndexNow (主动推送收录协议)',
    englishTerm: 'IndexNow',
    category: '技术底座',
    questionTitle: '什么是 IndexNow？为什么它对 ChatGPT 搜索也有用？',
    oneLineDefinition: 'IndexNow 是网站主动通知搜索引擎“这些页面新增或更新了”的开放协议，由微软 Bing 与 Yandex 在 2021 年发起。提交后搜索引擎可以更快来抓取，而不用等爬虫自己发现。',
    detailedExplanation: `用法很简单：生成一个密钥，把同名的文本文件放在网站根目录证明你拥有这个网站，然后把变化的网址用一次 HTTP 请求提交，一次最多 10000 个。提交给任何一家参与的搜索引擎，其余参与方都会收到通知，目前包括 Bing、Yandex、Naver、Seznam 等。Google 没有采用 IndexNow，仍然依靠 sitemap 与自身的抓取。它对 GEO 有意义，是因为 Bing 的索引不只服务 Bing：微软 Copilot 使用它，ChatGPT 搜索也把 Bing 作为索引来源之一。新站或更新不频繁的站点，爬虫来得慢，主动推送可以缩短从发布到被收录的时间。它只是通知，不保证收录，页面本身的质量仍然决定结果。`,
    realWorldExample: '本站每次正式部署完成后，构建脚本会把全部可索引页面的地址通过 IndexNow 推送出去，密钥文件放在网站根目录。',
    commonPitfalls: [
      '以为提交了就一定被收录。IndexNow 只是告诉搜索引擎“来看看”，收不收由内容决定。',
      '把没有变化的页面每天重复提交。协议要求只提交新增、更新或删除的网址。',
      '只做 IndexNow，不提交 sitemap、不验证 Google Search Console。Google 不走这个协议。'
    ],
    relatedTerms: ['AI 爬虫', 'hreflang', '结构化数据', 'XML 网站地图'],
    schemaType: 'DefinedTerm'
  }
,
  {
    id: 'term-ai-share-of-voice',
    term: 'AI 声量占比 (AI Share of Voice)',
    englishTerm: 'AI Share of Voice',
    category: 'SEO/GEO',
    questionTitle: '什么是 AI 声量占比？怎么知道 AI 推荐你还是推荐竞品？',
    oneLineDefinition: 'AI 声量占比是在一组固定的买家问题里，AI 回答提到你的品牌的次数占所有被提到品牌的比例。它回答的是“同样的问题，AI 更常推荐谁”，是衡量 GEO 效果最直接的指标之一。',
    detailedExplanation: `传统 SEO 看的是某个关键词排第几位，而 AI 的回答没有固定的“第几页”，同一个问题每次回答也可能不同。所以衡量 AI 可见性要换一种口径：先固定一组海外买家真实会问、但不带品牌名的问题（例如“欧洲有哪些可靠的储能电池供应商”），在 ChatGPT、Perplexity、Gemini 等平台上逐题提问，记录每个回答提到了哪些品牌，再统计你和竞品各被提到多少次。

常和声量一起看的还有三项：提及率（不带品牌名的问题里，有多少比例的回答提到你）、平均排位（被提到时排在第几个）和引用率（回答是否引用了你的官网）。声量看的是和竞品的相对位置，提及率看的是绝对覆盖，两者结合才知道问题出在“AI 不认识你”还是“AI 认识你但更推荐别人”。

做这类统计要注意口径：问题集要固定、每个平台的提问次数要一致、时间要写清楚，否则前后两次的数字没有可比性。`,
    realWorldExample: '本站的 AI 可见性测评对 6 个不带品牌名的买家问题逐平台提问，报告里的“声量”一栏列出被提及最多的竞品与你自己的次数对比，并给出提及率、平均排位与引用率。',
    commonPitfalls: [
      '只问一次、只问一个平台就下结论。AI 回答有随机性，至少要固定问题集、多平台、按月复测。',
      '用带品牌名的问题算声量。“某某公司怎么样”几乎一定会提到你，只能检查 AI 对你的了解是否准确，不能说明 AI 会主动推荐你。',
      '只看声量不看来源。声量低时，要看 AI 引用了哪些网站，那些网站上才是该补的内容。'
    ],
    relatedTerms: ['GEO', 'AI 引用来源', 'AI Overviews', '零点击搜索'],
    relatedLessonId: 'lesson-c-10-2',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-ai-citation',
    term: 'AI 引用来源 (AI Citations)',
    englishTerm: 'AI Citations',
    category: 'SEO/GEO',
    questionTitle: 'AI 回答里的引用来源是什么？怎样让 AI 引用你的网站？',
    oneLineDefinition: 'AI 引用来源是 ChatGPT 搜索、Perplexity、Google AI Overviews 等在回答旁边列出的网页链接，表示答案依据了哪些页面。被引用意味着买家能点进你的网站，也说明 AI 把你的页面当作可信的出处。',
    detailedExplanation: `联网的 AI 助手在回答问题时，会先检索网页，再根据检索到的内容写答案，并把依据的页面标成引用：Perplexity 在句子后面加编号，ChatGPT 搜索在回答中和“来源”面板里列出链接，Google 的 AI Overviews 在摘要旁边展示链接卡片。不联网、只靠训练数据回答时，通常不会有引用。

一个页面要被引用，先要被找到，再要“好引用”。被找到取决于搜索索引：页面被 Google、Bing 收录，AI 爬虫能抓取，正文不依赖 JavaScript 才出现。好引用取决于页面写法：开头就直接回答问题，事实具体且有出处（型号、参数、认证编号、标准号），用表格和列表组织，和其他来源说法一致。AI 倾向于引用能单独摘出一段就回答问题的页面。

引用的来源也不只是你的官网。行业媒体、目录网站、问答平台、标准组织的页面都会被引用，所以 GEO 既要把官网写好，也要让这些第三方来源对你的描述准确一致。`,
    realWorldExample: '本站测评会记录每个回答引用了哪些网址，统计其中有多少来自被测企业自己的官网（引用率），并在报告里列出 AI 最常引用的第三方网站，作为下一步补内容和铺信源的清单。',
    commonPitfalls: [
      '以为提及就等于引用。AI 可能提到你的品牌，却引用了目录网站或竞品的页面，买家点进去的不是你的网站。',
      '核心页面只有图片和宣传口号，没有可以被摘出来的具体事实，AI 找不到可以引用的句子。',
      '官网、平台店铺与第三方页面上的参数和公司信息互相矛盾，AI 难以判断哪个可信，往往干脆不引用。'
    ],
    relatedTerms: ['GEO', 'AI 声量占比', '结构化数据', 'E-E-A-T', 'AI 爬虫'],
    relatedLessonId: 'lesson-c-3-1',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-query-fan-out',
    term: '查询扇出 (Query Fan-out)',
    englishTerm: 'Query Fan-out',
    category: 'SEO/GEO',
    questionTitle: '什么是查询扇出（Query Fan-out）？AI 搜索为什么会搜你没想到的词？',
    oneLineDefinition: '查询扇出是 AI 搜索把用户的一个问题拆成多个子问题、同时分别检索，再把结果合成一个回答的做法。Google 公开说明 AI Mode 与 AI Overviews 使用这种技术，所以页面能否被引用，取决于它能不能回答这些子问题。',
    detailedExplanation: `买家问 AI 的问题往往很长，例如“给德国的工厂找一家能做 IP67 防护、有 CE 认证、交期四周以内的工业连接器供应商”。AI 搜索不会把整句话当成一个关键词去搜，而是拆成“工业连接器 IP67 供应商”“CE 认证 连接器 制造商”“连接器 交期”等多个子查询，分别检索后再挑出能回答各部分的页面写进答案。Google 在 2025 年介绍 AI Mode 时把这种方法称为 query fan-out，并在 Search Central 的“AI 功能与你的网站”文档中提到 AI Overviews 和 AI Mode 都可能使用它。

这对出海企业的含义是：只围绕一个主关键词写一篇宣传页已经不够。买家关心的每个维度（参数、认证、应用场景、交期与产能、售后、与其他方案的对比）最好都有一段能单独被检索到、单独回答问题的内容。页面里写清这些具体信息，被拆出来的子查询才可能落到你的网站上。

具体怎么拆、发出多少个子查询，各家都没有公开细节，以官方文档为准。`,
    realWorldExample: '本站测评生成的 6 个买家问题分别覆盖供应商推荐、对比、认证与合规、技术参数、从中国采购等不同意图，相当于把一个采购需求拆成多个角度来问；报告里没被提及的那几题，往往对应官网缺少的那一类信息。',
    commonPitfalls: [
      '把所有信息塞进一个很长的首页，没有分节标题，AI 检索子问题时找不到对应的段落。',
      '参数、认证只放在 PDF 或图片里，检索时读不到。',
      '以为查询扇出是可以单独“优化”的技巧。它只是 AI 的检索方式，应对办法仍然是把买家会问的每个方面写清楚。'
    ],
    relatedTerms: ['AI Overviews', 'AEO', 'AI 引用来源', '零点击搜索'],
    relatedLessonId: 'lesson-c-1-1',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-rag',
    term: 'RAG (检索增强生成)',
    englishTerm: 'Retrieval-Augmented Generation',
    category: '智能客服',
    questionTitle: '什么是 RAG（检索增强生成）？AI 客服为什么要先接知识库？',
    oneLineDefinition: 'RAG 是让大模型先从指定的资料库里检索相关内容，再依据检索结果作答的方法。它让 AI 客服按企业自己的产品资料回答，而不是凭模型的记忆猜，也是联网 AI 搜索引用网页的基本原理。',
    detailedExplanation: `RAG（Retrieval-Augmented Generation）这个名称来自 2020 年 Lewis 等人发表的论文《Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks》。做法分两步：先把用户的问题拿去资料库里检索，取出最相关的几段内容；再把这些内容和问题一起交给大模型，让它依据这些内容写答案，并可以标出出处。

对出海企业，RAG 有两层意义。第一层是自己的 AI 客服：把产品手册、参数表、认证、常见问题整理成知识库，客服回答询盘时先检索再作答，能明显减少“编参数”的情况，知识库更新后回答也随之更新，不用重新训练模型。第二层是外部的 AI 搜索：ChatGPT 搜索、Perplexity 等联网回答本质上也是检索加生成，检索的“资料库”是整个公开网页。所以官网写得是否清楚、能否被检索到，直接决定 AI 回答里有没有你。

RAG 的效果取决于资料质量和检索质量：资料过时、互相矛盾或切分得太碎，模型照样会答错。`,
    realWorldExample: '本站的 AI 售前顾问采用同样的“依据指定资料作答”原则：每次回答都带上由服务、案例与话术规则组成的知识库，问到知识库里没有的内容（例如价格）时引导到方案规划与诊断会，而不是自行编造。知识库篇幅小，所以直接放进提示词，不需要另做检索；资料多到放不下时才需要 RAG 的检索步骤。',
    commonPitfalls: [
      '把几百页 PDF 原样丢进知识库就上线，没有整理和去重，检索到的段落互相矛盾。',
      '以为接了 RAG 就不会出错。检索不到时模型仍可能自行发挥，需要设定“查不到就转人工”的规则。',
      '知识库建好后不维护，产品更新了，客服还在按旧参数回答。'
    ],
    relatedTerms: ['AI 幻觉', 'AI 引用来源', 'FDE', 'GEO'],
    relatedLessonId: 'lesson-d-1-2',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-ai-hallucination',
    term: 'AI 幻觉 (AI Hallucination)',
    englishTerm: 'AI Hallucination',
    category: 'SEO/GEO',
    questionTitle: '什么是 AI 幻觉？AI 把你的公司信息说错了怎么办？',
    oneLineDefinition: 'AI 幻觉是大模型生成了听起来合理、但与事实不符的内容。对企业来说，常见的是 AI 把成立时间、产品范围、认证或客户说错，买家看到错误信息就可能把你排除在名单之外。',
    detailedExplanation: `大模型按概率生成文字，当它掌握的资料不足或互相矛盾时，就可能“补全”出不存在的信息。对出海企业，最常见的几种错误是：把你和同名或名字相近的公司混在一起；沿用多年前的旧信息（旧地址、已停产的产品线）；把行业通用的认证安到你身上，或者漏掉你真正拥有的认证。

减少这类错误，关键是让公开资料“多、准、一致”。第一，官网用文字（不是图片）写清公司全称、成立时间、地址、产品范围、认证编号与主要市场，并用 Organization 等结构化数据标注。第二，平台店铺、行业目录、社交账号、新闻稿上的信息与官网保持一致，相互印证的来源越多，AI 越容易采信。第三，定期用带品牌名的问题检查 AI 对你的描述，发现错误就追查它引用的来源，从源头更正。

AI 平台一般不提供直接修改回答的入口，更正只能通过改进公开资料、等模型或索引更新来实现，需要时间。`,
    realWorldExample: '本站测评固定包含两个带品牌名的问题（“你对这家公司了解多少、做什么产品”“它是不是可靠的供应商、优缺点是什么”），用来检查 AI 对被测企业的描述是否准确，报告里的“品牌认知”指标就来自这两题。',
    commonPitfalls: [
      '发现 AI 说错后只在官网加一句声明，不去更正被 AI 引用的第三方来源，错误会继续出现。',
      '中英文公司名、旧品牌名不统一，AI 把两个名字当成两家公司。',
      '为了“纠正”AI 批量发布重复的宣传稿，反而增加了低质来源。'
    ],
    relatedTerms: ['实体', '结构化数据', 'RAG', 'E-E-A-T'],
    relatedLessonId: 'lesson-c-1-2',
    schemaType: 'DefinedTerm'
  },
  {
    id: 'term-xml-sitemap',
    term: 'XML 网站地图 (XML Sitemap)',
    englishTerm: 'XML Sitemap',
    category: '技术底座',
    questionTitle: '什么是 XML 网站地图（sitemap.xml）？外贸站要怎么写、怎么提交？',
    oneLineDefinition: 'XML 网站地图是列出网站所有希望被收录的网址的文件（通常是 /sitemap.xml），帮助 Google、Bing 等更快发现新页面和更新过的页面。它不保证收录，但新站和页面多的站点几乎都应该提供。',
    detailedExplanation: `网站地图的格式由 sitemaps.org 协议规定：每个网址一个 <url> 条目，写明地址 <loc>，可选写上最后修改时间 <lastmod>。单个文件最多 50,000 个网址、未压缩不超过 50MB，超过就拆成多个文件，再用一个索引文件汇总。多语言网站可以在网站地图里为每个网址标注 hreflang 对应关系，视频和图片也有各自的扩展写法。

按 Google 的官方说明，Google 会忽略 <priority> 和 <changefreq>，但如果 <lastmod> 一直准确，就会参考它安排重新抓取。所以 lastmod 应当只在页面内容真正变化时更新，不要每次部署都把所有页面改成今天。网站地图里只放返回 200、可以被收录、canonical 指向自己的网址，跳转页、404 页和 noindex 页都不要放。

提交方式有三种，可以同时用：在 robots.txt 里写一行 Sitemap: 地址；在 Google Search Console、Bing Webmaster Tools 里提交；对 Bing 等支持 IndexNow 的搜索引擎，页面更新时主动推送。提交后到站长平台查看“已发现”和“已收录”的数量，两者差距大时要逐页查原因。`,
    realWorldExample: '本站的 sitemap.xml 由路由表自动生成，包含中英文全部可索引页面、hreflang 对应关系与课程视频信息；文章的 lastmod 取真实的更新日期，并在 robots.txt 中声明地址。',
    commonPitfalls: [
      '网站地图里混着跳转、404 或 noindex 的网址，站长平台报大量错误，搜索引擎也会降低对这份文件的信任。',
      '每次构建都把所有页面的 lastmod 改成当天，搜索引擎发现不准后就不再参考。',
      '以为提交了网站地图就会被收录。是否收录仍取决于页面质量与重复程度。'
    ],
    relatedTerms: ['IndexNow', 'hreflang', 'AI 爬虫', '结构化数据'],
    relatedLessonId: 'lesson-b-1-3',
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

