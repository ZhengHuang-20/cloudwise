/**
 * 官网的路由表：URL ↔ 页面。服务端页面（app/(zh)、app/(en)）、metadata、sitemap、llms.txt 共用。
 * 中文无前缀（/services），英文加 /en（/en/services）；两种语言的路径结构完全一致。
 * 新增页面：在 links.ts 的 Route 里加一种 kind 并同步 routePath，在这里同步 resolveRoute / allRoutes，再到 RouteView 加渲染分支。
 *
 * 只在服务端使用：这里引入了全部文章数据。客户端组件从 links.ts 取路由工具。
 */
import { SERVICES } from '../data/servicesData';
import { CASE_STUDIES, INDUSTRY_SOLUTIONS } from '../data/caseStudiesData';
import { COURSES } from '../data/coursesData';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { INSIGHTS } from '../data/insights';
import { PAGE_UPDATED, type PageGroup } from '../lib/site';
import {
  CONSOLE_SECTIONS,
  caseSlug,
  courseSlug,
  findCase,
  findCourse,
  findLesson,
  findService,
  findSolution,
  findTerm,
  lessonSlug,
  solutionSlug,
  termSlug,
  type Route,
} from './links';
export * from './links';

export const findInsight = (slug: string) => INSIGHTS.find((i) => i.slug === slug);

// ---------- URL → Route ----------

const exists = <T,>(value: T | undefined | null, route: Route): Route | null => (value ? route : null);

export function resolveRoute(segments: string[] = []): Route | null {
  const [a, b, c, ...rest] = segments.map((s) => decodeURIComponent(s));
  if (rest.length) return null;
  if (!a) return { kind: 'home' };
  switch (a) {
    case 'services':
      if (!b) return { kind: 'services' };
      return c ? null : exists(findService(b), { kind: 'service', slug: b });
    case 'cases':
      if (!b) return { kind: 'cases' };
      return c ? null : exists(findCase(b), { kind: 'case', slug: b });
    case 'solutions':
      return !b || c ? null : exists(findSolution(b), { kind: 'solution', slug: b });
    case 'academy':
      if (!b) return { kind: 'academy' };
      if (!c) return exists(findCourse(b), { kind: 'course', slug: b });
      return exists(findLesson(b, c), { kind: 'lesson', course: b, slug: c });
    case 'insights':
      if (!b) return { kind: 'insights' };
      return c ? null : exists(findInsight(b), { kind: 'insight', slug: b });
    case 'glossary':
      if (!b) return { kind: 'glossary' };
      return c ? null : exists(findTerm(b), { kind: 'term', slug: b });
    case 'console':
      if (c) return null;
      if (!b) return { kind: 'console' };
      return (CONSOLE_SECTIONS as readonly string[]).includes(b) ? { kind: 'console', section: b } : null;
    case 'audit':
    case 'about':
    case 'configurator':
    case 'deal-room':
    case 'login':
      return b ? null : ({ kind: a } as Route);
    default:
      return null;
  }
}

/** 每种页面属于 src/lib/site.ts 的 PAGE_UPDATED 里哪一类 */
const PAGE_GROUP: Record<Exclude<Route['kind'], 'insight'>, PageGroup> = {
  home: 'home',
  services: 'services',
  service: 'services',
  cases: 'cases',
  case: 'cases',
  solution: 'cases',
  academy: 'academy',
  course: 'academy',
  lesson: 'academy',
  insights: 'insights',
  glossary: 'glossary',
  term: 'glossary',
  audit: 'audit',
  about: 'about',
  configurator: 'configurator',
  'deal-room': 'configurator',
  login: 'about',
  console: 'about',
};

const latest = (dates: string[]) => dates.reduce((max, d) => (d > max ? d : max));

/**
 * 页面内容的更新日期（YYYY-MM-DD）：sitemap 的 lastmod、JSON-LD 的 dateModified、Markdown 版共用。
 * 文章取自己的 updatedAt；「GEO 洞察」列表页列出全部文章，取列表文案与最新文章中较晚的日期；其他页面按类别取 PAGE_UPDATED。
 */
export const routeModified = (route: Route): string => {
  if (route.kind === 'insight') return findInsight(route.slug)?.updatedAt ?? PAGE_UPDATED.insights;
  if (route.kind === 'insights') return latest([PAGE_UPDATED.insights, ...INSIGHTS.map((i) => i.updatedAt)]);
  return PAGE_UPDATED[PAGE_GROUP[route.kind]];
};

/** 全部可访问的页面（静态生成与 sitemap 用） */
export function allRoutes(): Route[] {
  return [
    { kind: 'home' },
    { kind: 'services' },
    ...SERVICES.map((s) => ({ kind: 'service' as const, slug: s.slug })),
    { kind: 'cases' },
    ...CASE_STUDIES.map((c) => ({ kind: 'case' as const, slug: caseSlug(c.id) })),
    ...INDUSTRY_SOLUTIONS.map((s) => ({ kind: 'solution' as const, slug: solutionSlug(s.id) })),
    { kind: 'academy' },
    ...COURSES.map((c) => ({ kind: 'course' as const, slug: courseSlug(c.code) })),
    ...COURSES.flatMap((c) =>
      c.modules.flatMap((m) =>
        m.lessons.map((l) => ({ kind: 'lesson' as const, course: courseSlug(c.code), slug: lessonSlug(l.id) }))
      )
    ),
    { kind: 'insights' },
    ...INSIGHTS.map((i) => ({ kind: 'insight' as const, slug: i.slug })),
    { kind: 'glossary' },
    ...GLOSSARY_TERMS.map((t) => ({ kind: 'term' as const, slug: termSlug(t.id) })),
    { kind: 'audit' },
    { kind: 'about' },
    { kind: 'configurator' },
    { kind: 'deal-room' },
    { kind: 'login' },
    { kind: 'console' },
    ...CONSOLE_SECTIONS.map((section) => ({ kind: 'console' as const, section })),
  ];
}

