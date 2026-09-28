export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  moduleIndex: number;
  title: string;
  summary: string; // 一句话直答
  durationMinutes: number;
  conceptContent: string;
  diagrams?: {
    title: string;
    caption: string;
    type: 'comparison' | 'flowchart' | 'radar' | 'architecture';
    data: any;
  };
  caseSnippet?: {
    company: string;
    title: string;
    description: string;
  };
  misconceptions: string[];
  executiveTakeaway: string; // 决策者要点
  notebookLmPodcast: {
    title: string;
    audioDuration: string;
    audioUrl?: string; // Optional audio mp3 or synthesized speech
    hosts: string[];
    transcript: {
      speaker: 'Alex' | 'Sam';
      avatar: string;
      text: string;
      highlight?: boolean;
    }[];
    videoUrl?: string;
  };
  quiz?: QuizQuestion[];
  exercise?: {
    title: string;
    description: string;
    inputPlaceholder: string;
    outputKey: string;
    actionLabel: string;
  };
  nextStep: {
    label: string;
    actionType: 'lesson' | 'tool' | 'configurator' | 'booking';
    targetId: string;
  };
}

export interface CourseModule {
  index: number;
  name: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  code: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  subtitle: string;
  targetAudience: string;
  totalModules: number;
  totalLessons: number;
  durationHours: number;
  relatedService: string;
  frictionPoint: '读不懂' | '看不见' | '不被信' | '接不住' | '连不上';
  heroCase: string;
  relatedTool: {
    id: string;
    name: string;
    type: string;
  };
  executiveModuleSummary: string;
  modules: CourseModule[];
}

export interface RoleLearningPath {
  id: string;
  title: string;
  targetRole: string;
  durationText: string;
  description: string;
  endGoal: string;
  featuredLessonIds: string[];
  recommendedToolId: string;
}

