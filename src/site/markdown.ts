/**
 * 每个内容页的 Markdown 版本：/services/geo.md、/en/insights/geo-vs-seo.md，首页是 /index.md 与 /en/index.md。
 * 写给 AI 助手与智能体：不带导航、样式与脚本，一次请求就拿到干净的正文。全部从数据文件生成，与页面内容一致。
 * 页面在 <head> 里用 <link rel="alternate" type="text/markdown"> 指向它；响应带 noindex 与指向 HTML 页的
 * canonical（见 markdownResponse），搜索引擎只收录 HTML 页。路由在 app/md-pages，地址改写在 next.config.mjs。
 */
import { pick, type Lang } from '../lib/i18n';
import { caseList, solutionList } from '../data/caseStudiesData';
import { CONTACTS } from '../data/contactsData';
import { courseList } from '../data/coursesData';
import { AUTHORS } from '../data/authors';
import { glossaryList } from '../data/glossaryData';
import { HOME_FAQS } from '../data/homeFaqs';
import { INSIGHTS } from '../data/insights';
import { SERVICES } from '../data/servicesData';
import { BILIBILI_VIDEOS, BRAND, COMPANY, OFFICIAL_ACCOUNTS, SITE_URL, TAGLINE, absoluteUrl } from '../lib/site';
import { routeMeta } from './meta';
import {
  allRoutes,
  caseSlug,
  courseSlug,
  findCase,
  findCourse,
  findInsight,
  findLesson,
  findService,
  findSolution,
  findTerm,
  hasEnglish,
  isIndexable,
  lessonPath,
  localizePath,
  routeModified,
  routePath,
  solutionSlug,
  termSlug,
  type Route,
} from './routes';

/** 有 Markdown 版本的页面：可索引的内容页（方案规划是纯交互工具，没有正文） */
export const hasMarkdown = (route: Route) => isIndexable(route) && route.kind !== 'configurator';

/** Markdown 版本的地址（不带域名），例如 /services/geo.md、/en/index.md */
export const markdownPath = (route: Route, lang: Lang) => {
  const path = routePath(route);
  return `${localizePath(path === '/' ? '/index' : path, lang)}.md`.replace(/^\/en\.md$/, '/en/index.md');
};

/** 构建时预渲染的全部 Markdown 页面（app/md-pages/[lang]/[[...slug]]） */
export const markdownStaticParams = () =>
  allRoutes()
    .filter(hasMarkdown)
    .flatMap((route) =>
      (hasEnglish(route) ? (['zh', 'en'] as const) : (['zh'] as const)).map((lang) => ({
        lang,
        slug: routePath(route).split('/').filter(Boolean),
      }))
    );

const link = (path: string, lang: Lang) => absoluteUrl(localizePath(path, lang));

/** 正文里的站内相对链接改成绝对地址（静态文件不加语言前缀） */
export const absolutizeLinks = (markdown: string, lang: Lang) =>
  markdown.replace(/\]\((\/[^)\s]*)\)/g, (_, path: string) => `](${/\.[a-z0-9]+$/i.test(path) ? absoluteUrl(path) : link(path, lang)})`);

const faqLines = (items: { q: string; a: string }[], lang: Lang) =>
  items.length ? ['', `## ${lang === 'en' ? 'Frequently asked questions' : '常见问题'}`, ...items.flatMap((f) => ['', `### ${f.q}`, '', f.a])] : [];

const bullets = (items: string[]) => items.map((item) => `- ${item}`);
const entry = (title: string, path: string, note: string, lang: Lang) => `- [${title}](${link(path, lang)}): ${note}`;

