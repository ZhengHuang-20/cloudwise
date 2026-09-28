import React from 'react';
import { useApp } from '../context/AppContext';
import { Dialog, DialogBody } from './ui/Dialog';

export const SalesConsoleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, leadScore, currentStage, leadActivities, diagnoses, savedProposals } = useApp();

  const briefing = [
    {
      title: '企业画像与决策背景',
      text: `${user?.companyName}，行业：${user?.industry}，决策人角色：${user?.role}。年出口规模在 5000 万以上，正在由传统展会与代工向自主品牌及海外合规体系跃迁。`,
    },
    {
      title: '认知状态（已学懂）',
      text: '决策人已在站内完整阅读《出海认知破幻公理》与《GEO生成式权威信源》，已彻底破除“中文画册直译”与“买流量就有单”的语言幻觉，对三读者架构与第三方背调协议高度认同。',
    },
    {
      title: '测评结果（已自测）',
      text:
        diagnoses.length > 0
          ? `已完成 ${diagnoses[0].toolName}，断点得分 ${diagnoses[0].score} 分，薄弱断点：${diagnoses[0].summary}。核心痛点为欧美工程采购看不见、深夜欧美技术质询接不住。`
          : '已完成 AI 可见性测评，判定核心断损在“看不见（SEO/GEO缺席）”与“接不住（12小时时差流失）”，年均测算潜在线索损耗约 180~320 万元。',
    },
    {
      title: '方案偏好（已看方案）',
      text:
        savedProposals.length > 0
          ? `客户已在方案规划中确认草案，预选架构：${savedProposals[0].services.join(' + ')}，规划交付周期：${savedProposals[0].timeline}。`
          : '意向偏好【获客增长组合（独立站+SEO+GEO）】+【24h AI 转化引擎】，已查看交付周期与阶段排期。',
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="xl"
      title="售前商业情报"
      description="销售见面前即可掌握：已被充分教育、已完成测评的高意向线索。"
    >
      <DialogBody>
        {/* 线索概要 */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-title-2">{user?.companyName || '江苏某高端医疗装备制造集团'}</h3>
            <p className="mt-1 text-body text-label-secondary">
              {user?.name || '王总'} · {user?.role || '海外事业部总裁'}
            </p>
            <p className="mt-1 text-caption text-label-secondary">
              {user?.phone || '138****8888'} · {user?.industry || '高端装备与医疗器械'}
            </p>
          </div>
          <dl className="flex shrink-0 gap-8">
            <div>
              <dt className="text-caption text-label-secondary">线索阶段</dt>
              <dd className="mt-1 text-title-2">{currentStage}</dd>
            </div>
            <div>
              <dt className="text-caption text-label-secondary">意向评分</dt>
              <dd className="mt-1 text-title-2 tabular-nums text-success">{leadScore}</dd>
            </div>
          </dl>
        </div>

        {/* 会前简报 */}
        <section className="mt-10 border-t border-separator pt-8" aria-labelledby="briefing-title">
          <h3 id="briefing-title" className="text-title-3">
            会前商业简报
          </h3>
          <p className="mt-1 text-caption text-label-secondary">根据站内学习、自测与看方案轨迹自动生成</p>
          <dl className="mt-6 space-y-5">
            {briefing.map((item) => (
              <div key={item.title}>
                <dt className="text-body font-semibold">{item.title}</dt>
                <dd className="mt-1 text-body text-label-secondary">{item.text}</dd>
              </div>
            ))}
          </dl>
          <div className="well mt-6">
            <p className="text-body font-semibold">销售会面策略</p>
            <p className="mt-1 text-body text-label-secondary">
              无需寒暄公司成立年份或概念科普。直接出示《爱康医疗新站 95 分同行业对照报告》与《凌晨 3 点 AI 答疑实录卷宗》，进入商务与排期决议。
            </p>
          </div>
        </section>

        {/* 行为流水 */}
        <section className="mt-10 border-t border-separator pt-8" aria-labelledby="timeline-title">
          <h3 id="timeline-title" className="text-title-3">
            行为流水
          </h3>
          <ul className="mt-4 divide-y divide-separator border-y border-separator">
            {leadActivities.map((act) => (
              <li key={act.id} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0 text-body">{act.action}</span>
                <span className="flex shrink-0 items-baseline gap-4">
                  <span className="text-body font-semibold tabular-nums text-success">+{act.scoreDelta}</span>
                  <span className="w-16 text-right text-caption text-label-secondary">{act.timestamp}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </DialogBody>
    </Dialog>
  );
};