export const COURSES: Course[] = [
  {
    id: 'course-a-global-site',
    code: 'A',
    title: '独立站建站——一个网站，同时写给买家、Google 和 AI',
    subtitle: '学完能独立规划一个外贸独立站：写给谁、放哪些页面、达到哪些技术标准、上线后看哪些数据。',
    targetAudience: '出海企业决策者、外贸总监、技术负责人',
    totalModules: 8,
    totalLessons: 32,
    durationHours: 12,
    relatedService: '海外独立站建站',
    frictionPoint: '读不懂',
    heroCase: '爱康医疗海外新官网 (ak-medical-global.com)',
    relatedTool: {
      id: 'tool-website-health',
      name: '官网技术体检',
      type: 'website_health',
    },
    executiveModuleSummary: '建站不是套模板，而是海外获客的第一数据资产。三读者（买家、Google、AI）架构让网站上线即具备转化与索引能力。',
    modules: [
      {
        index: 1,
        name: 'M1 认知：独立站是海外主阵地',
        description: '弄清独立站、平台店铺与“电子画册”官网的本质差异',
        lessons: [
          {
            id: 'lesson-a-1-1',
            moduleIndex: 1,
            title: '1.1 独立站、平台店铺、“电子画册”官网有什么区别',
            summary: '平台店铺借流量难留存，电子画册自说自话；独立站是沉淀海外第一方数据、建立国际品牌权威与承接全域询盘的数字主阵地。',
            durationMinutes: 15,
            conceptContent: `传统外贸企业出海常陷入两大误区：一是完全依赖阿里巴巴国际站等第三方平台，受制于规则变动且客户资产无法沉淀；二是把中文宣传册机械翻译成英文放上网，做成无人问津的“僵尸画册”。\n\n真正的现代独立站具有三大不可替代的价值：\n1. 客户数据自主可控：每一个海外访客的浏览偏好、表单询盘均完整归属于企业私域。\n2. 适配海外B2B采购流程：海外大型买家（采购经理、工程师）在下单前平均查阅 7-10 份技术规格与案例，独立站是支撑决策的唯一权威信源。\n3. Google 与 AI 的唯一实体映射：缺乏独立站的品牌无法在 Google 与 ChatGPT 等大模型中建立被认证的知识图谱实体。`,
            misconceptions: [
              '认为做独立站就是找建站公司套个 WordPress 模板，花两三千块钱就行。',
              '把中文画册直接机翻成英文放上去，忽视了海外技术规范和度量衡差异。',
              '只看页面“好不好看”，忽视了加载速度、移动端体验和结构化代码。'
            ],
            executiveTakeaway: '外贸独立站是投资而非成本。它是企业出海所有流量（SEO、GEO、展会、广告）的唯一终局承接地。',
            notebookLmPodcast: {
              title: '【NotebookLM 深度解读】为什么你的外贸官网变成了“网络僵尸画册”？',
              audioDuration: '08:45',
              hosts: ['Alex (技术战略专家)', 'Sam (资深出海顾问)'],
              transcript: [
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: 'Sam，我们今天聊一个很多外贸老板心里的刺：为什么花了几万块建了个全英文官网，一年下来一条询盘都没有？',
                  highlight: false,
                },
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '哈哈，这个太典型了！因为他们做的是“电子画册”，根本不是给海外采购商看的，更不是给 Google 和 AI 爬虫准备的。',
                  highlight: true,
                },
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: '没错。一个真正的出海主阵地，必须同时服务三类读者：人类采购决策者、搜索引擎蜘蛛、还有今天最关键的 AI 问答大模型！',
                  highlight: true,
                },
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '对，只要你把这三个读者的信息架构理顺，网站就会从“沉睡画册”变成 24 小时不间断获客的海外销售机器。',
                  highlight: false,
                }
              ]
            },
            quiz: [
              {
                question: '现代海外外贸独立站的核心定位是什么？',
                options: [
                  '仅用于展会上发名片时让客户看一眼',
                  '同时写给海外买家、Google 与 AI 的全域获客数字主阵地',
                  '完全照搬中文官网的英文机翻镜像',
                  '替代销售员的一切人工接待工作'
                ],
                correctIndex: 1,
                explanation: '现代外贸独立站必须同时满足海外买家的采购决策、Google 的索引抓取与 AI 大模型的答案推荐，形成全域获客闭环。'
              }
            ],
            exercise: {
              title: '自查您的企业当前官网属于哪一类',
              description: '输入您现有的官网网址或核心产品，评估属于“僵尸画册”还是“获客阵地”',
              inputPlaceholder: '例如：www.mycompany.com 或 医疗骨科植入耗材',
              outputKey: 'site_nature_evaluation',
              actionLabel: '一键体检',
            },
            nextStep: {
              label: '进入 1.2 为什么一个网站要写给三类读者',
              actionType: 'lesson',
              targetId: 'lesson-a-1-2'
            }
          },
          {
            id: 'lesson-a-1-2',
            moduleIndex: 1,
            title: '1.2 为什么一个网站要写给三类读者',
            summary: '人类买家需要信任证据与采购逻辑，Google 依靠结构清晰的语义索引，而 AI 大模型需要有定义、有数据、有结构的知识实体。',
            durationMinutes: 18,
            conceptContent: `在 2026 年的今天，海外采购的链路已经发生根本性重塑：\n- 读者 1：人类买家（工程师与采购总监）——他们带着具体参数、交付期和认证合规需求而来，需要立刻看到参数表、工程案例与防伪资质。\n- 读者 2：Google 搜索引擎——需要清晰的 H1/H2 层次、Schema 结构化标记、Canonical 规范标签和极速的 Core Web Vitals 性能。\n- 读者 3：AI 问答模型（ChatGPT, Perplexity, Gemini）——依靠抓取公开的高价值定义、数值表格与 FAQ 来组织答案。如果你没有在网站上清晰定义自己的品类，AI 就会在答案中忽视你！`,
            misconceptions: [
              '认为网站写得越花哨、动效越多越能吸引海外买家，结果拖慢加载速度，AI 爬虫完全读不到内容。',
              '只顾堆砌关键词骗搜索引擎，买家进来看不懂，跳出率高达 90% 以上。'
            ],
            executiveTakeaway: '在设计网站前，必须把三类读者的需求映射到每个模块：产品页给买家参数，代码底层给 Google 结构，定义与 FAQ 喂给 AI。',
            notebookLmPodcast: {
              title: '【NotebookLM 深度对谈】三读者架构：如何让 Google 抓得懂、AI 答得出、买家愿买单？',
              audioDuration: '09:12',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: 'Sam，把一个网站同时写给三类读者，听起来很有道理，但很多人会觉得这难道不会冲突吗？',
                  highlight: false,
                },
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '不仅不冲突，反而是互相促进的！比如清晰的参数表格，买家看得舒服，Google 抽取 Featured Snippet，AI 抓取用于回答对比。一箭三雕！',
                  highlight: true,
                }
              ]
            },
            quiz: [
              {
                question: 'AI 大模型（如 ChatGPT / Perplexity）在评估一个独立站时最青睐什么样的内容形态？',
                options: [
                  '全由大幅无文字海报图片构成的幻灯片',
                  '有明确概念定义、有实测数值表格、有问句式 FAQ 的结构化文本',
                  '加了复杂 JavaScript 加密且阻止爬虫访问的页面',
                  '复制维基百科的大段无关文字'
                ],
                correctIndex: 1,
                explanation: '大模型基于检索增强生成 (RAG) 和预训练权重，对有定义、有数据、有问答结构的知识有极高的引用亲和度。'
              }
            ],
            nextStep: {
              label: '跳转：官网技术体检',
              actionType: 'tool',
              targetId: 'tool-website-health'
            }
          },
          {
            id: 'lesson-a-1-4',
            moduleIndex: 1,
            title: '1.4 决策者篇：投入、周期与验收',
            summary: '搞懂外贸独立站的合理费用构成（8-20万元区间）、2-3个月的交付节奏与5大客观验收标准，老板花15分钟即可理性拍板。',
            durationMinutes: 12,
            conceptContent: `老板做独立站最关心的三件事：\n1. 钱花在哪：专业建站费用通常在 8-20 万元区间。主要支出不在敲代码，而在“海外买家画像调研”、“英文行业母语级内容与技术文档改写”以及“Core Web Vitals 海外 CDN 架构部署”。\n2. 周期多久：标准交付周期为 8~12 周。前期 3 周做买家建模与内容梳理，中期 4 周做前后端开发与多语种部署，后期 3 周做技术 SEO 联调、AI 爬虫通道与表单打通。\n3. 如何验收：不要用主观的“好看不好看”验收，必须看客观指标：Google PageSpeed 评分 > 85、Schema 结构化校验零错误、海外主要节点加载 < 2.5 秒、表单自动入库 CRM。`,
            misconceptions: [
              '追求几千块的快速建站，结果交付的是漏洞百出的模板站，半年后收录仅个位数。',
              '把验收标准完全寄托在老板个人的主观视觉审美上，忽视了海外采购商的阅读习惯。'
            ],
            executiveTakeaway: '以工程化、数据化的交付物指标进行验收，确保独立站上线当天即可开始被 Google 与 AI 有效抓取。',
            notebookLmPodcast: {
              title: '【NotebookLM 决策者专线】老板必听：外贸建站防坑与验收五项铁律',
              audioDuration: '07:30',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '老板们听建站方案最怕被忽悠一堆专业名词。其实就记住五个铁律：测速得分、结构化数据绿灯、表单直通CRM、海外节点秒开、英文专业术语合规。',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '打开方案配置器计算建站预算',
              actionType: 'configurator',
              targetId: 'configurator'
            }
          }
        ]
      },
      {
        index: 7,
        name: 'M7 数据看板：看懂出海官网的核心指标',
        description: '从访客、跳出率、ChatGPT 引荐量到询盘转化，读懂获客仪表盘',
        lessons: [
          {
            id: 'lesson-a-7-4',
            moduleIndex: 7,
            title: '7.4 案例：爱康医疗海外站一周数据看板实战解读',
            summary: '复刻爱康医疗全球官网实拍看板：看懂 Google 自然搜索、ChatGPT 引荐流量、高意向国家分布与询盘转化路径。',
            durationMinutes: 20,
            conceptContent: `在画册第 6 页中，爱康医疗（AK Medical）全球站的后台仪表盘展现了极具代表性的数据结构：\n1. 引荐流量来源中，chatgpt.com、perplexity.ai 等生成式 AI 带来的访问占比逐步攀升至 18%，且这类访客的停留时长是普通访客的 2.4 倍。\n2. 受访高频页面不再是关于我们（About Us），而是带 3D 打印多孔钛参数表的技术白皮书页面。\n3. 询盘漏斗清晰映射：自测体检 -> 技术白皮书下载 -> 智能客服在线沟通 -> 业务员跟进。`,
            caseSnippet: {
              company: '爱康医疗 (港股上市)',
              title: '新站评分从 47 跃升至 95，ChatGPT 带来持续真实询盘',
              description: '通过爱康医疗旧官网 (ak-medical.net) 与新官网 (ak-medical-global.com) 对比，全面展现了三读者架构与 GEO 布局在海外医疗采购场景中的落地实效。'
            },
            misconceptions: [
              '看数据只看 PV 和 UV，不看来源渠道质量与真实询盘转化率。'
            ],
            executiveTakeaway: '合格的外贸独立站必须自带数据透明看板，每一条来自 Google 或 ChatGPT 的访问都清晰可溯源。',
            notebookLmPodcast: {
              title: '【NotebookLM 深度拆解】爱康医疗实战看板：ChatGPT 是如何给他们带来海外买家的？',
              audioDuration: '10:05',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: '大家可以在体验中心看到这个看板的交互演示。非常神奇的是，许多来自欧洲的医院采购工程师，直接通过 ChatGPT 推荐的链接进入了爱康的新官网！',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '体验中心：查看数据看板交互演示',
              actionType: 'tool',
              targetId: 'demo-analytics'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'course-b-seo',
    code: 'B',
    title: 'SEO——让海外买家在 Google 里找到你',
    subtitle: '看懂并管理一个外贸 SEO 项目：Google 标准、关键词映射、E-E-A-T 质量框架与效果衡量。',
    targetAudience: '外贸总经理、海外市场总监、出海品牌运营',
    totalModules: 8,
    totalLessons: 31,
    durationHours: 11,
    relatedService: '外贸 SEO 优化',
    frictionPoint: '看不见',
    heroCase: '泰宁科创 60 组英文核心词库与 SuDS 英国规范',
    relatedTool: {
      id: 'tool-frictions',
      name: '五断点自评',
      type: 'five_frictions',
    },
    executiveModuleSummary: 'SEO 不只是排关键词，更是 GEO 的底层知识通道。通过 E-E-A-T 权威信号与主题内容集群，构筑长期不灭的自然获客壁垒。',
    modules: [
      {
        index: 1,
        name: 'M1 认知：搜索引擎如何工作与分工',
        description: '抓取、索引、排序与海外买家的搜索心理',
        lessons: [
          {
            id: 'lesson-b-1-3',
            moduleIndex: 1,
            title: '1.3 SEO、付费广告与 GEO 的关系',
            summary: '付费广告停投即归零；SEO 是打底的持续公域资产；GEO 是基于搜索索引的终极推荐，三者协同形成获客漏斗。',
            durationMinutes: 16,
            conceptContent: `传统外贸获客往往过度依赖 Google Ads 关键词竞价，单次点击费用逐年高涨，一旦停止预算流量瞬间断崖。而 SEO 沉淀的是企业数字资产的自然权威，Google 收录的每一篇技术文章都在持续产生长尾复利。\n\n更为关键的是：今天主流 AI（如 Google AI Overview、Perplexity、ChatGPT Search）的答案生成，底层正是建立在对 Google 已经抓取并信任的高权重索引网页的实时检索！没有健康的 SEO 基础，GEO 推荐就是空中楼阁。`,
            misconceptions: [
              '以为做 SEO 就是找印度外包团队刷外链、堆砌关键词，结果被 Google 算法惩罚降权。',
              '把 SEO 和 GEO 对立起来，不知道 SEO 的技术底座正是 GEO 的燃料。'
            ],
            executiveTakeaway: '把 SEO 预算视为数字固定资产投资，SEO 为全站建立被 Google 索引的通行证，直接支撑后续的 GEO 推荐。',
            notebookLmPodcast: {
              title: '【NotebookLM 精英课】广告 vs SEO vs GEO：出海企业的流量三角形怎么搭？',
              audioDuration: '08:15',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '很多老板跑来问我：Sam，既然现在 AI 这么火，我们是不是不需要做 Google SEO，直接搞 GEO 就行了？',
                  highlight: false,
                },
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: '千万别！大模型不是凭空编出答案的，联网 AI 要回答“哪家供应商好”，第一步就是检索公开的高权重索引库。SEO 就是你的底层地基！',
                  highlight: true,
                }
              ]
            },
            quiz: [
              {
                question: '为什么说“SEO 是出海 GEO 的底层通道”？',
                options: [
                  '因为 SEO 价格比 GEO 贵很多',
                  '因为大模型进行实时联网检索（如 ChatGPT Search / Perplexity）高度依赖被主流搜索引擎收录的高权重网页',
                  '因为 Google 和 OpenAI 是同一家公司',
                  '因为外贸买家只在 Google 搜索，从不使用 AI'
                ],
                correctIndex: 1,
                explanation: '大模型的检索增强机制依赖公开网页的高质量索引，健康的 SEO 结构化数据是让 AI 顺利抓取引用的先决条件。'
              }
            ],
            nextStep: {
              label: '进入 3.5 泰宁科创 60 组核心词案例',
              actionType: 'lesson',
              targetId: 'lesson-b-3-5'
            }
          }
        ]
      },
      {
        index: 3,
        name: 'M3 关键词体系与内容集群',
        description: '从买家搜索意图推出核心词、长尾词与问题词体系',
        lessons: [
          {
            id: 'lesson-b-3-5',
            moduleIndex: 3,
            title: '3.5 案例：泰宁科创 60 组英文核心词体系搭建全过程',
            summary: '从中文雨水收集产品线，到精准映射欧美市政工程工程师习惯的 60 组高商业价值英文词库。',
            durationMinutes: 22,
            conceptContent: `泰宁科创作为中国雨水综合利用与海绵城市领军企业，在出海初期曾直接将“雨水模块”、“渗透井”字面翻译为 Rainwater Module，在海外搜索量极低且不符合工程惯例。\n\n云端智荐团队为其进行了深度买家意图重构：\n1. 词系归类：将词库分为信息型（What is SuDS compliance?）、对比型（Siphon drainage vs Gravity drainage cost comparison）、采购型（Stormwater attenuation tank manufacturer supplier）。\n2. 落地页一词一页映射：绝不让多个内部页面互相争抢相同关键词。\n3. 结合英国与欧盟规范：专门围绕 SuDS（可持续排水系统）撰写权威合规技术指引，让国际总包方直接按图索骥。`,
            caseSnippet: {
              company: '泰宁科创 (Tide Lion)',
              title: '60组核心词精准覆盖欧美市政工程与水务总包商',
              description: '将中文“水立方、大兴机场”工程经验转化为符合英国 SuDS 规范与 ASTM 标准的英文技术证据。'
            },
            misconceptions: [
              '用机器翻译软件直接翻关键词，忽视了欧美工程师行业内部的标准技术代号。'
            ],
            executiveTakeaway: '关键词不是拍脑袋想的，必须来源于海外买家的真实采购意图与当地工程技术规范。',
            notebookLmPodcast: {
              title: '【NotebookLM 案例复盘】泰宁科创如何用 60 组专业词库打开海外市政工程大门？',
              audioDuration: '09:40',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '这个案例最精彩的地方在于，把中国参编国标的威望，重新包装成了英国工程界认可的 SuDS 技术白皮书，直接打中了核心采购人员。',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '下载泰宁科创关键词映射表模板',
              actionType: 'tool',
              targetId: 'resources-templates'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'course-c-geo',
    code: 'C',
    title: 'GEO——让 AI 在答案里说出你的名字',
    subtitle: '云端智荐旗舰课：AI 如何挑选供应商、如何衡量你在 AI 里的位置、如何按六步闭环持续改进。',
    targetAudience: '出海企业决策者、市场总监、外贸业务掌门人',
    totalModules: 10,
    totalLessons: 36,
    durationHours: 14,
    relatedService: '出海 GEO 优化',
    frictionPoint: '不被信',
    heroCase: '爱康医疗全年 91 项内容规划与 AI 推荐评分 95 分',
    relatedTool: {
      id: 'tool-ai-visibility',
      name: 'AI 可见性测评 (旗舰工具)',
      type: 'ai_visibility',
    },
    executiveModuleSummary: '买家的第一站正在从搜索框迁移到 AI 对话框。做 GEO 就是让你在 ChatGPT、Perplexity 和 Gemini 给出的 3~5 个供应商名字中稳居第一梯队。',
    modules: [
      {
        index: 1,
        name: 'M1 认知：从搜索框到 AI 对话框的巨变',
        description: '海外买家采购行为的代际变迁与大模型工作机理',
        lessons: [
          {
            id: 'lesson-c-1-1',
            moduleIndex: 1,
            title: '1.1 买家的第一站在变：从翻看几十个网页到直接问 AI 要名单',
            summary: '过去买家在搜索结果里点开 10 个网页慢慢筛选，现在 AI 直接综合全网给出 3-5 个推荐供应商及理由。如果不在答案里，你就被彻底屏蔽了。',
            durationMinutes: 18,
            conceptContent: `根据 2026 年最新外贸采购商调研，超过 54% 的欧美 B2B 采购决策者在立项调研初期会首选使用 ChatGPT-4o、Perplexity 或 Gemini 提问：“推荐 3 家具备 CE/FDA 认证的亚太骨科植入物高性价比供应商”。\n\nAI 在生成回答时，不会展示数千条蓝色链接，而是直接输出一段凝练的段落与对比表格。这意味着：\n- 过去排在 Google 第 8 名可能还有几百次点击；\n- 今天如果 AI 没有在生成的 3 个名字里提到你，你的潜在客户在一开始就完全不知道你的存在！这就是出海企业面临的最严峻“看不见、不被信”断点。`,
            misconceptions: [
              '认为 AI 只是玩具，严肃的工业品或医疗器械海外大客户不可能用 AI 寻找供应商。',
              '以为在自己网站上挂几篇 AI 自动生成的洗稿文章就算是做了 GEO。'
            ],
            executiveTakeaway: 'GEO 是出海企业未来 3-5 年最大的结构性红利。越早建立在各大 AI 知识库中的权威信源引用，护城河越深。',
            notebookLmPodcast: {
              title: '【NotebookLM 旗舰课导读】海外采购商的第一站变了：你准备好被 AI 点名了吗？',
              audioDuration: '11:20',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: 'Sam，很多传统外贸老牌企业很有实力，工厂几百亩，但他们在海外 AI 的回答里是完全“不存在”的。',
                  highlight: false,
                },
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '太真实了！因为大模型是基于全网信源的证据链来推断信誉的。你的产品再好，如果没有被高质量信源收录引用，AI 根本不敢推荐你。',
                  highlight: true,
                },
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: '这就是为什么我们要提出 GEO 六步闭环。不仅要测出你的现状，更要用科学的方法，把你的名字写进 AI 的答案里！',
                  highlight: true,
                }
              ]
            },
            quiz: [
              {
                question: '面对海外买家向 AI（如 ChatGPT / Perplexity）直接提问推荐供应商的趋势，出海企业最核心的应对策略是？',
                options: [
                  '继续在传统 B2B 黄页上大量花钱做横幅广告',
                  '实施 GEO（生成式引擎优化），构建高权重证据链与第三方权威信源引用',
                  '完全封锁自己的网站不让任何爬虫抓取',
                  '花钱雇水军去各大论坛刷好评'
                ],
                correctIndex: 1,
                explanation: 'GEO 核心在于通过结构化证据、决策者建模、第三方权威信源铺设，让大模型在检索比对时有理有据地推荐你的品牌。'
              }
            ],
            nextStep: {
              label: '进入 AI 可见性测评（旗舰工具）',
              actionType: 'tool',
              targetId: 'tool-ai-visibility'
            }
          },
          {
            id: 'lesson-c-1-2',
            moduleIndex: 1,
            title: '1.2 GEO 是什么：与 SEO 的区别与联系',
            summary: 'SEO 的目标是排进搜索结果列表前列；GEO 的目标是被 AI 消化理解并在生成的答案正文中作为推荐选项列出。',
            durationMinutes: 16,
            conceptContent: `GEO（Generative Engine Optimization）与 SEO（Search Engine Optimization）有着密不可分的关系：\n- SEO：优化网页以匹配特定的搜索关键词，争夺点击进入率。评价指标是关键词排名（Ranking）、展示量（Impressions）和点击率（CTR）。\n- GEO：优化企业的全网知识实体与信源证据，争取在 AI 对话生成的最终结论中被指名道姓地推荐。核心衡量三大指标：AI 可见性（Visibility %）、推荐排名（Recommendation Rank）、好感度与正面佐证率（Sentiment）。\n\nSEO 是水系通道，GEO 是汇聚成海的知识认知。`,
            misconceptions: [
              '认为做 GEO 就是搞黑客攻击或者信息投毒篡改大模型参数。',
              '以为 GEO 可以保证 100% 每次提问都排第一，不了解大模型的温度随机性机制。'
            ],
            executiveTakeaway: '不要把预算押在单一渠道。用 SEO 保证公开透明的抓取通道，用 GEO 抢占下一代 AI 采购推荐高地。',
            notebookLmPodcast: {
              title: '【NotebookLM 深度对比】SEO vs GEO：一张图看清技术差异与收益模型',
              audioDuration: '08:50',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '我们团队做了一个很生动的比喻：SEO 是让你在货架上摆在显眼的位置，而 GEO 则是直接让最权威的行业专家在客户耳边推荐你的名字！',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '进入 3.1 GEO 六步闭环方法论',
              actionType: 'lesson',
              targetId: 'lesson-c-3-1'
            }
          }
        ]
      },
      {
        index: 3,
        name: 'M3 闭环体系：云端智荐 GEO 六步闭环法',
        description: '诊断、建模、内容、信源、口碑、监测六步按月迭代',
        lessons: [
          {
            id: 'lesson-c-3-1',
            moduleIndex: 3,
            title: '3.1 六步闭环总览：诊断、建模、内容、信源、口碑、监测',
            summary: '拒绝一次性盲目投放，按月进行六步数据迭代，确保持续累积为可增值的企业国际数字资产。',
            durationMinutes: 24,
            conceptContent: `云端智荐标准 GEO 交付实施采用严格的六步闭环体系：\n1. 诊断（Diagnosis）：通过无记忆会话对各大平台进行上百次探针提问，摸清现状与竞品差距。\n2. 建模（Modeling）：还原海外 3-7 类不同决策者（采购、工程师、分销商）的高频采购意图与真实提问簇。\n3. 内容（Content）：创作 AI 最乐于引用的高价值技术白皮书、合规对比指南与数值定义。\n4. 信源（Sources）：以独立站为中心，在学术平台、海外行业媒体与 LinkedIn 铺设权威外链。\n5. 口碑（Reputation）：整理第三方佐证、工程案例与防伪认证，纠偏负面信息。\n6. 监测（Monitoring）：按月运行自动化评测集，追踪可见性曲线并迭代下一月行动。`,
            misconceptions: [
              '搞一次性突击，以为做完一次以后就再也不用管了。大模型知识库与联网索引是每月动态更新的。'
            ],
            executiveTakeaway: '六步闭环把虚无缥缈的“AI 推荐”变成了可排期、可量化、可月度验收的工程化项目。',
            notebookLmPodcast: {
              title: '【NotebookLM 核心方法论】GEO 六步闭环：我们是如何把玄学变成确定性工程的？',
              audioDuration: '12:05',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: '这个六步闭环最牛的地方在于，客户每个月拿到的是实打实的可视化数据报表，看见自己的可见性从 30% 一步步爬升到 90% 以上。',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '体验中心：GEO 优化前后效果对比',
              actionType: 'tool',
              targetId: 'demo-geo'
            }
          }
        ]
      },
      {
        index: 10,
        name: 'M10 决策者篇：投入、周期与验收',
        description: '如何理性评估 GEO 投入产出比、服务商选择与合规红线',
        lessons: [
          {
            id: 'lesson-c-10-2',
            moduleIndex: 10,
            title: '10.2 案例实战：爱康医疗从 47 分到 95 分的数据口径客观说明',
            summary: '明确客观口径：47→95 分为第三方工具 arobis.ai 站点信号就绪度，结合真实来自 chatgpt.com 的高价值引荐访问，讲真话体现专业敬畏。',
            durationMinutes: 18,
            conceptContent: `在画册中我们公开了爱康医疗的实战成果：从原官网的 47 分跨越到新站的 95 分。在向客户汇报时，必须主动讲清数据口径：\n- 47 分到 95 分，属于权威第三方评估平台 arobis.ai 基于网站内容结构、定义完整性与信源就绪度的客观估算。\n- 更加确凿的业务成果，是来自 Google Analytics 4 后台的真实记录：chatgpt.com、perplexity 等 AI 域名作为 Referral（引荐流量）来源，连续数月源源不断带来海外骨科医院器械采购科工程师的访问，且平均停留时间达 4 分 35 秒。\n\n主动讲清口径，不搞数字游戏，是云端智荐作为专业出海工程师团队的立身之本。`,
            caseSnippet: {
              company: '爱康医疗',
              title: '骨科 3D 打印龙头企业的全球化 GEO 样本',
              description: '全年 91 项技术内容规划，四类海外决策者建模，实现了从传统国内龙头向全球被信任品牌的飞跃。'
            },
            misconceptions: [
              '有些不正规的服务商声称“充钱就能在 ChatGPT 里置顶你的广告”，完全是欺骗不懂技术的老板。'
            ],
            executiveTakeaway: '合规做 GEO，建立真实增值的企业数字资产；拒绝黑帽刷量和信息投毒，长效享受 AI 出海红利。',
            notebookLmPodcast: {
              title: '【NotebookLM 决策者专线】爱康医疗 47 到 95 分背后的真实故事与专业敬畏',
              audioDuration: '09:55',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '我非常赞赏云端智荐团队的一点：从来不吹神话，把数据口径说得一清二楚。老板们听得明白，心里踏实，合作自然会长久。',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '预约 30 分钟深度诊断会',
              actionType: 'booking',
              targetId: 'booking'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'course-d-ai-agent',
    code: 'D',
    title: 'AI 智能客服及系统对接——7×24 小时接住每一条询盘',
    subtitle: '规划高转化 AI 客服：知识库建设、多渠道接入、意向自动分级、直连 CRM 阻断流失。',
    targetAudience: '外贸业务副总、海外客服主管、IT 负责人',
    totalModules: 9,
    totalLessons: 34,
    durationHours: 12,
    relatedService: 'AI 智能客服及系统对接',
    frictionPoint: '接不住',
    heroCase: '凌晨 03:12 美国客户询价，03:14 自动写入 CRM',
    relatedTool: {
      id: 'tool-loss-calc',
      name: '询盘流失计算器',
      type: 'loss_calc',
    },
    executiveModuleSummary: '解决 12 小时跨时区时差痛点。AI 不是冷冰冰的关键词回复，而是基于企业知识库、能听懂专业术语、能分级高意向的 7×24 小时出海金牌销售助理。',
    modules: [
      {
        index: 1,
        name: 'M1 痛点诊断：询盘为什么在跨时区夜间严重流失',
        description: '算清回复延迟带来的隐形流失，拆解凌晨三点典型场景',
        lessons: [
          {
            id: 'lesson-d-1-2',
            moduleIndex: 1,
            title: '1.2 案例实测：凌晨三点的一条询盘如何被完美接住',
            summary: '03:12 美国加州客户提出复杂技术规格，03:13 AI 依据知识库回答并索要采购量，03:14 写入 CRM 并分流，09:00 业务员直接报价成交。',
            durationMinutes: 16,
            conceptContent: `真实外贸场景拆解：\n- 03:12（北京时间深夜）：美国加利福尼亚某工程采购总监访问网站，在客服窗口询问：“你们的排水构件是否满足 AASHTO M252 标准？如果首批订购 500 件，交期大概多久？”\n- 03:13：传统网站此时间段往往只有冷冰冰的“客服已离线，请留言”，买家立刻关闭页面寻找下一个竞争对手。\n- 云端智荐 AI 客服：毫秒级调用后台《ASTM 与 AASHTO 合规参数知识库》，正面答复：“是的，完全符合标准。针对 500 件规格，常规模具备货生产交期约为 18 个工作日。请问您需要海运至美西哪处港口以便为您测算含税到岸价？”\n- 03:14：买家回复港口信息。AI 瞬间提取“意向等级：HIGH”、“采购量：500pcs”、“目标港：长滩港”，自动在企业 CRM 生成线索卡片，并给区域销售经理的企业微信发送高优先级待办通知。\n- 09:00：国内销售上班，无需再做繁琐的冷启动询问，直接带精准测算报价单发起跟进，成功锁定订单！`,
            misconceptions: [
              '以为智能客服就是传统的“按 1 查物流，按 2 转人工”死板规则树。',
              '担心大模型会胡言乱语承诺低价或泄露商业底价。通过严格边界提示词与知识库隔离完全可控。'
            ],
            executiveTakeaway: '一条 5 万美元的工业品订单，往往就决定在买家深夜发问的头 5 分钟内。AI 客服是外贸转化的最强锁闭器。',
            notebookLmPodcast: {
              title: '【NotebookLM 场景复盘】凌晨三点的一条询盘：AI 如何帮你抢回 5 万美元订单？',
              audioDuration: '08:40',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: '这个凌晨三点的案例太经典了。很多老板算账，总觉得自己没花钱雇夜班销售是省钱，其实每年因为夜间无人回复漏掉的利润，够建好几个独立站了！',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '体验中心：AI 客服沙盒与凌晨三点模式',
              actionType: 'tool',
              targetId: 'demo-sandbox'
            }
          }
        ]
      },
      {
        index: 9,
        name: 'M9 决策者篇：算清账本与系统对接收益',
        description: '询盘流失公式、CRM 与企业微信直连、ROI 算清每一分钱',
        lessons: [
          {
            id: 'lesson-d-9-2',
            moduleIndex: 9,
            title: '9.2 决策者篇：用询盘流失公式算清一笔账',
            summary: '输入月询盘量 Q、夜间到达占比 p、客单价 A、成单率 c，算清每年因迟钝响应到底丢了多少真金白银。',
            durationMinutes: 15,
            conceptContent: `云端智荐官方流失估算模型：L = Q × p × r × c × A。其中 Q 为月总询盘量，p 为夜间跨时区到达占比，r 为延误流失率，c 为成单率，A 为客单价。很多企业每年因夜间回复慢流失数十万美元订单，而部署 AI 客服仅需数万元，ROI 极具压倒性。`,
            misconceptions: [
              '认为客户不急，等国内第二天上班再回邮件也来得及。海外采购商平均同时向 3 家询价，首个专业回复者胜率高出 70%。'
            ],
            executiveTakeaway: '不要再让辛辛苦苦花广告费买来的海外流量，在深夜的等待中付诸东流。',
            notebookLmPodcast: {
              title: '【NotebookLM 财务分析】算清一笔账：你的企业每年因为“回复慢”悄悄丢了多少钱？',
              audioDuration: '07:55',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Sam',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  text: '很多老板自己动手拉完这个流失计算器的滑块后，往往一身冷汗。算得清清楚楚的账，比任何销售推销都更有说服力。',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '打开询盘流失计算器进行实测',
              actionType: 'tool',
              targetId: 'tool-loss-calc'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'course-e-fde',
    code: 'E',
    title: 'FDE 驻场工程师——把系统做成、接通、用起来',
    subtitle: '解密前线部署工程师：为什么比买软件或找外包更适合出海实体、企业如何敏捷配合。',
    targetAudience: '出海企业决策者、CTO、信息总监、运营负责人',
    totalModules: 8,
    totalLessons: 28,
    durationHours: 10,
    relatedService: 'FDE 驻场工程师',
    frictionPoint: '连不上',
    heroCase: '每周敏捷迭代：观察-原型-试用-修改',
    relatedTool: {
      id: 'tool-inquiry-flow',
      name: '询盘与系统现状梳理',
      type: 'inquiry_flow',
    },
    executiveModuleSummary: '软件买了一堆，用不起来等于废纸。FDE 工程师带着代码深入业务一线，当周做原型，当周让一线外贸业务员试用，彻底攻克“连不上”顽疾。',
    modules: [
      {
        index: 1,
        name: 'M1 认知：什么是 FDE（前线部署工程师）',
        description: '源自 Palantir 的工程文化，与传统外包及 SaaS 售前的本质区别',
        lessons: [
          {
            id: 'lesson-e-1-1',
            moduleIndex: 1,
            title: '1.1 前线部署工程师的由来与核心职责',
            summary: 'FDE（Forward Deployed Engineer）既懂商业一线场景，又具备快速全栈编码能力，以解决具体业务结果为唯一交付目标。',
            durationMinutes: 18,
            conceptContent: `传统企业出海搞数字化，往往面临尴尬两难：\n- 路线 1：买标准 SaaS。功能是现成的，但海外多语种支持生硬，无法对接企业已有的 ERP 和内部报关系统，最终员工嫌麻烦弃用。\n- 路线 2：找传统软件外包。写了一堆厚厚的“需求规格说明书”，外包人员完全不懂外贸业务，耗时半年交付的代码漏洞百出，谁也不敢动。\n\nFDE 模式打破了这种僵局：\n工程师直接驻场在客户外贸销售团队身边，坐下来看销售怎么给买家查库存、看客服怎么回邮件。发现阻碍后，当天用低代码或全栈脚本写出原型，第二天让业务员点一点，当周完成修改上线！这就是把技术做成、接通、用起来的唯一正解。`,
            misconceptions: [
              '把 FDE 等同于普通的驻场外包劳务派遣。FDE 拥有系统架构与业务重构的高阶能力。'
            ],
            executiveTakeaway: '数字化成功的前提是一线员工真正在用。FDE 交付的是可落地的业务成果，而不是静态的无用代码。',
            notebookLmPodcast: {
              title: '【NotebookLM 深度访谈】FDE 是什么？为什么大洋彼岸的 Palantir 靠它打赢所有硬仗？',
              audioDuration: '10:18',
              hosts: ['Alex', 'Sam'],
              transcript: [
                {
                  speaker: 'Alex',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  text: '真正的数字化从来不是闭门造车写出来的，而是在一线销售的办公桌旁边看出来的。FDE 的灵魂就在于“每周一轮的快速敏捷循环”。',
                  highlight: true,
                }
              ]
            },
            nextStep: {
              label: '体验中心：浏览 FDE 的一周时间线',
              actionType: 'tool',
              targetId: 'demo-fde'
            }
          }
        ]
      }
    ]
  }
];

export const ROLE_LEARNING_PATHS: RoleLearningPath[] = [
  {
    id: 'path-boss',
    title: '老板 60 分钟看懂 AI 出海',
    targetRole: '决策者（董事长、总经理、出海项目投资人）',
    durationText: '约 60 分钟',
    description: '无需技术细节，聚焦五门课的“决策者篇”，摸清投入预算、交付周期、避坑防雷与验收标准。',
    endGoal: '清晰判断要不要做、做哪几项、花多少钱、如何考核团队与服务商',
    featuredLessonIds: ['lesson-a-1-4', 'lesson-b-1-3', 'lesson-c-10-2', 'lesson-d-9-2', 'lesson-e-1-1'],
    recommendedToolId: 'tool-frictions',
  },
  {
    id: 'path-acquisition',
    title: '获客增长路径：独立站 + SEO + GEO',
    targetRole: '外贸总监、海外市场总监、出海品牌操盘手',
    durationText: '约 3.5 小时精读',
    description: '深入构建全域流量漏斗，从独立站三读者架构，到 Google 核心词库，再到抢占 AI 推荐首选。',
    endGoal: '打造持续产生高意向外贸询盘的自然流量引擎',
    featuredLessonIds: ['lesson-a-1-1', 'lesson-a-1-2', 'lesson-b-3-5', 'lesson-c-1-1', 'lesson-c-3-1'],
    recommendedToolId: 'tool-ai-visibility',
  },
  {
    id: 'path-conversion',
    title: '询盘转化路径：7×24 小时阻断夜间流失',
    targetRole: '海外客服主管、业务骨干、销售运营',
    durationText: '约 2 小时精学',
    description: '攻克跨时区时差痛点，学会整理企业知识库、调优 AI 提示词边界并直通 CRM。',
    endGoal: '彻底消灭凌晨流失，让每条海外询盘在 60 秒内得到专业结构化响应',
    featuredLessonIds: ['lesson-d-1-2', 'lesson-d-9-2', 'lesson-a-7-4'],
    recommendedToolId: 'tool-loss-calc',
  },
  {
    id: 'path-tech',
    title: '技术评估与落地路径：底座、安全与 FDE',
    targetRole: 'IT 负责人、技术架构师、CIO',
    durationText: '约 2.5 小时深入',
    description: '全面评估独立站技术栈、Schema 结构化数据、多系统 API 对接、私有化部署与数据合规。',
    endGoal: '输出清晰的内部技术对接规划与安全合规防范报告',
    featuredLessonIds: ['lesson-a-1-2', 'lesson-e-1-1', 'lesson-c-3-1'],
    recommendedToolId: 'tool-inquiry-flow',
  }
];
