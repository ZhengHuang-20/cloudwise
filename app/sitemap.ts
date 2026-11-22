import type { MetadataRoute } from 'next';
import { courseList } from '../src/data/coursesData';
import { VIDEO_META, videoPoster } from '../src/data/videoMeta';
import { absoluteUrl } from '../src/lib/site';
import { allRoutes, findLesson, hasEnglish, isIndexable, localizePath, routeModified, routePath, type Route } from '../src/site/routes';

/**
 * sitemap.xml：全部可索引页面的中英文地址，带 hreflang 互指；课时页附带视频信息。
 *
 * lastmod 是这里唯一起作用的“新鲜度”字段：取 routeModified（文章取 updatedAt，其他页面按类别取
 * src/lib/site.ts 的 PAGE_UPDATED），只在正文有实质改动时变化。Google 与 Bing 都只在 lastmod 持续准确时
 * 才采信它；Bing 说明在 AI 驱动的搜索里，准确的 lastmod 帮它优先抓取更新过的页面。
 * 不输出 changefreq 与 priority：Google 与 Bing 的官方文档都写明会忽略这两个字段。
 * Markdown 版（*.md）是 noindex 且 canonical 指回 HTML 页，不进 sitemap。
 */

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
        alternates: languages ? { languages } : undefined,
        // 视频是中文讲解，只挂在中文课时页上
        videos: lang === 'zh' ? lessonVideo(route) : undefined,
      }));
    });
}
