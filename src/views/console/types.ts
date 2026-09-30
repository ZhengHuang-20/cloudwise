export interface Site {
  id: number;
  orgId: number;
  name: string;
  domain: string;
  hosting: string;
  siteKey: string;
  createdAt: string;
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
