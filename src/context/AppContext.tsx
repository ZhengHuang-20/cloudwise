import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useLang } from './LanguageContext';
import {
  UserProfile,
  LessonProgress,
  DiagnosisRecord,
  SavedProposal,
} from '../lib/types';
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
  saveProposalDraft: (title: string, services: string[], timeline: string, details: any) => SavedProposal;
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
  const { t } = useLang();
  // 页面在服务端渲染，首屏（含水合）一律用空状态；挂载后再从 localStorage 读取，
  // 没有存档时注入演示数据（访客档案、示例诊断与方案）。读取完成前不回写存储，避免空状态覆盖存档。
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [learningProgress, setLearningProgress] = useState<Record<string, LessonProgress>>({});
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
  const [activeProposal, setActiveProposal] = useState<SavedProposal | null>(null);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);

  useEffect(() => {
    const read = <T,>(key: string, demo: () => T): T => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored) as T;
      } catch {
        // 存储不可用或内容损坏时回退到演示数据
      }
      return demo();
    };

    setUser(
      read<UserProfile | null>(LOCAL_STORAGE_KEYS.USER, () => ({
        id: 'guest-user-1',
        email: 'demo@chingeo.com',
        phone: '13800138000',
        name: t('出海企业探索者', 'Export explorer'),
        companyName: t('某外贸智造集团', 'Sample trading group'),
        industry: t('高端工业装备 / 医疗器械', 'High-end industrial equipment / medical devices'),
        role: '决策者',
        createdAt: new Date().toISOString(),
      }))
    );

    // Initial sample progress so the learner immediately sees tracking
    setLearningProgress(
      read<Record<string, LessonProgress>>(LOCAL_STORAGE_KEYS.PROGRESS, () => ({
        'lesson-a-1-1': {
          courseId: 'course-a-global-site',
          lessonId: 'lesson-a-1-1',
          completed: true,
          completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          quizScore: 100,
        },
      }))
    );

    setDiagnoses(
      read<DiagnosisRecord[]>(LOCAL_STORAGE_KEYS.DIAGNOSES, () => [
        {
          id: 'diag-demo-1',
          toolType: 'ai_visibility',
          toolName: t('AI 可见性测评', 'AI visibility audit'),
          score: 62,
          summary: t('在“看不见”与“不被信”卡点存在显著薄弱项，建议首选 SEO + GEO 获客组合。', 'Clear weak points in the “invisible” and “not trusted” bottlenecks. Start with the SEO + GEO lead-generation package.'),
          date: new Date(Date.now() - 3600000 * 48).toLocaleDateString(),
          details: {},
        },
      ])
    );

    const proposals = read<SavedProposal[]>(LOCAL_STORAGE_KEYS.PROPOSALS, () => [
      {
        id: 'prop-sample-01',
        title: t('某医疗智造企业 · 获客增长与 GEO 专项方案', 'Sample medical manufacturer · lead growth and GEO project'),
        date: new Date().toLocaleDateString(),
        services: [t('海外独立站建站', 'Overseas websites'), t('出海 GEO 优化', 'Export GEO'), t('外贸 SEO 优化', 'Export SEO')],
        timeline: t('10 ~ 12 周', '10 ~ 12 weeks'),
        shareId: 'ak-med-draft-2026',
        details: {
          packageType: 'package-acquisition',
          deliverables: [t('三读者高转化独立站', 'Three-reader conversion website'), t('60组核心词库', '60 core keyword groups'), t('爱康同款91项技术内容规划', '91-item technical content plan, as used by Aikang Medical'), t('月度AI探针监测', 'Monthly AI probe monitoring')],
        },
      },
    ]);
    setSavedProposals(proposals);
    setActiveProposal(proposals[0] || null);

    setLeadActivities(
      read<LeadActivity[]>(LOCAL_STORAGE_KEYS.ACTIVITIES, () => [
        { id: 'act-1', action: t('完成课时：1.1 独立站与电子画册区别', 'Completed lesson 1.1: independent site vs e-brochure site'), scoreDelta: 1, timestamp: t('1天前', '1 day ago') },
        { id: 'act-2', action: t('完成 AI 可见性测评', 'Completed the AI visibility audit'), scoreDelta: 10, timestamp: t('2天前', '2 days ago') },
        { id: 'act-3', action: t('配置获客组合方案草案', 'Set up a lead-growth package draft'), scoreDelta: 15, timestamp: t('今天', 'Today') },
      ])
    );

    setHydrated(true);
    // 只在挂载时读取一次
  }, []);

  // AI Advisor & UI state
  const [isAiAdvisorOpen, setAiAdvisorOpen] = useState(false);
  const [isInspectorMode, setIsInspectorMode] = useState(false);
  const [aiAdvisorInitialQuery, setAiAdvisorInitialQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 新 Toast 会替换旧的并重新计时，避免旧计时器提前关掉新消息
  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to local storage（读取完成后才回写）
  const persist = (key: string, value: unknown) => {
    if (!hydrated) return;
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 存储已满或不可用时只影响本地记录
    }
  };

  useEffect(() => persist(LOCAL_STORAGE_KEYS.USER, user), [hydrated, user]);
  useEffect(() => persist(LOCAL_STORAGE_KEYS.PROGRESS, learningProgress), [hydrated, learningProgress]);
  useEffect(() => persist(LOCAL_STORAGE_KEYS.DIAGNOSES, diagnoses), [hydrated, diagnoses]);
  useEffect(() => persist(LOCAL_STORAGE_KEYS.PROPOSALS, savedProposals), [hydrated, savedProposals]);
  useEffect(() => persist(LOCAL_STORAGE_KEYS.ACTIVITIES, leadActivities), [hydrated, leadActivities]);

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
      timestamp: t('刚刚', 'Just now'),
      meta,
    };
    setLeadActivities((prev) => [newAct, ...prev]);
  };

  const login = async (phoneOrEmail: string, name?: string, company?: string, role?: any): Promise<boolean> => {
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
    showToast(t(`欢迎回来，${newUser.name}`, `Welcome back, ${newUser.name}`));
    return true;
  };

  const logout = () => {
    setUser(null);
    showToast(t('已退出登录', 'Signed out'));
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...data });
    showToast(t('个人档案与企业信息已更新', 'Profile and company details updated'));
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
    showToast(t('本课时已学完，进度已更新', 'Lesson completed, and your progress is updated'));
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
    showToast(t(`测评完成：${score} 分，已存入“我的空间”`, `Audit complete: ${score} pts, saved to My space`));

    return newRecord;
  };

  const latestDiagnosis = diagnoses[0] || null;

  const saveProposalDraft = (
    title: string,
    services: string[],
    timeline: string,
    details: any
  ): SavedProposal => {
    const newProposal: SavedProposal = {
      id: `prop-${Date.now()}`,
      title,
      date: new Date().toLocaleDateString(),
      services,
      timeline,
      shareId: `share-${Math.random().toString(36).substring(2, 8)}`,
      details,
    };

    setSavedProposals((prev) => [newProposal, ...prev]);
    setActiveProposal(newProposal);
    logLeadActivity(`保存方案配置草案: ${title}`, 20, { timeline });
    showToast(t('方案已保存，方案空间已开启', 'Plan saved, and the project room is open'));

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
