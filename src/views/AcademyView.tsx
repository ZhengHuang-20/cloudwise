import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';
import { COURSES, Course, courseList, FRICTION_EN, Lesson, pathList, RoleLearningPath } from '../data/coursesData';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { LessonModal } from '../components/LessonModal';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN } from '../lib/features';

interface AcademyViewProps {
  onGoToTool: (toolId: string) => void;
  onGoToBooking: () => void;
}

const TOTAL_LESSONS = COURSES.reduce((sum, course) => sum + course.totalLessons, 0);

// 课程标题形如「GEO——让 AI 在答案里说出你的名字」
const splitTitle = (title: string) => {
  const [short, tagline] = title.split('——');
  return { short, tagline: tagline || short };
};

// 角色名取第一个词：「决策者（董事长…）」→「决策者」，「Decision-makers (chairman…)」→「Decision-makers」
const roleLabel = (targetRole: string) => targetRole.split(/[（(]/)[0].split(/[、,]/)[0].trim();

const findLesson = (courses: Course[], lessonId: string) => {
  for (const course of courses) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return { course, lesson };
    }
  }
  return null;
};

/** 路径里的课按顺序列出；有课程被隐藏（如 FDE 关闭）时已在数据层过滤掉 */
const pathLessons = (courses: Course[], path: RoleLearningPath) =>
  path.featuredLessonIds.flatMap((id) => {
    const found = findLesson(courses, id);
    return found ? [found] : [];
  });

