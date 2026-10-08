import React, { useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { Lesson, Course } from '../data/coursesData';
import { useApp } from '../context/AppContext';
import { LessonVideo } from './LessonVideo';
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
  const completed = isLessonCompleted(lesson.id);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    setSubmittedQuiz(true);
    let correctCount = 0;
    lesson.quiz?.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    const score = lesson.quiz && lesson.quiz.length > 0
      ? Math.round((correctCount / lesson.quiz.length) * 100)
      : 100;

    markLessonComplete(course.id, lesson.id, score);
  };

  const handleManualComplete = () => {
    markLessonComplete(course.id, lesson.id, 100);
  };

  const quizAnsweredAll = lesson.quiz ? lesson.quiz.every((_, idx) => selectedAnswers[idx] !== undefined) : true;

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={lesson.title}
      description={`课程 ${course.code} · ${course.title.split('——')[0]} · ${lesson.durationMinutes} 分钟`}
      actions={
        completed ? (
          <span className="badge hidden bg-success/15 text-success sm:inline-flex">
            <CheckCircle2 className="h-4 w-4" />
            已学完
          </span>
        ) : (
          <button type="button" onClick={handleManualComplete} className="btn btn-neutral btn-sm hidden sm:inline-flex">
            标记学完
          </button>
        )
      }
    >
      <DialogBody>
        <article className="mx-auto max-w-2xl">
          {/* 一句话答案 */}
          <p className="text-caption text-label-secondary">一句话答案</p>
          <p className="mt-2 text-intro font-semibold">{lesson.summary}</p>

          <div className="mt-8">
            <LessonVideo src={lesson.videoUrl} title={lesson.title} />
          </div>

          <section className="mt-10">
            <h3 className="text-title-3">深度拆解</h3>
            <div className="mt-3 whitespace-pre-wrap text-body text-label-secondary">{lesson.conceptContent}</div>
          </section>

          {lesson.caseSnippet && (
            <section className="well mt-8">
              <p className="text-caption text-label-secondary">实战案例 · {lesson.caseSnippet.company}</p>
              <h3 className="mt-1 text-title-3">{lesson.caseSnippet.title}</h3>
              <p className="mt-2 text-body text-label-secondary">{lesson.caseSnippet.description}</p>
            </section>
          )}

          {lesson.misconceptions && lesson.misconceptions.length > 0 && (
            <section className="mt-10">
              <h3 className="text-title-3">常见误区</h3>
              <ul className="mt-3 space-y-3">
                {lesson.misconceptions.map((mis) => (
                  <li key={mis} className="flex gap-3 text-body">
                    <X className="mt-1 h-5 w-5 shrink-0 text-warning" />
                    <span className="text-label-secondary">{mis}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="well mt-10">
            <p className="text-caption text-label-secondary">决策者要点</p>
            <p className="mt-1 text-body font-semibold">{lesson.executiveTakeaway}</p>
          </section>

          {lesson.quiz && lesson.quiz.length > 0 && (
            <section className="mt-12 border-t border-separator pt-10" aria-labelledby="quiz-title">
              <div className="flex items-baseline justify-between gap-4">
                <h3 id="quiz-title" className="text-title-3">
                  课后自测
                </h3>
                <span className="text-caption text-label-secondary">
                  {submittedQuiz ? '已完成，成绩已记入学习档案' : '成绩将记入学习档案'}
                </span>
              </div>

              <div className="mt-6 space-y-10">
                {lesson.quiz.map((q, qIdx) => (
                  <fieldset key={qIdx}>
                    <legend className="text-body font-semibold">
                      {qIdx + 1}. {q.question}
                    </legend>
                    <div role="radiogroup" aria-label={q.question} className="mt-4 space-y-3">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx;
                        const isCorrect = optIdx === q.correctIndex;
                        let stateClass = '';
                        if (submittedQuiz && isCorrect) {
                          stateClass = 'border-success shadow-[inset_0_0_0_1px_var(--color-success)]';
                        } else if (submittedQuiz && isSelected) {
                          stateClass = 'border-danger shadow-[inset_0_0_0_1px_var(--color-danger)]';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            role="radio"
                            aria-checked={!submittedQuiz && isSelected}
                            aria-disabled={submittedQuiz}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`choice ${stateClass}`}
                          >
                            <span>{opt}</span>
                            {submittedQuiz && isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-label="正确答案" />}
                            {submittedQuiz && isSelected && !isCorrect && (
                              <XCircle className="h-5 w-5 shrink-0 text-danger" aria-label="您的选择" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {submittedQuiz && (
                      <p className="mt-3 text-caption text-label-secondary">
                        <span className="font-semibold text-label">解析　</span>
                        {q.explanation}
                      </p>
                    )}
                  </fieldset>
                ))}
              </div>

              {!submittedQuiz && (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={!quizAnsweredAll}
                  className="btn btn-primary btn-block mt-8"
                >
                  提交自测
                </button>
              )}
            </section>
          )}

          {/* 下一步 */}
          <div className="mt-12 flex flex-col gap-4 border-t border-separator pt-8 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 text-body text-label-secondary">
              {nextInPath ? (
                <>
                  路径下一课：<span className="text-label">{nextInPath.title}</span>
                </>
              ) : (
                '学完了？继续下一步'
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
                  下一课
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
              标记学完
            </button>
          )}
        </article>
      </DialogBody>
    </Dialog>
  );
};
