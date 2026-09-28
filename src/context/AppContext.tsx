import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  LessonProgress,
  DiagnosisRecord,
  SavedProposal,
  getSupabase,
  getSupabaseStatus,
  updateSupabaseCredentials,
} from '../lib/supabase';
import { COURSES } from '../data/coursesData';

interface LeadActivity {
  id: string;
  action: string;
  scoreDelta: number;
  timestamp: string;
  meta?: any;
}

interface AppContextType {
  // User & Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (phoneOrEmail: string, name?: string, company?: string, role?: any) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Supabase Status
  supabaseStatus: { url: string; key: string; isConfigured: boolean };
  saveSupabaseConfig: (url: string, key: string) => boolean;

  // Learning Progress
  learningProgress: Record<string, LessonProgress>;
  markLessonComplete: (courseId: string, lessonId: string, quizScore?: number, exerciseData?: any) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getCourseProgressPercentage: (courseId: string) => number;
  totalCompletedLessons: number;
  completedQuizzesCount: number;

  // Diagnosis Records
  diagnoses: DiagnosisRecord[];
  saveDiagnosis: (toolType: DiagnosisRecord['toolType'], toolName: string, score: number, summary: string, details: any) => DiagnosisRecord;
  latestDiagnosis: DiagnosisRecord | null;

  // Saved Proposals & Deal Room
  savedProposals: SavedProposal[];
  saveProposalDraft: (title: string, services: string[], budgetRange: string, timeline: string, details: any) => SavedProposal;
  activeProposal: SavedProposal | null;
  setActiveProposal: (p: SavedProposal | null) => void;

  // Pre-sales Leads & Activity (MQL / SQL)
  leadActivities: LeadActivity[];
  logLeadActivity: (action: string, scoreDelta: number, meta?: any) => void;
  leadScore: number;
  currentStage: '陌生访客' | '已识别' | '已诊断' | 'MQL' | 'SQL' | '商机' | '签约与交接';