/** 角色学习路径的课程列表。点击任一课直接播放，课程标签页随之切换。 */
const PathPanel: React.FC<{
  path: RoleLearningPath;
  courses: Course[];
  lastLessonId: string | null;
  onOpenLesson: (lessonId: string) => void;
  onClose: () => void;
}> = ({ path, courses, lastLessonId, onOpenLesson, onClose }) => {
  const { isLessonCompleted } = useApp();
  const { t } = useLang();
  const lessons = pathLessons(courses, path);
  const doneCount = lessons.filter(({ lesson }) => isLessonCompleted(lesson.id)).length;

  return (
    <section className="tile mt-6 animate-fade-in" aria-labelledby="path-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-caption text-label-secondary">
            {t('学习路径 · 已学', 'Learning path · completed')}{' '}
            <span className="tabular-nums text-label">{doneCount}</span> / {lessons.length} {t('课', 'lessons')}
          </p>
          <h3 id="path-title" className="mt-1 text-title-2">
            {path.title}
          </h3>
          <p className="mt-2 text-body text-label-secondary">
            {t('学完目标：', 'Goal: ')}
            {path.endGoal}
          </p>
        </div>
        <button type="button" onClick={onClose} className="btn btn-neutral btn-sm shrink-0">
          {t('收起路径', 'Close path')}
        </button>
      </div>

      <ol className="mt-6 divide-y divide-separator border-t border-separator">
        {lessons.map(({ course, lesson }, index) => {
          const completed = isLessonCompleted(lesson.id);
          const last = lesson.id === lastLessonId;
          return (
            <li key={lesson.id}>
              <button
                type="button"
                onClick={() => onOpenLesson(lesson.id)}
                aria-current={last ? 'step' : undefined}
                className="group flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-surface-hover"
              >
                {completed ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-label={t('已学完', 'Completed')} />
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-body tabular-nums text-label-secondary">
                    {index + 1}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-body ${completed ? 'text-label-secondary' : 'text-label'} ${last ? 'font-semibold' : ''}`}
                  >
                    {lesson.title}
                  </span>
                  <span className="mt-0.5 block text-caption text-label-secondary">
                    {last ? t('上次学到 · ', 'Last opened · ') : ''}
                    {t('课程', 'Course')} {course.code} · {splitTitle(course.title).short} · {lesson.durationMinutes}{' '}
                    {t('分钟', 'min')}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-label-tertiary transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export const AcademyView: React.FC<AcademyViewProps> = ({ onGoToTool }) => {
  const { isLessonCompleted, getCourseProgressPercentage, totalCompletedLessons } = useApp();
  const { t, lang } = useLang();
  const courses = courseList(lang);
  const paths = pathList(lang);

  const [activeCourseId, setActiveCourseId] = useState<string>('course-c-geo');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lastLessonId, setLastLessonId] = useState<string | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  const currentCourse = courses.find((c) => c.id === activeCourseId) || courses[2];
  const currentTitle = splitTitle(currentCourse.title);
  const currentProgress = getCourseProgressPercentage(currentCourse.id);
  const currentFriction = lang === 'en' ? FRICTION_EN[currentCourse.frictionPoint] : currentCourse.frictionPoint;

  const toggleModule = (modIdx: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modIdx]: !prev[modIdx],
    }));
  };

  const openLessonById = (lessonId: string) => {
    const found = findLesson(courses, lessonId);
    if (found) {
      setActiveCourseId(found.course.id);
      setActiveLesson(found.lesson);
      setLastLessonId(found.lesson.id);
    }
  };

  const activePath = paths.find((p) => p.id === activePathId) ?? null;

  // 「开始学习」：进入路径，从第一节未学完的课开始播放
  const startPath = (path: RoleLearningPath) => {
    setActivePathId(path.id);
    const firstOpen = path.featuredLessonIds.find((id) => !isLessonCompleted(id)) ?? path.featuredLessonIds[0];
    openLessonById(firstOpen);
  };

  // 弹窗里「下一课」指路径中的下一节
  const nextInPath = (() => {
    if (!activePath || !activeLesson) return null;
    const lessons = pathLessons(courses, activePath);
    const index = lessons.findIndex(({ lesson }) => lesson.id === activeLesson.id);
    return index >= 0 && index + 1 < lessons.length ? lessons[index + 1].lesson : null;
  })();

  return (
    <div>
      <PageHeader
        eyebrow={t('出海学院', 'Export Academy')}
        title={t(`${SERVICE_COUNT_CN}门专业课，全部公开`, `${SERVICE_COUNT_EN} expert courses, all open to read`)}
        intro={t(
          '海外采购标准里的工程细节，这里都写明白。先自己学懂，见面沟通时就不必从头解释基础。',
          'The engineering detail behind overseas procurement standards, written out in full. Learn it yourself first, and you will not need to explain the basics from scratch when you meet.'
        )}
      >
        <div className="mx-auto flex max-w-xs items-center gap-3">
          <div className="meter flex-1" aria-hidden="true">
            <span
              className="bg-success"
              style={{ width: `${Math.min(100, (totalCompletedLessons / TOTAL_LESSONS) * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-caption text-label-secondary">
            {t('已学', 'Completed')} <span className="tabular-nums text-label">{totalCompletedLessons}</span> / {TOTAL_LESSONS}{' '}
            {t('课时', 'lessons')}
          </span>
        </div>
      </PageHeader>

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {/* 角色路径 */}
        <section aria-labelledby="paths-title">
          <h2 id="paths-title" className="text-title-2">
            {t('按角色学习', 'Learn by role')}
          </h2>
          <p className="mt-2 text-body text-label-secondary">
            {t(
              '不同角色关注的深度与指标不同，从最适合你的一条路径开始。',
              'Each role needs a different depth and different metrics. Start with the path that suits you best.'
            )}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {paths.map((path) => {
              const isSelected = activePathId === path.id;
              return (
                <button
                  key={path.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => startPath(path)}
                  className={`card interactive group flex flex-col items-start ${
                    isSelected ? 'shadow-[inset_0_0_0_2px_var(--color-accent)]' : ''
                  }`}
                >
                  <span className="text-caption text-label-secondary">
                    {roleLabel(path.targetRole)} · {path.durationText}
                  </span>
                  <h3 className="mt-2 text-title-3">{path.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-body text-label-secondary">{path.description}</p>
                  <span className="link mt-5 text-body">
                    {t('开始学习', 'Start learning')}
                    <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>

          {activePath && (
            <PathPanel
              key={activePath.id}
              path={activePath}
              courses={courses}
              lastLessonId={lastLessonId}
              onOpenLesson={openLessonById}
              onClose={() => setActivePathId(null)}
            />
          )}
        </section>

        {/* 课程 */}
        <section aria-labelledby="course-title" className="mt-[clamp(4rem,2.5rem+4vw,6rem)]">
          <div className="flex justify-center">
            <SegmentedControl
              ariaLabel={t('选择课程', 'Choose a course')}
              size="lg"
              value={activeCourseId}
              onChange={setActiveCourseId}
              options={courses.map((course) => ({
                id: course.id,
                label: `${course.code} · ${splitTitle(course.title).short}`,
              }))}
            />
          </div>

          <div className="tile mt-8 animate-fade-in" key={currentCourse.id}>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-caption text-label-secondary">
                  {t(
                    `课程 ${currentCourse.code} · ${currentTitle.short} · 对应卡点：${currentFriction}`,
                    `Course ${currentCourse.code} · ${currentTitle.short} · Pain point: ${currentFriction}`
                  )}
                </p>
                <h2 id="course-title" className="mt-2 text-title-1">
                  {currentTitle.tagline}
                </h2>
                <p className="mt-4 text-body text-label-secondary">{currentCourse.subtitle}</p>
                <p className="mt-2 text-caption text-label-secondary">
                  {t('主案例：', 'Lead case: ')}
                  {currentCourse.heroCase}
                </p>
              </div>

              <div className="w-full shrink-0 lg:w-64">
                <div className="flex items-baseline justify-between">
                  <span className="text-caption text-label-secondary">{t('课程进度', 'Course progress')}</span>
                  <span className="text-body font-semibold tabular-nums">{currentProgress}%</span>
                </div>
                <div className="meter mt-2">
                  <span className="bg-success" style={{ width: `${currentProgress}%` }} />
                </div>
                {currentCourse.relatedTool && (
                  <button
                    type="button"
                    onClick={() => onGoToTool(currentCourse.relatedTool!.id)}
                    className="btn btn-secondary btn-block mt-5 whitespace-normal"
                  >
                    {t('配套工具：', 'Related tool: ')}
                    {currentCourse.relatedTool.name}
                  </button>
                )}
              </div>
            </div>

            <blockquote className="mt-8 border-l-2 border-separator-strong pl-4 text-body text-label-secondary">
              <span className="font-semibold text-label">{t('决策者视点　', 'Executive view: ')}</span>
              {currentCourse.executiveModuleSummary}
            </blockquote>
          </div>

          {/* 章节与课时 */}
          <div className="mt-5 space-y-3">
            {currentCourse.modules.map((mod) => {
              const isExpanded = Boolean(expandedModules[mod.index]);
              const panelId = `module-${currentCourse.id}-${mod.index}`;
              return (
                <div key={mod.index} className="card overflow-hidden p-0">
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.index)}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-hover md:px-8"
                    >
                      <span className="min-w-0">
                        <span className="block text-title-3">{mod.name}</span>
                        <span className="mt-1 block text-caption text-label-secondary">
                          {mod.description} · {mod.lessons.length} {t('课时', 'lessons')}
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-label-secondary transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </h3>

                  {isExpanded && (
                    <ul id={panelId} className="divide-y divide-separator border-t border-separator">
                      {mod.lessons.map((lesson) => {
                        const completed = isLessonCompleted(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <button
                              type="button"
                              onClick={() => setActiveLesson(lesson)}
                              className="group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-surface-hover md:px-8"
                            >
                              {completed ? (
                                <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-label={t('已学完', 'Completed')} />
                              ) : (
                                <PlayCircle className="h-6 w-6 shrink-0 text-label-secondary" aria-label={t('未学', 'Not started')} />
                              )}
                              <span className="min-w-0 flex-1">
                                <span className={`block text-body ${completed ? 'text-label-secondary' : 'text-label'}`}>
                                  {lesson.title}
                                </span>
                                <span className="mt-0.5 block truncate text-caption text-label-secondary">
                                  {lesson.summary}
                                </span>
                              </span>
                              <span className="hidden shrink-0 text-caption tabular-nums text-label-secondary sm:block">
                                {lesson.durationMinutes} {t('分钟', 'min')}
                              </span>
                              <ChevronRight className="h-5 w-5 shrink-0 text-label-tertiary transition-transform duration-200 group-hover:translate-x-0.5" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {activeLesson && (
        <LessonModal
          key={activeLesson.id}
          lesson={activeLesson}
          course={currentCourse}
          nextInPath={nextInPath ? { title: nextInPath.title, onNext: () => openLessonById(nextInPath.id) } : undefined}
          onClose={() => setActiveLesson(null)}
          onNavigateToNextLesson={openLessonById}
          onNavigateToTool={(toolId) => {
            setActiveLesson(null);
            onGoToTool(toolId);
          }}
        />
      )}
    </div>
  );
};
