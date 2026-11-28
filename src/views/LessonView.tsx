import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { courseList } from '../data/coursesData';
import { glossaryList } from '../data/glossaryData';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { LessonArticle } from '../components/LessonArticle';
import { BILIBILI_VIDEOS } from '../lib/site';
import { courseSlug, findLesson, lessonPath, serviceForLesson, termSlug } from '../site/links';
import { useSite } from '../site/SiteContext';
import { splitTitle } from './AcademyView';

/** 课时页 /academy/<课程>/<课时>：与课程弹窗内容相同，多了面包屑、上一课 / 下一课与 B 站链接 */
export const LessonView: React.FC<{ course: string; slug: string }> = ({ course: courseSlugValue, slug }) => {
  const { t, lang, path } = useLang();
  const { markLessonComplete, isLessonCompleted } = useApp();
  const { goToCourseTarget } = useSite();
  const found = findLesson(courseSlugValue, slug)!;
  const course = courseList(lang).find((c) => c.id === found.course.id)!;
  const lessons = course.modules.flatMap((m) => m.lessons);
  const index = lessons.findIndex((l) => l.id === found.lesson.id);
  const lesson = lessons[index];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const completed = isLessonCompleted(lesson.id);
  const bvid = BILIBILI_VIDEOS[lesson.id];
  const short = splitTitle(course.title).short;
  const relatedService = serviceForLesson(lesson.id);
  const relatedTerms = glossaryList(lang).filter((term) => term.relatedLessonId === lesson.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: t('出海学院', 'Export Academy'), href: '/academy' },
          { label: short, href: `/academy/${courseSlug(course.code)}` },
          { label: lesson.title },
        ]}
        eyebrow={`${t('课程', 'Course')} ${course.code} · ${short} · ${lesson.durationMinutes} ${t('分钟', 'min')}`}
        title={lesson.title}
      />

      <article className="layout-reading pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <LessonArticle lesson={lesson} course={course} headingLevel="h2" />

        {bvid && (
          <p className="mt-6 text-caption text-label-secondary">
            {t('本课视频同步发布在 B 站：', 'This video is also on Bilibili: ')}
            <a href={`https://www.bilibili.com/video/${bvid}`} target="_blank" rel="noopener noreferrer" className="link">
              {bvid}
            </a>
          </p>
        )}

        {(relatedService || relatedTerms.length > 0) && (
          <section aria-labelledby="lesson-related" className="mt-16 border-t border-separator pt-10">
            <h2 id="lesson-related" className="text-title-3">
              {t('相关服务与术语', 'Related service and terms')}
            </h2>
            {relatedService && (
              <Link href={path(`/services/${relatedService.slug}`)} className="link mt-5 inline-flex items-center gap-1 text-body">
                {t(relatedService.title.zh, relatedService.title.en)}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            {relatedTerms.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {relatedTerms.map((term) => (
                  <li key={term.id}>
                    <Link href={path(`/glossary/${termSlug(term.id)}`)} className="chip">
                      {term.term}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="mt-12 flex flex-col gap-4 border-t border-separator pt-8 sm:flex-row sm:items-center sm:justify-between">
          {completed ? (
            <span className="inline-flex items-center gap-2 text-body text-success">
              <CheckCircle2 className="h-5 w-5" />
              {t('已学完', 'Completed')}
            </span>
          ) : (
            <button type="button" onClick={() => markLessonComplete(course.id, lesson.id, 100)} className="btn btn-neutral">
              {t('标记学完', 'Mark as completed')}
            </button>
          )}
          {lesson.nextStep.actionType === 'lesson' ? (
            <Link href={path(lessonPath(lesson.nextStep.targetId))} className="btn btn-primary">
              {lesson.nextStep.label}
            </Link>
          ) : (
            <button type="button" onClick={() => goToCourseTarget(lesson.nextStep.targetId)} className="btn btn-primary">
              {lesson.nextStep.label}
            </button>
          )}
        </div>

        <nav aria-label={t('课时导航', 'Lesson navigation')} className="mt-10 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link href={path(lessonPath(prev.id))} className="card interactive">
              <span className="block text-caption text-label-secondary">{t('上一课', 'Previous lesson')}</span>
              <span className="mt-1 block text-body">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={path(lessonPath(next.id))} className="card interactive sm:text-right">
              <span className="block text-caption text-label-secondary">{t('下一课', 'Next lesson')}</span>
              <span className="mt-1 block text-body">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
};
