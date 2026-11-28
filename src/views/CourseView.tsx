import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';
import { courseList, FRICTION_EN } from '../data/coursesData';
import { glossaryList } from '../data/glossaryData';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { courseCodeForLesson, findCourse, lessonPath, servicesForCourse, termSlug } from '../site/links';
import { splitTitle } from './AcademyView';

/** 课程主页 /academy/<slug>：课程简介与全部课时的链接 */
export const CourseView: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, lang, path } = useLang();
  const { isLessonCompleted } = useApp();
  const id = findCourse(slug)!.id;
  const course = courseList(lang).find((c) => c.id === id)!;
  const title = splitTitle(course.title);
  const friction = lang === 'en' ? FRICTION_EN[course.frictionPoint] : course.frictionPoint;
  // 课程 ↔ 服务一一对应（见 ServiceDetailView 的 codes 计算）
  const relatedServices = servicesForCourse(course.code);
  // 术语按 relatedLessonId 归到课程字母，与服务页「相关术语」同一口径
  const relatedTerms = glossaryList(lang).filter(
    (term) => term.relatedLessonId !== undefined && courseCodeForLesson(term.relatedLessonId) === course.code
  );
  const publishedLessons = course.modules.flatMap((mod) => mod.lessons);
  const publishedMinutes = publishedLessons.reduce((total, lesson) => total + lesson.durationMinutes, 0);
  const durationText =
    publishedMinutes >= 60
      ? t(
          `${Math.floor(publishedMinutes / 60)} 小时${publishedMinutes % 60 ? ` ${publishedMinutes % 60} 分钟` : ''}`,
          `${Math.floor(publishedMinutes / 60)}h${publishedMinutes % 60 ? ` ${publishedMinutes % 60}m` : ''}`
        )
      : t(`${publishedMinutes} 分钟`, `${publishedMinutes} min`);

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

        {/* 事实型数据：只报「已上线」的量，与下面的模块列表、Course 结构化数据同口径 */}
        <dl className="well grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          {[
            { label: t('已上线课时', 'Published lessons'), value: `${publishedLessons.length}` },
            { label: t('已上线模块', 'Published modules'), value: `${course.modules.length}` },
            { label: t('视频时长', 'Video time'), value: durationText },
            { label: t('价格', 'Price'), value: t('免费', 'Free') },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-caption text-label-secondary">{item.label}</dt>
              <dd className="mt-1 text-title-3 tabular-nums text-label">{item.value}</dd>
            </div>
          ))}
        </dl>

        {relatedServices.length > 0 && (
          <p className="text-body text-label-secondary">
            {t('这门课对应的服务：', 'Service for this course: ')}
            {relatedServices.map((svc, i) => (
              <React.Fragment key={svc.slug}>
                {i > 0 && (lang === 'en' ? ', ' : '、')}
                <Link href={path(`/services/${svc.slug}`)} className="link">
                  {t(svc.title.zh, svc.title.en)}
                </Link>
              </React.Fragment>
            ))}
          </p>
        )}

        {relatedTerms.length > 0 && (
          <section aria-labelledby="course-terms">
            <h2 id="course-terms" className="text-title-3">
              {t('这门课讲到的术语', 'Terms covered in this course')}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {relatedTerms.map((term) => (
                <li key={term.id}>
                  <Link href={path(`/glossary/${termSlug(term.id)}`)} className="chip">
                    {term.term}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

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
          <Link href={path(`/services/${relatedServices[0]?.slug ?? slug}`)} className="btn btn-secondary btn-lg">
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
