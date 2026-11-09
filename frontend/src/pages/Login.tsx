import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SessionUser, api, homeFor, setSession } from '../api';
import { ErrorBox } from '../components/ui';
import { translate as t } from '../i18n';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await api<{ token: string; user: SessionUser }>('/auth/login', { method: 'POST', body: { email, password } });
      setSession(r.token, r.user);
      nav(homeFor(r.user));
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-black text-lapis">{t('ورود به حساب')}</h1>
      <ErrorBox msg={error} />
      <label className="block text-sm">{t('ایمیل')}
        <input className="input mt-1" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block text-sm">{t('رمز عبور')}
        <input className="input mt-1" type="password" dir="ltr" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button className="btn-primary w-full" disabled={busy}>{busy ? t('در حال ورود…') : t('ورود')}</button>
      <p className="text-center text-sm text-slate-600">{t('حساب ندارید؟')} <Link to="/register" className="text-lapis underline">{t('ثبت‌نام')}</Link></p>
    </form>
  );
}
