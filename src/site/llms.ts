/**
 * /llms.txt 与 /llms-full.txt（英文版 /en/llms-full.txt）：写给大模型的网站导读，全部从数据文件生成，
 * 与页面内容保持一致。格式参照 https://llmstxt.org/ 的提议。
 */
import { pick, type Lang } from '../lib/i18n';
import { caseList, solutionList } from '../data/caseStudiesData';
import { courseList } from '../data/coursesData';
import { glossaryList } from '../data/glossaryData';
import { INSIGHTS } from '../data/insights';
import { SERVICES } from '../data/servicesData';
import { CONTACTS } from '../data/contactsData';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN } from '../lib/features';
import { BRAND, ICP_RECORD, SAME_AS, SITE_URL, TAGLINE, absoluteUrl } from '../lib/site';
import { routeMeta } from './meta';
import { caseSlug, courseSlug, lessonPath, localizePath, solutionSlug, termSlug, type Route } from './routes';

const link = (path: string, lang: Lang) => absoluteUrl(localizePath(path, lang));

/** 正文里的站内相对链接改成绝对地址（静态文件不加语言前缀） */
const absolutizeLinks = (markdown: string, lang: Lang) =>
  markdown.replace(/\]\((\/[^)\s]*)\)/g, (_, path: string) =>
    `](${/\.[a-z]+$/i.test(path) ? absoluteUrl(path) : link(path, lang)})`
  );

const entry = (title: string, path: string, note: string, lang: Lang) => `- [${title}](${link(path, lang)}): ${note}`;
const desc = (route: Route, lang: Lang) => routeMeta(route, lang).description;

export function llmsTxt(): string {
  const zh: Lang = 'zh';
  const lines: string[] = [
    `# ${BRAND.zh}（${BRAND.en}）`,
    '',
    `> ${TAGLINE.zh}。${TAGLINE.en}.`,
    '',
    `${BRAND.zh}（英文名 ${BRAND.en}，官网 ${SITE_URL.replace(/^https:\/\//, '')}）帮助中国制造企业让海外买家找得到、读得懂、信得过：提供${SERVICE_COUNT_CN}项服务、免费的 AI 可见性测评、出海学院公开课与 SEO / GEO 实操文章。站点不公开任何价格，费用通过方案规划与诊断会沟通。中文页面无路径前缀，英文页面在 /en 下。`,
    '',
    '## 服务 Services',
    ...SERVICES.map((s) => entry(pick(s.title, zh), `/services/${s.slug}`, pick(s.oneLiner, zh), zh)),
    '',
    '## 工具 Tools',
    entry('AI 可见性测评（免费）', '/audit', desc({ kind: 'audit' }, zh), zh),
    entry('方案规划', '/configurator', desc({ kind: 'configurator' }, zh), zh),
    '',
    '## 案例 Case studies',
    ...caseList(zh).map((c) => entry(c.clientName, `/cases/${caseSlug(c.id)}`, c.results.directOutcome, zh)),
    ...solutionList(zh).map((s) => entry(s.name, `/solutions/${solutionSlug(s.id)}`, s.description, zh)),
    '',
    '## GEO 洞察 Insights',
    ...INSIGHTS.map((i) => entry(i.zh.title, `/insights/${i.slug}`, i.zh.description, zh)),
    '',
    '## 出海学院 Export Academy',
    ...courseList(zh).map((c) => entry(c.title, `/academy/${courseSlug(c.code)}`, c.subtitle, zh)),
    '',
    '## 术语百科 Glossary',
    ...glossaryList(zh).map((t) => entry(t.questionTitle, `/glossary/${termSlug(t.id)}`, t.oneLineDefinition, zh)),
    '',
    '## 公司 Company',
    entry(`关于${BRAND.zh}`, '/about', desc({ kind: 'about' }, zh), zh),
    ...CONTACTS.map((c) => `- ${c.title}：${c.name}，手机 ${c.phone}`),
    `- ICP 备案号：${ICP_RECORD}`,
    ...SAME_AS.map((u) => `- 官方账号：${u}`),
    '',
    '## English',
    entry(`${BRAND.en} home`, '/', desc({ kind: 'home' }, 'en'), 'en'),
    ...SERVICES.map((s) => entry(pick(s.title, 'en'), `/services/${s.slug}`, pick(s.oneLiner, 'en'), 'en')),
    ...INSIGHTS.map((i) => entry(i.en.title, `/insights/${i.slug}`, i.en.description, 'en')),
    entry('Free AI visibility audit', '/audit', desc({ kind: 'audit' }, 'en'), 'en'),
    entry(`About ${BRAND.en}`, '/about', desc({ kind: 'about' }, 'en'), 'en'),
    '',
    '## Optional',
    `- [全文版（中文）](${absoluteUrl('/llms-full.txt')}): 服务、案例、文章、术语与课程的完整正文`,
    `- [Full text (English)](${absoluteUrl('/en/llms-full.txt')}): complete text of services, cases, articles, glossary and courses`,
    ...courseList(zh).flatMap((c) =>
      c.modules.flatMap((m) => m.lessons.map((l) => entry(l.title, lessonPath(l.id), l.summary, zh)))
    ),
  ];
  return lines.join('\n') + '\n';
}

