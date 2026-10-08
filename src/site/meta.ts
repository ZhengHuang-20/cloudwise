/**
 * 每个页面的标题与描述（服务端 generateMetadata、JSON-LD、llms.txt 共用）。
 * 标题含核心搜索词；描述 = 页面第一屏的直接回答，中文 70～90 字、英文不超过约 160 字符。
 */
import { pick, type Lang } from '../lib/i18n';
import { caseList, solutionList } from '../data/caseStudiesData';
import { courseList } from '../data/coursesData';
import { glossaryList } from '../data/glossaryData';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';
import { BRAND } from '../lib/site';
import { findCase, findCourse, findInsight, findLesson, findService, findSolution, findTerm, type Route } from './routes';

export interface PageMeta {
  title: string;
  description: string;
  /** 首页用完整标题，其他页面在标题后加「 - 品牌名」 */
  absoluteTitle?: boolean;
  /** 文章类页面（Open Graph type=article） */
  article?: { publishedTime: string; modifiedTime: string };
  keywords?: string[];
}

const clip = (text: string, max: number) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
};

/** 客户名形如「爱康医疗 (AK Medical)」，取主名 */
const primaryName = (name: string) => name.replace(/\s*\(.*\)$/, '');

export function routeMeta(route: Route, lang: Lang): PageMeta {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const max = lang === 'en' ? 165 : 95;
  const svcList = SHOW_FDE ? t('独立站、外贸 SEO、出海 GEO、AI 客服与 FDE 驻场', 'websites, SEO, GEO, AI customer service and FDE on-site engineering') : t('独立站、外贸 SEO、出海 GEO 与 AI 客服', 'websites, SEO, GEO and AI customer service');

  switch (route.kind) {
    case 'home':
      return {
        absoluteTitle: true,
        title: t(
          `${BRAND.zh} - 出海 GEO 优化、外贸 SEO 与独立站建设 | AI 出海售前支持`,
          `${BRAND.en} - GEO, SEO and export websites for Chinese manufacturers`
        ),
        description: t(
          `${BRAND.zh}帮中国制造企业让海外买家找得到、读得懂、信得过：${svcList}${SERVICE_COUNT_CN}项服务，并提供免费 AI 可见性测评、出海学院与方案规划。`,
          `${BRAND.en} helps Chinese manufacturers get found, read and trusted by overseas buyers: ${SERVICE_COUNT_EN.toLowerCase()} services covering ${svcList}, plus a free AI visibility audit, an export academy and a project planner.`
        ),
      };
    case 'services':
      return {
        title: t(`${SERVICE_COUNT_CN}项服务：${svcList}`, `Services: ${svcList}`),
        description: t(
          `${SERVICE_COUNT_CN}项服务共用同一套企业资料，各解决一个卡点：看不见、读不懂、不被信、接不住${SHOW_FDE ? '、连不上' : ''}。每项服务写明做什么、交什么、怎样验收。`,
          `${SERVICE_COUNT_EN} services share one set of company material, each solving one bottleneck: invisible, hard to read, not trusted, can’t keep up${SHOW_FDE ? ', not connected' : ''}. Each states what we do, what you get and how it is accepted.`
        ),
      };
    case 'service': {
      const svc = findService(route.slug)!;
      return { title: pick(svc.seo.title, lang), description: clip(pick(svc.seo.description, lang), max) };
    }
    case 'cases':
      return {
        title: t('出海案例：爱康医疗、泰宁科创的 GEO 与 SEO 实战', 'Case studies: GEO and SEO results for Chinese exporters'),
        description: t(
          '爱康医疗、泰宁科创的出海实战拆解：起点、做了什么、结果与数据口径，以及医疗器械、环保工程两个行业的出海方案。',
          'Field breakdowns from Aikang Medical and Taining Tech: the starting point, what we did, the results and the basis of the data, plus export plans for medical devices and environmental engineering.'
        ),
      };
    case 'case': {
      const id = findCase(route.slug)!.id;
      const c = caseList(lang).find((item) => item.id === id)!;
      return {
        title: t(`${primaryName(c.clientName)}出海案例：${c.industry}`, `${primaryName(c.clientName)} case study: ${c.industry}`),
        description: clip(c.results.directOutcome, max),
      };
    }
    case 'solution': {
      const id = findSolution(route.slug)!.id;
      const s = solutionList(lang).find((item) => item.id === id)!;
      return { title: s.name, description: clip(s.description, max) };
    }
    case 'academy':
      return {
        title: t(`出海学院：${SERVICE_COUNT_CN}门公开课，讲透独立站、SEO 与 GEO`, `Export Academy: ${SERVICE_COUNT_EN.toLowerCase()} open courses on websites, SEO and GEO`),
        description: t(
          '面向出海企业决策者、外贸总监与技术负责人的公开课程，带视频、案例、误区与课后自测，按角色给出学习路径。',
          'Open courses for export decision-makers, export directors and technical leads, with videos, cases, misconceptions and quizzes, plus learning paths by role.'
        ),
      };
    case 'course': {
      const id = findCourse(route.slug)!.id;
      const c = courseList(lang).find((item) => item.id === id)!;
      const [short, tagline] = c.title.split('——');
      return { title: t(`${short}课程：${tagline ?? short}`, `${short} course: ${tagline ?? short}`), description: clip(c.subtitle, max) };
    }
    case 'lesson': {
      const found = findLesson(route.course, route.slug)!;
      const c = courseList(lang).find((item) => item.id === found.course.id)!;
      const lesson = c.modules.flatMap((m) => m.lessons).find((l) => l.id === found.lesson.id)!;
      return { title: t(`${lesson.title}｜${c.title.split('——')[0]}课程`, `${lesson.title} | ${c.title.split('——')[0]} course`), description: clip(lesson.summary, max) };
    }
    case 'insights':
      return {
        title: t('GEO 洞察：出海 SEO 与 GEO 的方法、数据与实操', 'GEO insights: methods, data and practice for export SEO and GEO'),
        description: t(
          '写给出海企业决策者与市场负责人的 SEO、GEO 实操文章：GEO 与 SEO 的区别、AI 可见性怎么测、llms.txt 怎么写。',
          'Practical SEO and GEO articles for export decision-makers and marketing leads: GEO vs SEO, how to measure AI visibility, and how to write llms.txt.'
        ),
      };
    case 'insight': {
      const item = findInsight(route.slug)!;
      const content = item[lang];
      return {
        title: content.title,
        description: clip(content.description, max),
        article: { publishedTime: item.publishedAt, modifiedTime: item.updatedAt },
        keywords: item.keywords[lang],
      };
    }
    case 'glossary':
      return {
        title: t('出海 SEO、GEO 与 AI 术语百科', 'Glossary of export SEO, GEO and AI terms'),
        description: t(
          '用一问一答讲清 GEO、E-E-A-T、Core Web Vitals 等出海获客术语：一句话定义、案例与常见误区。',
          'GEO, E-E-A-T, Core Web Vitals and other export marketing terms explained as questions and answers: a one-line definition, a case and common pitfalls.'
        ),
      };
    case 'term': {
      const id = findTerm(route.slug)!.id;
      const term = glossaryList(lang).find((item) => item.id === id)!;
      return { title: term.questionTitle, description: clip(term.oneLineDefinition, max) };
    }
    case 'audit':
      return {
        title: t('免费 AI 可见性测评：ChatGPT、Perplexity、Gemini 会推荐你的品牌吗？', 'Free AI visibility audit: do ChatGPT, Perplexity and Gemini recommend your brand?'),
        description: t(
          '输入官网或品牌名，以海外买家身份向 ChatGPT、Perplexity、Gemini 提问，统计品牌被提及与被引用的情况，并检查官网能否被 AI 读取。免费。',
          'Enter your website or brand. We ask ChatGPT, Perplexity and Gemini questions as an overseas buyer, measure how often you are mentioned and cited, and check whether AI can read your site. Free.'
        ),
      };
    case 'about':
      return {
        title: t(`关于${BRAND.zh}（${BRAND.en}）`, `About ${BRAND.en} (${BRAND.zh})`),
        description: t(
          `${BRAND.zh}（${BRAND.en}）是面向中国出海企业的 AI 售前支持团队，提供${svcList}服务。公司信息、做事原则、案例与联系方式。`,
          `${BRAND.en} (${BRAND.zh}) is an AI pre-sales support team for Chinese companies going global, offering ${svcList}. Company facts, principles, cases and contacts.`
        ),
      };
    case 'configurator':
      return {
        title: t('方案规划：组合出海服务，查看周期、排期与交付物', 'Project planner: combine services and see timelines and deliverables'),
        description: t(
          `自由组合${svcList}，按规模实时得到交付周期、阶段排期与交付物清单。`,
          `Combine ${svcList}, and get the delivery timeline, phased schedule and deliverables for your scale instantly.`
        ),
      };
    case 'deal-room':
      return { title: t('方案空间', 'Project room'), description: t('行动计划、答疑与在线签约。', 'Action plan, Q&A and online contract signing.') };
    case 'login':
      return { title: '客户登录', description: '云端智荐客户后台登录。' };
    case 'console':
      return { title: '客户后台', description: '云端智荐客户后台。' };
  }
}
