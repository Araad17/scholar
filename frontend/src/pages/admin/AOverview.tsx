import { Link } from 'react-router-dom';
import { useApi } from '../../hooks';
import { AdminPanel } from '../../components/AdminDashboard';
import { Badge, ErrorBox, Loading, Stat } from '../../components/ui';
import { fmtDate, fmtDateTime } from '../../types';
import { formatNumber, translate as t } from '../../i18n';

interface Stats { users: number; new_users: number; scholarships: number; pending_documents: number; upcoming_meetings: number; referred_users: number }
interface Scholarship { id: number; title: string; country: string; deadline: string | null; is_published: boolean; source_name: string; created_at: string }
interface Document { id: number; original_name: string; created_at: string; user_name: string; user_email: string }
interface Meeting { id: number; starts_at: string; status: string; user_name: string | null; topic: string | null }
interface User { id: number; name: string; created_at: string }

export default function AOverview() {
  const { data, error } = useApi<Stats>('/admin/stats');
  const { data: scholarships, error: scholarshipError } = useApi<Scholarship[]>('/admin/scholarships');
  const { data: pendingDocs, error: documentError } = useApi<Document[]>('/admin/documents?status=pending');
  const { data: meetings, error: meetingError } = useApi<Meeting[]>('/admin/meetings');
  const { data: users, error: userError } = useApi<User[]>('/admin/users');
  const errors = [error, scholarshipError, documentError, meetingError, userError].filter(Boolean).join(' · ');
  if (error && !data) return <ErrorBox msg={error} />;
  if (!data) return <Loading />;

  const allScholarships = scholarships ?? [];
  const published = allScholarships.filter((scholarship) => scholarship.is_published).length;
  const drafts = allScholarships.length - published;
  const today = new Date().toISOString().slice(0, 10);
  const upcomingScholarships = allScholarships
    .filter((scholarship) => scholarship.is_published && scholarship.deadline && scholarship.deadline >= today)
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''));
  const nextMeetings = (meetings ?? [])
    .filter((meeting) => meeting.status === 'booked' && new Date(meeting.starts_at).getTime() >= Date.now())
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 2);
  const activity = [
    ...(users ?? []).map((user) => ({ id: `u-${user.id}`, label: `${t('ثبت‌نام')} ${user.name}`, date: user.created_at, type: 'کاربر', status: 'ثبت‌نام جدید' })),
    ...allScholarships.map((scholarship) => ({ id: `s-${scholarship.id}`, label: scholarship.title, date: scholarship.created_at, type: 'بورسیه', status: scholarship.is_published ? 'منتشرشده' : 'پیش‌نویس' })),
    ...(pendingDocs ?? []).map((doc) => ({ id: `d-${doc.id}`, label: `${t('ارسال مدرک توسط')} ${doc.user_name}`, date: doc.created_at, type: 'مدرک', status: 'در انتظار بررسی' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{t('مدیریت سایت')} / {t('نمای کلی')}</p>
          <h1 className="mt-1 text-xl font-black text-[#173f3b] sm:text-2xl">{t('نمای کلی مدیریت')}</h1>
        </div>
        <Link to="/admin/scholarships/new" className="btn-primary">＋ {t('افزودن بورسیه')}</Link>
      </div>

      {errors && <ErrorBox msg={errors} />}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#f1e4bf] bg-[#fff4d8] px-4 py-3 text-xs text-[#745a1d]">
        <span aria-hidden="true">ⓘ</span>
        <p className="min-w-0 flex-1">{t('چند کار مهم در انتظار بررسی شماست؛ وضعیت بورسیه‌ها و مدارک کاربران را بررسی کنید.')}</p>
        {data.pending_documents > 0 && <Link to="/admin/documents" className="shrink-0 font-bold underline">{formatNumber(data.pending_documents)} {t('مدرک منتظر بررسی')}</Link>}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <Stat label={t('بورسیه‌های منتشرشده')} value={formatNumber(data.scholarships)} hint={t('فرصت فعال در سامانه')} />
        <Stat label={t('کاربران ثبت‌نام‌شده')} value={formatNumber(data.users)} hint={`${formatNumber(data.new_users)} ${t('کاربر جدید در ۷ روز اخیر')}`} />
        <Stat label={t('جلسه‌های پیش‌رو')} value={formatNumber(data.upcoming_meetings)} hint={t('جلسه رزروشده با کاربران')} />
        <Stat label={t('مدارک در انتظار بررسی')} value={formatNumber(data.pending_documents)} hint={t('نیازمند اقدام مدیر')} />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(15rem,0.8fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <AdminPanel title={t('اولویت‌های امروز')}>
            <div className="space-y-3">
              <div className="rounded-lg bg-[#fbfaf6] p-3">
                <Badge tone={data.pending_documents ? 'yellow' : 'green'}>{data.pending_documents ? `${formatNumber(data.pending_documents)} ${t('مورد')}` : t('انجام‌شده')}</Badge>
                <p className="mt-2 text-sm font-bold">{t('مدارک در انتظار بررسی')}</p>
                <p className="mt-1 text-xs text-slate-500">{t('مدارک ارسال‌شده را بررسی و نتیجه را ثبت کنید.')}</p>
              </div>
              <div className="rounded-lg bg-[#fbfaf6] p-3">
                <Badge tone={data.upcoming_meetings ? 'blue' : 'gray'}>{formatNumber(data.upcoming_meetings)} {t('جلسه')}</Badge>
                <p className="mt-2 text-sm font-bold">{t('جلسات آینده')}</p>
                {nextMeetings.length ? (
                  <ul className="mt-2 space-y-2 text-xs text-slate-600">
                    {nextMeetings.map((meeting) => (
                      <li key={meeting.id}>
                        {meeting.user_name || t('کاربر')}{meeting.topic ? ` · ${meeting.topic}` : ''}
                        <span className="block text-slate-500">{fmtDateTime(meeting.starts_at)}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-1 text-xs text-slate-500">{t('زمان و لینک جلسه‌های رزروشده را مدیریت کنید.')}</p>}
                <Link to="/admin/meetings" className="mt-2 inline-block text-xs font-bold text-[#14534c] hover:underline">{t('مدیریت جلسات')}</Link>
              </div>
              <div className="rounded-lg bg-[#fbfaf6] p-3">
                <Badge tone="green">{formatNumber(data.new_users)} {t('کاربر')}</Badge>
                <p className="mt-2 text-sm font-bold">{t('ثبت‌نام‌های جدید')}</p>
                <p className="mt-1 text-xs text-slate-500">{t('کاربران تازه‌وارد هفته اخیر.')}</p>
              </div>
              <Link to="/admin/documents" className="btn-ghost w-full">{t('رفتن به بررسی مدارک')}</Link>
            </div>
          </AdminPanel>

          <AdminPanel title={t('اقدام‌های سریع')}>
            <div className="grid gap-2">
              <Link to="/admin/scholarships/new" className="btn-ghost justify-start">{t('افزودن بورسیه جدید')}</Link>
              <Link to="/admin/meetings" className="btn-ghost justify-start">{t('افزودن زمان جلسه')}</Link>
              <Link to="/admin/documents" className="btn-ghost justify-start">{t('بررسی مدارک')}</Link>
            </div>
          </AdminPanel>
        </div>

        <div className="space-y-4">
          <AdminPanel title={t('مهلت‌های نزدیک')}>
            {!scholarships && !scholarshipError ? <Loading /> : upcomingScholarships.length === 0 ? (
              <p className="text-sm text-slate-500">{t('بورسیهٔ منتشرشده‌ای با مهلت آینده موجود نیست.')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[35rem] text-right text-sm">
                  <thead className="bg-[#f5f5f1] text-xs text-slate-500">
                    <tr><th className="px-3 py-2 font-medium">{t('بورسیه')}</th><th className="px-3 py-2 font-medium">{t('مهلت')}</th><th className="px-3 py-2 font-medium">{t('منبع')}</th><th className="px-3 py-2 font-medium">{t('وضعیت')}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {upcomingScholarships.slice(0, 4).map((scholarship) => (
                      <tr key={scholarship.id}>
                        <td className="px-3 py-3 font-bold">{scholarship.title}<span className="block text-xs font-normal text-slate-500">{scholarship.country}</span></td>
                        <td className="px-3 py-3 text-xs">{fmtDate(scholarship.deadline)}</td>
                        <td className="px-3 py-3 text-xs">{scholarship.source_name}</td>
                        <td className="px-3 py-3"><Badge tone={scholarship.is_published ? 'green' : 'yellow'}>{t(scholarship.is_published ? 'منتشرشده' : 'پیش‌نویس')}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminPanel>

          <AdminPanel title={t('وضعیت محتوای بورسیه‌ها')}>
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <Badge tone="green">{t('منتشرشده')}: {formatNumber(published)}</Badge>
              <Badge tone="yellow">{t('پیش‌نویس')}: {formatNumber(drafts)}</Badge>
              <Badge tone="gray">{t('کل:')} {formatNumber(allScholarships.length)}</Badge>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${t('وضعیت بورسیه‌ها:')} ${formatNumber(published)} ${t('منتشرشده')} ${t('و')} ${formatNumber(drafts)} ${t('پیش‌نویس')}`}>
              <div className="h-full bg-[#14534c]" style={{ width: `${allScholarships.length ? published / allScholarships.length * 100 : 0}%` }} />
              <div className="h-full bg-[#e8ae3b]" style={{ width: `${allScholarships.length ? drafts / allScholarships.length * 100 : 0}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-500">{t('وضعیت انتشار بورسیه‌های ثبت‌شده را مدیریت کنید.')}</p>
          </AdminPanel>
        </div>
      </div>

      <AdminPanel title={t('تازه‌ترین فعالیت‌ها')}>
        {activity.length === 0 ? <p className="text-sm text-slate-500">{t('فعالیت تازه‌ای ثبت نشده است.')}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-right text-sm">
              <thead className="bg-[#f5f5f1] text-xs text-slate-500">
                <tr><th className="px-3 py-2 font-medium">{t('فعالیت')}</th><th className="px-3 py-2 font-medium">{t('زمان')}</th><th className="px-3 py-2 font-medium">{t('بخش')}</th><th className="px-3 py-2 font-medium">{t('وضعیت')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activity.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3 font-bold">{item.label}</td>
                    <td className="px-3 py-3 text-xs">{fmtDateTime(item.date)}</td>
                    <td className="px-3 py-3 text-xs">{t(item.type)}</td>
                    <td className="px-3 py-3"><Badge tone={item.status === 'در انتظار بررسی' || item.status === 'پیش‌نویس' ? 'yellow' : 'green'}>{t(item.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      {data.referred_users > 0 && (
        <p className="text-xs text-slate-500">{t('کاربران معرفی‌شده در سامانه:')} {formatNumber(data.referred_users)}</p>
      )}
    </div>
  );
}
