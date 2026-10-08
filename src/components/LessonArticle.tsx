import React, { useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { Course, Lesson } from '../data/coursesData';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { LessonVideo } from './LessonVideo';

/**
 * 一节课的正文：一句话答案、视频、深度拆解、案例、误区、决策者要点与课后自测。
 * 课程弹窗（LessonModal）与课时页（/academy/<课程>/<课时>）共用；弹窗里小节标题是 h3，课时页是 h2。
 */
export const LessonArticle: React.FC<{ lesson: Lesson; course: Course; headingLevel?: 'h2' | 'h3' }> = ({
  lesson,
  course,
  headingLevel = 'h3',
}) => {
  const { markLessonComplete } = useApp();
  const { t } = useLang();
  const H = headingLevel;

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

  const quizAnsweredAll = lesson.quiz ? lesson.quiz.every((_, idx) => selectedAnswers[idx] !== undefined) : true;

  return (
    <>
      {/* 一句话答案 */}
      <p className="text-caption text-label-secondary">{t('一句话答案', 'The short answer')}</p>
      <p className="mt-2 text-intro font-semibold">{lesson.summary}</p>

      <div className="mt-8">
        <LessonVideo src={lesson.videoUrl} title={lesson.title} />
      </div>

      <section className="mt-10">
        <H className="text-title-3">{t('深度拆解', 'In depth')}</H>
        <div className="mt-3 whitespace-pre-wrap text-body text-label-secondary">{lesson.conceptContent}</div>
      </section>

      {lesson.caseSnippet && (
        <section className="well mt-8">
          <p className="text-caption text-label-secondary">
            {t('实战案例 · ', 'Case in practice · ')}
            {lesson.caseSnippet.company}
          </p>
          <H className="mt-1 text-title-3">{lesson.caseSnippet.title}</H>
          <p className="mt-2 text-body text-label-secondary">{lesson.caseSnippet.description}</p>
        </section>
      )}

      {lesson.misconceptions && lesson.misconceptions.length > 0 && (
        <section className="mt-10">
          <H className="text-title-3">{t('常见误区', 'Common misconceptions')}</H>
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
        <p className="text-caption text-label-secondary">{t('决策者要点', 'Key takeaway for decision-makers')}</p>
        <p className="mt-1 text-body font-semibold">{lesson.executiveTakeaway}</p>
      </section>

      {lesson.quiz && lesson.quiz.length > 0 && (
        <section className="mt-12 border-t border-separator pt-10" aria-labelledby="quiz-title">
          <div className="flex items-baseline justify-between gap-4">
            <H id="quiz-title" className="text-title-3">
              {t('课后自测', 'Quick quiz')}
            </H>
            <span className="text-caption text-label-secondary">
              {submittedQuiz
                ? t('已完成，成绩已记入学习档案', 'Done. Your score has been saved to your learning record')
                : t('成绩将记入学习档案', 'Your score will be saved to your learning record')}
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
                        {submittedQuiz && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-label={t('正确答案', 'Correct answer')} />
                        )}
                        {submittedQuiz && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 shrink-0 text-danger" aria-label={t('您的选择', 'Your answer')} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {submittedQuiz && (
                  <p className="mt-3 text-caption text-label-secondary">
                    <span className="font-semibold text-label">{t('解析　', 'Explanation: ')}</span>
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
              {t('提交自测', 'Submit answers')}
            </button>
          )}
        </section>
      )}
    </>
  );
};
