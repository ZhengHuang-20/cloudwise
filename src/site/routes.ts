/**
 * 官网的路由表：URL ↔ 页面。服务端页面（app/(zh)、app/(en)）、metadata、sitemap、llms.txt 与前端导航共用。
 * 中文无前缀（/services），英文加 /en（/en/services）；两种语言的路径结构完全一致。
 * 新增页面：在 Route 里加一种 kind，并同步 resolveRoute / routePath / allRoutes，再到 RouteView 加渲染分支。
 */
import { SERVICES } from '../data/servicesData';
import { CASE_STUDIES, INDUSTRY_SOLUTIONS } from '../data/caseStudiesData';
import { COURSES } from '../data/coursesData';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { INSIGHTS } from '../data/insights';
export { localizePath, splitLocale } from './locale';

export type Route =
  | { kind: 'home' }
  | { kind: 'services' }
  | { kind: 'service'; slug: string }
  | { kind: 'cases' }
  | { kind: 'case'; slug: string }
  | { kind: 'solution'; slug: string }
  | { kind: 'academy' }
  | { kind: 'course'; slug: string }
  | { kind: 'lesson'; course: string; slug: string }
  | { kind: 'insights' }
  | { kind: 'insight'; slug: string }
  | { kind: 'glossary' }
  | { kind: 'term'; slug: string }
  | { kind: 'audit' }
  | { kind: 'about' }
  | { kind: 'configurator' }
  | { kind: 'deal-room' }
  | { kind: 'login' }
  | { kind: 'console'; section?: string };

export type RouteKind = Route['kind'];

// ---------- 数据 id ↔ URL slug ----------

export const caseSlug = (id: string) => id.replace(/^case-/, '');
export const solutionSlug = (id: string) => id.replace(/^solution-/, '');
export const termSlug = (id: string) => id.replace(/^term-/, '');
export const lessonSlug = (id: string) => id.replace(/^lesson-/, '');
/** 课程与服务一一对应（课程 C ↔ 服务 C），共用同一个 slug */
export const courseSlug = (code: string) => SERVICES.find((s) => s.code === code)?.slug ?? code.toLowerCase();

export const findService = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const findCase = (slug: string) => CASE_STUDIES.find((c) => caseSlug(c.id) === slug);
export const findSolution = (slug: string) => INDUSTRY_SOLUTIONS.find((s) => solutionSlug(s.id) === slug);
export const findCourse = (slug: string) => COURSES.find((c) => courseSlug(c.code) === slug);
export const findTerm = (slug: string) => GLOSSARY_TERMS.find((t) => termSlug(t.id) === slug);
export const findInsight = (slug: string) => INSIGHTS.find((i) => i.slug === slug);
export const findLesson = (courseSlugValue: string, slug: string) => {
  const course = findCourse(courseSlugValue);
  const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => lessonSlug(l.id) === slug);
  return course && lesson ? { course, lesson } : null;
};

/** 课时 id → 课时页路径（不带语言前缀） */
export const lessonPath = (lessonId: string) => {
  for (const course of COURSES) {
    if (course.modules.some((m) => m.lessons.some((l) => l.id === lessonId))) {
      return `/academy/${courseSlug(course.code)}/${lessonSlug(lessonId)}`;
    }
  }
  return '/academy';
};

/** 后台的子页面（与 src/views/console/ConsoleContext 的 Section 对应） */
export const CONSOLE_SECTIONS = ['overview', 'leads', 'install', 'orgs', 'users', 'sites'] as const;

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

// ---------- Route → URL ----------

/** 不带语言前缀的路径，例如 /services/geo */
export function routePath(route: Route): string {
  switch (route.kind) {
    case 'home':
      return '/';
    case 'service':
      return `/services/${route.slug}`;
    case 'case':
      return `/cases/${route.slug}`;
    case 'solution':
      return `/solutions/${route.slug}`;
    case 'course':
      return `/academy/${route.slug}`;
    case 'lesson':
      return `/academy/${route.course}/${route.slug}`;
    case 'insight':
      return `/insights/${route.slug}`;
    case 'term':
      return `/glossary/${route.slug}`;
    case 'console':
      return route.section ? `/console/${route.section}` : '/console';
    default:
      return `/${route.kind}`;
  }
}

/** 后台与个人方案页不进搜索引擎 */
export const isIndexable = (route: Route) => !['deal-room', 'login', 'console'].includes(route.kind);

/** 后台只有中文 */
export const hasEnglish = (route: Route) => !['login', 'console'].includes(route.kind);

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

/** Header 高亮用：路由属于哪个导航项 */
export const navSection = (route: Route): string => {
  switch (route.kind) {
    case 'service':
      return 'services';
    case 'case':
    case 'solution':
      return 'cases';
    case 'course':
    case 'lesson':
      return 'academy';
    case 'insight':
      return 'insights';
    case 'term':
      return 'glossary';
    default:
      return route.kind;
  }
};
