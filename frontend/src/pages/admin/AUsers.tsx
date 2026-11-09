import { FormEvent, Fragment, useState } from 'react';
import { api, getUser, openFile } from '../../api';
import { useApi } from '../../hooks';
import { DOC_STATUS, DOC_TYPES, EDU, ENGLISH, fmtDateTime } from '../../types';
import { Badge, ErrorBox, Loading, OkBox, statusTone } from '../../components/ui';
import { translate as t } from '../../i18n';

interface Row { id: number; name: string; email: string; role: string; created_at: string; documents: number; referrals: number }
interface Detail {
  user: { referral_code: string };
  profile: Record<string, string | number | null> | null;
  documents: { id: number; type: string; original_name: string; status: string }[];
}

export default function AUsers() {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const { data, error, reload } = useApi<Row[]>(`/admin/users?q=${encodeURIComponent(query)}`);
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const admin = getUser();

  async function toggle(id: number) {
    if (openId === id) return setOpenId(null);
    setOpenId(id); setDetail(null); setErr(''); setEditId(null);
    try { setDetail(await api<Detail>(`/admin/users/${id}`, { auth: true })); } catch (e) { setErr((e as Error).message); }
  }

  function startEdit(user: Row) {
    setOpenId(user.id);
    setDetail(null);
    setEditId(user.id);
    setEditForm({ name: user.name, email: user.email, password: '' });
    setErr('');
    setNotice('');
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (editId === null) return;
    setSaving(true);
    setErr('');
    setNotice('');
    try {
      await api(`/admin/users/${editId}`, {
        method: 'PATCH',
        auth: true,
        body: {
          name: editForm.name,
          email: editForm.email,
          ...(editForm.password ? { password: editForm.password } : {}),
        },
      });
      setEditId(null);
      setNotice(t('اطلاعات کاربر به‌روز شد.'));
      reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user: Row) {
    if (!confirm(`${t('آیا حساب این کاربر و تمام اطلاعات پروفایل و مدارک حذف شود؟ این کار برگشت‌پذیر نیست.')} «${user.name}»`)) return;
    setDeletingId(user.id);
    setErr('');
    setNotice('');
    try {
      const result = await api<{ warning?: string }>(`/admin/users/${user.id}`, { method: 'DELETE', auth: true });
      setNotice(result.warning || t('حساب کاربر حذف شد.'));
      if (openId === user.id) setOpenId(null);
      if (editId === user.id) setEditId(null);
      reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  const p = detail?.profile;
  const items: [string, string | number | null | undefined][] = p ? [
    ['تلفن', p.phone], ['تولد', p.date_of_birth], ['ولایت', p.province],
    ['تحصیلات', p.education_level ? t(EDU[p.education_level as string]) : null], ['مکتب/دانشگاه', p.institution],
    ['رشته', p.field_of_study], ['معدل', p.gpa], ['انگلیسی', p.english_level ? t(ENGLISH[p.english_level as string]) : null],
    ['کشورهای هدف', p.target_countries],
  ] : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-lapis">{t('کاربران')}</h1>
      <form onSubmit={(e: FormEvent) => { e.preventDefault(); setQuery(q.trim()); }} className="flex gap-2">
        <input className="input min-w-0" placeholder={t('جستجو با نام یا ایمیل…')} value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary shrink-0">{t('جستجو')}</button>
      </form>
      <ErrorBox msg={err || error} />
      <OkBox msg={notice} />
      {!data && !error && <Loading />}
      {data && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[48rem] text-sm">
            <thead className="bg-slate-50 text-right text-slate-600">
              <tr>{['نام', 'ایمیل', 'نقش', 'مدارک', 'معرفی‌ها', 'عضویت', 'مدیریت'].map((h) => <th key={h} className="px-3 py-2 font-medium">{t(h)}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <Fragment key={u.id}>
                  <tr className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium">{u.name}</td>
                    <td className="px-3 py-2" dir="ltr">{u.email}</td>
                    <td className="px-3 py-2">{u.role === 'admin' ? <Badge tone="blue">{t('ادمین')}</Badge> : t('کاربر')}</td>
                    <td className="px-3 py-2">{u.documents}</td>
                    <td className="px-3 py-2">{u.referrals}</td>
                    <td className="px-3 py-2">{fmtDateTime(u.created_at)}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <button className="ml-3 text-lapis hover:underline" onClick={() => toggle(u.id)}>{openId === u.id ? t('بستن') : t('جزئیات')}</button>
                      {u.role === 'user' && admin?.id !== u.id && (
                        <>
                          <button className="ml-3 text-emerald-700 hover:underline" onClick={() => startEdit(u)}>{t('ویرایش')}</button>
                          <button className="text-red-700 hover:underline disabled:opacity-50" disabled={deletingId === u.id} onClick={() => deleteUser(u)}>
                            {deletingId === u.id ? t('در حال حذف…') : t('حذف')}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {openId === u.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="space-y-3">
                            {editId === u.id && (
                              <form onSubmit={saveEdit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                                <h2 className="font-bold">{t('ویرایش اطلاعات کاربر')}</h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <label className="block text-sm">{t('نام کامل')}
                                    <input className="input mt-1" required minLength={2} maxLength={100} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                                  </label>
                                  <label className="block text-sm">{t('ایمیل')}
                                    <input className="input mt-1" type="email" dir="ltr" required maxLength={255} value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                                  </label>
                                  <label className="block text-sm sm:col-span-2">{t('رمز عبور تازه (اختیاری)')}
                                    <input className="input mt-1" type="password" dir="ltr" autoComplete="new-password" minLength={8} maxLength={100} placeholder={t('خالی بگذارید تا رمز فعلی تغییر نکند')} value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} />
                                  </label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button className="btn-primary" disabled={saving}>{saving ? t('در حال ذخیره…') : t('ذخیره تغییرات')}</button>
                                  <button type="button" className="btn-ghost" onClick={() => setEditId(null)}>{t('انصراف')}</button>
                                </div>
                              </form>
                            )}
                            {!detail ? <Loading /> : (
                              <>
                            <p className="text-xs text-slate-500">{t('کد معرفی:')} <span dir="ltr">{detail.user.referral_code}</span></p>
                            {!p ? <p className="text-sm text-slate-500">{t('این کاربر هنوز پروفایل را پر نکرده است.')}</p> : (
                              <dl className="grid gap-3 sm:grid-cols-3">
                                {items.map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{t(k)}</dt><dd>{v ?? '—'}</dd></div>)}
                                {p.bio && <div className="sm:col-span-3"><dt className="text-xs text-slate-500">{t('درباره')}</dt><dd className="whitespace-pre-line">{p.bio}</dd></div>}
                              </dl>
                            )}
                            <div>
                              <p className="mb-1 text-xs text-slate-500">{t('مدارک')}</p>
                              {detail.documents.length === 0 ? <p className="text-sm text-slate-500">{t('مدرکی ندارد.')}</p> : (
                                <ul className="space-y-1 text-sm">
                                  {detail.documents.map((d) => (
                                    <li key={d.id} className="flex flex-wrap items-center gap-3">
                                      <span className="break-all">{t(DOC_TYPES[d.type])} · {d.original_name}</span>
                                      <Badge tone={statusTone(d.status)}>{t(DOC_STATUS[d.status])}</Badge>
                                      <button className="text-lapis hover:underline" onClick={() => openFile(d.id).catch((e) => setErr(e.message))}>{t('مشاهده')}</button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
