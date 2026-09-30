import { SHOW_FDE } from '../lib/features';

export interface ResourceItem {
  id: string;
  type: 'template' | 'whitepaper' | 'checklist' | 'open_course';
  title: string;
  category: string;
  description: string;
  downloadCount: number;
  format: 'PDF' | 'Excel' | 'Word' | 'Notion 模板';
  requiresLogin: boolean;
  relatedCourseCode: 'A' | 'B' | 'C' | 'D' | 'E';
  fileSize: string;
}

const ALL_RESOURCE_ITEMS: ResourceItem[] = [
  {
    id: 'res-buyer-persona',
    type: 'template',
    title: '海外 B2B 买家决策者画像与意图建模模板',
    category: 'GEO / 内容规划',
    description: '涵盖海外采购经理、工程总监、分销商核心诉求、搜索习惯与 AI 提问意图梳理的标准工作表。',
    downloadCount: 1420,
    format: 'Excel',
    requiresLogin: true,
    relatedCourseCode: 'C',
    fileSize: '1.2 MB'
  },
  {
    id: 'res-geo-clusters',
    type: 'template',
    title: '买家英文问题簇编写工作表',
    category: 'GEO / 内容规划',
    description: '爱康医疗做法的通用版：从 1 个业务场景整理出 30 组买家会问的英文问题，并给出直接回答的写法。',
    downloadCount: 2180,
    format: 'Excel',
    requiresLogin: true,
    relatedCourseCode: 'C',
    fileSize: '860 KB'
  },
  {
    id: 'res-seo-keywords-map',
    type: 'template',
    title: '60 组外贸核心词「一词一页」映射表（泰宁科创做法）',
    category: 'SEO 优化',
    description: '避免自家页面互相抢同一个词，并按信息型、对比型、采购型整理关键词。',
    downloadCount: 1890,
    format: 'Excel',
    requiresLogin: true,
    relatedCourseCode: 'B',
    fileSize: '1.5 MB'
  },
  {
    id: 'res-site-launch-checklist',
    type: 'checklist',
    title: '出海独立站上线前 36 项技术与 SEO 验收清单',
    category: '独立站建站',
    description: '涵盖 Core Web Vitals、hreflang、Schema 验证、表单直通 CRM、AI 爬虫通道的排查表。',
    downloadCount: 3120,
    format: 'PDF',
    requiresLogin: false,
    relatedCourseCode: 'A',
    fileSize: '2.4 MB'
  },
  {
    id: 'res-ai-whitepaper',
    type: 'whitepaper',
    title: '《2026 中国出海企业 AI 售前全链路白皮书》',
    category: '出海战略',
    description: `介绍出海获客的五个卡点、爱康医疗与泰宁科创的做法、GEO 六步闭环与${SHOW_FDE ? ' FDE 三层建设' : '系统对接落地'}。`,
    downloadCount: 4560,
    format: 'PDF',
    requiresLogin: true,
    relatedCourseCode: 'C',
    fileSize: '8.8 MB'
  },
  {
    id: 'res-fde-needs-spec',
    type: 'template',
    title: '企业 FDE 三层建设现状盘点清单',
    category: 'FDE 驻场',
    description: '帮助业务与 IT 负责人逐层盘点：哪些经验还没写成标准，哪些数据还在 Excel 和个人邮箱，哪些场景适合先上 AI。',
    downloadCount: 940,
    format: 'Word',
    requiresLogin: true,
    relatedCourseCode: 'E',
    fileSize: '750 KB'
  }
];

export const RESOURCE_ITEMS: ResourceItem[] = SHOW_FDE ? ALL_RESOURCE_ITEMS : ALL_RESOURCE_ITEMS.filter((item) => item.id !== 'res-fde-needs-spec');
