export interface Site {
  id: number;
  orgId: number;
  name: string;
  domain: string;
  hosting: string;
  siteKey: string;
  createdAt: string;
  /** 仅管理接口 /api/admin/sites 返回：已授权的客户账号 */
  memberIds?: number[];
}

export interface Org {
  id: number;
  name: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  role: 'admin' | 'customer';
  displayName: string;
  orgId?: number;
  mustChangePassword: boolean;
  disabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  company: string;
  message: string;
  sourcePage: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'invalid';
  note: string;
  createdAt: string;
}

export const LEAD_STATUS: Record<Lead['status'], string> = {
  new: '新线索',
  contacted: '已联系',
  qualified: '有意向',
  closed: '已成交',
  invalid: '无效',
};

/** 线索状态的提示色（antd Badge status），状态始终同时显示文字 */
export const LEAD_BADGE: Record<Lead['status'], 'processing' | 'warning' | 'success' | 'default' | 'error'> = {
  new: 'processing',
  contacted: 'warning',
  qualified: 'success',
  closed: 'success',
  invalid: 'default',
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS) as Lead['status'][];

export const HOSTING: Record<string, string> = {
  script: '嵌入脚本',
  vercel: '我方托管（Vercel）',
  self_hosted: '客户自有服务器',
};
