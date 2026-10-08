import { SERVICE_COUNT_CN, SHOW_FDE } from '../lib/features';
import { courseA } from './en/courseA';
import { courseB } from './en/courseB';
import { courseC } from './en/courseC';
import { courseD } from './en/courseD';
import { courseE } from './en/courseE';
import { pathsEn } from './en/paths';
import type { CourseEn, LessonEn } from './en/types';

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
  videoUrl: string; // 课程视频，放在 public/videos/<课程字母>/ 下
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
  // 配套工具：目前只有首页的 AI 可见性测评，没有合适工具的课程不设
  relatedTool?: {
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

const ALL_COURSES: Course[] = [
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
      id: 'tool-ai-visibility',
      name: 'AI 可见性测评',
      type: 'ai_visibility',
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
            videoUrl: '/videos/a/a-1-1.mp4',
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
              actionLabel: '一键评估',
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
            videoUrl: '/videos/a/a-1-2.mp4',
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
              label: '免费评估官网出海就绪度',
              actionType: 'tool',
              targetId: 'tool-ai-visibility'
            }
          },
          {
            id: 'lesson-a-1-4',
            moduleIndex: 1,
            title: '1.4 决策者篇：投入、周期与验收',
            summary: '搞懂外贸独立站的投入构成、2-3个月的交付节奏与5大客观验收标准，老板花15分钟即可理性拍板。',
            durationMinutes: 12,
            conceptContent: `老板做独立站最关心的三件事：\n1. 投入花在哪：专业建站的主要投入不在敲代码，而在“海外买家画像调研”、“英文行业母语级内容与技术文档改写”以及“Core Web Vitals 海外 CDN 架构部署”。\n2. 周期多久：标准交付周期为 8~12 周。前期 3 周做买家建模与内容梳理，中期 4 周做前后端开发与多语种部署，后期 3 周做技术 SEO 联调、AI 爬虫通道与表单打通。\n3. 如何验收：不要用主观的“好看不好看”验收，必须看客观指标：Google PageSpeed 评分 > 85、Schema 结构化校验零错误、海外主要节点加载 < 2.5 秒、表单自动入库 CRM。`,
            misconceptions: [
              '追求几天上线的快速建站，结果交付的是漏洞百出的模板站，半年后收录仅个位数。',
              '把验收标准完全寄托在老板个人的主观视觉审美上，忽视了海外采购商的阅读习惯。'
            ],
            executiveTakeaway: '以工程化、数据化的交付物指标进行验收，确保独立站上线当天即可开始被 Google 与 AI 有效抓取。',
            videoUrl: '/videos/a/a-1-4.mp4',
            nextStep: {
              label: '打开方案规划查看建站周期',
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
            conceptContent: `在画册第 6 页中，爱康医疗（AK Medical）全球站的后台仪表盘展现了极具代表性的数据结构：\n1. 引荐流量来源中，chatgpt.com、perplexity.ai 等生成式 AI 带来的访问占比逐步攀升至 18%，且这类访客的停留时长是普通访客的 2.4 倍。\n2. 受访高频页面不再是关于我们（About Us），而是带 3D 打印多孔钛参数表的技术白皮书页面。\n3. 询盘漏斗清晰映射：AI 可见性测评 -> 技术白皮书下载 -> 智能客服在线沟通 -> 业务员跟进。`,
            caseSnippet: {
              company: '爱康医疗 (港股上市)',
              title: '国内官网 47 分，新建海外官网 95 分，ChatGPT 带来持续真实询盘',
              description: '通过爱康医疗国内官网 (ak-medical.net) 与新建海外官网 (ak-medical-global.com) 对比，全面展现了三读者架构与 GEO 布局在海外医疗采购场景中的落地实效。'
            },
            misconceptions: [
              '看数据只看 PV 和 UV，不看来源渠道质量与真实询盘转化率。'
            ],
            executiveTakeaway: '合格的外贸独立站必须自带数据透明看板，每一条来自 Google 或 ChatGPT 的访问都清晰可溯源。',
            videoUrl: '/videos/a/a-7-4.mp4',
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
      id: 'tool-ai-visibility',
      name: 'AI 可见性测评',
      type: 'ai_visibility',
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
            videoUrl: '/videos/b/b-1-3.mp4',
            quiz: [
              {
                question: '为什么说“SEO 是出海 GEO 的底层通道”？',
                options: [
                  '因为 SEO 见效比 GEO 快很多',
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
            videoUrl: '/videos/b/b-3-5.mp4',
            nextStep: {
              label: '预约诊断，规划贵司的核心词体系',
              actionType: 'booking',
              targetId: 'booking'
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
      name: 'AI 可见性测评',
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
            videoUrl: '/videos/c/c-1-1.mp4',
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
              label: '进入 AI 可见性测评',
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
            videoUrl: '/videos/c/c-1-2.mp4',
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
            videoUrl: '/videos/c/c-3-1.mp4',
            nextStep: {
              label: '进入 AI 可见性测评',
              actionType: 'tool',
              targetId: 'tool-ai-visibility'
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
            title: '10.2 案例实战：爱康医疗 47 分与 95 分的数据口径客观说明',
            summary: '明确客观口径：47 分与 95 分分别是国内官网与新建海外官网的 GEO / SEO 评分，由第三方工具 arobis.ai 按同一口径测得，结合真实来自 chatgpt.com 的高价值引荐访问，讲真话体现专业敬畏。',
            durationMinutes: 18,
            conceptContent: `在画册中我们公开了爱康医疗的实战成果：现有国内官网 (ak-medical.net) 的 GEO / SEO 评分为 47 分，我们新建的海外官网 (ak-medical-global.com) 为 95 分。在向客户汇报时，必须主动讲清数据口径：\n- 这是两个站点之间的对比，而不是同一站点改造前后的变化；两个分数都由权威第三方评估平台 arobis.ai 基于网站内容结构、定义完整性与信源就绪度，按同一口径客观估算。\n- 更加确凿的业务成果，是来自 Google Analytics 4 后台的真实记录：chatgpt.com、perplexity 等 AI 域名作为 Referral（引荐流量）来源，连续数月源源不断带来海外骨科医院器械采购科工程师的访问，且平均停留时间达 4 分 35 秒。\n\n主动讲清口径，不搞数字游戏，是云端智荐作为专业出海工程师团队的立身之本。`,
            caseSnippet: {
              company: '爱康医疗',
              title: '骨科 3D 打印龙头企业的全球化 GEO 样本',
              description: '全年 91 项技术内容规划，四类海外决策者建模，实现了从传统国内龙头向全球被信任品牌的飞跃。'
            },
            misconceptions: [
              '有些不正规的服务商声称“充钱就能在 ChatGPT 里置顶你的广告”，完全是欺骗不懂技术的老板。'
            ],
            executiveTakeaway: '合规做 GEO，建立真实增值的企业数字资产；拒绝黑帽刷量和信息投毒，长效享受 AI 出海红利。',
            videoUrl: '/videos/c/c-10-2.mp4',
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
            videoUrl: '/videos/d/d-1-2.mp4',
            nextStep: {
              label: '规划 AI 客服方案',
              actionType: 'configurator',
              targetId: 'configurator'
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
            videoUrl: '/videos/d/d-9-2.mp4',
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
    id: 'course-e-fde',
    code: 'E',
    title: 'FDE 驻场工程师——用 AI 做实标准化、信息化、智能化',
    subtitle: '看懂前线部署工程师的来龙去脉，以及它如何带着 AI 把企业的经验变成标准、系统和生产力。',
    targetAudience: '出海企业决策者、CIO、信息化负责人、运营负责人',
    totalModules: 8,
    totalLessons: 28,
    durationHours: 10,
    relatedService: 'FDE 驻场工程师',
    frictionPoint: '连不上',
    heroCase: '三层建设 · 每周“观察-原型-试用-沉淀”',
    executiveModuleSummary: '软件买了一堆却用不起来，AI 试了几次只停在演示，根子往往在于经验没写成标准、标准没装进系统。FDE 带着 AI 驻场一线，自下而上完成三层建设，对业务结果负责，离场时把能力留给企业。',
    modules: [
      {
        index: 1,
        name: 'M1 认知：什么是 FDE（前线部署工程师）',
        description: '从 Palantir 到 AI 公司：FDE 的由来、三层建设方法，以及它与外包、SaaS、咨询的区别',
        lessons: [
          {
            id: 'lesson-e-1-1',
            moduleIndex: 1,
            title: '1.1 FDE 从哪来，和外包、SaaS、咨询有什么不同',
            summary: 'FDE 是驻场在客户业务一线、对业务结果负责的工程师：普通工程师把一个功能做给很多客户，FDE 为一个客户把很多能力做通。',
            durationMinutes: 18,
            conceptContent: `FDE（Forward Deployed Engineer，前线部署工程师）诞生于 Palantir。Palantir 把驻场团队分成两类：Echo 懂行业，能说清一线的问题到底出在哪；Delta 写代码，能在信息不完整时快速交付可用的系统。两者合在一起，就是今天所说的 FDE。\n\n2024 年以后，OpenAI、Anthropic 等 AI 公司纷纷组建 FDE 团队。原因很朴素：模型越来越强，但企业里的 AI 项目大多停在试点。卡住它们的不是模型，而是模型进不了真实的流程、数据和系统。\n\n四种常见路线的区别：\n- 咨询公司：交付建议报告，停在 PPT，落地靠企业自己。\n- 软件外包：按需求文档交代码，外包人员不懂业务，需求一变就要加钱改。\n- 标准 SaaS：交付账号和标准功能，流程去适应软件，停止付费就停用。\n- FDE：交付业务结果。驻场跟岗、边看边做、每周迭代，离场时把标准、系统、数据和会用的人留给企业。`,
            misconceptions: [
              '把 FDE 等同于驻场外包或人力派遣。FDE 对业务结果负责，而不是对工时或需求文档负责。',
              '以为 FDE 只是来帮企业“接个 AI 接口”。真正耗时的往往是梳理流程、清洗数据和组织协同。'
            ],
            executiveTakeaway: '评估 FDE 服务，不要只问“派几个人、驻多久”，要问“每周交付什么结果、离场后留下什么”。',
            videoUrl: '/videos/e/e-1-1.mp4',
            quiz: [
              {
                question: 'FDE 与传统软件外包最本质的区别是什么？',
                options: [
                  'FDE 派的人更多、驻场时间更长',
                  'FDE 对业务结果负责，驻场跟岗、每周迭代，并把能力留给企业',
                  'FDE 只负责采购和安装 AI 软件',
                  'FDE 不写代码，只出咨询报告'
                ],
                correctIndex: 1,
                explanation: '外包对需求文档负责，咨询对建议负责，FDE 对业务结果负责：既写生产级代码，也要确保一线真正用起来，并在离场时把能力留给企业。'
              }
            ],
            nextStep: {
              label: '进入 1.2 三层建设',
              actionType: 'lesson',
              targetId: 'lesson-e-1-2'
            }
          },
          {
            id: 'lesson-e-1-2',
            moduleIndex: 1,
            title: '1.2 三层建设：标准化、信息化、智能化',
            summary: 'AI 放大的是企业已有的秩序。FDE 自下而上推进三层：先把经验写成规则，再把规则装进系统，最后让 AI 在系统上干活。',
            durationMinutes: 22,
            conceptContent: `很多外贸企业上 AI 失败，不是模型不行，而是地基没打：报价靠老业务员心算，产品参数散在 PDF 和微信里，客户在 Excel，线索在个人邮箱。在这样的底子上接 AI，只能做出一场漂亮的演示。\n\nFDE 的工作因此分三层，自下而上：\n\n第 1 层 标准化：把经验写成规则\n跟岗访谈业务骨干，用 AI 转写录音，从历史邮件、报价单和聊天记录中归纳规则，生成 SOP、产品参数主数据、报价规则和询盘分级标准的初稿，再由业务负责人审定。\n\n第 2 层 信息化：把规则装进系统\n用 AI 辅助数据清洗、字段映射和接口脚本，把独立站表单、邮件、WhatsApp、CRM 与 ERP 接成一条线，配好权限和操作日志，让老板第一次看到完整的漏斗。\n\n第 3 层 智能化：让 AI 在系统上干活\n在清晰的规则和干净的数据之上，部署 AI 客服、询盘分级、报价助手和会前商业情报；每个场景都配评测集和人工复核点，上线后按周调优。\n\n三层不是三个先后立项的项目，而是每周都在推进：一个场景走完一轮“观察-原型-试用-沉淀”，三层就各往前走一步。`,
            caseSnippet: {
              company: '示例场景',
              title: '询盘分级：一周走完三层',
              description: '周一至周二跟岗，用 AI 从历史询盘中归纳分级规则（标准化）；周三把规则变成 CRM 意向字段，接通表单与询盘邮箱（信息化）；周四 AI 按规则自动打标，业务员逐条确认（智能化）；周五把纠正过的案例写回规则与评测集。'
            },
            misconceptions: [
              '跳过前两层直接买 AI 工具。没有标准和数据，AI 答错了没人发现，也没人兜底。',
              '把标准化理解为写一堆没人看的制度文件。这里的标准，是能被系统执行、被 AI 调用的规则和数据。'
            ],
            executiveTakeaway: '没有标准化的智能化，只是把混乱自动化。先问企业的经验有没有写下来、数据在不在系统里，再谈上什么 AI。',
            videoUrl: '/videos/e/e-1-2.mp4',
            quiz: [
              {
                question: '外贸企业想用 AI 自动给询盘分级，FDE 通常先做哪一步？',
                options: [
                  '直接采购一款 AI 客服产品上线',
                  '跟岗梳理业务员的判断经验，用 AI 归纳成可执行的分级规则',
                  '先招一支算法团队自研大模型',
                  '让 IT 部门独立写需求文档交给外包开发'
                ],
                correctIndex: 1,
                explanation: '分级规则是 AI 执行的依据。先把一线经验标准化，再装进 CRM，最后让 AI 按规则打标，结果才可验证、可纠正。'
              }
            ],
            nextStep: {
              label: '进入 8.1 决策者篇',
              actionType: 'lesson',
              targetId: 'lesson-e-8-1'
            }
          }
        ]
      },
      {
        index: 8,
        name: 'M8 决策者篇：切入、配合、验收与离场',
        description: '从哪个场景开始、企业要出什么人、如何按层验收、FDE 离场后留下什么',
        lessons: [
          {
            id: 'lesson-e-8-1',
            moduleIndex: 8,
            title: '8.1 决策者篇：从哪切入、怎么配合、怎么验收',
            summary: '从一个高价值场景切入，2 ~ 4 周跑通第一个闭环；按三层分别验收；从第一周起就为离场做准备。',
            durationMinutes: 15,
            conceptContent: `老板引入 FDE，最该想清楚四件事：\n\n1. 从哪里切入：选一个高频、痛感强、结果可衡量的场景，例如“询盘到报价”。不要一上来就做全公司的数字化。\n\n2. 企业出什么人：一位能拍板的业务负责人，两三位愿意试用的一线业务员，一位 IT 对接人。FDE 能写代码，但替代不了业务方的判断。\n\n3. 怎么验收：按层验收，不按人天验收。标准化看规则是否经业务负责人审定并写进 SOP；信息化看线索与数据是否自动入库、看板是否可用；智能化看评测集准确率、人工纠正率和响应时效。\n\n4. 离场留下什么：源码、数据、文档与账号全部在企业名下；最小权限、开发与生产隔离、操作全程留痕；同步培养一两名内部 AI 业务骨干，离场后 FDE 转为顾问。\n\n参考投入：FDE 驻场通常为 20 ~ 50 万元 / 周期，取决于场景数量、系统复杂度以及是否需要私有化部署。`,
            misconceptions: [
              '指望 FDE 独立搞定一切，业务负责人不参与每周的试用与拍板。',
              '用“驻了多少人天”来验收，而不是看每一层留下了什么。'
            ],
            executiveTakeaway: '好的 FDE 会让自己越来越不被需要：离场那天，标准在、系统在、数据在，会用的人也在。',
            videoUrl: '/videos/e/e-8-1.mp4',
            nextStep: {
              label: '预约 60 分钟技术对接评估会',
              actionType: 'booking',
              targetId: 'booking'
            }
          }
        ]
      }
    ]
  }
];

// 课程 E 对应 FDE 驻场服务，随 SHOW_FDE 一起隐藏
export const COURSES: Course[] = SHOW_FDE ? ALL_COURSES : ALL_COURSES.filter((course) => course.code !== 'E');

const ALL_ROLE_LEARNING_PATHS: RoleLearningPath[] = [
  {
    id: 'path-boss',
    title: '老板 60 分钟看懂 AI 出海',
    targetRole: '决策者（董事长、总经理、出海项目投资人）',
    durationText: '约 60 分钟',
    description: `无需技术细节，聚焦${SERVICE_COUNT_CN}门课的“决策者篇”，摸清投入构成、交付周期、避坑防雷与验收标准。`,
    endGoal: '清晰判断要不要做、做哪几项、先做哪项、如何考核团队与服务商',
    featuredLessonIds: ['lesson-a-1-4', 'lesson-b-1-3', 'lesson-c-10-2', 'lesson-d-9-2', 'lesson-e-8-1'],
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
    title: SHOW_FDE ? '技术评估与落地路径：底座、安全与 FDE' : '技术评估与落地路径：底座、安全与系统对接',
    targetRole: 'IT 负责人、技术架构师、CIO',
    durationText: '约 2.5 小时深入',
    description: '全面评估独立站技术栈、Schema 结构化数据、多系统 API 对接、私有化部署与数据合规。',
    endGoal: '输出清晰的内部技术对接规划与安全合规防范报告',
    featuredLessonIds: ['lesson-a-1-2', 'lesson-e-1-1', 'lesson-e-1-2', 'lesson-c-3-1'],
    recommendedToolId: 'tool-inquiry-flow',
  }
];

export const ROLE_LEARNING_PATHS: RoleLearningPath[] = ALL_ROLE_LEARNING_PATHS.map((path) => ({
  ...path,
  featuredLessonIds: path.featuredLessonIds.filter((id) => COURSES.some((course) => course.modules.some((mod) => mod.lessons.some((lesson) => lesson.id === id)))),
}));

// ---------- 英文版：src/data/en/ 下的覆盖层按 id 合并到中文数据上，结构与中文完全一致 ----------

const EN_COURSES: Record<string, CourseEn> = {
  'course-a-global-site': courseA,
  'course-b-seo': courseB,
  'course-c-geo': courseC,
  'course-d-ai-agent': courseD,
  'course-e-fde': courseE,
};

export const FRICTION_EN: Record<Course['frictionPoint'], string> = {
  读不懂: 'Hard to read',
  看不见: 'Invisible',
  不被信: 'Not trusted',
  接不住: "Can't keep up",
  连不上: 'Not connected',
};

const localizeLesson = (lesson: Lesson, en: LessonEn | undefined): Lesson => {
  if (!en) return lesson;
  return {
    ...lesson,
    title: en.title,
    summary: en.summary,
    conceptContent: en.conceptContent,
    executiveTakeaway: en.executiveTakeaway,
    misconceptions: en.misconceptions,
    quiz: lesson.quiz?.map((q, i) => ({
      ...q,
      question: en.quiz?.[i]?.question ?? q.question,
      options: en.quiz?.[i]?.options ?? q.options,
      explanation: en.quiz?.[i]?.explanation ?? q.explanation,
    })),
    caseSnippet: en.caseSnippet ?? lesson.caseSnippet,
    nextStep: { ...lesson.nextStep, label: en.nextStepLabel },
  };
};

const localizeCourse = (course: Course): Course => {
  const en = EN_COURSES[course.id];
  if (!en) return course;
  return {
    ...course,
    title: en.title,
    subtitle: en.subtitle,
    targetAudience: en.targetAudience,
    relatedService: en.relatedService,
    heroCase: en.heroCase,
    executiveModuleSummary: en.executiveModuleSummary,
    relatedTool: course.relatedTool && en.toolName ? { ...course.relatedTool, name: en.toolName } : course.relatedTool,
    modules: course.modules.map((mod) => ({
      ...mod,
      name: en.modules[mod.index]?.name ?? mod.name,
      description: en.modules[mod.index]?.description ?? mod.description,
      lessons: mod.lessons.map((lesson) => localizeLesson(lesson, en.lessons[lesson.id])),
    })),
  };
};

const COURSES_EN: Course[] = COURSES.map(localizeCourse);

const ROLE_LEARNING_PATHS_EN: RoleLearningPath[] = ROLE_LEARNING_PATHS.map((path) =>
  pathsEn[path.id] ? { ...path, ...pathsEn[path.id] } : path
);

/** 按界面语言取课程列表；英文版与中文版的 id、课时结构相同 */
export const courseList = (lang: 'zh' | 'en'): Course[] => (lang === 'en' ? COURSES_EN : COURSES);

/** 按界面语言取角色学习路径 */
export const pathList = (lang: 'zh' | 'en'): RoleLearningPath[] =>
  lang === 'en' ? ROLE_LEARNING_PATHS_EN : ROLE_LEARNING_PATHS;
