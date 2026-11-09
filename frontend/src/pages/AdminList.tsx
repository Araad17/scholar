import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { LEVELS, Level, fmtDate } from '../types';
import { translate as t } from '../i18n';

interface Row { id: number; title: string; country: string; level: Level; deadline: string | null; source_name: string; is_published: boolean }

export default function AdminList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');

  const load = () => api<Row[]>('/admin/scholarships', { auth: true }).then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function remove(r: Row) {
    if (!confirm(`${t('آیا این بورسیه برای همیشه حذف شود؟')} «${r.title}»`)) return;
    await api(`/admin/scholarships/${r.id}`, { method: 'DELETE', auth: true });
    load();
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-lapis sm:text-2xl">{t('مدیریت بورسیه‌ها')}</h1>
        <Link to="/admin/scholarships/new" className="btn-accent shrink-0">{t('افزودن بورسیه')}</Link>
      </div>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {rows && rows.length === 0 && <p className="py-10 text-center text-slate-500">{t('هنوز بورسیه‌ای اضافه نشده. اولین بورسیه را اضافه کنید.')}</p>}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[48rem] text-sm">
            <thead className="bg-slate-50 text-right text-slate-600">
              <tr>{['عنوان', 'کشور', 'مقطع', 'مهلت', 'منبع', 'وضعیت', ''].map((h) => <th key={h} className="px-3 py-2 font-medium">{t(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="max-w-xs px-3 py-2 font-medium">{r.title}</td>
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2">{t(LEVELS[r.level])}</td>
                  <td className="px-3 py-2">{fmtDate(r.deadline)}</td>
                  <td className="px-3 py-2">{r.source_name}</td>
                  <td className="px-3 py-2">{t(r.is_published ? 'منتشر شده' : 'پیش‌نویس')}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <Link to={`/admin/scholarships/edit/${r.id}`} className="ml-3 text-lapis hover:underline">{t('ویرایش')}</Link>
                    <button onClick={() => remove(r)} className="text-red-700 hover:underline">{t('حذف')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
