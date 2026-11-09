import { FormEvent, useState } from 'react';
import { api } from '../../api';
import { useApi } from '../../hooks';
import { MEET_STATUS, fmtDateTime } from '../../types';
import { Badge, ErrorBox, Field, Loading, Panel, statusTone } from '../../components/ui';
import { translate as t } from '../../i18n';

interface Slot { id: number; starts_at: string; duration_min: number; meeting_link: string; status: string; topic: string | null; user_name: string | null; user_email: string | null }

export default function AMeetings() {
  const { data, error, reload } = useApi<Slot[]>('/admin/meetings');
  const [when, setWhen] = useState('');
  const [duration, setDuration] = useState(30);
  const [link, setLink] = useState('');
  const [err, setErr] = useState('');

  const run = async (fn: () => Promise<unknown>) => {
    setErr('');
    try { await fn(); reload(); } catch (e) { setErr((e as Error).message); }
  };

  const create = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api('/admin/meetings', { method: 'POST', auth: true, body: { starts_at: new Date(when).toISOString(), duration_min: duration, meeting_link: link } });
      setWhen('');
    });
  };
  const patch = (id: number, body: object) => run(() => api(`/admin/meetings/${id}`, { method: 'PATCH', body, auth: true }));
  const remove = (id: number) => confirm(t('این زمان حذف شود؟')) && run(() => api(`/admin/meetings/${id}`, { method: 'DELETE', auth: true }));
  const editLink = (s: Slot) => { const v = prompt(t('لینک جلسه (Google Meet / Zoom):'), s.meeting_link); if (v !== null) patch(s.id, { meeting_link: v.trim() }); };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-lapis">{t('جلسات مشاوره')}</h1>
      <Panel title={t('افزودن زمان جدید')}>
        <form onSubmit={create} className="grid min-w-0 gap-3 sm:grid-cols-2 sm:items-end xl:grid-cols-[minmax(0,1.5fr)_minmax(5rem,1fr)_minmax(0,2fr)_auto]">
          <Field label={t('تاریخ و ساعت (به وقت دستگاه شما)')}><input className="input" type="datetime-local" dir="ltr" required value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
          <Field label={t('مدت (دقیقه)')}><input className="input" type="number" min={10} max={240} dir="ltr" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></Field>
          <Field label={t('لینک جلسه (اختیاری)')}><input className="input" type="url" dir="ltr" value={link} onChange={(e) => setLink(e.target.value)} /></Field>
          <button className="btn-accent">{t('افزودن')}</button>
        </form>
      </Panel>

      <ErrorBox msg={err || error} />
      {!data && !error && <Loading />}
      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[42rem] text-sm">
            <thead className="bg-slate-50 text-right text-slate-600">
              <tr>{['زمان', 'مدت', 'وضعیت', 'کاربر / موضوع', ''].map((h) => <th key={h} className="px-3 py-2 font-medium">{t(h)}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2">{fmtDateTime(s.starts_at)}</td>
                  <td className="px-3 py-2">{s.duration_min}</td>
                  <td className="px-3 py-2"><Badge tone={statusTone(s.status)}>{t(MEET_STATUS[s.status])}</Badge></td>
                  <td className="px-3 py-2">{s.user_name ? <>{s.user_name} <span className="text-xs text-slate-500" dir="ltr">({s.user_email})</span><br /><span className="text-slate-600">{s.topic}</span></> : '—'}</td>
                  <td className="space-x-3 space-x-reverse whitespace-nowrap px-3 py-2">
                    <button className="text-lapis hover:underline" onClick={() => editLink(s)}>{t(s.meeting_link ? 'تغییر لینک' : 'افزودن لینک')}</button>
                    {s.status === 'booked' && <button className="text-emerald-700 hover:underline" onClick={() => patch(s.id, { status: 'completed' })}>{t('انجام شد')}</button>}
                    {(s.status === 'booked' || s.status === 'open') && <button className="text-amber-700 hover:underline" onClick={() => patch(s.id, { status: 'cancelled' })}>{t('لغو')}</button>}
                    <button className="text-red-700 hover:underline" onClick={() => remove(s.id)}>{t('حذف')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
