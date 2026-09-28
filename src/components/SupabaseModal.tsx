import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Dialog, DialogBody } from './ui/Dialog';
import { SegmentedControl } from './ui/SegmentedControl';

export const SupabaseModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { supabaseStatus, saveSupabaseConfig, showToast } = useApp();

  const [url, setUrl] = useState(supabaseStatus.url || '');
  const [key, setKey] = useState(supabaseStatus.key || '');
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

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
      showToast('SQL 已复制，可粘贴到 Supabase SQL Editor 执行');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="md"
      title="数据同步设置"
      description="连接 Supabase 后，学习进度、体检档案与方案会同步到云端。"
    >
      <div className="shrink-0 border-b border-separator px-6 py-3 sm:px-8">
        <SegmentedControl
          ariaLabel="数据同步设置"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'config', label: '连接配置' },
            { id: 'sql', label: '数据表结构' },
          ]}
        />
      </div>

      <DialogBody>
        {activeTab === 'config' ? (
          <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
            <div className="well flex items-start gap-3">
              <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${supabaseStatus.isConfigured ? 'bg-success' : 'bg-warning'}`}
                aria-hidden="true"
              />
              <div>
                <p className="text-body font-semibold">
                  {supabaseStatus.isConfigured ? '已连接 Supabase' : '本地离线模式'}
                </p>
                <p className="mt-1 text-caption text-label-secondary">
                  系统采用本地优先架构：不连接 Supabase 时，所有数据完整保存在本浏览器；填写 URL 与 Key 后自动开启云端同步。
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="supabase-url" className="field-label">Project URL</label>
              <input
                id="supabase-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="field font-mono"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="supabase-key" className="field-label">Anon Public Key</label>
              <input
                id="supabase-key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="field font-mono"
                autoComplete="off"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              保存并连接
            </button>
          </form>
        ) : (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <p className="text-caption text-label-secondary">在 Supabase 后台运行以下 SQL 以初始化数据表。</p>
              <button type="button" onClick={copySql} className="btn btn-neutral btn-sm shrink-0">
                <Copy />
                复制
              </button>
            </div>
            <pre className="well mt-4 max-h-80 overflow-auto font-mono text-caption text-label-secondary">{sqlCode}</pre>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
};
