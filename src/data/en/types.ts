/**
 * 课程的英文覆盖层（overlay）。结构与 src/data/coursesData.ts 中的中文数据一一对应，按 id 合并：
 * 课程、章节按 id / moduleIndex，课时按 lesson id，题目按下标（选项顺序与正确答案沿用中文数据）。
 */
export interface QuizEn {
  question: string;
  options: string[];
  explanation: string;
}

export interface LessonEn {
  title: string;
  summary: string;
  conceptContent: string;
  executiveTakeaway: string;
  misconceptions: string[];
  quiz?: QuizEn[];
  caseSnippet?: { company: string; title: string; description: string };
  nextStepLabel: string;
}

export interface CourseEn {
  title: string;
  subtitle: string;
  targetAudience: string;
  relatedService: string;
  heroCase: string;
  executiveModuleSummary: string;
  toolName?: string;
  modules: Record<number, { name: string; description: string }>;
  lessons: Record<string, LessonEn>;
}

export interface PathEn {
  title: string;
  targetRole: string;
  durationText: string;
  description: string;
  endGoal: string;
}
