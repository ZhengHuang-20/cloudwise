import type { Bi } from '../lib/i18n';
import type { ServiceKey } from '../components/ui/serviceIdentity';
import { SHOW_FDE } from '../lib/features';

/**
 * 核心服务的说明（GEO、SEO 与建站、AI 客服）：服务页、服务详情页（/services/<slug>）、llms.txt 与 JSON-LD 共用。
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
  /** 同一项服务对应多门课程时，其余课程的字母（SEO 与建站对应课程 A 与 B） */
  extraCourseCodes?: Service['code'][];
  caseName: Bi;
  judgement: Bi;
  /** 详情页的 <title> 与 description（含核心搜索词） */
  seo: { title: Bi; description: Bi };
  /** 详情页的常见问题，同时输出为 FAQPage 结构化数据 */
  faqs: { q: Bi; a: Bi }[];
  /**
   * 可选：合作与付费方式。只写方式与口径，不写任何金额、区间或比例（站点不展示价格）。
   * 详情页单独成块，同时进入服务列表页、.md 页面与 llms-full.txt。
   */
  engagement?: Engagement;
  /** 可选：案例数据（来自客户后台截图），单独成块，也进入 .md 页面与 llms-full.txt。每个数字都要能在截图里核对 */
  proof?: Proof;
  /** 可选：详情页的完整说明（Markdown 子集，见 src/lib/markdown.ts，从 ## 开始），也进入 .md 页面与 llms-full.txt */
  guide?: Bi;
}

export interface Proof {
  title: Bi;
  intro: Bi;
  period: Bi;
  stats: { value: string; label: Bi }[];
  milestonesTitle: Bi;
  milestones: { date: string; value: string }[];
  notes: Bi[];
  source: Bi;
  images: { src: string; width: number; height: number; alt: Bi }[];
  caseHref: string;
  /** 可选：PageSpeed Insights（Lighthouse）的实验室测试分数，单次测试 */
  pagespeed?: {
    title: Bi;
    columns: { mobile: Bi; desktop: Bi };
    rows: { label: Bi; mobile: string; desktop: string }[];
    note: Bi;
  };
}

export interface Engagement {
  /** 一句话概括，服务列表页的侧栏使用 */
  summary: Bi;
  title: Bi;
  intro: Bi;
  /** 可以任选其一的付费方式 */
  options: { title: Bi; desc: Bi }[];
  kpi: { title: Bi; desc: Bi };
  note: Bi;
}

