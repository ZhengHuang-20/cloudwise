import { createContext, useContext } from 'react';
import type { AuthUser } from '../../context/AuthContext';
import type { Site } from './types';

/** 后台的功能页：前三项按站点查看，后三项仅管理员可见。地址为 #/console/<section>。 */
export type Section = 'overview' | 'leads' | 'install' | 'orgs' | 'users' | 'sites';

export const SITE_SECTIONS: Section[] = ['overview', 'leads', 'install'];
export const ADMIN_SECTIONS: Section[] = ['orgs', 'users', 'sites'];

export const SECTION_TITLE: Record<Section, string> = {
  overview: '数据概览',
  leads: '线索管理',
  install: '接入代码',
  orgs: '客户公司',
  users: '账号',
  sites: '站点与授权',
};

export const isSection = (v: string): v is Section => v in SECTION_TITLE;

export interface ConsoleState {
  user: AuthUser;
  isAdmin: boolean;
  /** /api/sites：管理员为全部站点，客户为授权给自己的站点；null 表示加载中 */
  sites: Site[] | null;
  site: Site | null;
  selectSite: (id: number) => void;
  reloadSites: () => Promise<void>;
  section: Section;
  go: (section: Section) => void;
}

export const ConsoleContext = createContext<ConsoleState | null>(null);

export const useConsole = () => {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error('useConsole 必须在 ConsoleShell 内使用');
  return ctx;
};
