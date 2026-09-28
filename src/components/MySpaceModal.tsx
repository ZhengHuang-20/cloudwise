import React, { useState } from 'react';
import { Activity, Award, Check, FileText, GraduationCap, Sliders } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSES } from '../data/coursesData';
import { SERVICE_COUNT_CN } from '../lib/features';
import { UserProfile } from '../lib/supabase';
import { Dialog, DialogBody } from './ui/Dialog';
import { SegmentedControl } from './ui/SegmentedControl';
import { scoreTone, TONE_TEXT } from './ui/tone';

interface MySpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  openSupabaseModal: () => void;
}

type SpaceTab = 'progress' | 'diagnoses' | 'proposals' | 'certificate' | 'profile';

const ROLES: UserProfile['role'][] = ['决策者', '业务负责人', '技术负责人', '执行人员', '售前顾问'];

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <p className="py-16 text-center text-body text-label-secondary">{text}</p>
);

export const MySpaceModal: React.FC<MySpaceModalProps> = ({ isOpen, onClose, openSupabaseModal }) => {
  const {
    user,
    logout,
    updateUserProfile,
    totalCompletedLessons,
    completedQuizzesCount,
    getCourseProgressPercentage,
    diagnoses,
    savedProposals,
    supabaseStatus,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<SpaceTab>('progress');

  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.companyName || '');
  const [industry, setIndustry] = useState(user?.industry || '');
  const [role, setRole] = useState(user?.role || '业务负责人');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, companyName: company, industry, role });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="lg"
      title={user?.name || '出海探索者'}
      description={`${user?.role || '决策者'} · ${user?.companyName || '出海企业'}`}
      leading={
        <span className="avatar h-10 w-10 text-body" aria-hidden="true">
          {user?.name?.slice(0, 1) || '我'}
        </span>
      }
      actions={
        <button type="button" onClick={openSupabaseModal} className="chip hidden sm:inline-flex" title="数据同步设置">
          <span
            className={`h-1.5 w-1.5 rounded-full ${supabaseStatus.isConfigured ? 'bg-success' : 'bg-warning'}`}
            aria-hidden="true"
          />
          {supabaseStatus.isConfigured ? '已云同步' : '仅本地'}
        </button>
      }
    >
      <div className="shrink-0 border-b border-separator px-6 py-3 sm:px-8">
        <SegmentedControl
          ariaLabel="我的空间"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'progress', label: '学习进度', icon: GraduationCap },
            { id: 'diagnoses', label: `测评档案 ${diagnoses.length}`, icon: Activity },
            { id: 'proposals', label: `方案草案 ${savedProposals.length}`, icon: FileText },
            { id: 'certificate', label: '能力认证', icon: Award },
            { id: 'profile', label: '企业档案', icon: Sliders },
          ]}
        />
      </div>

      <DialogBody>
        {activeTab === 'progress' && (
          <div className="animate-fade-in">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: '已学完课时', value: totalCompletedLessons, unit: '节' },
                { label: '课后自测', value: completedQuizzesCount, unit: '次' },
                { label: '可见性测评', value: diagnoses.length, unit: '次' },
                { label: '方案草案', value: savedProposals.length, unit: '份' },
              ].map((stat) => (
                <div key={stat.label} className="well">
                  <dt className="text-caption text-label-secondary">{stat.label}</dt>
                  <dd className="mt-1 text-title-2 tabular-nums">
                    {stat.value}
                    <span className="ml-1 text-caption font-normal text-label-secondary">{stat.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-10 text-title-3">{SERVICE_COUNT_CN}门课程进度</h3>
            <ul className="mt-4 space-y-5">
              {COURSES.map((course) => {
                const percent = getCourseProgressPercentage(course.id);
                return (
                  <li key={course.id}>
                    <div className="flex items-baseline justify-between gap-4 text-body">
                      <span>
                        {course.code} · {course.title.split('——')[0]}
                      </span>
                      <span className="tabular-nums text-label-secondary">{percent}%</span>
                    </div>
                    <div className="meter mt-2">
                      <span className="bg-success" style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activeTab === 'diagnoses' &&
          (diagnoses.length === 0 ? (
            <EmptyState text="还没有测评记录。在首页完成 AI 可见性测评后，结果会自动保存在这里。" />
          ) : (
            <ul className="divide-y divide-separator border-y border-separator animate-fade-in">
              {diagnoses.map((diag) => (
                <li key={diag.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-body font-semibold">{diag.toolName}</span>
                    <span className={`shrink-0 text-body font-semibold tabular-nums ${TONE_TEXT[scoreTone(diag.score)]}`}>
                      {diag.score} 分
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-label-secondary">{diag.summary}</p>
                </li>
              ))}
            </ul>
          ))}

        {activeTab === 'proposals' &&
          (savedProposals.length === 0 ? (
            <EmptyState text="还没有方案草案。在“方案规划”中保存方案后会出现在这里。" />
          ) : (
            <ul className="divide-y divide-separator border-y border-separator animate-fade-in">
              {savedProposals.map((prop) => (
                <li key={prop.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-body font-semibold">{prop.title}</span>
                    <span className="shrink-0 text-body tabular-nums">{prop.timeline}</span>
                  </div>
                  <p className="mt-1 text-caption text-label-secondary">保存于 {prop.date}</p>
                </li>
              ))}
            </ul>
          ))}

        {activeTab === 'certificate' && (
          <div className="mx-auto max-w-md text-center animate-fade-in">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fill">
              <Award className="h-8 w-8" />
            </span>
            <p className="mt-6 text-caption text-label-secondary">AI 出海实战能力结业证书</p>
            <h3 className="mt-1 text-title-2">出海获客能力认证</h3>
            <p className="mt-2 text-body text-label-secondary">
              授予 {user?.name} · {user?.companyName}
            </p>

            <ul className="mt-8 space-y-3 text-left">
              {[
                '掌握独立站三读者架构与 Core Web Vitals 技术规范',
                '掌握 Google 60 组外贸核心词体系与 E-E-A-T 质量标准',
                '掌握 GEO 六步闭环与海外 AI 大模型推荐机制',
                '掌握 7×24 小时出海 AI 客服知识库建设与 CRM 直连',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-body">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => showToast('证书卡片已生成，可保存后分享')}
              className="btn btn-primary btn-block mt-8"
            >
              分享到朋友圈或 LinkedIn
            </button>
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="mx-auto max-w-md space-y-5 animate-fade-in">
            <div>
              <label htmlFor="profile-name" className="field-label">姓名 / 称呼</label>
              <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="profile-company" className="field-label">企业全称</label>
              <input
                id="profile-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="profile-industry" className="field-label">所属行业</label>
              <input
                id="profile-industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="profile-role" className="field-label">角色</label>
              <select
                id="profile-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                className="field"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-2 py-2 text-body text-danger hover:underline"
              >
                退出登录
              </button>
              <button type="submit" className="btn btn-primary">
                保存档案
              </button>
            </div>
            <button
              type="button"
              onClick={openSupabaseModal}
              className="link text-body sm:hidden"
            >
              数据同步设置
            </button>
          </form>
        )}
      </DialogBody>
    </Dialog>
  );
};
