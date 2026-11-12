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
    relatedTerms: ['SEO', 'AEO', 'AI Overviews', 'E-E-A-T', '实体'],
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
    relatedTerms: ['GEO', 'AEO', '零点击搜索', 'E-E-A-T'],
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
    relatedTerms: ['AI Overviews', 'AEO', 'GEO'],
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
    relatedTerms: ['结构化数据', 'E-E-A-T', 'GEO'],
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
    relatedTerms: ['AI 爬虫', 'hreflang', '结构化数据'],
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

