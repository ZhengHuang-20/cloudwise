import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Lesson, Course } from '../data/coursesData';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { LessonArticle } from './LessonArticle';
import { Dialog, DialogBody } from './ui/Dialog';

interface LessonModalProps {
  lesson: Lesson;
  course: Course;
  onClose: () => void;
  /** 从学习路径打开时，路径中的下一课（没有则不传） */
  nextInPath?: { title: string; onNext: () => void };
  onNavigateToNextLesson?: (nextLessonId: string) => void;
  onNavigateToTool?: (toolId: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  course,
  onClose,
  nextInPath,
  onNavigateToNextLesson,
  onNavigateToTool,
}) => {
  const { markLessonComplete, isLessonCompleted } = useApp();
  const { t } = useLang();
  const completed = isLessonCompleted(lesson.id);

  const handleManualComplete = () => {
    markLessonComplete(course.id, lesson.id, 100);
  };

  // 英文界面下中文的课程编号标题（如「GEO——…」）只取前半段
  const courseShortTitle = course.title.split('——')[0];

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={lesson.title}
      description={`${t('课程', 'Course')} ${course.code} · ${courseShortTitle} · ${lesson.durationMinutes} ${t('分钟', 'min')}`}
      actions={
        completed ? (
          <span className="badge hidden bg-success/15 text-success sm:inline-flex">
            <CheckCircle2 className="h-4 w-4" />
            {t('已学完', 'Completed')}
          </span>
        ) : (
          <button type="button" onClick={handleManualComplete} className="btn btn-neutral btn-sm hidden sm:inline-flex">
            {t('标记学完', 'Mark as completed')}
          </button>
        )
      }
    >
      <DialogBody>
        <article className="mx-auto max-w-2xl">
          <LessonArticle lesson={lesson} course={course} />

          {/* 下一步 */}
          <div className="mt-12 flex flex-col gap-4 border-t border-separator pt-8 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 text-body text-label-secondary">
              {nextInPath ? (
                <>
                  {t('路径下一课：', 'Next lesson on this path: ')}
                  <span className="text-label">{nextInPath.title}</span>
                </>
              ) : (
                t('学完了？继续下一步', 'Finished? Continue to the next step')
              )}
            </span>
            <div className="flex flex-col gap-3 sm:shrink-0 sm:flex-row">
              {nextInPath && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    nextInPath.onNext();
                  }}
                  className="btn btn-primary"
                >
                  {t('下一课', 'Next lesson')}
                </button>
              )}
              {/* 路径模式下，「进入某一课」已由「下一课」代替 */}
              {!(nextInPath && lesson.nextStep.actionType === 'lesson') && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (lesson.nextStep.actionType === 'lesson' && onNavigateToNextLesson) {
                      onNavigateToNextLesson(lesson.nextStep.targetId);
                    } else if (onNavigateToTool) {
                      onNavigateToTool(lesson.nextStep.targetId);
                    }
                  }}
                  className={`btn ${nextInPath ? 'btn-neutral' : 'btn-primary'}`}
                >
                  {lesson.nextStep.label}
                </button>
              )}
            </div>
          </div>

          {!completed && (
            <button type="button" onClick={handleManualComplete} className="btn btn-neutral btn-block mt-4 sm:hidden">
              {t('标记学完', 'Mark as completed')}
            </button>
          )}
        </article>
      </DialogBody>
    </Dialog>
  );
};
