/**
 * 每个页面的 JSON-LD 结构化数据（schema.org），由服务端页面输出到 HTML。
 * 全站共用 Organization 与 WebSite（固定 @id），各页面再加 WebPage、BreadcrumbList 与内容类型
 * （Service、Article、Course、VideoObject、DefinedTerm、FAQPage 等）。不输出任何价格（offers）。
 */
import { pick, type Lang } from '../lib/i18n';
import { caseList, solutionList } from '../data/caseStudiesData';
import { courseList } from '../data/coursesData';
import { glossaryList } from '../data/glossaryData';
import { SERVICES } from '../data/servicesData';
import { VIDEO_META, videoPoster } from '../data/videoMeta';
import { CONTACTS } from '../data/contactsData';
import { BILIBILI_VIDEOS, BRAND, SAME_AS, SITE_URL, TAGLINE, absoluteUrl } from '../lib/site';
import { routeMeta } from './meta';
import {
  courseSlug,
  findCase,
  findCourse,
  findInsight,
  findLesson,
  findService,
  findSolution,
  findTerm,
  lessonPath,
  localizePath,
  routePath,
  termSlug,
  type Route,
} from './routes';

type Json = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const GLOSSARY_SET_ID = (lang: Lang) => `${absoluteUrl(localizePath('/glossary', lang))}#termset`;

const inLanguage = (lang: Lang) => (lang === 'en' ? 'en' : 'zh-CN');
const url = (path: string, lang: Lang) => absoluteUrl(localizePath(path, lang));
const orgRef = { '@id': ORG_ID };

function organization(lang: Lang): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: pick(BRAND, lang),
    alternateName: lang === 'en' ? BRAND.zh : BRAND.en,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/brand/logo-mark.png'), width: 235, height: 204 },
    description: pick(TAGLINE, lang),
    knowsAbout: ['Generative Engine Optimization (GEO)', 'Search Engine Optimization (SEO)', 'B2B export websites', 'AI customer service', 'Forward Deployed Engineering'],
    areaServed: ['CN', 'Worldwide'],
    contactPoint: CONTACTS.map((c) => ({
      '@type': 'ContactPoint',
      contactType: 'sales',
      name: lang === 'en' ? `${c.nameEn}, ${c.titleEn}` : `${c.name}（${c.title}）`,
      telephone: `+86-${c.phone}`,
      areaServed: 'CN',
      availableLanguage: ['zh-CN', 'en'],
    })),
    sameAs: SAME_AS,
  };
}

function website(lang: Lang): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: pick(BRAND, lang),
    alternateName: lang === 'en' ? BRAND.zh : BRAND.en,
    url: SITE_URL,
    inLanguage: ['zh-CN', 'en'],
    publisher: orgRef,
  };
}

/** 面包屑（与页面上的 Breadcrumbs 组件对应） */
function crumbs(route: Route, lang: Lang): { name: string; path: string }[] {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const home = { name: t('首页', 'Home'), path: '/' };
  const here = { name: routeMeta(route, lang).title, path: routePath(route) };
  switch (route.kind) {
    case 'home':
      return [];
    case 'service':
      return [home, { name: t('服务', 'Services'), path: '/services' }, here];
    case 'case':
    case 'solution':
      return [home, { name: t('案例', 'Cases'), path: '/cases' }, here];
    case 'course':
      return [home, { name: t('出海学院', 'Export Academy'), path: '/academy' }, here];
    case 'lesson': {
      const found = findLesson(route.course, route.slug)!;
      const course = courseList(lang).find((c) => c.id === found.course.id)!;
      return [
        home,
        { name: t('出海学院', 'Export Academy'), path: '/academy' },
        { name: course.title.split('——')[0], path: `/academy/${route.course}` },
        here,
      ];
    }
    case 'insight':
      return [home, { name: t('GEO 洞察', 'GEO insights'), path: '/insights' }, here];
    case 'term':
      return [home, { name: t('术语百科', 'Glossary'), path: '/glossary' }, here];
    default:
      return [home, here];
  }
}

