import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { FUNDING, LEVELS, Scholarship, daysLeft, fmtDate } from '../types';
import { translate as t } from '../i18n';

export default function Detail() {
  const { id } = useParams();
  const [s, setS] = useState<Scholarship | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { api<Scholarship>(`/scholarships/${id}`).then(setS).catch((e) => setError(e.message)); }, [id]);

  if (error) return <p className="py-20 text-center text-red-700">{error}</p>;
  if (!s) return <p className="py-20 text-center text-slate-500">{t('در حال بارگذاری…')}</p>;

  const left = daysLeft(s.deadline);
  const expired = left !== null && left < 0;

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/" className="mb-4 inline-block text-sm text-lapis hover:underline">{t('بازگشت به فهرست')}</Link>
      <h1 className="mb-3 text-2xl font-black leading-9 text-lapis">{s.title}</h1>

      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-sm sm:grid-cols-4">
        {[
          [t('کشور'), s.country],
          [t('مقطع'), t(LEVELS[s.level])],
          [t('تمویل'), t(FUNDING[s.funding])],
          [t('مهلت'), expired ? t('تمام شده') : fmtDate(s.deadline)],
        ].map(([k, v]) => (
          <div key={k} className="bg-white p-3">
            <dt className="text-xs text-slate-500">{k}</dt>
            <dd className="mt-1 font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      {expired && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{t('مهلت درخواست این بورسیه تمام شده است.')}</p>}

      <h2 className="mb-2 mt-6 text-lg font-bold">{t('درباره بورسیه')}</h2>
      <p className="whitespace-pre-line leading-8 text-slate-700">{s.description}</p>

      {s.eligibility && (
        <>
          <h2 className="mb-2 mt-6 text-lg font-bold">{t('شرایط و مدارک')}</h2>
          <p className="whitespace-pre-line leading-8 text-slate-700">{s.eligibility}</p>
        </>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
        <a href={s.apply_url} target="_blank" rel="noopener noreferrer" className="btn-accent">{t('درخواست در وب‌سایت رسمی')}</a>
        <span className="min-w-0 break-words text-sm text-slate-500">
          {t('منبع')}: {s.source_url ? <a className="break-all text-lapis underline" href={s.source_url} target="_blank" rel="noopener noreferrer">{s.source_name}</a> : s.source_name}
        </span>
      </div>
    </article>
  );
}
