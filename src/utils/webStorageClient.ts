import { LOGIN_USER, USER_PROFILE } from '@/constants/enum';

const webStorageClient = {
  set(key: string, value: any) {
    if (typeof window === 'undefined') return;
    try {
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, val);
    } catch (e) {
      console.error('webStorageClient set error:', e);
    }
  },

  get(key: string) {
    if (typeof window === 'undefined') return null;
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch {
      return null;
    }
  },

  remove(key: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(e);
    }
  },

  // Token management
  getToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const raw = localStorage.getItem(LOGIN_USER) || localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!raw) return undefined;
    // If raw is a JSON string (e.g. user profile object)
    if (raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.token === 'string') return parsed.token;
        if (typeof parsed?.accessToken === 'string') return parsed.accessToken;
        return undefined;
      } catch {
        return undefined;
      }
    }
    // Ensure no non-ASCII / non-ISO-8859-1 chars
    if (/[^\x00-\x7F]/.test(raw)) {
      return undefined;
    }
    return raw.replace(/^Bearer\s+/i, '').trim();
  },

  setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOGIN_USER, token);
  },

  removeToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOGIN_USER);
  },

  // Refresh token
  getRefreshToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const raw = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
    if (!raw || raw.trim().startsWith('{') || /[^\x00-\x7F]/.test(raw)) return undefined;
    return raw.trim();
  },

  setRefreshToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refresh_token', token);
  },

  removeRefreshToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('refresh_token');
  },

  // User info
  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_PROFILE);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser(user: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_PROFILE, JSON.stringify(user));
  },

  removeUser() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_PROFILE);
  },

  logout() {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  },
};

export default webStorageClient;