  // Global AI Advisor Drawer / Modal
  isAiAdvisorOpen: boolean;
  setAiAdvisorOpen: (open: boolean) => void;
  isInspectorMode: boolean;
  setIsInspectorMode: (inspect: boolean) => void;
  aiAdvisorInitialQuery: string;
  triggerAiAdvisorWithQuery: (query: string) => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  USER: 'cw_user_profile',
  PROGRESS: 'cw_learning_progress',
  DIAGNOSES: 'cw_diagnosis_records',
  PROPOSALS: 'cw_saved_proposals',
  ACTIVITIES: 'cw_lead_activities',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return null; }
    }
    // Default guest profile for seamless exploration
    return {
      id: 'guest-user-1',
      email: 'demo@cloudwisdom.com',
      phone: '13800138000',
      name: '出海企业探索者',
      companyName: '某外贸智造集团',
      industry: '高端工业装备 / 医疗器械',
      role: '决策者',
      createdAt: new Date().toISOString(),
    };
  });

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(getSupabaseStatus());

  // Learning Progress state
  const [learningProgress, setLearningProgress] = useState<Record<string, LessonProgress>>(() => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRESS);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return {}; }
    }
    // Initial sample progress so the learner immediately sees tracking
    return {
      'lesson-a-1-1': {
        courseId: 'course-a-global-site',
        lessonId: 'lesson-a-1-1',
        completed: true,
        completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        quizScore: 100,
      },
    };
  });

  // Diagnoses state
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DIAGNOSES);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return []; }
    }
    return [
      {
        id: 'diag-demo-1',
        toolType: 'five_frictions',
        toolName: '出海五断点自评',
        score: 62,
        summary: '在“看不见”与“不被信”断点存在显著薄弱项，建议首选 SEO + GEO 获客组合。',
        date: new Date(Date.now() - 3600000 * 48).toLocaleDateString(),
        details: {
          scores: { invisible: 35, unreadable: 60, untrusted: 45, missed: 75, disconnected: 80 }
        }
      }
    ];
  });

  // Proposals state
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PROPOSALS);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return []; }
    }
    return [
      {
        id: 'prop-sample-01',
        title: '某医疗智造企业 · 获客增长与 GEO 专项方案',
        date: new Date().toLocaleDateString(),
        services: ['海外独立站建站', '出海 GEO 优化', '外贸 SEO 优化'],
        budgetRange: '26.0 ~ 38.0 万元',
        timeline: '10 ~ 12 周',
        shareId: 'ak-med-draft-2026',
        details: {
          packageType: 'package-acquisition',
          deliverables: ['三读者高转化独立站', '60组核心词库', '爱康同款91项技术内容规划', '月度AI探针监测']
        }
      }
    ];
  });

  const [activeProposal, setActiveProposal] = useState<SavedProposal | null>(savedProposals[0] || null);

  // Lead Activities & Scoring
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVITIES);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return []; }
    }
    return [
      { id: 'act-1', action: '完成课时：1.1 独立站与电子画册区别', scoreDelta: 1, timestamp: '1天前' },
      { id: 'act-2', action: '完成五断点自评诊断', scoreDelta: 10, timestamp: '2天前' },
      { id: 'act-3', action: '配置获客组合预算草案', scoreDelta: 15, timestamp: '今天' }
    ];
  });

  // AI Advisor & UI state
  const [isAiAdvisorOpen, setAiAdvisorOpen] = useState(false);
  const [isInspectorMode, setIsInspectorMode] = useState(false);
  const [aiAdvisorInitialQuery, setAiAdvisorInitialQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, JSON.stringify(learningProgress));
  }, [learningProgress]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DIAGNOSES, JSON.stringify(diagnoses));
  }, [diagnoses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROPOSALS, JSON.stringify(savedProposals));
  }, [savedProposals]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVITIES, JSON.stringify(leadActivities));
  }, [leadActivities]);

  // Lead Scoring & Stage Calculation
  const leadScore = leadActivities.reduce((acc, cur) => acc + cur.scoreDelta, 25); // base 25 profile score

  const currentStage: AppContextType['currentStage'] = (() => {
    if (savedProposals.length > 0 && diagnoses.length > 0 && leadScore >= 60) return '商机';
    if (leadScore >= 45) return 'SQL';
    if (leadScore >= 30) return 'MQL';
    if (diagnoses.length > 0) return '已诊断';
    if (user && user.email) return '已识别';
    return '陌生访客';
  })();

  const logLeadActivity = (action: string, scoreDelta: number, meta?: any) => {
    const newAct: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      scoreDelta,
      timestamp: '刚刚',
      meta,
    };
    setLeadActivities((prev) => [newAct, ...prev]);

    // Async sync to Supabase if configured
    const client = getSupabase();
    if (client && user) {
      client.from('leads').insert({
        user_id: user.id,
        company_name: user.companyName,
        contact_name: user.name,
        contact_phone: user.phone,
        mql_score: leadScore + scoreDelta,
        stage: currentStage,
        crm_card: { action, meta },
      }).then(() => {}, (err: any) => console.warn('Supabase lead sync notice:', err));
    }
  };

  const login = async (phoneOrEmail: string, name?: string, company?: string, role?: any): Promise<boolean> => {
    const client = getSupabase();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: phoneOrEmail.includes('@') ? phoneOrEmail : `${phoneOrEmail}@example.com`,
      phone: phoneOrEmail.includes('@') ? '13900000000' : phoneOrEmail,
      name: name || (phoneOrEmail.includes('@') ? phoneOrEmail.split('@')[0] : `用户${phoneOrEmail.slice(-4)}`),
      companyName: company || '出海企业',
      industry: '智能制造 / 出海贸易',
      role: role || '业务负责人',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    logLeadActivity(`用户登录/注册成功: ${newUser.name}`, 10);
    showToast(`欢迎回来，${newUser.name}！已为您载入专属学习与体检空间。`);

    // If Supabase is connected, sync user profile
    if (client) {
      try {
        await client.from('profiles').upsert({
          id: newUser.id,
          email: newUser.email,
          phone: newUser.phone,
          full_name: newUser.name,
          company_name: newUser.companyName,
          industry: newUser.industry,
          role: newUser.role,
        });
      } catch (err) {
        console.warn('Supabase profile sync notice:', err);
      }
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    showToast('您已安全退出登录。');
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...data });
    showToast('个人档案与企业信息已更新');
  };

  const saveSupabaseConfig = (url: string, key: string) => {
    const ok = updateSupabaseCredentials(url, key);
    if (ok) {
      setSupabaseStatus(getSupabaseStatus());
      showToast('Supabase 云数据库连接成功！数据已开启远程多端同步。');
    } else {
      showToast('Supabase 配置参数格式有误，请检查 URL 与 Key。');
    }
    return ok;
  };

  const markLessonComplete = (courseId: string, lessonId: string, quizScore = 100, exerciseData?: any) => {
    setLearningProgress((prev) => {
      const updated = {
        ...prev,
        [lessonId]: {
          courseId,
          lessonId,
          completed: true,
          completedAt: new Date().toISOString(),
          quizScore,
          exerciseData,
        },
      };
      return updated;
    });

    logLeadActivity(`学完课时: ${lessonId}`, 3, { courseId, quizScore });
    showToast('🎉 本课时已学完！学习进度已实时更新到您的出海档案。');

    // Async sync to Supabase
    const client = getSupabase();
    if (client && user) {
      client.from('course_progress').upsert({
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        completed: true,
        quiz_score: quizScore,
        exercise_data: exerciseData,
      }).then(() => {}, (err: any) => console.warn('Supabase course progress sync:', err));
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return Boolean(learningProgress[lessonId]?.completed);
  };

  const getCourseProgressPercentage = (courseId: string) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return 0;
    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    if (allLessonIds.length === 0) return 0;
    const completed = allLessonIds.filter((id) => Boolean(learningProgress[id]?.completed)).length;
    return Math.round((completed / allLessonIds.length) * 100);
  };

  const totalCompletedLessons = Object.values(learningProgress).filter((p) => p.completed).length;
  const completedQuizzesCount = Object.values(learningProgress).filter((p) => p.quizScore !== undefined).length;

  const saveDiagnosis = (
    toolType: DiagnosisRecord['toolType'],
    toolName: string,
    score: number,
    summary: string,
    details: any
  ): DiagnosisRecord => {
    const newRecord: DiagnosisRecord = {
      id: `diag-${Date.now()}`,
      toolType,
      toolName,
      score,
      summary,
      date: new Date().toLocaleDateString(),
      details,
    };

    setDiagnoses((prev) => [newRecord, ...prev]);
    logLeadActivity(`完成诊断测试: ${toolName}`, 15, { score });
    showToast(`体检完成！已为您生成诊断书（得分 ${score} 分），已自动存入“我的空间”。`);

    // Async Supabase sync
    const client = getSupabase();
    if (client && user) {
      client.from('diagnosis_records').insert({
        user_id: user.id,
        tool_type: toolType,
        tool_name: toolName,
        score,
        summary,
        details,
      }).then(() => {}, (e: any) => console.warn('Supabase diagnosis sync:', e));
    }

    return newRecord;
  };

  const latestDiagnosis = diagnoses[0] || null;

  const saveProposalDraft = (
    title: string,
    services: string[],
    budgetRange: string,
    timeline: string,
    details: any
  ): SavedProposal => {
    const newProposal: SavedProposal = {
      id: `prop-${Date.now()}`,
      title,
      date: new Date().toLocaleDateString(),
      services,
      budgetRange,
      timeline,
      shareId: `share-${Math.random().toString(36).substring(2, 8)}`,
      details,
    };

    setSavedProposals((prev) => [newProposal, ...prev]);
    setActiveProposal(newProposal);
    logLeadActivity(`保存方案配置草案: ${title}`, 20, { budgetRange });
    showToast('方案配置已保存！专属商机空间 (Deal Room) 已激活。');

    // Async Supabase sync
    const client = getSupabase();
    if (client && user) {
      client.from('saved_proposals').insert({
        user_id: user.id,
        title,
        services,
        budget_range: budgetRange,
        timeline,
        details,
      }).then(() => {}, (e: any) => console.warn('Supabase proposal sync:', e));
    }

    return newProposal;
  };

  const triggerAiAdvisorWithQuery = (query: string) => {
    setAiAdvisorInitialQuery(query);
    setAiAdvisorOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateUserProfile,
        isAuthModalOpen,
        setAuthModalOpen,
        supabaseStatus,
        saveSupabaseConfig,
        learningProgress,
        markLessonComplete,
        isLessonCompleted,
        getCourseProgressPercentage,
        totalCompletedLessons,
        completedQuizzesCount,
        diagnoses,
        saveDiagnosis,
        latestDiagnosis,
        savedProposals,
        saveProposalDraft,
        activeProposal,
        setActiveProposal,
        leadActivities,
        logLeadActivity,
        leadScore,
        currentStage,
        isAiAdvisorOpen,
        setAiAdvisorOpen,
        isInspectorMode,
        setIsInspectorMode,
        aiAdvisorInitialQuery,
        triggerAiAdvisorWithQuery,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
