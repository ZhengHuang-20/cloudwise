import { SERVICE_COUNT_EN, SHOW_FDE } from '../../lib/features';
import type { PathEn } from './types';

/** 角色学习路径（英文），按 id 与 src/data/coursesData.ts 中的 ROLE_LEARNING_PATHS 对应 */
export const pathsEn: Record<string, PathEn> = {
  'path-boss': {
    title: '60 minutes for owners: understand AI export in one hour',
    targetRole: 'Decision-makers (chairman, general manager, export project investors)',
    durationText: 'About 60 minutes',
    description: `No technical detail. Focus on the decision-maker sections of the ${SERVICE_COUNT_EN.toLowerCase()} courses: the investment mix, delivery timeline, pitfalls to avoid and acceptance criteria.`,
    endGoal: 'Decide clearly whether to act, which items to do, what to do first, and how to assess the team and the provider',
  },
  'path-acquisition': {
    title: 'Lead-growth path: independent site + SEO + GEO',
    targetRole: 'Export directors, overseas market directors, export brand operators',
    durationText: 'About 3.5 hours of close reading',
    description:
      'Build a full-channel traffic funnel: from the three-reader architecture of an independent site, to the Google core keyword library, to taking the top spot in AI recommendations.',
    endGoal: 'Build a natural traffic engine that keeps producing high-intent export enquiries',
  },
  'path-conversion': {
    title: '7×24 conversion path: stop losses on overnight enquiries',
    targetRole: 'Overseas customer service managers, sales core staff, sales operations',
    durationText: 'About 2 hours of focused study',
    description:
      'Tackle the time-zone gap: learn to organise the company knowledge base, tune the boundaries of AI prompts and connect directly to the CRM.',
    endGoal:
      'Eliminate overnight losses completely, so that every overseas enquiry gets a professional, structured reply within 60 seconds',
  },
  'path-tech': {
    title: SHOW_FDE
      ? 'Tech evaluation and rollout path: foundations, security and FDE'
      : 'Tech evaluation and rollout path: foundations, security and system integration',
    targetRole: 'IT leads, technical architects, CIOs',
    durationText: 'About 2.5 hours of in-depth study',
    description:
      'Fully assess the independent site tech stack, Schema structured data, multi-system API integration, private deployment and data compliance.',
    endGoal: 'Produce a clear internal plan for technical integration, and a security and compliance report',
  },
};
