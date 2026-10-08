import { Bot, Globe, Search, Sparkles, Users } from 'lucide-react';

/**
 * 五项服务的固定识别（DESIGN.md §3.1）：图标与识别色全站一致，按 A–E 顺序排列。
 * 识别色只用于图标和小色点，不用于正文、按钮或大面积背景。
 */
export const SERVICE_IDENTITY = {
  site: { code: 'A', name: '海外独立站', nameEn: 'Overseas website', icon: Globe, text: 'text-svc-site', dot: 'bg-svc-site' },
  seo: { code: 'B', name: '外贸 SEO', nameEn: 'Export SEO', icon: Search, text: 'text-svc-seo', dot: 'bg-svc-seo' },
  geo: { code: 'C', name: '出海 GEO', nameEn: 'Export GEO', icon: Sparkles, text: 'text-svc-geo', dot: 'bg-svc-geo' },
  chat: { code: 'D', name: 'AI 智能客服', nameEn: 'AI customer service', icon: Bot, text: 'text-svc-chat', dot: 'bg-svc-chat' },
  fde: { code: 'E', name: 'FDE 驻场', nameEn: 'FDE on-site', icon: Users, text: 'text-svc-fde', dot: 'bg-svc-fde' },
} as const;

export type ServiceKey = keyof typeof SERVICE_IDENTITY;
