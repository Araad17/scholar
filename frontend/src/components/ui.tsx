import { ReactNode } from 'react';
import { translate as t } from '../i18n';

const TONES: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-800', yellow: 'bg-amber-50 text-amber-800',
  red: 'bg-red-50 text-red-700', blue: 'bg-lapis-light text-lapis', gray: 'bg-slate-100 text-slate-700',
};
export const Badge = ({ tone = 'gray', children }: { tone?: string; children: ReactNode }) => (
  <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>
);
export const statusTone = (s: string) =>
  ({ approved: 'green', completed: 'green', pending: 'yellow', booked: 'blue', rejected: 'red', cancelled: 'red', open: 'gray' }[s] || 'gray');

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block text-sm font-medium">{label}<div className="mt-1 font-normal">{children}</div></label>
);

export const ErrorBox = ({ msg }: { msg: string }) => (msg ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{t(msg)}</p> : null);
export const OkBox = ({ msg }: { msg: string }) => (msg ? <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-800">{t(msg)}</p> : null);
export const Loading = () => <p className="py-10 text-center text-slate-500">{t('در حال بارگذاری…')}</p>;

export const Stat = ({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) => (
  <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 break-words text-xl font-black text-lapis sm:text-2xl">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

export const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
    <h2 className="mb-3 text-base font-bold">{title}</h2>
    {children}
  </section>
);
