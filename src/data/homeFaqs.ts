/**
 * 首页的常见问题：回答「这家公司是谁、做什么、适合谁、怎么开始」，页面与 FAQPage 结构化数据共用。
 * 只写站内已有的事实（服务见 servicesData.ts，案例与口径见 caseStudiesData.ts）；不写价格，不承诺结果。
 */
import type { Bi } from '../lib/i18n';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';
import { BRAND } from '../lib/site';

export const HOME_FAQS: { q: Bi; a: Bi }[] = [
  {
    q: { zh: `${BRAND.zh}（${BRAND.en}）是做什么的？`, en: `What does ${BRAND.en} (${BRAND.zh}) do?` },
    a: {
      zh: `${BRAND.zh}（英文名 ${BRAND.en}）是一家面向中国出海制造企业的服务公司，提供${SERVICE_COUNT_CN}项服务：出海 GEO（让 ChatGPT、Perplexity、Gemini 等 AI 引用并推荐你的品牌）、${SHOW_FDE ? 'FDE 驻场工程师、' : ''}海外独立站、外贸 SEO 与 AI 客服。目标是让海外买家找得到、读得懂、信得过，询盘来了有人接。`,
      en: `${BRAND.en} (${BRAND.zh} in Chinese) is a service company for Chinese manufacturers going global. It offers ${SERVICE_COUNT_EN.toLowerCase()} services: export GEO (getting AI such as ChatGPT, Perplexity and Gemini to cite and recommend your brand), ${SHOW_FDE ? 'FDE on-site engineering, ' : ''}overseas websites, export SEO and AI customer service. The aim is that overseas buyers can find you, understand you and trust you, and that every enquiry gets answered.`,
    },
  },
  {
    q: { zh: 'GEO 和 SEO 有什么区别，需要都做吗？', en: 'How do GEO and SEO differ, and do we need both?' },
    a: {
      zh: 'SEO 让你的页面出现在 Google、Bing 的搜索结果里；GEO 让 AI 在回答买家问题时引用并提到你。两者共用同一套基础：能被抓取的官网、清楚的内容和可查证的资料。通常先把官网与 SEO 的底座做好，再做 GEO 的信源建设与每月复测。',
      en: 'SEO gets your pages into Google and Bing results. GEO gets AI to cite and name you when it answers a buyer’s question. Both rest on the same foundation: a crawlable website, clear content and verifiable material. The usual order is to get the website and SEO foundation right first, then build sources for GEO and re-test every month.',
    },
  },
  {
    q: { zh: '哪些企业适合找云端智荐？', en: `Which companies is ${BRAND.en} a good fit for?` },
    a: {
      zh: '做 B2B 出口的中国中型制造企业，尤其是采购决策周期长、买家会反复核对参数、认证与工程案例的行业，例如医疗器械与环保工程。已经有专利、认证和真实项目，但海外买家搜不到或 AI 不提及的企业，改进空间最明确。',
      en: 'Mid-sized Chinese manufacturers that export B2B, especially in industries with long buying cycles where buyers check specifications, certifications and engineering cases repeatedly, such as medical devices and environmental engineering. Companies that already have patents, certifications and real projects, yet cannot be found by overseas buyers or are not mentioned by AI, have the clearest room to improve.',
    },
  },
  {
    q: { zh: 'AI 可见性测评测什么？是免费的吗？', en: 'What does the AI visibility audit test, and is it free?' },
    a: {
      zh: '免费。输入官网域名或品牌名，系统以海外买家的身份向 ChatGPT、Perplexity、Gemini 提问，统计你的品牌是否被提及、排在第几位、和哪些品牌一起被推荐；同时检查官网能否被 AI 读取，包括 AI 爬虫权限、不执行脚本时的正文、结构化数据、sitemap 与 llms.txt。',
      en: 'It is free. Enter your website domain or brand name. The system asks ChatGPT, Perplexity and Gemini questions as an overseas buyer would, then reports whether your brand is mentioned, where it ranks and which brands are recommended alongside it. It also checks whether AI can read your website: AI crawler permissions, content without scripts, structured data, the sitemap and llms.txt.',
    },
  },
  {
    q: { zh: '有可以核实的案例吗？', en: 'Are there cases we can verify?' },
    a: {
      zh: '有两个公开案例，都写明了数据口径。爱康医疗：新建海外官网的 GEO / SEO 评分为 95 分，现有国内官网为 47 分，这是两个站点按同一口径的对比。泰宁科创：围绕英国 SuDS 规范建立 60 组英文核心词，并进入中东某新城雨水调蓄项目的供应商短名单。详情见案例页。',
      en: 'There are two public cases, each with the basis of its data stated. Aikang Medical: the new overseas website scored 95 on GEO / SEO against 47 for the existing domestic site, a comparison of two sites on the same basis. Taining Tech: 60 English core keyword groups built around the UK SuDS standard, and a place on the supplier shortlist for a stormwater storage project in a new Middle East city. Details are on the case pages.',
    },
  },
  {
    q: { zh: '服务怎么收费？', en: 'How are the services charged?' },
    a: {
      zh: '网站不公开价格。投入取决于产品规模、目标市场、语种和需要打通的系统。可以先用方案规划工具查看周期与交付物，再预约 30 分钟诊断会，会后给出书面的改进清单与定制方案。',
      en: 'The website does not publish prices. The investment depends on the size of your product range, target markets, languages and the systems that need connecting. Use the project planner to see timelines and deliverables, then book a 30-minute diagnosis call. A written improvement list and a tailored plan follow the call.',
    },
  },
];
