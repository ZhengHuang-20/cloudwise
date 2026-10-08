import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';
import { courseList, FRICTION_EN } from '../data/coursesData';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { findCourse, lessonPath } from '../site/routes';
import { splitTitle } from './AcademyView';

/** 课程主页 /academy/<slug>：课程简介与全部课时的链接 */
export const CourseView: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, lang, path } = useLang();
  const { isLessonCompleted } = useApp();
  const id = findCourse(slug)!.id;
  const course = courseList(lang).find((c) => c.id === id)!;
  const title = splitTitle(course.title);
  const friction = lang === 'en' ? FRICTION_EN[course.frictionPoint] : course.frictionPoint;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t('出海学院', 'Export Academy'), href: '/academy' }, { label: title.short }]}
        eyebrow={t(`课程 ${course.code} · 对应卡点：${friction}`, `Course ${course.code} · Pain point: ${friction}`)}
        title={title.tagline}
        intro={course.subtitle}
      >
        <p className="text-caption text-label-secondary">
          {t('适合：', 'For: ')}
          {course.targetAudience} · {t('主案例：', 'Lead case: ')}
          {course.heroCase}
        </p>
      </PageHeader>

      <div className="layout-text space-y-5 pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <blockquote className="tile text-body text-label-secondary">
          <span className="font-semibold text-label">{t('决策者视点　', 'Executive view: ')}</span>
          {course.executiveModuleSummary}
        </blockquote>

        {course.modules.map((mod) => (
          <section key={mod.index} className="card overflow-hidden p-0" aria-labelledby={`module-${mod.index}`}>
            <div className="px-6 py-5 md:px-8">
              <h2 id={`module-${mod.index}`} className="text-title-3">
                {mod.name}
              </h2>
              <p className="mt-1 text-caption text-label-secondary">{mod.description}</p>
            </div>
            <ul className="divide-y divide-separator border-t border-separator">
              {mod.lessons.map((lesson) => {
                const completed = isLessonCompleted(lesson.id);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={path(lessonPath(lesson.id))}
                      className="group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-surface-hover md:px-8"
                    >
                      {completed ? (
                        <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-label={t('已学完', 'Completed')} />
                      ) : (
                        <PlayCircle className="h-6 w-6 shrink-0 text-label-secondary" aria-hidden="true" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-body text-label">{lesson.title}</span>
                        <span className="mt-0.5 block text-caption text-label-secondary">{lesson.summary}</span>
                      </span>
                      <span className="hidden shrink-0 text-caption tabular-nums text-label-secondary sm:block">
                        {lesson.durationMinutes} {t('分钟', 'min')}
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-label-tertiary transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div className="flex flex-col items-center justify-center gap-3 pt-10 sm:flex-row">
          <Link href={path(`/services/${slug}`)} className="btn btn-secondary btn-lg">
            {t('查看对应服务', 'See the matching service')}
          </Link>
          <Link href={path('/academy')} className="btn btn-neutral btn-lg">
            {t('全部课程', 'All courses')}
          </Link>
        </div>
      </div>
    </div>
  );
};