const faqPage = (pageUrl: string, items: { q: string; a: string }[]): Json => ({
  '@type': 'FAQPage',
  '@id': `${pageUrl}#faq`,
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

/** 页面主体内容的结构化数据 */
function mainEntities(route: Route, lang: Lang, pageUrl: string): Json[] {
  const meta = routeMeta(route, lang);
  switch (route.kind) {
    case 'home':
    case 'services':
      return [
        {
          '@type': 'ItemList',
          '@id': `${pageUrl}#services`,
          itemListElement: SERVICES.map((svc, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: url(`/services/${svc.slug}`, lang),
            name: pick(svc.title, lang),
          })),
        },
      ];
    case 'service': {
      const svc = findService(route.slug)!;
      return [
        {
          '@type': 'Service',
          '@id': `${pageUrl}#service`,
          name: pick(svc.title, lang),
          serviceType: pick(svc.seo.title, lang),
          description: pick(svc.desc, lang),
          provider: orgRef,
          areaServed: 'Worldwide',
          audience: { '@type': 'BusinessAudience', name: lang === 'en' ? 'Chinese manufacturers going global' : '出海的中国制造企业' },
          url: pageUrl,
        },
        faqPage(
          pageUrl,
          svc.faqs.map((f) => ({ q: pick(f.q, lang), a: pick(f.a, lang) }))
        ),
      ];
    }
    case 'case': {
      const id = findCase(route.slug)!.id;
      const c = caseList(lang).find((item) => item.id === id)!;
      return [
        {
          '@type': 'Article',
          '@id': `${pageUrl}#article`,
          headline: meta.title,
          description: meta.description,
          about: { '@type': 'Organization', name: c.clientName },
          author: orgRef,
          publisher: orgRef,
          inLanguage: inLanguage(lang),
          mainEntityOfPage: pageUrl,
        },
      ];
    }
    case 'solution': {
      const id = findSolution(route.slug)!.id;
      const s = solutionList(lang).find((item) => item.id === id)!;
      return [
        {
          '@type': 'Article',
          '@id': `${pageUrl}#article`,
          headline: s.name,
          description: s.description,
          author: orgRef,
          publisher: orgRef,
          inLanguage: inLanguage(lang),
          mainEntityOfPage: pageUrl,
        },
      ];
    }
    case 'academy':
      return [
        {
          '@type': 'ItemList',
          '@id': `${pageUrl}#courses`,
          itemListElement: courseList(lang).map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: url(`/academy/${courseSlug(c.code)}`, lang),
            name: c.title,
          })),
        },
      ];
    case 'course': {
      const id = findCourse(route.slug)!.id;
      const c = courseList(lang).find((item) => item.id === id)!;
      return [
        {
          '@type': 'Course',
          '@id': `${pageUrl}#course`,
          name: c.title,
          description: c.subtitle,
          provider: orgRef,
          inLanguage: inLanguage(lang),
          audience: { '@type': 'Audience', audienceType: c.targetAudience },
          isAccessibleForFree: true,
          hasPart: c.modules.flatMap((m) =>
            m.lessons.map((l) => ({ '@type': 'LearningResource', name: l.title, url: url(lessonPath(l.id), lang) }))
          ),
        },
      ];
    }
    case 'lesson': {
      const found = findLesson(route.course, route.slug)!;
      const course = courseList(lang).find((c) => c.id === found.course.id)!;
      const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === found.lesson.id)!;
      const video = VIDEO_META[lesson.id];
      const bvid = BILIBILI_VIDEOS[lesson.id];
      const entities: Json[] = [
        {
          '@type': 'LearningResource',
          '@id': `${pageUrl}#lesson`,
          name: lesson.title,
          description: lesson.summary,
          learningResourceType: 'Lesson',
          timeRequired: `PT${lesson.durationMinutes}M`,
          inLanguage: inLanguage(lang),
          isAccessibleForFree: true,
          isPartOf: { '@type': 'Course', name: course.title, url: url(`/academy/${route.course}`, lang), provider: orgRef },
          author: orgRef,
        },
      ];
      if (video) {
        entities.push({
          '@type': 'VideoObject',
          '@id': `${pageUrl}#video`,
          name: lesson.title,
          description: lesson.summary,
          thumbnailUrl: absoluteUrl(videoPoster(lesson.videoUrl)),
          contentUrl: absoluteUrl(lesson.videoUrl),
          uploadDate: `${video.uploadDate}T00:00:00+08:00`,
          duration: `PT${Math.floor(video.seconds / 60)}M${video.seconds % 60}S`,
          inLanguage: 'zh-CN',
          publisher: orgRef,
          ...(bvid ? { sameAs: `https://www.bilibili.com/video/${bvid}` } : {}),
        });
      }
      return entities;
    }
    case 'insights':
      return [];
    case 'insight': {
      const item = findInsight(route.slug)!;
      const content = item[lang];
      return [
        {
          '@type': 'Article',
          '@id': `${pageUrl}#article`,
          headline: content.title,
          description: content.description,
          abstract: content.answer,
          datePublished: item.publishedAt,
          dateModified: item.updatedAt,
          author: orgRef,
          publisher: orgRef,
          inLanguage: inLanguage(lang),
          keywords: item.keywords[lang].join(', '),
          mainEntityOfPage: pageUrl,
          image: absoluteUrl('/og.png'),
        },
        faqPage(pageUrl, content.faqs),
      ];
    }
    case 'glossary':
      return [
        {
          '@type': 'DefinedTermSet',
          '@id': GLOSSARY_SET_ID(lang),
          name: meta.title,
          hasDefinedTerm: glossaryList(lang).map((term) => ({
            '@type': 'DefinedTerm',
            name: term.term,
            url: url(`/glossary/${termSlug(term.id)}`, lang),
          })),
        },
      ];
    case 'term': {
      const id = findTerm(route.slug)!.id;
      const term = glossaryList(lang).find((item) => item.id === id)!;
      return [
        {
          '@type': 'DefinedTerm',
          '@id': `${pageUrl}#term`,
          name: term.term,
          alternateName: term.englishTerm,
          description: term.oneLineDefinition,
          inDefinedTermSet: { '@id': GLOSSARY_SET_ID(lang) },
          url: pageUrl,
        },
        faqPage(pageUrl, [{ q: term.questionTitle, a: `${term.oneLineDefinition} ${term.detailedExplanation}` }]),
      ];
    }
    case 'audit': {
      const method = findInsight('ai-visibility-audit-methodology');
      return [
        {
          '@type': 'WebApplication',
          '@id': `${pageUrl}#app`,
          name: lang === 'en' ? 'AI visibility audit' : 'AI 可见性测评',
          description: meta.description,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          isAccessibleForFree: true,
          provider: orgRef,
          url: pageUrl,
        },
        ...(method ? [faqPage(pageUrl, method[lang].faqs)] : []),
      ];
    }
    default:
      return [];
  }
}

const PAGE_TYPE: Partial<Record<Route['kind'], string>> = {
  about: 'AboutPage',
  services: 'CollectionPage',
  cases: 'CollectionPage',
  academy: 'CollectionPage',
  insights: 'CollectionPage',
  glossary: 'CollectionPage',
  insight: 'WebPage',
};

/** 页面的完整 JSON-LD（@graph） */
export function pageSchema(route: Route, lang: Lang): Json {
  const meta = routeMeta(route, lang);
  const pageUrl = url(routePath(route), lang);
  const trail = crumbs(route, lang);
  const graph: Json[] = [
    organization(lang),
    website(lang),
    {
      '@type': PAGE_TYPE[route.kind] ?? 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: meta.title,
      description: meta.description,
      inLanguage: inLanguage(lang),
      isPartOf: { '@id': WEBSITE_ID },
      about: route.kind === 'home' || route.kind === 'about' ? orgRef : undefined,
      breadcrumb: trail.length ? { '@id': `${pageUrl}#breadcrumb` } : undefined,
    },
    ...mainEntities(route, lang, pageUrl),
  ];
  if (trail.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: trail.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: url(item.path, lang),
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

