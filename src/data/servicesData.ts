import type { Bi } from '../lib/i18n';
import type { ServiceKey } from '../components/ui/serviceIdentity';
import { SHOW_FDE } from '../lib/features';

/**
 * 五项服务的说明：服务页、服务详情页（/services/<slug>）、llms.txt 与 JSON-LD 共用。
 * 业务事实同时出现在 AI 顾问知识库（src/server/knowledge.ts）与课程数据里，改动时一并更新。站点不写任何价格。
 */

export interface Service {
  key: ServiceKey;
  /** 详情页地址 /services/<slug>，与课程页 /academy/<slug> 共用 */
  slug: string;
  code: 'A' | 'B' | 'C' | 'D' | 'E';
  title: Bi;
  friction: Bi;
  oneLiner: Bi;
  desc: Bi;
  deliverables: Bi[];
  courseId: string;
  caseName: Bi;
  judgement: Bi;
  /** 详情页的 <title> 与 description（含核心搜索词） */
  seo: { title: Bi; description: Bi };
  /** 详情页的常见问题，同时输出为 FAQPage 结构化数据 */
  faqs: { q: Bi; a: Bi }[];
}

const ALL_SERVICES: Service[] = [
  {
    key: 'site',
    slug: 'website',
    code: 'A',
    title: { zh: '海外独立站（三读者架构）', en: 'Overseas website (three-reader architecture)' },
    friction: { zh: '读不懂', en: 'Hard to read' },
    oneLiner: {
      zh: '为采购主管、技术总监、合规官各自准备他们要找的页面。',
      en: 'Pages built for procurement managers, technical directors and compliance officers, each finding what they need.',
    },
    desc: {
      zh: '很多企业的英文站是中文画册直译，海外工程师找不到公差、标准编号和可下载的资料，也就无从判断你是否可靠。我们把制造能力整理成参数与公差范围、国际标准合规编号和可下载的工程白皮书，让每类读者一眼找到自己要的。',
      en: "Many companies' English sites are literal translations of Chinese brochures. Overseas engineers cannot find tolerances, standard numbers or downloadable material, so they cannot judge whether you are reliable. We turn your manufacturing capability into parameters and tolerance ranges, international standard compliance numbers and downloadable engineering white papers, so each type of reader finds what they need at a glance.",
    },
    deliverables: [
      { zh: '按采购、技术、合规三类读者分流的页面结构', en: 'Page structure routed by procurement, technical and compliance readers' },
      { zh: 'Core Web Vitals 优化，目标：海外主要地区 LCP ≤ 1.8 秒', en: 'Core Web Vitals tuning, target: LCP ≤ 1.8 seconds in key overseas regions' },
      { zh: 'Schema.org 结构化数据，便于搜索引擎与 AI 读取', en: 'Schema.org structured data for search engines and AI to read' },
      { zh: '访客行为与表单线索同步到企业自己的 CRM', en: 'Visitor behaviour and form leads synced to your own CRM' },
    ],
    courseId: 'A',
    seo: {
      title: { zh: '外贸独立站建设：写给买家、Google 与 AI 的三读者海外官网', en: 'B2B export website development for Chinese manufacturers' },
      description: { zh: '为中国制造企业建设海外独立站：按采购、技术、合规三类读者组织页面，公差、认证与技术资料可查证，Core Web Vitals 达标，并内置结构化数据。', en: 'Export websites for Chinese manufacturers: pages organised for procurement, technical and compliance readers, verifiable specs and certifications, fast Core Web Vitals and built-in structured data.' },
    },
    faqs: [
      {
        q: { zh: '独立站和阿里巴巴国际站等平台店铺有什么区别？', en: 'How is an independent export website different from a marketplace store such as Alibaba.com?' },
        a: { zh: '平台店铺借平台流量，规则由平台决定，客户数据也留在平台；独立站是企业自己的海外主阵地，访客与询盘数据归企业所有，也是 Google 和 AI 识别品牌实体的权威来源。两者可以并存，但独立站不能缺。', en: 'A marketplace store borrows the platform’s traffic: the platform sets the rules and keeps the customer data. An independent website is your own base overseas: visitor and enquiry data belong to you, and it is the authoritative source Google and AI use to recognise your brand. The two can coexist, but you cannot do without the website.' },
      },
      {
        q: { zh: '什么是“三读者架构”？', en: 'What is the “three-reader architecture”?' },
        a: { zh: '一个外贸网站同时写给三类读者：海外买家（采购、技术、合规负责人）、Google 搜索引擎和 AI 大模型。买家要能找到参数与资质，搜索引擎要能读懂页面结构，AI 要能引用可查证的事实。', en: 'An export website is written for three readers at once: overseas buyers (procurement, technical and compliance leads), the Google search engine, and AI models. Buyers need to find specs and credentials, search engines need to understand the page structure, and AI needs verifiable facts it can cite.' },
      },
      {
        q: { zh: '网站上线后怎么验收？', en: 'How is the website accepted after launch?' },
        a: { zh: '按交付标准逐项验收：三类读者的页面结构、海外主要地区的 Core Web Vitals、Schema 结构化数据校验、表单线索进入企业自己的 CRM。上线后还会接入访问与线索数据看板。', en: 'Item by item against the deliverables: page structure for the three readers, Core Web Vitals in key overseas regions, Schema validation, and form leads reaching your own CRM. After launch, a visit and lead dashboard is connected as well.' },
      },
    ],
    caseName: {
      zh: '爱康医疗：新建海外官网 GEO / SEO 评分 95 分（国内官网为 47 分，是两个不同站点）',
      en: 'Aikang Medical: the new overseas site scores 95 on GEO / SEO (the domestic site scored 47; these are two different sites)',
    },
    judgement: {
      zh: '工程师核对不了的参数，不会被当作依据。所以先把能核对的东西摆出来：公差、标准编号、检测报告。',
      en: 'Parameters an engineer cannot verify will not be used as evidence. So we publish what can be checked first: tolerances, standard numbers and test reports.',
    },
  },
  {
    key: 'seo',
    slug: 'seo',
    code: 'B',
    title: { zh: '外贸 SEO：采购级核心词库', en: 'Export SEO: a procurement-grade keyword library' },
    friction: { zh: '看不见', en: 'Invisible' },
    oneLiner: {
      zh: '买家搜什么词，你的页面就出现在那个词下面。',
      en: 'Whatever words buyers search for, your page appears under those words.',
    },
    desc: {
      zh: '不堆泛词，不买流量。遵循 Google Search Essentials 与 E-E-A-T，建立信息型、对比型、采购型共 60 组核心词，一个词对应一个页面，让欧美买家在采购搜索中有机会看到你。',
      en: 'No generic keywords, no bought traffic. Following Google Search Essentials and E-E-A-T, we build 60 core keyword groups across informational, comparison and procurement intent, with one page per term, so buyers in Europe and the US have a chance to find you in procurement searches.',
    },
    deliverables: [
      { zh: '60 组外贸核心采购词，一词一页', en: '60 core procurement keyword groups, one page per term' },
      { zh: '技术白皮书与工程规格主题内容', en: 'Technical white papers and engineering specification content' },
      { zh: '行业协会与专业媒体的外部链接（不买卖链接）', en: 'Links from industry associations and trade media (no paid links)' },
      { zh: '用 GA4 追踪询盘来源与转化流失的位置', en: 'GA4 tracking of enquiry sources and where conversions drop off' },
    ],
    courseId: 'B',
    seo: {
      title: { zh: '外贸 SEO 优化：采购级核心词库，让海外买家在 Google 搜到你', en: 'Export SEO for B2B manufacturers: a procurement-grade keyword strategy' },
      description: { zh: '遵循 Google Search Essentials 与 E-E-A-T，为出海企业建立信息型、对比型、采购型核心词库，一个词对应一个页面，不买链接、不堆泛词。', en: 'Export SEO that follows Google Search Essentials and E-E-A-T: informational, comparison and procurement keyword groups, one page per term, no paid links and no generic keyword stuffing.' },
    },
    faqs: [
      {
        q: { zh: '外贸 SEO 和 Google 付费广告有什么区别？', en: 'How is export SEO different from Google Ads?' },
        a: { zh: '付费广告按点击付费，预算一停流量就没了；SEO 积累的是网站自身的自然排名，被收录的技术内容会长期带来访问。两者可以配合：广告测试关键词，SEO 沉淀长期资产。', en: 'Ads charge per click, and the traffic stops when the budget stops. SEO builds your site’s own organic rankings, and indexed technical content keeps bringing visits over time. They work together: ads test keywords, and SEO builds the long-term asset.' },
      },
      {
        q: { zh: '为什么要“一个词对应一个页面”？', en: 'Why “one page per keyword”?' },
        a: { zh: '多个页面抢同一个词，会互相稀释排名，搜索引擎也难判断该展示哪一页。按信息型、对比型、采购型意图把词分配到具体页面，每个页面才有明确的排名目标。', en: 'When several pages compete for the same term they dilute each other, and search engines struggle to decide which to show. Assigning terms to specific pages by informational, comparison and procurement intent gives every page a clear ranking target.' },
      },
      {
        q: { zh: 'SEO 和 GEO 是什么关系？', en: 'How do SEO and GEO relate?' },
        a: { zh: 'AI 联网回答问题时，检索的往往就是搜索引擎的结果。页面先被搜索引擎收录、排得上，AI 才更容易找到并引用它，所以 SEO 是 GEO 的底座。', en: 'When AI answers with live search, it often retrieves search engine results. A page that is indexed and ranks well is easier for AI to find and cite, so SEO is the foundation of GEO.' },
      },
    ],
    caseName: {
      zh: '泰宁科创：60 组英文核心词在 Google 欧美主要地区排名前两页',
      en: 'Taining Tech: 60 English core keyword groups reach the first two pages of Google in key US and European markets',
    },
    judgement: {
      zh: '买家搜不到你，就不会知道你。所以先弄清他们搜什么词，再让页面对得上。',
      en: 'Buyers who cannot find you will never know you exist. So first work out what they search for, then make your pages match.',
    },
  },
  {
    key: 'geo',
    slug: 'geo',
    code: 'C',
    title: { zh: '出海 GEO：让 AI 引用你的资料', en: 'Export GEO: get AI to cite your material' },
    friction: { zh: '不被信', en: 'Not trusted' },
    oneLiner: {
      zh: '把企业的专利、认证与工程案例整理成 AI 能查证、愿意引用的公开资料。',
      en: 'We organise your patents, certifications and engineering cases into public material that AI can verify and is willing to cite.',
    },
    desc: {
      zh: '海外买家向 ChatGPT、Perplexity 或 Google AI 概览询问推荐供应商时，AI 会引用它能查到的公开资料。我们通过第三方学术索引、认证与评测机构、真实工程案例，整理你的证据链，提高被引用的机会。我们无法保证 AI 一定推荐你，所以每月用同一组问题复测并汇报。',
      en: 'When overseas buyers ask ChatGPT, Perplexity or Google AI Overviews to recommend suppliers, the AI cites public material it can find. We build your evidence chain through third-party academic indexes, certification and testing bodies, and real engineering cases, which raises the chance of being cited. We cannot guarantee that AI will recommend you, so we re-test with the same question set every month and report back.',
    },
    deliverables: [
      { zh: '整理海外决策者会问 AI 的问题（问题簇）', en: 'Map the questions overseas decision-makers ask AI (question clusters)' },
      { zh: '全年技术资料与第三方背书规划', en: 'Annual technical content and third-party endorsement plan' },
      { zh: '在行业媒体与评测报告中建立可被引用的公开来源', en: 'Citable public sources built in trade media and test reports' },
      { zh: '每月用固定问题集测试主流 AI 平台，并与竞品对比的月报', en: 'Monthly report testing major AI platforms with a fixed question set, compared against competitors' },
    ],
    courseId: 'C',
    seo: {
      title: { zh: '出海 GEO 优化：让 ChatGPT、Perplexity、Gemini 引用你的品牌', en: 'GEO services for exporters: get ChatGPT, Perplexity and Gemini to cite your brand' },
      description: { zh: 'GEO（生成式引擎优化）把企业的专利、认证与工程案例整理成 AI 能查证、愿意引用的公开资料，提高海外买家问 AI 时你被推荐的机会，并每月复测。', en: 'GEO (generative engine optimisation) turns your patents, certifications and engineering cases into public material AI can verify and cite, so you are more likely to be recommended when overseas buyers ask AI. Re-tested monthly.' },
    },
    faqs: [
      {
        q: { zh: 'GEO 能保证 AI 一定推荐我们吗？', en: 'Can GEO guarantee that AI will recommend us?' },
        a: { zh: '不能。AI 的回答取决于它能查到的公开来源，任何人都无法保证结果。我们能做的是建设可查证的证据链、提高被引用的机会，并每月用同一组问题在主流 AI 平台复测，把变化如实汇报给你。', en: 'No. AI answers depend on the public sources it can find, and nobody can guarantee the outcome. What we do is build a verifiable evidence chain that raises the chance of being cited, then re-test every month with the same question set on the major AI platforms and report the changes honestly.' },
      },
      {
        q: { zh: '做 GEO 需要企业提供哪些资料？', en: 'What material does a company need to provide for GEO?' },
        a: { zh: '可以被第三方查证的资料：专利、认证与检测报告、产品参数与公差、真实的工程案例和客户应用。我们把它们整理成结构清楚、带出处的公开内容，并在行业媒体、评测与目录等第三方来源建立引用。', en: 'Material a third party can verify: patents, certifications and test reports, product parameters and tolerances, and real engineering cases and customer applications. We organise it into well-structured public content with sources, and build citations in third-party places such as trade media, reviews and directories.' },
      },
      {
        q: { zh: 'GEO 的效果怎么衡量？', en: 'How are GEO results measured?' },
        a: { zh: '用固定的买家问题集，定期在 ChatGPT、Perplexity、Gemini 等平台提问，统计品牌被提及的比例、排位与引用的来源，并与竞品对比；同时看来自 AI 平台的引荐访问与询盘。', en: 'With a fixed set of buyer questions asked regularly on ChatGPT, Perplexity, Gemini and other platforms, we track how often the brand is mentioned, where it ranks and which sources are cited, compared with competitors. Referral visits and enquiries from AI platforms are tracked too.' },
      },
    ],
    caseName: {
      zh: '爱康医疗：ChatGPT、Perplexity 数月持续带来引荐访问',
      en: 'Aikang Medical: ChatGPT and Perplexity have sent referral traffic consistently for several months',
    },
    judgement: {
      zh: '没有出处的说法，AI 不会引用，采购方也不会采信。',
      en: 'A claim without a source will not be cited by AI, and buyers will not trust it either.',
    },
  },
  {
    key: 'chat',
    slug: 'ai-customer-service',
    code: 'D',
    title: { zh: 'AI 智能客服与系统对接', en: 'AI customer service and system integration' },
    friction: { zh: '接不住', en: "Can't keep up" },
    oneLiner: {
      zh: '欧美买家深夜来信，也能在几秒内得到第一次回复。',
      en: 'When European and US buyers write late at night, they still get a first reply within seconds.',
    },
    desc: {
      zh: '欧美买家在他们的工作时间来信，往往正是北京时间的深夜；等第二天人工回复，买家可能已经联系了别的供应商。AI 客服依据企业自己的技术参数库，用多语种回答公差、认证、交期等问题，提取采购信息并判断意向等级；超出资料范围的问题转给销售。',
      en: 'European and US buyers usually write during their working day, which is often late at night in Beijing. If you reply the next morning, they may already have contacted another supplier. Using your own technical parameter library, the AI customer service answers questions on tolerances, certifications and lead times in several languages, extracts purchase details, grades buying intent, and passes questions beyond the material to sales.',
    },
    deliverables: [
      { zh: '整理企业参数与资质资料，建立多语种知识库', en: 'Product parameters and certifications organised into a multilingual knowledge base' },
      { zh: '官网、邮件、WhatsApp 等渠道接入', en: 'Connected to your website, email, WhatsApp and other channels' },
      { zh: '抽取采购数量、交期、目标港等 12 项询盘信息', en: 'Extracts 12 enquiry fields, including order quantity, lead time and destination port' },
      { zh: '高意向线索即时推送到企业微信与 CRM', en: 'High-intent leads pushed instantly to WeCom (WeChat Work) and your CRM' },
    ],
    courseId: 'D',
    seo: {
      title: { zh: '外贸 AI 智能客服：7×24 小时多语种接待海外询盘', en: 'AI customer service for exporters: 24/7 multilingual enquiry handling' },
      description: { zh: '基于企业自己的参数与资质知识库，AI 客服用多语种回答公差、认证、交期问题，抽取询盘信息、判断意向，并推送到企业微信与 CRM，超出范围转人工。', en: 'AI customer service built on your own parameter and certification knowledge base: multilingual answers on tolerances, certifications and lead times, enquiry extraction and intent grading, pushed to WeCom and your CRM, with hand-off to sales.' },
    },
    faqs: [
      {
        q: { zh: 'AI 客服答错了怎么办？', en: 'What if the AI customer service gives a wrong answer?' },
        a: { zh: 'AI 只依据企业审定过的知识库回答，超出资料范围的问题会转给销售，而不是自己编答案。上线前用评测问题集检查回答质量，上线后按周根据真实对话补充资料。', en: 'The AI answers only from the knowledge base your company has approved, and passes questions beyond that material to sales instead of inventing answers. Answer quality is checked against an evaluation question set before launch, and the material is extended weekly from real conversations.' },
      },
      {
        q: { zh: '可以接入哪些渠道和系统？', en: 'Which channels and systems can it connect to?' },
        a: { zh: '常见的有官网在线咨询、邮件、WhatsApp 等询盘渠道，以及企业微信和 CRM；具体按企业现有系统评估对接方式。', en: 'Typically website chat, email and WhatsApp for enquiries, plus WeCom and your CRM. The integration approach is assessed against your existing systems.' },
      },
      {
        q: { zh: '为什么夜间询盘特别重要？', en: 'Why do night-time enquiries matter so much?' },
        a: { zh: '欧美买家的工作时间往往是北京时间的深夜，等到第二天上午才回复，买家可能已经联系了别的供应商。第一次回复要快，而且要答对。', en: 'European and US buyers often write during what is late night in Beijing. If the reply waits until the next morning, the buyer may already have contacted another supplier. The first reply must be fast, and it must be right.' },
      },
    ],
    caseName: {
      zh: '示例：凌晨 03:12 收到欧美采购询问，03:14 完成回复并生成线索档案',
      en: 'Example: an overseas purchase enquiry arrives at 03:12, is answered by 03:14, and a lead record is created',
    },
    judgement: {
      zh: '买家等不到回复，就会去问别人。所以第一次回复要快，而且要答对。',
      en: 'Buyers who do not get a reply go elsewhere. So the first reply must be fast, and it must be right.',
    },
  },
  {
    key: 'fde',
    slug: 'fde',
    code: 'E',
    title: { zh: 'AI 驱动的三层建设（FDE 驻场）', en: 'AI-driven three-layer build (FDE on-site)' },
    friction: { zh: '连不上', en: 'Not connected' },
    oneLiner: {
      zh: '带着 AI 下到业务一线，把经验写成标准，把标准装进系统，再让 AI 在系统上干活',
      en: 'Go to the front line with AI: write experience down as standards, load the standards into systems, then let AI work on those systems.',
    },
    desc: {
      zh: 'FDE（前线部署工程师）源自 Palantir，如今 OpenAI、Anthropic 也在用它跨越“演示惊艳、上线艰难”的鸿沟。多数外贸企业的流程写在老业务员的经验和微信里，直接上 AI 只能做出演示。FDE 驻场跟岗，用 AI 加速完成标准化、信息化、智能化三层建设，对业务结果负责，离场时把标准、系统、数据和会用的人一起留给企业。',
      en: 'FDE (Forward Deployed Engineer) originated at Palantir, and OpenAI and Anthropic now use it to bridge the gap between an impressive demo and a launch that actually works. Most export businesses keep their processes in veteran salespeople\'s experience and in WeChat chats, so putting AI on top only produces a demo. FDE engineers work on site alongside your team and use AI to speed up three layers of build: standardisation, digitisation and intelligence. They are accountable for business results, and when they leave, the standards, systems, data and trained people stay with your company.',
    },
    deliverables: [
      { zh: '从一个高价值场景切入，2 ~ 4 周跑通第一个闭环', en: 'Start from one high-value scenario and complete the first closed loop in 2 to 4 weeks' },
      { zh: '每周一轮“观察-原型-试用-沉淀”，每周都有可用成果', en: 'One observe–prototype–trial–consolidate cycle each week, with usable output every week' },
      { zh: '按层验收：规则经业务审定、数据自动入库、AI 达到评测指标', en: 'Accepted layer by layer: rules approved by the business, data stored automatically, AI meets evaluation targets' },
      { zh: '源码、数据与文档归企业，同步培养内部 AI 骨干', en: 'Source code, data and documentation belong to your company, and internal AI leads are trained alongside' },
    ],
    courseId: 'E',
    seo: {
      title: { zh: 'FDE 驻场工程师：AI 驱动的标准化、信息化、智能化三层建设', en: 'Forward deployed engineers (FDE): an AI-driven three-layer build for exporters' },
      description: { zh: 'FDE 带着 AI 驻场业务一线，自下而上完成标准化、信息化、智能化三层建设，每周一轮“观察-原型-试用-沉淀”，离场时把标准、系统、数据和会用的人留给企业。', en: 'FDE engineers work on site with AI and build three layers from the bottom up: standardisation, digitisation and intelligence, with a weekly observe–prototype–trial–consolidate cycle. Standards, systems, data and trained people stay with you.' },
    },
    faqs: [
      {
        q: { zh: 'FDE 和驻场外包有什么不同？', en: 'How is an FDE different from on-site outsourcing?' },
        a: { zh: '外包对需求文档负责，FDE 对业务结果负责，并要把能力留给企业：源码、数据、文档归企业，同时培养内部 AI 骨干。', en: 'Outsourcing is accountable for a requirements document; an FDE is accountable for business results and leaves the capability behind: source code, data and documentation belong to you, and internal AI leads are trained alongside.' },
      },
      {
        q: { zh: '为什么不直接上 AI，而要先做标准化和信息化？', en: 'Why not go straight to AI instead of standardising and digitising first?' },
        a: { zh: '没有清晰的规则和干净的数据，AI 只能做演示，上线后答错了没人兜底。没有标准化的智能化，只是把混乱自动化。', en: 'Without clear rules and clean data, AI can only produce a demo, and nobody catches its mistakes after launch. Intelligence without standardisation just automates the mess.' },
      },
      {
        q: { zh: 'FDE 项目从哪里开始？', en: 'Where does an FDE project start?' },
        a: { zh: '从一个高价值场景切入，例如询盘分级或报价，2 ~ 4 周跑通第一个闭环，再按层验收、逐步扩展。', en: 'From one high-value scenario, such as enquiry grading or quoting. The first closed loop runs in 2 to 4 weeks, then the work is accepted layer by layer and extended step by step.' },
      },
    ],
    caseName: {
      zh: '示例：一周内，询盘分级从凭经验判断变为 AI 按规则打标',
      en: 'Example: within one week, enquiry grading moves from gut feel to AI tagging by rules',
    },
    judgement: {
      zh: '没有标准化的智能化，只是把混乱自动化。AI 只会放大企业已有的秩序。',
      en: 'Intelligence without standardisation just automates the mess. AI only amplifies the order a company already has.',
    },
  },
];
export const SERVICES: Service[] = SHOW_FDE ? ALL_SERVICES : ALL_SERVICES.filter((svc) => svc.key !== 'fde');
