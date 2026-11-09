import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SessionUser, api, homeFor, setSession } from '../api';
import { ErrorBox } from '../components/ui';
import { translate as t } from '../i18n';

export default function Register() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [f, setF] = useState({ name: '', email: '', password: '', ref: sp.get('ref') || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await api<{ token: string; user: SessionUser }>('/auth/register', { method: 'POST', body: { ...f, ref: f.ref || undefined } });
      setSession(r.token, r.user);
      nav(homeFor(r.user));
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-black text-lapis">{t('ساخت حساب جدید')}</h1>
      <ErrorBox msg={error} />
      <label className="block text-sm">{t('نام کامل')}
        <input className="input mt-1" required value={f.name} onChange={(e) => up('name', e.target.value)} />
      </label>
      <label className="block text-sm">{t('ایمیل')}
        <input className="input mt-1" type="email" dir="ltr" required value={f.email} onChange={(e) => up('email', e.target.value)} />
      </label>
      <label className="block text-sm">{t('رمز عبور (حداقل ۸ حرف)')}
        <input className="input mt-1" type="password" dir="ltr" minLength={8} required value={f.password} onChange={(e) => up('password', e.target.value)} />
      </label>
      <label className="block text-sm">{t('کد معرفی (اختیاری)')}
        <input className="input mt-1" dir="ltr" maxLength={12} value={f.ref} onChange={(e) => up('ref', e.target.value)} />
      </label>
      <button className="btn-primary w-full" disabled={busy}>{busy ? t('لطفاً صبر کنید…') : t('ثبت‌نام')}</button>
      <p className="text-center text-sm text-slate-600">{t('حساب دارید؟')} <Link to="/login" className="text-lapis underline">{t('ورود')}</Link></p>
    </form>
  );
}
