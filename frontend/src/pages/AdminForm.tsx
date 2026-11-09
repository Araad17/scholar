import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { LEVELS, ScholarshipInput } from '../types';
import { translate as t } from '../i18n';

const empty: ScholarshipInput = {
  title: '', country: '', level: 'master', funding: 'full', deadline: null,
  description: '', eligibility: '', apply_url: '', source_name: '', source_url: '', is_published: true,
};

function L({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium">{label}<div className="mt-1 font-normal">{children}</div></label>;
}

export default function AdminForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState<ScholarshipInput>(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) api<ScholarshipInput>(`/admin/scholarships/${id}`, { auth: true }).then(setF).catch((e) => setError(e.message));
  }, [id]);

  const up = <K extends keyof ScholarshipInput>(k: K, v: ScholarshipInput[K]) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const body = { ...f, deadline: f.deadline || null };
      await api(id ? `/admin/scholarships/${id}` : '/admin/scholarships', { method: id ? 'PUT' : 'POST', body, auth: true });
      nav('/admin/scholarships');
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-black text-lapis">{t(id ? 'ویرایش بورسیه' : 'افزودن بورسیه')}</h1>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <L label={t('عنوان')}><input className="input" required value={f.title} onChange={(e) => up('title', e.target.value)} /></L>
      <div className="grid gap-4 sm:grid-cols-2">
        <L label={t('کشور')}><input className="input" required value={f.country} onChange={(e) => up('country', e.target.value)} /></L>
        <L label={t('مهلت درخواست')}><input className="input" type="date" dir="ltr" value={f.deadline || ''} onChange={(e) => up('deadline', e.target.value || null)} /></L>
        <L label={t('مقطع')}>
          <select className="input" value={f.level} onChange={(e) => up('level', e.target.value as ScholarshipInput['level'])}>
            {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
          </select>
        </L>
        <L label={t('نوع تمویل')}>
          <select className="input" value={f.funding} onChange={(e) => up('funding', e.target.value as ScholarshipInput['funding'])}>
            <option value="full">{t('تمویل کامل')}</option>
            <option value="partial">{t('تمویل بخشی')}</option>
          </select>
        </L>
      </div>
      <L label={t('توضیحات')}><textarea className="input" rows={6} required value={f.description} onChange={(e) => up('description', e.target.value)} /></L>
      <L label={t('شرایط و مدارک مورد نیاز')}><textarea className="input" rows={5} value={f.eligibility} onChange={(e) => up('eligibility', e.target.value)} /></L>
      <L label={t('لینک درخواست (وب‌سایت رسمی)')}><input className="input" type="url" dir="ltr" required value={f.apply_url} onChange={(e) => up('apply_url', e.target.value)} /></L>
      <div className="grid gap-4 sm:grid-cols-2">
        <L label={t('نام منبع')}><input className="input" required value={f.source_name} onChange={(e) => up('source_name', e.target.value)} /></L>
        <L label={t('لینک منبع (اختیاری)')}><input className="input" type="url" dir="ltr" value={f.source_url} onChange={(e) => up('source_url', e.target.value)} /></L>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.is_published} onChange={(e) => up('is_published', e.target.checked)} />
        {t('منتشر شود (در غیر این صورت به‌عنوان پیش‌نویس ذخیره می‌شود)')}
      </label>

      <div className="flex gap-3">
        <button className="btn-primary" disabled={busy}>{busy ? t('در حال ذخیره…') : t('ذخیره')}</button>
        <button type="button" className="btn-ghost" onClick={() => nav('/admin/scholarships')}>{t('انصراف')}</button>
      </div>
    </form>
  );
}
