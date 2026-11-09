import { useState } from 'react';
import { api, openFile } from '../../api';
import { useApi } from '../../hooks';
import { DOC_STATUS, DOC_TYPES, fmtDateTime, fmtSize } from '../../types';
import { Badge, ErrorBox, Loading, statusTone } from '../../components/ui';
import { translate as t } from '../../i18n';

interface Doc { id: number; type: string; original_name: string; size: number; status: string; admin_note: string | null; created_at: string; user_name: string; user_email: string }

export default function ADocuments() {
  const [status, setStatus] = useState('pending');
  const { data, error, reload } = useApi<Doc[]>(`/admin/documents?status=${status}`);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [err, setErr] = useState('');

  async function review(d: Doc, next: 'approved' | 'rejected') {
    const note = notes[d.id] ?? d.admin_note ?? '';
    if (next === 'rejected' && !note.trim()) return setErr(t('برای رد کردن مدرک، دلیل را بنویسید.'));
    setErr('');
    try {
      await api(`/admin/documents/${d.id}`, { method: 'PATCH', body: { status: next, admin_note: note }, auth: true });
      reload();
    } catch (e) { setErr((e as Error).message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-lapis sm:text-2xl">{t('بررسی مدارک')}</h1>
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">{t('در انتظار بررسی')}</option><option value="approved">{t('تأیید شده')}</option>
          <option value="rejected">{t('رد شده')}</option><option value="">{t('همه')}</option>
        </select>
      </div>
      <ErrorBox msg={err || error} />
      {!data && !error && <Loading />}
      {data?.length === 0 && <p className="py-8 text-center text-slate-500">{t('مدرکی در این وضعیت نیست.')}</p>}
      <ul className="space-y-3">
        {data?.map((d) => (
          <li key={d.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="break-words font-medium">{t(DOC_TYPES[d.type])} <span className="break-all text-sm font-normal text-slate-500">· {d.original_name} · {fmtSize(d.size)}</span></p>
                <p className="text-xs text-slate-500">{d.user_name} (<span dir="ltr">{d.user_email}</span>) · {fmtDateTime(d.created_at)}</p>
              </div>
              <Badge tone={statusTone(d.status)}>{t(DOC_STATUS[d.status])}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button className="btn-ghost !py-1" onClick={() => openFile(d.id).catch((e) => setErr(e.message))}>{t('مشاهده فایل')}</button>
              <input className="input min-w-48 flex-1" placeholder={t('یادداشت برای کاربر (برای رد کردن الزامی است)')}
                value={notes[d.id] ?? d.admin_note ?? ''} onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))} />
              <button className="btn-primary !py-1" onClick={() => review(d, 'approved')}>{t('تأیید')}</button>
              <button className="btn !border !border-red-300 !py-1 text-red-700 hover:bg-red-50" onClick={() => review(d, 'rejected')}>{t('رد')}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
