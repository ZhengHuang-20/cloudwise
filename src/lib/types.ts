// 共享领域类型（AppContext 的本地状态，持久化在 localStorage）

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  name: string;
  companyName: string;
  industry: string;
  role: '决策者' | '业务负责人' | '技术负责人' | '执行人员' | '售前顾问';
  createdAt: string;
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
  quizScore?: number;
  exerciseData?: any;
}

export interface DiagnosisRecord {
  id: string;
  toolType: 'five_frictions' | 'ai_visibility' | 'website_health' | 'inquiry_flow' | 'loss_calc';
  toolName: string;
  score: number;
  summary: string;
  date: string;
  details: any;
}

export interface SavedProposal {
  id: string;
  title: string;
  date: string;
  services: string[];
  timeline: string;
  shareId: string;
  details: any;
}
