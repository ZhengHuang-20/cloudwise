import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';
import { COURSES, Lesson, ROLE_LEARNING_PATHS } from '../data/coursesData';
import { useApp } from '../context/AppContext';
import { LessonModal } from '../components/LessonModal';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { SERVICE_COUNT_CN } from '../lib/features';

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

const findLesson = (lessonId: string) => {
  for (const course of COURSES) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return { course, lesson };
    }
  }
  return null;
};

export const AcademyView: React.FC<AcademyViewProps> = ({ onGoToTool }) => {
  const { isLessonCompleted, getCourseProgressPercentage, totalCompletedLessons } = useApp();

  const [activeCourseId, setActiveCourseId] = useState<string>('course-c-geo');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [selectedRolePathId, setSelectedRolePathId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  const currentCourse = COURSES.find((c) => c.id === activeCourseId) || COURSES[2];
  const currentTitle = splitTitle(currentCourse.title);
  const currentProgress = getCourseProgressPercentage(currentCourse.id);

  const toggleModule = (modIdx: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modIdx]: !prev[modIdx],
    }));
  };

  const openLessonById = (lessonId: string) => {
    const found = findLesson(lessonId);
    if (found) {
      setActiveCourseId(found.course.id);
      setActiveLesson(found.lesson);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="出海学院"
        title={`${SERVICE_COUNT_CN}门专业课，全部公开`}
        intro="凡是涉及海外采购标准的工程细节，都在这里说透。买家在站内自主学懂，销售见面前不必再做低效的基础说服。"
      >
        <div className="mx-auto flex max-w-xs items-center gap-3">
          <div className="meter flex-1" aria-hidden="true">
            <span
              className="bg-success"
              style={{ width: `${Math.min(100, (totalCompletedLessons / TOTAL_LESSONS) * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-caption text-label-secondary">
            已学 <span className="tabular-nums text-label">{totalCompletedLessons}</span> / {TOTAL_LESSONS} 课时
          </span>
        </div>
      </PageHeader>

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {/* 角色路径 */}
        <section aria-labelledby="paths-title">
          <h2 id="paths-title" className="text-title-2">
            按角色学习
          </h2>
          <p className="mt-2 text-body text-label-secondary">不同角色关注的深度与指标不同，从最适合你的一条路径开始。</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ROLE_LEARNING_PATHS.map((path) => {
              const isSelected = selectedRolePathId === path.id;
              return (
                <button
                  key={path.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedRolePathId(isSelected ? null : path.id);
                    openLessonById(path.featuredLessonIds[0]);
                  }}
                  className={`card interactive group flex flex-col items-start ${
                    isSelected ? 'shadow-[inset_0_0_0_2px_var(--color-accent)]' : ''
                  }`}
                >
                  <span className="text-caption text-label-secondary">
                    {path.targetRole.split('（')[0].split('、')[0]} · {path.durationText}
                  </span>
                  <h3 className="mt-2 text-title-3">{path.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-body text-label-secondary">{path.description}</p>
                  <span className="link mt-5 text-body">
                    开始学习
                    <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 课程 */}
        <section aria-labelledby="course-title" className="mt-[clamp(4rem,2.5rem+4vw,6rem)]">
          <div className="flex justify-center">
            <SegmentedControl
              ariaLabel="选择课程"
              size="lg"
              value={activeCourseId}
              onChange={setActiveCourseId}
              options={COURSES.map((course) => ({
                id: course.id,
                label: `${course.code} · ${splitTitle(course.title).short}`,
              }))}
            />
          </div>

          <div className="tile mt-8 animate-fade-in" key={currentCourse.id}>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-caption text-label-secondary">
                  课程 {currentCourse.code} · {currentTitle.short} · 攻克「{currentCourse.frictionPoint}」
                </p>
                <h2 id="course-title" className="mt-2 text-title-1">
                  {currentTitle.tagline}
                </h2>
                <p className="mt-4 text-body text-label-secondary">{currentCourse.subtitle}</p>
                <p className="mt-2 text-caption text-label-secondary">主案例：{currentCourse.heroCase}</p>
              </div>

              <div className="w-full shrink-0 lg:w-64">
                <div className="flex items-baseline justify-between">
                  <span className="text-caption text-label-secondary">课程进度</span>
                  <span className="text-body font-semibold tabular-nums">{currentProgress}%</span>
                </div>
                <div className="meter mt-2">
                  <span className="bg-success" style={{ width: `${currentProgress}%` }} />
                </div>
                <button
                  type="button"
                  onClick={() => onGoToTool(currentCourse.relatedTool.id)}
                  className="btn btn-secondary btn-block mt-5 whitespace-normal"
                >
                  配套工具：{currentCourse.relatedTool.name}
                </button>
              </div>
            </div>

            <blockquote className="mt-8 border-l-2 border-separator-strong pl-4 text-body text-label-secondary">
              <span className="font-semibold text-label">决策者视点　</span>
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
                          {mod.description} · {mod.lessons.length} 课时
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
                                <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-label="已学完" />
                              ) : (
                                <PlayCircle className="h-6 w-6 shrink-0 text-label-secondary" aria-label="未学" />
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
                                {lesson.durationMinutes} 分钟
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
