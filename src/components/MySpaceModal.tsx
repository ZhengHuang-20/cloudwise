import React, { useState } from 'react';
import { Activity, Award, Check, FileText, GraduationCap, Sliders } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { courseList } from '../data/coursesData';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN } from '../lib/features';
import { UserProfile } from '../lib/types';
import { Dialog, DialogBody } from './ui/Dialog';
import { SegmentedControl } from './ui/SegmentedControl';
import { scoreTone, TONE_TEXT } from './ui/tone';

interface MySpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SpaceTab = 'progress' | 'diagnoses' | 'proposals' | 'certificate' | 'profile';

const ROLES: UserProfile['role'][] = ['决策者', '业务负责人', '技术负责人', '执行人员', '售前顾问'];

// 角色的值保存为中文，英文界面只改显示
const ROLE_EN: Record<UserProfile['role'], string> = {
  决策者: 'Decision-maker',
  业务负责人: 'Business lead',
  技术负责人: 'Technical lead',
  执行人员: 'Operations staff',
  售前顾问: 'Pre-sales adviser',
};

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <p className="py-16 text-center text-body text-label-secondary">{text}</p>
);

export const MySpaceModal: React.FC<MySpaceModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    logout,
    updateUserProfile,
    totalCompletedLessons,
    completedQuizzesCount,
    getCourseProgressPercentage,
    diagnoses,
    savedProposals,
    showToast
  } = useApp();
  const { t, lang } = useLang();
  const courses = courseList(lang);
  const roleLabel = (r: UserProfile['role']) => (lang === 'en' ? ROLE_EN[r] : r);

  const [activeTab, setActiveTab] = useState<SpaceTab>('progress');

  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.companyName || '');
  const [industry, setIndustry] = useState(user?.industry || '');
  const [role, setRole] = useState(user?.role || '业务负责人');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, companyName: company, industry, role });
  };

  const certificateItems = [
    {
      zh: '学习了独立站三读者架构与 Core Web Vitals 技术规范',
      en: 'Studied the three-reader website architecture and the Core Web Vitals technical standard',
    },
    {
      zh: '学习了 Google 60 组外贸核心词体系与 E-E-A-T 质量标准',
      en: 'Studied the 60-group Google export keyword system and the E-E-A-T quality standard',
    },
    {
      zh: '学习了 GEO 六步闭环与海外 AI 引用来源的机制',
      en: 'Studied the six-step GEO closed loop and how overseas AI tools choose sources to cite',
    },
    {
      zh: '学习了 7×24 小时出海 AI 客服知识库建设与 CRM 对接',
      en: 'Studied building a 24/7 export AI customer service knowledge base and connecting it to the CRM',
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="lg"
      title={user?.name || t('访客', 'Guest')}
      description={`${user?.role ? roleLabel(user.role) : t('决策者', 'Decision-maker')} · ${user?.companyName || t('出海企业', 'Export company')}`}
      leading={
        <span className="avatar h-10 w-10 text-body" aria-hidden="true">
          {user?.name?.slice(0, 1) || t('我', 'Me')}
        </span>
      }
    >
      <div className="shrink-0 border-b border-separator px-6 py-3 sm:px-8">
        <SegmentedControl
          ariaLabel={t('我的空间', 'My space')}
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'progress', label: t('学习进度', 'Progress'), icon: GraduationCap },
            { id: 'diagnoses', label: `${t('测评档案', 'Audits')} ${diagnoses.length}`, icon: Activity },
            { id: 'proposals', label: `${t('方案草案', 'Draft plans')} ${savedProposals.length}`, icon: FileText },
            { id: 'certificate', label: t('学习证明', 'Certificate'), icon: Award },
            { id: 'profile', label: t('企业档案', 'Company profile'), icon: Sliders },
          ]}
        />
      </div>

      <DialogBody>
        {activeTab === 'progress' && (
          <div className="animate-fade-in">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: t('已学完课时', 'Lessons completed'), value: totalCompletedLessons, unit: t('节', '') },
                { label: t('课后自测', 'Quizzes'), value: completedQuizzesCount, unit: t('次', '') },
                { label: t('可见性测评', 'Visibility audits'), value: diagnoses.length, unit: t('次', '') },
                { label: t('方案草案', 'Draft plans'), value: savedProposals.length, unit: t('份', '') },
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

            <h3 className="mt-10 text-title-3">
              {t(`${SERVICE_COUNT_CN}门课程进度`, `${SERVICE_COUNT_EN} courses: progress`)}
            </h3>
            <ul className="mt-4 space-y-5">
              {courses.map((course) => {
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
            <EmptyState
              text={t(
                '还没有测评记录。在首页完成 AI 可见性测评后，结果会自动保存在这里。',
                'No audits yet. Once you complete the AI visibility audit on the homepage, the result is saved here.'
              )}
            />
          ) : (
            <ul className="divide-y divide-separator border-y border-separator animate-fade-in">
              {diagnoses.map((diag) => (
                <li key={diag.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-body font-semibold">{diag.toolName}</span>
                    <span className={`shrink-0 text-body font-semibold tabular-nums ${TONE_TEXT[scoreTone(diag.score)]}`}>
                      {diag.score} {t('分', 'pts')}
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-label-secondary">{diag.summary}</p>
                </li>
              ))}
            </ul>
          ))}

        {activeTab === 'proposals' &&
          (savedProposals.length === 0 ? (
            <EmptyState
              text={t(
                '还没有方案草案。在“方案规划”中保存方案后会出现在这里。',
                'No draft plans yet. Plans you save in the Project planner appear here.'
              )}
            />
          ) : (
            <ul className="divide-y divide-separator border-y border-separator animate-fade-in">
              {savedProposals.map((prop) => (
                <li key={prop.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-body font-semibold">{prop.title}</span>
                    <span className="shrink-0 text-body tabular-nums">{prop.timeline}</span>
                  </div>
                  <p className="mt-1 text-caption text-label-secondary">
                    {t('保存于 ', 'Saved on ')}
                    {prop.date}
                  </p>
                </li>
              ))}
            </ul>
          ))}

        {activeTab === 'certificate' && (
          <div className="mx-auto max-w-md text-center animate-fade-in">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fill">
              <Award className="h-8 w-8" />
            </span>
            <p className="mt-6 text-caption text-label-secondary">{t('学习完成证明', 'Learning certificate')}</p>
            <h3 className="mt-1 text-title-2">{t('已完成出海获客课程学习', 'Completed the export lead-generation courses')}</h3>
            <p className="mt-2 text-body text-label-secondary">
              {t('授予 ', 'Awarded to ')}
              {user?.name} · {user?.companyName}
            </p>

            <ul className="mt-8 space-y-3 text-left">
              {certificateItems.map((item) => (
                <li key={item.zh} className="flex gap-3 text-body">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                  <span>{t(item.zh, item.en)}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => showToast(t('证书卡片已生成，可保存后分享', 'Certificate card generated. Save it to share'))}
              className="btn btn-primary btn-block mt-8"
            >
              {t('分享到朋友圈或 LinkedIn', 'Share to WeChat Moments or LinkedIn')}
            </button>
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="mx-auto max-w-md space-y-5 animate-fade-in">
            <div>
              <label htmlFor="profile-name" className="field-label">{t('姓名 / 称呼', 'Name')}</label>
              <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="profile-company" className="field-label">{t('企业全称', 'Company name')}</label>
              <input
                id="profile-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="profile-industry" className="field-label">{t('所属行业', 'Industry')}</label>
              <input
                id="profile-industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="profile-role" className="field-label">{t('角色', 'Role')}</label>
              <select
                id="profile-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                className="field"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
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
                {t('退出登录', 'Sign out')}
              </button>
              <button type="submit" className="btn btn-primary">
                {t('保存档案', 'Save profile')}
              </button>
            </div>
          </form>
        )}
      </DialogBody>
    </Dialog>
  );
};
