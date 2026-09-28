import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 凭据只从构建时环境变量读取（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY），页面上不提供配置入口
const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key && !url.includes('your-project-id') && !url.includes('xyzcompany')),
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.warn('Supabase initialization failed:', e);
      return null;
    }
  }
  return supabaseInstance;
};

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
