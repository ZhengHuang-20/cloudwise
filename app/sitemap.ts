import type { MetadataRoute } from 'next';
import { courseList } from '../src/data/coursesData';
import { VIDEO_META, videoPoster } from '../src/data/videoMeta';
import { absoluteUrl } from '../src/lib/site';
import { allRoutes, findLesson, hasEnglish, isIndexable, localizePath, routeModified, routePath, type Route } from '../src/site/routes';

/**
 * sitemap.xml：全部可索引页面的中英文地址，带 hreflang 互指；课时页附带视频信息。
 * lastModified：文章取更新日期，其他页面取 src/lib/site.ts 的 CONTENT_UPDATED（改动页面内容时更新它）。
 */

const PRIORITY: Partial<Record<Route['kind'], number>> = {
  home: 1,
  services: 0.9,
  service: 0.9,
  audit: 0.9,
  insights: 0.8,
  insight: 0.8,
  cases: 0.8,
  case: 0.8,
  academy: 0.7,
  course: 0.7,
  lesson: 0.6,
  glossary: 0.7,
  term: 0.7,
};

function lessonVideo(route: Route) {
  if (route.kind !== 'lesson') return undefined;
  const found = findLesson(route.course, route.slug);
  if (!found) return undefined;
  const lesson = courseList('zh')
    .flatMap((c) => c.modules.flatMap((m) => m.lessons))
    .find((l) => l.id === found.lesson.id)!;
  const meta = VIDEO_META[lesson.id];
  if (!meta) return undefined;
  return [
    {
      title: lesson.title,
      description: lesson.summary,
      thumbnail_loc: absoluteUrl(videoPoster(lesson.videoUrl)),
      content_loc: absoluteUrl(lesson.videoUrl),
      duration: meta.seconds,
      publication_date: `${meta.uploadDate}T00:00:00+08:00`,
    },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes()
    .filter(isIndexable)
    .flatMap((route) => {
      const path = routePath(route);
      const languages = hasEnglish(route)
        ? {
            'zh-CN': absoluteUrl(localizePath(path, 'zh')),
            en: absoluteUrl(localizePath(path, 'en')),
            'x-default': absoluteUrl(localizePath(path, 'zh')),
          }
        : undefined;
      const langs = hasEnglish(route) ? (['zh', 'en'] as const) : (['zh'] as const);
      return langs.map((lang) => ({
        url: absoluteUrl(localizePath(path, lang)),
        lastModified: routeModified(route),
        changeFrequency: route.kind === 'insights' || route.kind === 'home' ? ('weekly' as const) : ('monthly' as const),
        priority: PRIORITY[route.kind] ?? 0.5,
        alternates: languages ? { languages } : undefined,
        // 视频是中文讲解，只挂在中文课时页上
        videos: lang === 'zh' ? lessonVideo(route) : undefined,
      }));
    });
}
