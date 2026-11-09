import { useState } from 'react';
import { api } from '../../api';
import { useApi } from '../../hooks';
import { MEET_STATUS, fmtDateTime } from '../../types';
import { Badge, ErrorBox, Field, Loading, OkBox, Panel, statusTone } from '../../components/ui';
import { translate as t } from '../../i18n';

interface Slot { id: number; starts_at: string; duration_min: number }
interface Mine extends Slot { meeting_link: string; status: string; topic: string }

export default function UMeet() {
  const open = useApi<Slot[]>('/meetings/open');
  const mine = useApi<Mine[]>('/meetings/mine');
  const [topic, setTopic] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const refresh = () => { open.reload(); mine.reload(); };

  async function act(path: string, body?: unknown, okMsg = '') {
    setErr(''); setMsg('');
    try { await api(path, { method: 'POST', body, auth: true }); setMsg(okMsg); refresh(); } catch (e) { setErr((e as Error).message); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-lapis">{t('جلسه مشاوره')}</h1>
      <p className="text-sm text-slate-600">{t('یک زمان آزاد انتخاب کنید و موضوع مشاوره را بنویسید. لینک جلسه پس از رزرو برای شما نمایش داده می‌شود.')}</p>
      <ErrorBox msg={err} /><OkBox msg={msg} />

      <Panel title={t('جلسات من')}>
        {!mine.data ? <Loading /> : mine.data.length === 0 ? <p className="text-sm text-slate-500">{t('هنوز جلسه‌ای رزرو نکرده‌اید.')}</p> : (
          <ul className="divide-y divide-slate-100">
            {mine.data.map((m) => {
              const future = new Date(m.starts_at).getTime() > Date.now();
              return (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">{fmtDateTime(m.starts_at)} · {m.duration_min} {t('دقیقه')}</p>
                    <p className="text-slate-600">{t('موضوع:')} {m.topic}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone(m.status)}>{t(MEET_STATUS[m.status])}</Badge>
                    {m.status === 'booked' && m.meeting_link && <a className="text-lapis underline" href={m.meeting_link} target="_blank" rel="noopener noreferrer">{t('لینک جلسه')}</a>}
                    {m.status === 'booked' && future && <button className="text-red-700 hover:underline" onClick={() => act(`/meetings/${m.id}/cancel`, undefined, t('جلسه لغو شد.'))}>{t('لغو')}</button>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title={t('زمان‌های آزاد')}>
        <Field label={t('موضوع جلسه')}>
          <input className="input" placeholder={t('مثلاً: راهنمایی برای درخواست بورسیه ترکیه')} value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
        {!open.data ? <Loading /> : open.data.length === 0 ? <p className="mt-4 text-sm text-slate-500">{t('فعلاً زمان آزادی وجود ندارد. بعداً دوباره سر بزنید.')}</p> : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {open.data.map((s) => (
              <li key={s.id} className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded border border-slate-200 p-3 text-sm">
                <span className="min-w-0">{fmtDateTime(s.starts_at)} <span className="text-slate-500">· {s.duration_min} {t('دقیقه')}</span></span>
                <button className="btn-accent shrink-0 !py-1" onClick={() => act(`/meetings/${s.id}/book`, { topic }, t('جلسه رزرو شد.'))}>{t('رزرو')}</button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
