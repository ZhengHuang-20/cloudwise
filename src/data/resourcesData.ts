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

export const RESOURCE_ITEMS: ResourceItem[] = [
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
    title: 'AI 偏好引用高价值“问题簇”编写工作表',
    category: 'GEO / 内容规划',
    description: '爱康医疗同款：从 1 个业务场景裂变为 30 组真实买家英文问题簇与标准直答写法。',
    downloadCount: 2180,
    format: 'Excel',
    requiresLogin: true,
    relatedCourseCode: 'C',
    fileSize: '860 KB'
  },
  {
    id: 'res-seo-keywords-map',
    type: 'template',
    title: '泰宁科创同款：60 组外贸核心词一词一页映射表',
    category: 'SEO 优化',
    description: '彻底解决内部网页相互抢词的混乱局面，建立清晰的信息型、对比型、采购型关键词树。',
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
    description: '涵盖 Core Web Vitals、hreflang、Schema 验证、表单直通 CRM、AI 爬虫通道的专业排查表。',
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
    description: '深度剖析出海获客五大断点治理、爱康医疗与泰宁科创实践全案、GEO 六步闭环与 FDE 敏捷落地。',
    downloadCount: 4560,
    format: 'PDF',
    requiresLogin: true,
    relatedCourseCode: 'C',
    fileSize: '8.8 MB'
  },
  {
    id: 'res-fde-needs-spec',
    type: 'template',
    title: '企业 FDE 驻场工程师需求与系统接口盘点清单',
    category: 'FDE 驻场',
    description: '帮助 IT 与外贸业务主管梳理现有 CRM、ERP、邮件与产品知识库的字段映射与接口范围。',
    downloadCount: 940,
    format: 'Word',
    requiresLogin: true,
    relatedCourseCode: 'E',
    fileSize: '750 KB'
  }
];