function body(route: Route, lang: Lang): string[] {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const desc = (r: Route) => routeMeta(r, lang).description;
  switch (route.kind) {
    case 'home':
      return [
        pick(TAGLINE, lang),
        '',
        `## ${t('服务', 'Services')}`,
        ...SERVICES.map((s) => entry(pick(s.title, lang), `/services/${s.slug}`, pick(s.oneLiner, lang), lang)),
        '',
        `## ${t('工具', 'Tools')}`,
        entry(t('AI 可见性测评（免费）', 'AI visibility audit (free)'), '/audit', desc({ kind: 'audit' }), lang),
        entry(t('方案规划', 'Project planner'), '/configurator', desc({ kind: 'configurator' }), lang),
        '',
        `## ${t('案例', 'Case studies')}`,
        ...caseList(lang).map((c) => entry(c.clientName, `/cases/${caseSlug(c.id)}`, c.results.directOutcome, lang)),
        '',
        `## ${t('内容', 'Content')}`,
        entry(t('GEO 洞察', 'GEO insights'), '/insights', desc({ kind: 'insights' }), lang),
        entry(t('出海学院', 'Export Academy'), '/academy', desc({ kind: 'academy' }), lang),
        entry(t('术语百科', 'Glossary'), '/glossary', desc({ kind: 'glossary' }), lang),
        entry(t(`关于${BRAND.zh}`, `About ${BRAND.en}`), '/about', desc({ kind: 'about' }), lang),
        ...faqLines(HOME_FAQS.map((f) => ({ q: pick(f.q, lang), a: pick(f.a, lang) })), lang),
      ];
    case 'services':
      return SERVICES.flatMap((s) => [
        `## [${pick(s.title, lang)}](${link(`/services/${s.slug}`, lang)})`,
        '',
        pick(s.desc, lang),
        '',
        t('交付标准：', 'Deliverables:'),
        ...bullets(s.deliverables.map((d) => pick(d, lang))),
        '',
      ]);
    case 'service': {
      const s = findService(route.slug)!;
      return [
        pick(s.oneLiner, lang),
        '',
        pick(s.desc, lang),
        '',
        `## ${t('交付标准', 'Deliverables')}`,
        ...bullets(s.deliverables.map((d) => pick(d, lang))),
        '',
        `## ${t('案例', 'Case')}`,
        pick(s.caseName, lang),
        '',
        `> ${pick(s.judgement, lang)}`,
        ...faqLines(s.faqs.map((f) => ({ q: pick(f.q, lang), a: pick(f.a, lang) })), lang),
      ];
    }
    case 'cases':
      return [
        `## ${t('案例', 'Case studies')}`,
        ...caseList(lang).map((c) => entry(c.clientName, `/cases/${caseSlug(c.id)}`, `${c.industry} — ${c.results.directOutcome}`, lang)),
        '',
        `## ${t('行业方案', 'Industry solutions')}`,
        ...solutionList(lang).map((s) => entry(s.name, `/solutions/${solutionSlug(s.id)}`, s.description, lang)),
      ];
    case 'case': {
      const id = findCase(route.slug)!.id;
      const c = caseList(lang).find((item) => item.id === id)!;
      return [
        `${c.industry} · ${c.status}`,
        '',
        `- ${t('目标市场', 'Target market')}: ${c.targetMarket}`,
        `- ${t('买家角色', 'Buyer roles')}: ${c.buyerRoles.join(t('、', ', '))}`,
        '',
        `## ${t('起点', 'Starting point')}`,
        c.startingPointFriction,
        '',
        `## ${t('我们做了什么', 'What we did')}`,
        ...bullets(c.whatWeDid),
        '',
        `## ${t('结果', 'Results')}`,
        ...bullets(c.results.metrics),
        '',
        c.results.directOutcome,
        '',
        `## ${t('数据口径', 'Basis of the data')}`,
        c.dataScopeStatement,
        '',
        `## ${t('可复用的经验', 'Reusable lessons')}`,
        ...bullets(c.reusableExperience),
      ];
    }
    case 'solution': {
      const id = findSolution(route.slug)!.id;
      const s = solutionList(lang).find((item) => item.id === id)!;
      return [
        s.description,
        '',
        `## ${t('海外决策者各自关注什么', 'What each overseas decision-maker looks for')}`,
        ...s.overseasDecisionMakers.flatMap((d) => ['', `### ${d.role}`, ...bullets(d.focusPoints)]),
        '',
        `## ${t('海外买家常问的问题', 'Questions overseas buyers ask')}`,
        ...bullets(s.typicalProblemClusters),
        '',
        `## ${t('推荐的内容形式', 'Recommended content formats')}`,
        ...bullets(s.recommendedContentFormat),
        '',
        `## ${t('合规提示', 'Compliance notes')}`,
        ...bullets(s.complianceNotes),
      ];
    }
    case 'academy':
      return courseList(lang).flatMap((c) => [
        `## [${c.title}](${link(`/academy/${courseSlug(c.code)}`, lang)})`,
        '',
        c.subtitle,
        '',
        ...c.modules.flatMap((m) => m.lessons.map((l) => entry(l.title, lessonPath(l.id), l.summary, lang))),
        '',
      ]);
    case 'course': {
      const id = findCourse(route.slug)!.id;
      const c = courseList(lang).find((item) => item.id === id)!;
      return [
        c.subtitle,
        '',
        `- ${t('适合', 'For')}: ${c.targetAudience}`,
        '',
        c.executiveModuleSummary,
        ...c.modules.flatMap((m) => ['', `## ${m.name}`, '', m.description, '', ...m.lessons.map((l) => entry(l.title, lessonPath(l.id), l.summary, lang))]),
      ];
    }
    case 'lesson': {
      const found = findLesson(route.course, route.slug)!;
      const course = courseList(lang).find((c) => c.id === found.course.id)!;
      const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === found.lesson.id)!;
      const bvid = BILIBILI_VIDEOS[lesson.id];
      return [
        `${t('课程', 'Course')}: [${course.title}](${link(`/academy/${route.course}`, lang)})`,
        '',
        lesson.summary,
        '',
        lesson.conceptContent,
        ...(lesson.caseSnippet ? ['', `## ${lesson.caseSnippet.company}: ${lesson.caseSnippet.title}`, '', lesson.caseSnippet.description] : []),
        ...(lesson.misconceptions.length ? ['', `## ${t('常见误区', 'Common misconceptions')}`, ...bullets(lesson.misconceptions)] : []),
        '',
        `## ${t('决策者要点', 'Key takeaway')}`,
        lesson.executiveTakeaway,
        '',
        `## ${t('视频', 'Video')}`,
        `- ${t('视频（中文讲解）', 'Video (in Chinese)')}: ${absoluteUrl(lesson.videoUrl)}`,
        ...(bvid ? [`- Bilibili: https://www.bilibili.com/video/${bvid}`] : []),
      ];
    }
    case 'insights':
      return INSIGHTS.map((i) => `- [${i[lang].title}](${link(`/insights/${i.slug}`, lang)}) (${i.updatedAt}): ${i[lang].description}`);
    case 'insight': {
      const item = findInsight(route.slug)!;
      const content = item[lang];
      const author = AUTHORS[item.author];
      return [
        `${t('作者', 'Author')}: [${pick(author.name, lang)}](${link('/about', lang)})${t('，', ', ')}${pick(author.title, lang)} · ${t('发布于', 'Published')} ${item.publishedAt}`,
        '',
        `**${content.answer}**`,
        '',
        absolutizeLinks(content.body, lang),
        ...faqLines(content.faqs, lang),
      ];
    }
    case 'glossary':
      return glossaryList(lang).map((term) => entry(term.questionTitle, `/glossary/${termSlug(term.id)}`, term.oneLineDefinition, lang));
    case 'term': {
      const id = findTerm(route.slug)!.id;
      const term = glossaryList(lang).find((item) => item.id === id)!;
      return [
        `**${term.oneLineDefinition}**`,
        '',
        `- ${t('术语', 'Term')}: ${term.term}`,
        `- ${t('英文全称', 'Full name')}: ${term.englishTerm}`,
        '',
        `## ${t('详细解释', 'In detail')}`,
        term.detailedExplanation,
        '',
        `## ${t('实际案例', 'In practice')}`,
        term.realWorldExample,
        '',
        `## ${t('常见误区', 'Common pitfalls')}`,
        ...bullets(term.commonPitfalls),
        '',
        `## ${t('相关术语', 'Related terms')}`,
        term.relatedTerms.join(t('、', ', ')),
        ...(term.relatedLessonId ? ['', `${t('相关课程', 'Related lesson')}: ${link(lessonPath(term.relatedLessonId), lang)}`] : []),
      ];
    }
    case 'audit': {
      const method = findInsight('ai-visibility-audit-methodology');
      return [
        t(
          '在线工具：在页面上输入官网域名或品牌名即可开始，需要留下联系人姓名与手机号，几分钟内出报告。',
          'An online tool: enter a website domain or brand name on the page to start. A contact name and mobile number are required, and the report is ready within minutes.'
        ),
        '',
        `## ${t('测评做什么', 'What the audit does')}`,
        ...bullets([
          t('抓取官网，检查 AI 爬虫的 robots.txt 权限、不执行脚本时的正文、语言、JSON-LD、sitemap、llms.txt 与首字节耗时', 'Fetches the website and checks robots.txt permissions for AI crawlers, content without scripts, language, JSON-LD, sitemap, llms.txt and time to first byte'),
          t('识别品牌、行业与目标市场，生成不带品牌名的买家问题与带品牌名的问题', 'Identifies the brand, industry and target market, then writes buyer questions without the brand name and questions with it'),
          t('向 ChatGPT、Perplexity、Gemini 提问（均开启联网搜索）', 'Asks ChatGPT, Perplexity and Gemini, each with web search on'),
          t('按平台统计品牌是否被提及、排位，以及一起被推荐的品牌', 'Reports per platform whether the brand is mentioned, where it ranks and which brands are recommended alongside it'),
        ]),
        ...(method ? ['', `${t('方法与口径', 'Method')}: ${link(`/insights/${method.slug}`, lang)}`, ...faqLines(method[lang].faqs, lang)] : []),
      ];
    }
    case 'about': {
      const founder = AUTHORS.founder;
      return [
        pick(TAGLINE, lang),
        '',
        `## ${t('公司信息', 'Company facts')}`,
        `- ${t('品牌名', 'Brand')}: ${BRAND.zh} / ${BRAND.en}`,
        `- ${t('公司全称', 'Legal name')}: ${COMPANY.legalName.zh}${lang === 'en' ? ` (${COMPANY.legalName.en})` : ''}`,
        `- ${t('统一社会信用代码', 'Unified social credit code')}: ${COMPANY.creditCode}`,
        `- ${t('成立日期', 'Founded')}: ${COMPANY.foundingDate}`,
        `- ${t('地址', 'Address')}: ${pick(COMPANY.address.full, lang)}`,
        `- ${t('邮箱', 'Email')}: ${COMPANY.email}`,
        `- ${t('官网', 'Website')}: ${SITE_URL}`,
        `- ${pick(COMPANY.endorsement, lang)}`,
        '',
        `## ${t('创始人', 'Founder')}`,
        `${pick(founder.name, lang)}${t('，', ', ')}${pick(founder.title, lang)}${t('。', '. ')}${pick(founder.intro, lang)}`,
        '',
        `## ${t('联系方式', 'Contact')}`,
        ...CONTACTS.map((c) => (lang === 'en' ? `- ${c.titleEn}: ${c.nameEn}, +86 ${c.phone}` : `- ${c.title}：${c.name}，手机 ${c.phone}`)),
        '',
        `## ${t('官方账号', 'Official accounts')}`,
        ...OFFICIAL_ACCOUNTS.map((a) => `- ${pick(a.label, lang)}: ${a.url}`),
      ];
    }
    default:
      return [];
  }
}

