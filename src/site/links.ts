/**
 * 前端可用的路由工具：Route 类型、数据 id ↔ URL slug、路径换算。
 * 这里不引入「GEO 洞察」文章数据，所以客户端组件从这里 import 时，文章正文不会被打进浏览器脚本。
 * 需要文章数据的部分（URL 解析、全部页面列表、更新日期、findInsight）在服务端的 routes.ts。
 */
import { SERVICES } from '../data/servicesData';
import { CASE_STUDIES, INDUSTRY_SOLUTIONS } from '../data/caseStudiesData';
import { COURSES } from '../data/coursesData';
import { GLOSSARY_TERMS } from '../data/glossaryData';
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
