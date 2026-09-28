import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  ArrowRight,
  BookOpen,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Lesson, Course } from '../data/coursesData';
import { useApp } from '../context/AppContext';
import { NotebookLmPlayer } from './NotebookLmPlayer';

interface LessonModalProps {
  lesson: Lesson;
  course: Course;
  onClose: () => void;
  onNavigateToNextLesson?: (nextLessonId: string) => void;
  onNavigateToTool?: (toolId: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  course,
  onClose,
  onNavigateToNextLesson,
  onNavigateToTool,
}) => {
  const { markLessonComplete, isLessonCompleted, showToast } = useApp();
  const completed = isLessonCompleted(lesson.id);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [exerciseInput, setExerciseInput] = useState('');
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);

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

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseInput.trim()) return;
    setExerciseSubmitted(true);
    showToast('练习已保存！可直接在随后的体检工具中自动带入此项数据。');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="apple-glass rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#f5f5f7] border border-white/[0.12]">
        {/* Header */}
        <div className="px-8 py-5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white/[0.08] text-[#2997ff] border border-white/[0.1] flex items-center justify-center font-mono font-bold text-xs">
              {course.code}
            </span>
            <div>
              <div className="text-xs text-[#86868b] flex items-center gap-2">
                <span>{course.title.split('——')[0]}</span>
                <span>·</span>
                <span>课时 {lesson.title.split(' ')[0]}</span>
                <span>·</span>
                <span className="font-mono">{lesson.durationMinutes} 分钟</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{lesson.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {completed ? (
              <span className="flex items-center gap-1.5 text-xs text-[#30d158] font-medium bg-[#30d158]/10 px-3 py-1 rounded-full border border-[#30d158]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>已完成</span>
              </span>
            ) : (
              <button
                onClick={handleManualComplete}
                className="apple-blue-btn px-4 py-1.5 text-xs font-semibold"
              >
                <span>标记学完</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#86868b] hover:text-white rounded-full hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* 一句话直答 (Executive Answer) */}
          <div className="p-5 bg-white/[0.03] border-l-2 border-[#2997ff] rounded-r-2xl space-y-1">
            <div className="text-xs font-mono text-[#2997ff] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>一句话答案 (Executive Summary)</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
              {lesson.summary}
            </p>
          </div>

          {/* NotebookLM Audio Podcast & Video Player */}
          <NotebookLmPlayer podcast={lesson.notebookLmPodcast} lessonTitle={lesson.title} />

          {/* Concept Content */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2997ff]" />
              <span>深度概念拆解</span>
            </h3>
            <div className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed space-y-3 whitespace-pre-wrap p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] font-normal">
              {lesson.conceptContent}
            </div>
          </div>

          {/* Case Snippet if present */}
          {lesson.caseSnippet && (
            <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
              <span className="text-xs font-mono text-[#2997ff] block">
                实战案例 · {lesson.caseSnippet.company}
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight">{lesson.caseSnippet.title}</h4>
              <p className="text-xs text-[#a1a1a6] leading-relaxed">{lesson.caseSnippet.description}</p>
            </div>
          )}

          {/* Common Misconceptions */}
          {lesson.misconceptions && lesson.misconceptions.length > 0 && (
            <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2.5">
              <span className="text-xs font-mono text-[#ffd60a] block">
                行业常见误区排雷
              </span>
              <ul className="space-y-1.5 text-xs text-[#a1a1a6]">
                {lesson.misconceptions.map((mis, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#ffd60a] font-bold">✕</span>
                    <span>{mis}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Executive Takeaway */}
          <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-1.5">
            <span className="text-xs font-mono text-[#30d158] block">
              决策者要点 (老板视角)
            </span>
            <p className="text-xs sm:text-sm text-[#f5f5f7] leading-relaxed font-medium">
              {lesson.executiveTakeaway}
            </p>
          </div>

          {/* Self-check Quiz */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#2997ff] block">
                  课后理解自测 (计入学习档案)
                </span>
                {submittedQuiz && (
                  <span className="text-xs text-[#30d158] font-medium font-mono">已完成测试</span>
                )}
              </div>

              {lesson.quiz.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      let optionClasses = 'bg-white/[0.03] border-white/[0.06] text-[#a1a1a6] hover:border-white/20';

                      if (submittedQuiz) {
                        if (isCorrect) {
                          optionClasses = 'bg-[#30d158]/15 border-[#30d158]/40 text-white font-medium';
                        } else if (isSelected && !isCorrect) {
                          optionClasses = 'bg-[#ff453a]/15 border-[#ff453a]/40 text-white';
                        }
                      } else if (isSelected) {
                        optionClasses = 'bg-white/15 border-white/30 text-white font-medium';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionClasses}`}
                        >
                          <span>{opt}</span>
                          {submittedQuiz && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#30d158]" />}
                        </button>
                      );
                    })}
                  </div>

                  {submittedQuiz && (
                    <div className="p-3 bg-white/[0.03] rounded-xl text-xs text-[#a1a1a6] border border-white/[0.06]">
                      <span className="font-semibold text-white mr-1.5">解析:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {!submittedQuiz && (
                <button
                  onClick={handleSubmitQuiz}
                  className="apple-blue-btn w-full py-3 text-xs font-semibold"
                >
                  提交自测并保存成绩
                </button>
              )}
            </div>
          )}

          {/* Next Step */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-[#86868b]">学完了？继续下一步：</span>
            <button
              onClick={() => {
                onClose();
                if (lesson.nextStep.actionType === 'lesson' && onNavigateToNextLesson) {
                  onNavigateToNextLesson(lesson.nextStep.targetId);
                } else if (onNavigateToTool) {
                  onNavigateToTool(lesson.nextStep.targetId);
                }
              }}
              className="apple-blue-btn px-6 py-2.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>{lesson.nextStep.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
