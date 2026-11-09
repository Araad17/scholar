import { useState } from 'react';
import { useApi } from '../../hooks';
import { fmtDateTime } from '../../types';
import { ErrorBox, Loading, Panel, Stat } from '../../components/ui';
import { translate as t } from '../../i18n';

interface Ref { code: string; total: number; items: { name: string; created_at: string }[] }

export default function UReferral() {
  const { data, error } = useApi<Ref>('/user/referrals');
  const [copied, setCopied] = useState(false);
  if (error) return <ErrorBox msg={error} />;
  if (!data) return <Loading />;

  const link = `${window.location.origin}/register?ref=${data.code}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-lapis">{t('معرفی دوستان')}</h1>
      <p className="text-sm text-slate-600">{t('لینک اختصاصی خود را با دوستانتان به اشتراک بگذارید تا از بورسیه‌ها باخبر شوند.')}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label={t('کد معرفی شما')} value={<span dir="ltr" className="tracking-widest">{data.code}</span>} />
        <Stat label={t('تعداد ثبت‌نام‌های موفق')} value={data.total} />
      </div>

      <Panel title={t('لینک معرفی')}>
        <div className="flex gap-2">
          <input readOnly dir="ltr" className="input min-w-0" value={link} onFocus={(e) => e.target.select()} />
          <button className="btn-primary shrink-0" onClick={copy}>{copied ? t('کپی شد ✓') : t('کپی')}</button>
        </div>
      </Panel>

      <Panel title={t('دوستان معرفی‌شده')}>
        {data.items.length === 0 ? <p className="text-sm text-slate-500">{t('هنوز کسی با لینک شما ثبت‌نام نکرده است.')}</p> : (
          <ul className="divide-y divide-slate-100 text-sm">
            {data.items.map((r, i) => (
              <li key={i} className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-2"><span>{r.name}</span><span className="text-slate-500">{fmtDateTime(r.created_at)}</span></li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
