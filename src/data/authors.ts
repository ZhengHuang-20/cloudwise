import { FOUNDER } from './fdeData';

/**
 * 文章作者（E-E-A-T）：id → 人物资料。Person 的 @id 为 `${SITE_URL}/#<id>`，
 * 介绍页为 /about；文章页与关于页都会输出完整的 Person，保证 @id 在页面内可解析。
 */
export const AUTHORS = {
  founder: FOUNDER,
};

export type AuthorId = keyof typeof AUTHORS;