export function llmsFullTxt(lang: Lang): string {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const brand = pick(BRAND, lang);
  const out: string[] = [
    `# ${brand}${lang === 'en' ? ` (${BRAND.zh})` : `（${BRAND.en}）`}`,
    '',
    `> ${pick(TAGLINE, lang)}`,
    '',
    t(
      `官网：${SITE_URL}。本文件是网站内容的全文版，从网站数据自动生成。站点不公开任何价格。`,
      `Website: ${SITE_URL}/en. This file is the full-text version of the site, generated automatically from the site data. The site does not publish prices.`
    ),
    '',
    `## ${t(`${SERVICE_COUNT_CN}项服务`, `${SERVICE_COUNT_EN} services`)}`,
  ];

  for (const s of SERVICES) {
    out.push(
      '',
      `### ${pick(s.title, lang)}`,
      t(`页面：${link(`/services/${s.slug}`, lang)}`, `Page: ${link(`/services/${s.slug}`, lang)}`),
      '',
      pick(s.oneLiner, lang),
      '',
      pick(s.desc, lang),
      '',
      t('交付标准：', 'Deliverables:'),
      ...s.deliverables.map((d) => `- ${pick(d, lang)}`),
      '',
      `${t('案例：', 'Case: ')}${pick(s.caseName, lang)}`,
      '',
      ...s.faqs.flatMap((f) => [`**${pick(f.q, lang)}**`, pick(f.a, lang), ''])
    );
  }

  out.push('', `## ${t('案例', 'Case studies')}`);
  for (const c of caseList(lang)) {
    out.push(
      '',
      `### ${c.clientName}`,
      `${t('页面：', 'Page: ')}${link(`/cases/${caseSlug(c.id)}`, lang)}`,
      '',
      `${c.industry} · ${c.status} · ${t('目标市场：', 'Target market: ')}${c.targetMarket}`,
      '',
      `${t('起点：', 'Starting point: ')}${c.startingPointFriction}`,
      '',
      t('我们做了什么：', 'What we did:'),
      ...c.whatWeDid.map((w) => `- ${w}`),
      '',
      t('结果：', 'Results:'),
      ...c.results.metrics.map((m) => `- ${m}`),
      '',
      c.results.directOutcome,
      '',
      `${t('数据口径：', 'Basis of the data: ')}${c.dataScopeStatement}`
    );
  }

  out.push('', `## ${t('GEO 洞察', 'GEO insights')}`);
  for (const i of INSIGHTS) {
    const content = i[lang];
    out.push(
      '',
      `### ${content.title}`,
      `${t('页面：', 'Page: ')}${link(`/insights/${i.slug}`, lang)} · ${t('更新于', 'Updated')} ${i.updatedAt}`,
      '',
      content.answer,
      '',
      absolutizeLinks(content.body, lang).replace(/^## /gm, '#### ').replace(/^### /gm, '##### '),
      '',
      ...content.faqs.flatMap((f) => [`**${f.q}**`, f.a, ''])
    );
  }

  out.push('', `## ${t('术语百科', 'Glossary')}`);
  for (const term of glossaryList(lang)) {
    out.push(
      '',
      `### ${term.questionTitle}`,
      `${t('页面：', 'Page: ')}${link(`/glossary/${termSlug(term.id)}`, lang)}`,
      '',
      term.oneLineDefinition,
      '',
      term.detailedExplanation,
      '',
      `${t('案例：', 'In practice: ')}${term.realWorldExample}`,
      '',
      t('常见误区：', 'Common pitfalls:'),
      ...term.commonPitfalls.map((p) => `- ${p}`)
    );
  }

  out.push('', `## ${t('出海学院课程', 'Export Academy courses')}`);
  for (const c of courseList(lang)) {
    out.push('', `### ${c.title}`, `${t('页面：', 'Page: ')}${link(`/academy/${courseSlug(c.code)}`, lang)}`, '', c.subtitle);
    for (const lesson of c.modules.flatMap((m) => m.lessons)) {
      out.push(
        '',
        `#### ${lesson.title}`,
        `${t('页面：', 'Page: ')}${link(lessonPath(lesson.id), lang)}`,
        '',
        lesson.summary,
        '',
        lesson.conceptContent,
        '',
        `${t('决策者要点：', 'Key takeaway: ')}${lesson.executiveTakeaway}`
      );
    }
  }

  out.push(
    '',
    `## ${t('联系方式', 'Contact')}`,
    '',
    ...CONTACTS.map((c) => (lang === 'en' ? `- ${c.titleEn}: ${c.nameEn}, +86 ${c.phone}` : `- ${c.title}：${c.name}，手机 ${c.phone}`)),
    `- ${t('免费 AI 可见性测评', 'Free AI visibility audit')}: ${link('/audit', lang)}`
  );
  return out.join('\n') + '\n';
}

export const textResponse = (body: string) =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
