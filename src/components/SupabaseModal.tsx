import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Code
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SupabaseModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { supabaseStatus, saveSupabaseConfig, showToast } = useApp();

  const [url, setUrl] = useState(supabaseStatus.url || '');
  const [key, setKey] = useState(supabaseStatus.key || '');
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) {
      showToast('请输入有效的 Supabase URL 与 Anon Key');
      return;
    }
    const success = saveSupabaseConfig(url.trim(), key.trim());
    if (success) {
      onClose();
    }
  };

  const sqlCode = `-- 云端智荐 (Cloud Wisdom) Supabase 数据库表结构
-- 在您的 Supabase 控制台 -> SQL Editor 中粘贴运行即可：

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  company_name TEXT,
  industry TEXT,
  role TEXT DEFAULT '业务负责人',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  quiz_score INT DEFAULT 100,
  exercise_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.diagnosis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  score INT,
  summary TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saved_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  services JSONB NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`;

  const copySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sqlCode);
      showToast('SQL 脚本已复制到剪贴板！可直接粘贴至 Supabase SQL Editor 执行。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Supabase 云端数据库配置与连接</h2>
              <p className="text-xs text-slate-400">用于远程多端同步用户出海学习进度、体检档案与方案空间</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex gap-2 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'config' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            连接配置
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'sql' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            SQL 数据表结构
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'config' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${supabaseStatus.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    当前状态：{supabaseStatus.isConfigured ? '已连接 Supabase 云端数据库' : '本地离线存储模式（自适应）'}
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    本系统已内置离线优先架构（Offline-First），未填 Supabase 时所有课程进度、诊断记录均完整保存在本地；配置 Supabase URL 与 Key 后，将自动开启云端持久化同步。
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Supabase Project URL (项目链接)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Supabase Anon Public Key (匿名公钥)
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                >
                  保存并连接 Supabase
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>在 Supabase 后台运行以下 SQL 即可初始化数据表：</span>
                <button
                  onClick={copySql}
                  className="flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制 SQL 脚本</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72">
                {sqlCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
