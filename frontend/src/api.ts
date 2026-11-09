const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export type Role = 'user' | 'admin';
export interface SessionUser { id: number; name: string; email: string; role: Role }

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export function getUser(): SessionUser | null {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
}
export function setSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export const homeFor = (u: SessionUser | null) => (u?.role === 'admin' ? '/admin' : '/dashboard');

interface Opts { method?: string; body?: unknown; form?: FormData; auth?: boolean }

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body) headers['Content-Type'] = 'application/json';
  if (opts.auth) headers.Authorization = `Bearer ${getToken()}`;

  const res = await fetch('/api' + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.form ?? (opts.body ? JSON.stringify(opts.body) : undefined),
  });

  if (res.status === 401 && opts.auth) {
    clearSession();
    window.location.href = '/login';
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'خطایی رخ داد');
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// باز کردن فایل مدرک (نیازمند توکن، پس با fetch گرفته می‌شود)
export async function openFile(id: number) {
  const w = window.open('', '_blank');
  const res = await fetch(`/api/documents/${id}/file`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) { w?.close(); throw new Error('فایل باز نشد'); }
  const url = URL.createObjectURL(await res.blob());
  if (w) w.location.href = url;
}