/** 顺序即展示顺序：GEO 与 FDE 是主推服务，排在最前（code 与课程字母保持不变） */
const ALL_SERVICES: Service[] = [
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
      title: { zh: '出海 GEO 优化：让 ChatGPT、Perplexity、Gemini 引用你的品牌', en: 'GEO for exporters: get cited by ChatGPT, Perplexity, Gemini' },
      description: { zh: 'GEO（生成式引擎优化）把企业的专利、认证与工程案例整理成 AI 能查证、愿意引用的公开资料，提高海外买家问 AI 时你被推荐的机会，并每月复测。', en: 'GEO (generative engine optimisation) turns your patents, certifications and engineering cases into public material AI can verify and cite, so you are more likely to be recommended when overseas buyers ask AI. Re-tested monthly.' },
    },
    faqs: [
      {
        q: { zh: 'GEO 能保证 AI 一定推荐我们吗？', en: 'Can GEO guarantee that AI will recommend us?' },
        a: { zh: '不能。AI 的回答取决于它能查到的公开来源，任何人都无法保证结果。我们能做的是建设可查证的证据链、提高被引用的机会，并每月用同一组问题在主流 AI 平台复测，把变化如实汇报给你。如果希望费用和效果挂钩，可以选择按线索付费，KPI 也由双方商定。', en: 'No. AI answers depend on the public sources it can find, and nobody can guarantee the outcome. What we do is build a verifiable evidence chain that raises the chance of being cited, then re-test every month with the same question set on the major AI platforms and report the changes honestly. If you want the fee tied to results, you can choose to pay per lead, and the KPIs are agreed between us.' },
      },
      {
        q: { zh: 'GEO 可以按线索付费吗？', en: 'Can we pay for GEO per lead?' },
        a: { zh: '可以。GEO 有两种付费方式，任选其一：按服务周期和交付内容付费，或按官网收到的有效线索付费。按线索付费时，线索按全站统计，什么算有效线索在合作开始前双方约定。无论选哪种，KPI 都由双方商定，每月复测汇报。按线索付费不代表保证线索数量。', en: 'Yes. GEO can be paid for in either of two ways: for an agreed service period and deliverables, or per valid lead received by your website. With pay per lead, leads are counted across the whole site, and what counts as a valid lead is agreed before the work starts. Either way, the KPIs are agreed between us and re-tested monthly. Paying per lead is not a guarantee of a number of leads.' },
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
    engagement: {
      summary: { zh: '可以按线索付费，KPI 双方商定', en: 'Pay per lead if you prefer, with KPIs agreed together' },
      title: { zh: '可以按线索付费，KPI 一起商定', en: 'Pay per lead if you prefer, and agree the KPIs together' },
      intro: {
        zh: '签约前，你可以在下面两种付费方式中选一种。无论选哪种，衡量效果的 KPI 都由双方根据你的行业和目标市场一起商定。',
        en: 'Before signing, you choose one of the two payment models below. Whichever you choose, the KPIs used to judge results are agreed between us based on your industry and target markets.',
      },
      options: [
        {
          title: { zh: '按服务付费', en: 'Pay for the service' },
          desc: {
            zh: '按约定的服务周期和交付内容付费，交付标准与六步闭环见本页。',
            en: 'Pay for an agreed service period and set of deliverables. The deliverables and the six-step loop are on this page.',
          },
        },
        {
          title: { zh: '按线索付费', en: 'Pay per lead' },
          desc: {
            zh: '按官网收到的有效线索计费，线索按全站统计，不只算来自 AI 平台的。很多买家看完 AI 的回答后会直接搜索品牌名或输入网址进站，这类访问通常带不上来源信息，只按 AI 渠道统计会漏算。什么算有效线索，在合作开始前双方约定。',
            en: 'You pay for valid leads received by your website, counted across the whole site rather than only those from AI platforms. Many buyers read an AI answer and then search your brand name or type your address, and these visits usually carry no source information, so counting only the AI channel would miss them. What counts as a valid lead is agreed before the work starts.',
          },
        },
      ],
      kpi: {
        title: { zh: 'KPI 怎么商定', en: 'How the KPIs are agreed' },
        desc: {
          zh: '先用 AI 可见性测评做出基线，再一起选定要看的指标，例如品牌在 AI 回答里被提及的比例与排位、AI 对品牌信息回答的准确率、来自 AI 平台的访问、官网线索数量。之后每月用同一组问题复测，按约定的指标汇报，没有达到的也如实写。',
          en: 'We first set a baseline with the AI visibility audit, then choose the metrics together, for example how often and how high the brand is mentioned in AI answers, how accurately AI answers questions about the brand, visits from AI platforms, and website leads. After that we re-test monthly with the same question set and report against the agreed metrics, including any that fall short.',
        },
      },
      note: {
        zh: '两种方式都不代表保证 AI 推荐或保证线索数量。网站不公开价格，具体方案在诊断会后给出。',
        en: 'Neither model is a guarantee of AI recommendations or of a number of leads. Prices are not published on this site; a tailored plan follows the diagnosis call.',
      },
    },
    caseName: {
      zh: '爱康医疗：ChatGPT、Perplexity 数月持续带来引荐访问',
      en: 'Aikang Medical: ChatGPT and Perplexity have sent referral traffic consistently for several months',
    },
    judgement: {
      zh: '没有出处的说法，AI 不会引用，采购方也不会采信。',
      en: 'A claim without a source will not be cited by AI, and buyers will not trust it either.',
    },
    guide: {
      zh: `## 适合谁

- 产品面向海外 B2B 买家的中国制造企业：工业设备、零部件、材料、新能源、医疗器械、电子制造等；
- 有可以公开、可以被核对的资料：认证与检测报告、专利、参数与公差、工程案例；
- 愿意让工程师参与审核技术内容。GEO 靠真实资料，资料越扎实，被引用的机会越大。

如果产品还没有任何海外认证或案例，建议先补资料，再做 GEO；否则 AI 没有可以引用的东西。

## 我们怎么做：六步闭环

| 步骤 | 做什么 | 你能看到的结果 |
|---|---|---|
| 1. 诊断 | 用固定问题集在 ChatGPT、Perplexity、Gemini 上提问，检查官网能否被 AI 爬虫读取 | 基线报告，含各平台原始回答与引用来源 |
| 2. 建模 | 梳理采购、工程师、合规、分销商各自会问 AI 的问题 | 问题簇清单，经你确认后固定下来 |
| 3. 内容 | 把参数、认证、案例写成 AI 能直接引用的页面与技术文章 | 已发布的页面，参数为 HTML 表格，数字带出处 |
| 4. 信源 | 在行业媒体、展会名录、认证机构数据库、协会目录建立可查证的第三方来源 | 第三方来源登记表（网址、日期、对应问题） |
| 5. 口碑 | 统一各平台的公司信息，整理客户评价与工程案例，纠正错误信息 | 实体信息统一记录 |
| 6. 监测 | 每月用同一组问题复测，与基线和竞品对比 | 月度复测报告，没有改善的指标也如实写 |

完整的 90 天排期与验收方式见[90 天 GEO 试点交付什么](/insights/geo-90-day-pilot)，指标定义见[GEO 效果怎么衡量](/insights/how-to-measure-geo-results)。

## 按行业的技术实施方案

不同行业的买家问的问题、要核对的证据差别很大。我们按行业整理了具体做法与注意事项：

- [储能与锂电池](/insights/geo-energy-storage-batteries)：UN 38.3、IEC 62619、UL 9540A 与欧盟电池法规
- [光伏组件与逆变器](/insights/geo-solar-pv)：按国家整理认证与并网标准、PAN / OND 文件、供应链追溯
- [机械设备与机床](/insights/geo-industrial-machinery)：精度口径、欧盟机械法规、售后与备件页面
- [汽车零部件](/insights/geo-auto-parts)：OE 对照与适配车型数据、ACES / PIES 与 TecDoc
- [PCB 与电子制造](/insights/geo-electronics-pcb)：工艺能力表、IPC 与 UL 资质、RoHS / REACH
- [医疗器械](/solutions/medical)与[环保市政工程](/solutions/environmental)：行业方案

## 和 SEO、独立站的关系

AI 联网回答时，常常先检索搜索引擎的结果，所以页面要先能被收录、被读懂。官网如果是只在浏览器里渲染的单页应用，或者参数都在 PDF 和图片里，GEO 的第一步就是修这些。属于[海外独立站](/services/seo-website)或[外贸 SEO](/services/seo-website)范围的修复，我们可以一并完成；两者的区别见[GEO 和 SEO 有什么区别](/insights/geo-vs-seo)。

## 我们不做什么

- 不承诺“保证 AI 推荐”或“保证排名第一”；
- 不刷量、不批量发布低质内容、不在问答平台冒充用户、不买卖链接；
- 不编造数据、案例或客户评价，没有授权的客户信息不公开；
- 账号用你的企业主体注册，内容与数据归你，见[网站、内容、数据和账号归谁](/insights/chingeo-asset-ownership)。

想先看看现状，[做一次免费的 AI 可见性测评](/audit)；怎么评估任何一家服务商，见[GEO 服务商怎么选](/insights/geo-agency-selection)。`,
      en: `## Who it is for

- Chinese manufacturers selling to overseas B2B buyers: industrial equipment, components, materials, new energy, medical devices, electronics manufacturing and similar;
- Companies with material that can be published and checked: certifications and test reports, patents, parameters and tolerances, engineering cases;
- Teams willing to have engineers review technical content. GEO runs on real material, and the more solid it is, the better the chance of being cited.

If a product has no overseas certifications or cases yet, build that material first. Otherwise AI has nothing to cite.

## How we work: a six-step loop

| Step | What we do | What you see |
|---|---|---|
| 1. Diagnosis | Ask a fixed question set on ChatGPT, Perplexity and Gemini, and check whether AI crawlers can read your site | A baseline report with raw answers and cited sources per platform |
| 2. Modelling | Map the questions procurement, engineers, compliance and distributors each ask AI | A question cluster list, fixed once you confirm it |
| 3. Content | Turn parameters, certifications and cases into pages and technical articles AI can cite directly | Published pages with HTML parameter tables and sourced figures |
| 4. Sources | Build verifiable third-party sources in trade media, trade-fair listings, certification databases and association directories | A third-party source register (URL, date, question served) |
| 5. Reputation | Align company details across platforms, gather customer reviews and engineering cases, correct wrong information | A record of aligned entity details |
| 6. Monitoring | Re-test monthly with the same questions against the baseline and competitors | A monthly re-test report, including metrics that did not improve |

The full 90-day schedule and acceptance method are in [what a 90-day GEO pilot delivers](/insights/geo-90-day-pilot), and the metrics in [how to measure GEO results](/insights/how-to-measure-geo-results).

## Implementation guides by industry

Buyers in different industries ask different questions and check different evidence. We have written up the specifics and pitfalls by industry:

- [Energy storage and lithium batteries](/insights/geo-energy-storage-batteries): UN 38.3, IEC 62619, UL 9540A and the EU Battery Regulation
- [Solar modules and inverters](/insights/geo-solar-pv): certifications and grid codes by country, PAN / OND files, supply-chain traceability
- [Machinery and machine tools](/insights/geo-industrial-machinery): accuracy definitions, the EU Machinery Regulation, service and spare parts pages
- [Auto parts](/insights/geo-auto-parts): OE cross references and fitment data, ACES / PIES and TecDoc
- [PCB and electronics manufacturing](/insights/geo-electronics-pcb): capability tables, IPC and UL credentials, RoHS / REACH
- [Medical devices](/solutions/medical) and [environmental and municipal engineering](/solutions/environmental): industry plans

## How it relates to SEO and your website

When AI answers with live search, it often retrieves search engine results first, so pages must be indexable and readable. If your site is a single-page app that only renders in the browser, or the parameters live in PDFs and images, fixing that is the first step of GEO. Fixes within a [website](/services/seo-website) or [export SEO](/services/seo-website) project can be done as part of the work; the difference between the two is in [GEO vs SEO](/insights/geo-vs-seo).

## What we do not do

- No promise that AI will recommend you or that you will rank first;
- No fake traffic, no mass low-quality content, no posing as users on Q&A sites, no buying or selling links;
- No invented data, cases or reviews, and no customer details published without permission;
- Accounts are registered under your company, and the content and data are yours; see [who owns the website, content, data and accounts](/insights/chingeo-asset-ownership).

To see where you stand, [run a free AI visibility audit](/audit). To evaluate any provider, see [how to choose a GEO agency](/insights/geo-agency-selection).`,
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
      title: { zh: 'FDE 驻场工程师：AI 驱动的标准化、信息化、智能化三层建设', en: 'Forward deployed engineers (FDE): a three-layer AI build' },
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
  {
    key: 'site',
    slug: 'seo-website',
    code: 'A',
    title: { zh: 'SEO 与建站：让海外买家搜得到、看得懂', en: 'SEO and website: found by overseas buyers, understood on arrival' },
    friction: { zh: '看不见 · 读不懂', en: 'Invisible · Hard to read' },
    oneLiner: {
      zh: '用海外独立站承接买家，用外贸 SEO 让买家搜得到：先把官网做成能被收录、能被读懂的样子。',
      en: 'An overseas website that receives buyers, and export SEO that lets buyers find it: first make your site indexable and readable.',
    },
    desc: {
      zh: '很多企业的英文站是中文画册直译，海外工程师找不到公差、标准编号和可下载的资料，买家搜相关词时也搜不到你。我们把建站与 SEO 放在一起做：先按采购、技术、合规三类读者组织页面，把制造能力整理成参数与公差、国际标准编号和可下载的工程资料；再按信息型、对比型、采购型意图建立核心词库，一个词对应一个页面。官网既是买家的落脚点，也是 Google 与 AI 识别你的来源，所以 SEO 与建站是 GEO 的底座。',
      en: "Many companies' English sites are literal translations of Chinese brochures. Overseas engineers cannot find tolerances, standard numbers or downloadable material, and buyers searching for related terms never reach you. We do the website and SEO together: pages are organised for procurement, technical and compliance readers, and your manufacturing capability becomes parameters and tolerances, international standard numbers and downloadable engineering material; then we build a keyword library by informational, comparison and procurement intent, with one page per term. The website is both where buyers land and the source Google and AI use to recognise you, which is why SEO and the website are the foundation of GEO.",
    },
    deliverables: [
      { zh: '按采购、技术、合规三类读者分流的页面结构', en: 'Page structure routed by procurement, technical and compliance readers' },
      { zh: 'Core Web Vitals 优化，目标：海外主要地区 LCP ≤ 1.8 秒', en: 'Core Web Vitals tuning, target: LCP ≤ 1.8 seconds in key overseas regions' },
      { zh: 'Schema.org 结构化数据，便于搜索引擎与 AI 读取', en: 'Schema.org structured data for search engines and AI to read' },
      { zh: '60 组外贸核心采购词，一词一页', en: '60 core procurement keyword groups, one page per term' },
      { zh: '技术白皮书与工程规格主题内容', en: 'Technical white papers and engineering specification content' },
      { zh: '行业协会与专业媒体的外部链接（不买卖链接）', en: 'Links from industry associations and trade media (no paid links)' },
      { zh: '用 Search Console 与 GA4 追踪搜索表现、询盘来源与转化流失的位置', en: 'Search Console and GA4 tracking of search performance, enquiry sources and where conversions drop off' },
      { zh: '访客行为与表单线索同步到企业自己的 CRM', en: 'Visitor behaviour and form leads synced to your own CRM' },
    ],
    courseId: 'A',
    extraCourseCodes: ['B'],
    seo: {
      title: { zh: '外贸 SEO 与独立站建设：让海外买家在 Google 搜到并看懂你', en: 'Export SEO and website development for Chinese manufacturers' },
      description: { zh: '为中国制造企业建设海外独立站并做外贸 SEO：按采购、技术、合规三类读者组织页面，建立一词一页的采购级核心词库，Core Web Vitals 达标，内置结构化数据，附爱康医疗的 Search Console 数据。', en: 'Overseas websites and export SEO for Chinese manufacturers: pages organised for procurement, technical and compliance readers, a one-page-per-term procurement keyword library, fast Core Web Vitals and built-in structured data, with Search Console data from Aikang Medical.' },
    },
    proof: {
      title: { zh: '案例数据：爱康医疗新建海外官网的 Google 搜索表现', en: 'Case data: Google Search performance of the new Aikang Medical overseas site' },
      intro: {
        zh: '爱康医疗（港股上市的骨科植入物企业）的国内官网英文内容是中文画册机翻，我们为其新建了英文海外官网 ak-medical-global.com。下面是该站在 Google Search Console 里的真实数据。',
        en: 'Aikang Medical (a Hong Kong-listed orthopaedic implant maker) had a domestic site whose English content was machine-translated from a Chinese brochure, so we built a new English overseas site, ak-medical-global.com. Below is that site’s real data from Google Search Console.',
      },
      period: {
        zh: '统计区间：2026-08-15 至 2026-11-13（Search Console「近 3 个月」），搜索类型：网页（文本）',
        en: 'Period: 2026-08-15 to 2026-11-13 (Search Console, last 3 months), search type: web (text)',
      },
      stats: [
        { value: '272', label: { zh: 'Google 搜索总点击次数', en: 'Total clicks from Google Search' } },
        { value: '8,315', label: { zh: '总展示次数', en: 'Total impressions' } },
        { value: '3.3%', label: { zh: '平均点击率', en: 'Average click-through rate' } },
        { value: '8', label: { zh: '平均排名（所有查询的平均值）', en: 'Average position (across all queries)' } },
      ],
      milestonesTitle: { zh: 'Google「搜索影响力成就」：28 天内的点击次数达到', en: 'Google “search impact” achievements: clicks within 28 days reached' },
      milestones: [
        { date: '2026-09-17', value: '60' },
        { date: '2026-09-20', value: '70' },
        { date: '2026-09-30', value: '90' },
        { date: '2026-11-04', value: '100' },
      ],
      notes: [
        {
          zh: '需要说明的口径：点击最多的两个查询是品牌词，“ak medical”（60 次点击、1,882 次展示）与“ak medical china”（12 次点击、126 次展示），所以这组数据主要说明品牌词在 Google 上能搜到官网，不代表非品牌的采购词都已排在前列。',
          en: 'A note on scope: the two queries with the most clicks are brand terms, “ak medical” (60 clicks, 1,882 impressions) and “ak medical china” (12 clicks, 126 impressions). So this data mainly shows that the brand can be found on Google, not that non-brand procurement terms already rank near the top.',
        },
        {
          zh: '这是一个客户站点、一个统计区间的数据，不代表其他企业会得到同样结果。我们会按你的站点与行业，在同一口径下定期复盘。',
          en: 'This is one client site over one period and does not mean other companies will get the same result. We review your own site and industry on the same basis at regular intervals.',
        },
      ],
      source: {
        zh: '来源：ak-medical-global.com 的 Google Search Console「效果」与「成就」页面截图。',
        en: 'Source: screenshots of the Google Search Console “Performance” and “Achievements” pages for ak-medical-global.com.',
      },
      images: [
        {
          src: '/cases/ak-medical/gsc-performance-2026-11-13.jpg',
          width: 1600,
          height: 716,
          alt: { zh: 'Google Search Console 效果报告截图：近 3 个月 272 次点击、8,315 次展示、平均点击率 3.3%、平均排名 8', en: 'Google Search Console performance report: 272 clicks, 8,315 impressions, 3.3% average CTR and average position 8 over the last 3 months' },
        },
        {
          src: '/cases/ak-medical/gsc-achievements.jpg',
          width: 1000,
          height: 1088,
          alt: { zh: 'Google Search Console 成就页面截图：28 天点击次数达到 60、70、90、100 的日期', en: 'Google Search Console achievements page: the dates when 28-day clicks reached 60, 70, 90 and 100' },
        },
      ],
      caseHref: '/cases/ak-medical',
      pagespeed: {
        title: { zh: '官网首页的 PageSpeed Insights 测试（2026-11-24）', en: 'PageSpeed Insights test of the home page (24 Nov 2026)' },
        columns: { mobile: { zh: '手机端', en: 'Mobile' }, desktop: { zh: '桌面端', en: 'Desktop' } },
        rows: [
          { label: { zh: '性能', en: 'Performance' }, mobile: '100', desktop: '100' },
          { label: { zh: '无障碍', en: 'Accessibility' }, mobile: '100', desktop: '100' },
          { label: { zh: '最佳实践', en: 'Best practices' }, mobile: '96', desktop: '96' },
          { label: { zh: 'SEO', en: 'SEO' }, mobile: '100', desktop: '100' },
        ],
        note: {
          zh: '来源：Google PageSpeed Insights（Lighthouse）对 www.ak-medical-global.com 首页的单次实验室测试，2026-11-24 手机端与桌面端各测一次。分数会随网络与测试时间波动，不代表真实访客的体验数据；我们会定期复测。',
          en: 'Source: one lab test each of mobile and desktop on the home page of www.ak-medical-global.com with Google PageSpeed Insights (Lighthouse), 24 Nov 2026. Scores vary with network and test time and are not field data from real visitors; we re-test regularly.',
        },
      },
    },
    faqs: [
      {
        q: { zh: 'SEO 和建站为什么放在一起做？', en: 'Why are SEO and the website done together?' },
        a: { zh: '官网的页面结构决定了搜索引擎能不能收录、读懂它。先建好站再补 SEO，往往要返工页面；一起做，可以在建站时就按“一词一页”规划页面与内链，上线后直接接入 Search Console 追踪表现。', en: 'The structure of your pages decides whether search engines can index and understand them. Adding SEO after the site is built often means reworking pages. Done together, pages and internal links are planned around “one page per term” from the start, and Search Console tracking is connected at launch.' },
      },
      {
        q: { zh: '独立站和阿里巴巴国际站等平台店铺有什么区别？', en: 'How is an independent export website different from a marketplace store such as Alibaba.com?' },
        a: { zh: '平台店铺借平台流量，规则由平台决定，客户数据也留在平台；独立站是企业自己的海外主阵地，访客与询盘数据归企业所有，也是 Google 和 AI 识别品牌实体的权威来源。两者可以并存，但独立站不能缺。', en: 'A marketplace store borrows the platform’s traffic: the platform sets the rules and keeps the customer data. An independent website is your own base overseas: visitor and enquiry data belong to you, and it is the authoritative source Google and AI use to recognise your brand. The two can coexist, but you cannot do without the website.' },
      },
      {
        q: { zh: '什么是“三读者架构”？', en: 'What is the “three-reader architecture”?' },
        a: { zh: '一个外贸网站同时写给三类读者：海外买家（采购、技术、合规负责人）、Google 搜索引擎和 AI 大模型。买家要能找到参数与资质，搜索引擎要能读懂页面结构，AI 要能引用可查证的事实。', en: 'An export website is written for three readers at once: overseas buyers (procurement, technical and compliance leads), the Google search engine, and AI models. Buyers need to find specs and credentials, search engines need to understand the page structure, and AI needs verifiable facts it can cite.' },
      },
      {
        q: { zh: '为什么要“一个词对应一个页面”？', en: 'Why “one page per keyword”?' },
        a: { zh: '多个页面抢同一个词，会互相稀释排名，搜索引擎也难判断该展示哪一页。按信息型、对比型、采购型意图把词分配到具体页面，每个页面才有明确的排名目标。', en: 'When several pages compete for the same term they dilute each other, and search engines struggle to decide which to show. Assigning terms to specific pages by informational, comparison and procurement intent gives every page a clear ranking target.' },
      },
      {
        q: { zh: '外贸 SEO 和 Google 付费广告有什么区别？', en: 'How is export SEO different from Google Ads?' },
        a: { zh: '付费广告按点击付费，预算一停流量就没了；SEO 积累的是网站自身的自然排名，被收录的技术内容会长期带来访问。两者可以配合：广告测试关键词，SEO 沉淀长期资产。', en: 'Ads charge per click, and the traffic stops when the budget stops. SEO builds your site’s own organic rankings, and indexed technical content keeps bringing visits over time. They work together: ads test keywords, and SEO builds the long-term asset.' },
      },
      {
        q: { zh: 'SEO 和 GEO 是什么关系？', en: 'How do SEO and GEO relate?' },
        a: { zh: 'AI 联网回答问题时，检索的往往就是搜索引擎的结果。页面先被搜索引擎收录、排得上，AI 才更容易找到并引用它，所以 SEO 与建站是 GEO 的底座。', en: 'When AI answers with live search, it often retrieves search engine results. A page that is indexed and ranks well is easier for AI to find and cite, so SEO and the website are the foundation of GEO.' },
      },
      {
        q: { zh: '网站上线后怎么验收？', en: 'How is the website accepted after launch?' },
        a: { zh: '按交付标准逐项验收：三类读者的页面结构、海外主要地区的 Core Web Vitals、Schema 结构化数据校验、表单线索进入企业自己的 CRM。上线后接入 Search Console 与访问、线索数据看板。', en: 'Item by item against the deliverables: page structure for the three readers, Core Web Vitals in key overseas regions, Schema validation, and form leads reaching your own CRM. After launch, Search Console and a visit and lead dashboard are connected.' },
      },
    ],
    caseName: {
      zh: '爱康医疗：新建海外官网，Google 搜索近 3 个月 272 次点击、8,315 次展示（2026-08-15 至 2026-11-13，Search Console）',
      en: 'Aikang Medical: the new overseas site had 272 clicks and 8,315 impressions on Google Search in 3 months (15 Aug to 13 Nov 2026, Search Console)',
    },
    judgement: {
      zh: '买家搜不到你就不会知道你，工程师核对不了的参数不会被当作依据。所以先把能核对的东西摆出来，再让页面对得上买家搜的词。',
      en: 'Buyers who cannot find you will never know you exist, and parameters an engineer cannot verify will not be used as evidence. So publish what can be checked first, then make your pages match what buyers search for.',
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
      title: { zh: '外贸 AI 智能客服：7×24 小时多语种接待海外询盘', en: 'AI customer service for exporters: 24/7 multilingual replies' },
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
];
export const SERVICES: Service[] = SHOW_FDE ? ALL_SERVICES : ALL_SERVICES.filter((svc) => svc.key !== 'fde');
