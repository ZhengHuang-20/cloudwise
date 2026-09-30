import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError, setCsrfToken } from '../lib/api';

export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'customer';
  displayName: string;
  mustChangePassword: boolean;
  csrfToken: string;
  orgId?: number;
}

interface AuthState {
  user: AuthUser | null;
  /** 首次读取会话中 */
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const apply = useCallback((u: AuthUser | null) => {
    setCsrfToken(u?.csrfToken ?? '');
    setUser(u);
  }, []);

  useEffect(() => {
    api<{ user: AuthUser }>('/api/auth/me')
      .then((r) => apply(r.user))
      .catch((e) => {
        if (!(e instanceof ApiError)) console.warn(e);
        apply(null);
      })
      .finally(() => setLoading(false));
  }, [apply]);

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await api<{ user: AuthUser }>('/api/auth/login', { method: 'POST', body: { email, password } });
      apply(r.user);
      return r.user;
    },
    [apply],
  );

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } finally {
      apply(null);
    }
  }, [apply]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const r = await api<{ user: AuthUser }>('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      apply(r.user);
    },
    [apply],
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, changePassword }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
};
