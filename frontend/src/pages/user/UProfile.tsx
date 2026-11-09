import { FormEvent, useEffect, useState } from 'react';
import { api, getUser } from '../../api';
import { EDU, ENGLISH } from '../../types';
import { ErrorBox, Field, Loading, OkBox } from '../../components/ui';
import { translate as t } from '../../i18n';

const KEYS = ['phone', 'gender', 'date_of_birth', 'province', 'education_level', 'institution', 'field_of_study', 'gpa', 'english_level', 'target_countries', 'bio'] as const;
type F = Record<(typeof KEYS)[number], string>;

export default function UProfile() {
  const [f, setF] = useState<F | null>(null);
  const [completion, setCompletion] = useState(0);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const user = getUser();

  useEffect(() => {
    api<Record<string, unknown> & { completion: number }>('/user/profile', { auth: true })
      .then((p) => {
        setF(Object.fromEntries(KEYS.map((k) => [k, p[k] == null ? '' : String(p[k])])) as F);
        setCompletion(p.completion);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (!f) return error ? <ErrorBox msg={error} /> : <Loading />;
  const up = (k: keyof F, v: string) => { setOk(''); setF((p) => ({ ...p!, [k]: v })); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setOk('');
    try {
      const body: Record<string, string | number | null> = Object.fromEntries(KEYS.map((k) => [k, f![k] === '' ? null : f![k]]));
      body.gpa = f!.gpa === '' ? null : Number(f!.gpa);
      const r = await api<{ completion: number }>('/user/profile', { method: 'PUT', body, auth: true });
      setCompletion(r.completion);
      setOk(t('پروفایل ذخیره شد.'));
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-lapis">{t('پروفایل')}</h1>
        <span className="text-sm text-slate-600">{t('تکمیل:')} {completion}{t('٪')}</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-slate-200"><div className="h-full bg-saffron" style={{ width: `${completion}%` }} /></div>
      <ErrorBox msg={error} /><OkBox msg={ok} />

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
        <div><span className="text-xs text-slate-500">{t('نام')}</span><p className="font-medium">{user?.name}</p></div>
        <div><span className="text-xs text-slate-500">{t('ایمیل')}</span><p className="font-medium" dir="ltr">{user?.email}</p></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('شماره تماس')}><input className="input" dir="ltr" value={f.phone} onChange={(e) => up('phone', e.target.value)} /></Field>
        <Field label={t('تاریخ تولد')}><input className="input" type="date" dir="ltr" value={f.date_of_birth} onChange={(e) => up('date_of_birth', e.target.value)} /></Field>
        <Field label={t('جنسیت')}>
          <select className="input" value={f.gender} onChange={(e) => up('gender', e.target.value)}>
            <option value="">{t('انتخاب کنید')}</option><option value="male">{t('مرد')}</option><option value="female">{t('زن')}</option>
          </select>
        </Field>
        <Field label={t('ولایت')}><input className="input" value={f.province} onChange={(e) => up('province', e.target.value)} /></Field>
        <Field label={t('سطح تحصیلی فعلی')}>
          <select className="input" value={f.education_level} onChange={(e) => up('education_level', e.target.value)}>
            <option value="">{t('انتخاب کنید')}</option>
            {Object.entries(EDU).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
          </select>
        </Field>
        <Field label={t('مکتب / دانشگاه')}><input className="input" value={f.institution} onChange={(e) => up('institution', e.target.value)} /></Field>
        <Field label={t('رشته تحصیلی')}><input className="input" value={f.field_of_study} onChange={(e) => up('field_of_study', e.target.value)} /></Field>
        <Field label={t('معدل (۰ تا ۱۰۰)')}><input className="input" type="number" step="0.01" min="0" max="100" dir="ltr" value={f.gpa} onChange={(e) => up('gpa', e.target.value)} /></Field>
        <Field label={t('سطح زبان انگلیسی')}>
          <select className="input" value={f.english_level} onChange={(e) => up('english_level', e.target.value)}>
            <option value="">{t('انتخاب کنید')}</option>
            {Object.entries(ENGLISH).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
          </select>
        </Field>
        <Field label={t('کشورهای مورد علاقه')}><input className="input" placeholder={t('ترکیه، آلمان، ...')} value={f.target_countries} onChange={(e) => up('target_countries', e.target.value)} /></Field>
      </div>
      <Field label={t('درباره من / اهداف تحصیلی')}><textarea className="input" rows={4} maxLength={2000} value={f.bio} onChange={(e) => up('bio', e.target.value)} /></Field>

      <button className="btn-primary" disabled={busy}>{busy ? t('در حال ذخیره…') : t('ذخیره پروفایل')}</button>
    </form>
  );
}
