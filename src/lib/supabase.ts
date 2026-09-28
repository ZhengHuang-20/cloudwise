import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment or user-configured localStorage
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('cw_supabase_url') || '' : '';
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem('cw_supabase_key') || '' : '';

  const url = savedUrl || envUrl;
  const key = savedKey || envKey;

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

export const updateSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('cw_supabase_url', url);
  localStorage.setItem('cw_supabase_key', key);
  try {
    supabaseInstance = createClient(url, key);
    return true;
  } catch (err) {
    console.error('Failed to update Supabase credentials:', err);
    return false;
  }
};

export const getSupabaseStatus = () => {
  return getSupabaseConfig();
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
