/**
 * 对外联系人。页脚、方案空间与 AI 顾问知识库（src/server/knowledge.ts）都引用这里，
 * 换人或换号码只改这一处。
 */
export interface Contact {
  name: string;
  /** 职务，如“西南大区客户经理” */
  title: string;
  /** 11 位手机号，展示时用 formatPhone 分段 */
  phone: string;
}

export const CONTACTS: Contact[] = [
  { name: '周荣岳', title: '西南大区客户经理', phone: '13880491401' },
  { name: '崔跃', title: '华北大区负责人', phone: '13811954582' },
];

/** 13880491401 → 138 8049 1401 */
export const formatPhone = (phone: string) => phone.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1 $2 $3');
