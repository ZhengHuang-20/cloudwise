import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  PlayCircle,
  FileCheck,
  Award,
  ChevronDown,
  ChevronRight,
  Users
} from 'lucide-react';
import { COURSES, Course, Lesson, ROLE_LEARNING_PATHS } from '../data/coursesData';
import { useApp } from '../context/AppContext';
import { LessonModal } from '../components/LessonModal';

interface AcademyViewProps {
  onGoToTool: (toolId: string) => void;
  onGoToBooking: () => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({ onGoToTool, onGoToBooking }) => {
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

  const toggleModule = (modIdx: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modIdx]: !prev[modIdx],
    }));
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#f5f5f7]">
      {/* Academy Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="apple-eyebrow">GLOBAL ACQUISITION ACADEMY</span>
        <h1 className="apple-section-title">
          出海认知实战学院 · 五门专业课全量开放
        </h1>
        <p className="text-sm sm:text-base text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          凡是涉及海外采购标准的工程细节，全量公开说透。<br />
          买家在站内自主学懂，销售在见面前无需进行低效基础说服。
        </p>

        {/* Global Progress Bar - Apple minimal metric badge */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] px-4 py-1.5 rounded-full text-xs">
            <Award className="w-3.5 h-3.5 text-[#30d158]" />
            <span className="text-[#a1a1a6]">认知重塑与学分已累计：</span>
            <span className="font-mono font-medium text-white">{totalCompletedLessons} / 161 课时</span>
          </div>
        </div>
      </div>

      {/* Role-based Learning Paths */}
      <div className="mb-14 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">按出海角色定制的快捷路径</h2>
            <p className="text-xs text-[#86868b]">不同身份角色关注不同深度与交付指标</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLE_LEARNING_PATHS.map((path) => {
            const isSelected = selectedRolePathId === path.id;
            return (
              <div
                key={path.id}
                onClick={() => {
                  setSelectedRolePathId(isSelected ? null : path.id);
                  const targetLessonId = path.featuredLessonIds[0];
                  for (const c of COURSES) {
                    for (const m of c.modules) {
                      const found = m.lessons.find((l) => l.id === targetLessonId);
                      if (found) {
                        setActiveCourseId(c.id);
                        setActiveLesson(found);
                        return;
                      }
                    }
                  }
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white/[0.08] border-[#2997ff] shadow-xl'
                    : 'apple-glass-card'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#2997ff] font-medium">{path.durationText}</span>
                    <span className="text-[11px] text-[#86868b]">{path.targetRole.split('（')[0]}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white tracking-tight">{path.title}</h3>
                  <p className="text-xs text-[#a1a1a6] leading-relaxed line-clamp-3 font-normal">
                    {path.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#2997ff] font-medium">
                  <span>开始学习</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 Courses Tabs - Apple Segmented Control */}
      <div className="mb-10 flex justify-center">
        <div className="flex items-center gap-1.5 p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full overflow-x-auto no-scrollbar max-w-full">
          {COURSES.map((course) => {
            const isActive = activeCourseId === course.id;
            const progress = getCourseProgressPercentage(course.id);
            return (
              <button
                key={course.id}
                onClick={() => setActiveCourseId(course.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm backdrop-blur-md'
                    : 'text-[#86868b] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="font-mono font-bold text-[11px] opacity-75">{course.code}</span>
                <span>{course.title.split('——')[0]}</span>
                <span className="font-mono text-[10px] text-[#2997ff]">{progress}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Overview Banner */}
      <div className="apple-glass rounded-3xl p-8 mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#86868b]">
              <span className="font-mono text-[#2997ff] font-medium">课程 {currentCourse.code}</span>
              <span>·</span>
              <span>攻克断点：{currentCourse.frictionPoint}</span>
              <span>·</span>
              <span>主案例：{currentCourse.heroCase}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentCourse.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1a6] max-w-2xl font-normal leading-relaxed">
              {currentCourse.subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onGoToTool(currentCourse.relatedTool.id)}
              className="apple-secondary-btn px-5 py-2.5 text-xs flex items-center gap-1.5"
            >
              <span>配套工具：{currentCourse.relatedTool.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] text-xs text-[#a1a1a6] leading-relaxed">
          <span className="font-semibold text-white mr-1.5">决策者视点：</span>
          {currentCourse.executiveModuleSummary}
        </div>
      </div>

      {/* Syllabus Modules & Lessons List */}
      <div className="space-y-4">
        {currentCourse.modules.map((mod) => {
          const isExpanded = Boolean(expandedModules[mod.index]);
          return (
            <div key={mod.index} className="apple-glass rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleModule(mod.index)}
                className="px-6 py-4.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors"
              >
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                    <span>{mod.name}</span>
                    <span className="text-xs text-[#86868b] font-normal">({mod.lessons.length} 课时)</span>
                  </h3>
                  <p className="text-xs text-[#86868b] mt-0.5">{mod.description}</p>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-[#86868b]" /> : <ChevronRight className="w-4 h-4 text-[#86868b]" />}
              </div>

              {isExpanded && (
                <div className="p-4 space-y-2">
                  {mod.lessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleOpenLesson(lesson)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                          completed
                            ? 'bg-white/[0.01] border-white/[0.04] text-[#86868b]'
                            : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 text-[#f5f5f7]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              completed
                                ? 'bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30'
                                : 'bg-white/[0.06] text-[#2997ff]'
                            }`}
                          >
                            {completed ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight">
                              <span>{lesson.title}</span>
                              <span className="text-[11px] text-[#86868b] font-mono font-normal">
                                · {lesson.durationMinutes} 分钟
                              </span>
                            </div>
                            <p className="text-xs text-[#86868b] truncate max-w-lg mt-0.5 font-normal">
                              {lesson.summary}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-[#2997ff] font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
                          <span className="hidden sm:inline">学习</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lesson Modal View */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          course={currentCourse}
          onClose={() => setActiveLesson(null)}
          onNavigateToNextLesson={(nextLessonId) => {
            for (const c of COURSES) {
              for (const m of c.modules) {
                const found = m.lessons.find((l) => l.id === nextLessonId);
                if (found) {
                  setActiveCourseId(c.id);
                  setActiveLesson(found);
                  return;
                }
              }
            }
          }}
          onNavigateToTool={(toolId) => {
            setActiveLesson(null);
            onGoToTool(toolId);
          }}
        />
      )}
    </div>
  );
};
