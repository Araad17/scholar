import { FormEvent, useRef, useState } from 'react';
import { api, openFile } from '../../api';
import { useApi } from '../../hooks';
import { DOC_STATUS, DOC_TYPES, fmtDateTime, fmtSize } from '../../types';
import { Badge, ErrorBox, Field, Loading, OkBox, statusTone } from '../../components/ui';
import { translate as t } from '../../i18n';

interface Doc { id: number; type: string; original_name: string; size: number; status: string; admin_note: string | null; created_at: string }

export default function UDocuments() {
  const { data, error, reload } = useApi<Doc[]>('/documents');
  const [type, setType] = useState('passport');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(e: FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return setErr(t('یک فایل انتخاب کنید'));
    setBusy(true); setErr(''); setMsg('');
    try {
      const form = new FormData();
      form.append('type', type);
      form.append('file', file);
      await api('/documents', { method: 'POST', form, auth: true });
      if (fileRef.current) fileRef.current.value = '';
      setMsg(t('مدرک آپلود شد و در انتظار بررسی است.'));
      reload();
    } catch (e2) { setErr((e2 as Error).message); } finally { setBusy(false); }
  }

  async function remove(d: Doc) {
    if (!confirm(`${t('حذف شود؟')} «${d.original_name}»`)) return;
    try { await api(`/documents/${d.id}`, { method: 'DELETE', auth: true }); reload(); } catch (e2) { setErr((e2 as Error).message); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-lapis">{t('مدارک من')}</h1>

      <form onSubmit={upload} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
        <Field label={t('نوع مدرک')}>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
          </select>
        </Field>
        <Field label={t('فایل (PDF، JPG یا PNG — حداکثر ۵ مگابایت)')}>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" />
        </Field>
        <button className="btn-primary" disabled={busy}>{busy ? t('در حال آپلود…') : t('آپلود')}</button>
      </form>

      <ErrorBox msg={err || error} /><OkBox msg={msg} />
      {!data && !error && <Loading />}
      {data && data.length === 0 && <p className="py-8 text-center text-slate-500">{t('هنوز مدرکی آپلود نکرده‌اید.')}</p>}

      <ul className="space-y-3">
        {data?.map((d) => (
          <li key={d.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{t(DOC_TYPES[d.type])} <span className="text-sm font-normal text-slate-500">· {d.original_name}</span></p>
                <p className="text-xs text-slate-500">{fmtSize(d.size)} · {fmtDateTime(d.created_at)}</p>
              </div>
              <Badge tone={statusTone(d.status)}>{t(DOC_STATUS[d.status])}</Badge>
            </div>
            {d.admin_note && <p className="mt-2 rounded bg-slate-50 p-2 text-sm">{t('یادداشت ادمین:')} {d.admin_note}</p>}
            <div className="mt-3 flex gap-4 text-sm">
              <button className="text-lapis hover:underline" onClick={() => openFile(d.id).catch((e2) => setErr(e2.message))}>{t('مشاهده')}</button>
              <button className="text-red-700 hover:underline" onClick={() => remove(d)}>{t('حذف')}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