/** 页面的 Markdown 全文；没有 Markdown 版本的页面返回 null */
export function pageMarkdown(route: Route, lang: Lang): string | null {
  if (!hasMarkdown(route) || (lang === 'en' && !hasEnglish(route))) return null;
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const meta = routeMeta(route, lang);
  const path = routePath(route);
  const other: Lang = lang === 'en' ? 'zh' : 'en';
  const lines = [
    `# ${meta.title}`,
    '',
    `> ${meta.description}`,
    '',
    `- ${t('页面', 'Page')}: ${link(path, lang)}`,
    `- ${t('更新于', 'Updated')}: ${routeModified(route)}`,
    `- ${t('来源', 'Source')}: ${pick(BRAND, lang)}${lang === 'en' ? ` (${BRAND.zh})` : `（${BRAND.en}）`}`,
    ...(hasEnglish(route) ? [`- ${t('English version', '中文版')}: ${absoluteUrl(markdownPath(route, other))}`] : []),
    '',
    ...body(route, lang),
    '',
    '---',
    '',
    t(
      `${BRAND.zh}（${BRAND.en}）：${TAGLINE.zh}。网站不公开价格，费用通过方案规划与诊断会沟通。`,
      `${BRAND.en} (${BRAND.zh}): ${TAGLINE.en}. The site does not publish prices; costs are discussed through the project planner and a diagnosis call.`
    ),
    '',
    `- ${t('免费 AI 可见性测评', 'Free AI visibility audit')}: ${link('/audit', lang)}`,
    `- ${t('全站导读', 'Site guide for LLMs')}: ${absoluteUrl('/llms.txt')}`,
    ...CONTACTS.map((c) => (lang === 'en' ? `- ${c.titleEn}: ${c.nameEn}, +86 ${c.phone}` : `- ${c.title}：${c.name}，手机 ${c.phone}`)),
  ];
  // 标题后补空行，连续空行压成一行
  return (
    lines
      .join('\n')
      .replace(/^(#{1,6} .*)\n(?!\n)/gm, '$1\n\n')
      .replace(/\n{3,}/g, '\n\n') + '\n'
  );
}

/** Markdown 响应：不进搜索引擎索引（HTML 页才是规范地址），并用 Link 头指回 HTML 页 */
export const markdownResponse = (text: string, canonical: string) =>
  new Response(text, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex, follow',
      Link: `<${canonical}>; rel="canonical"`,
    },
  });
