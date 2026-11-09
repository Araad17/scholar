import { Link } from 'react-router-dom';
import { getUser } from '../../api';
import { useApi } from '../../hooks';
import { Badge, ErrorBox, Loading, Panel, Stat } from '../../components/ui';
import { fmtDate, fmtDateTime } from '../../types';
import { formatNumber, translate as t } from '../../i18n';

interface HomeData {
  completion: number;
  documents: { pending: number; approved: number; rejected: number; total: number };
  next_meeting: { id: number; starts_at: string; duration_min: number; topic: string; meeting_link: string } | null;
  referrals: number;
  closing_soon: { id: number; title: string; country: string; deadline: string }[];
}

export default function UHome() {
  const { data, error } = useApi<HomeData>('/user/home');
  if (error) return <ErrorBox msg={error} />;
  if (!data) return <Loading />;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="mb-5">
        <p className="text-sm text-slate-500">{t('داشبورد شخصی من')}</p>
        <h1 className="mt-1 break-words text-xl font-black text-[#173f3b] sm:text-2xl">{t('خوش آمدید')}، {getUser()?.name}!</h1>
        <p className="mt-1 text-sm text-slate-500">{t('فرصت‌های آموزشی و وضعیت درخواست‌های خود را از اینجا دنبال کنید.')}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Stat label={t('معرفی دوستان')} value={formatNumber(data.referrals)} hint={t('نفر معرفی‌شده')} />
        <Stat label={t('مدارک من')} value={formatNumber(data.documents.total)} hint={`${formatNumber(data.documents.approved)} ${t('تأییدشده')} · ${formatNumber(data.documents.pending)} ${t('در انتظار')}`} />
        <Stat label={t('تکمیل پروفایل')} value={`${formatNumber(data.completion)}${t('٪')}`} hint={data.completion < 100 ? t('برای تکمیل اقدام کنید') : t('پروفایل شما کامل است')} />
        <Stat label={t('مهلت‌های نزدیک')} value={formatNumber(data.closing_soon.length)} hint={t('فرصت بورسیه')} />
      </div>

      {data.documents.rejected > 0 && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {formatNumber(data.documents.rejected)} {t('مدرک رد شده است.')} <Link to="/dashboard/documents" className="font-bold underline">{t('دلیل را ببینید و دوباره آپلود کنید')}</Link>
        </p>
      )}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]">
        <div className="space-y-4">
          <Panel title={t('پروفایل شما')}>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">{data.completion === 100 ? t('پروفایل شما کامل شده است') : `${t('پروفایل شما')} ${formatNumber(data.completion)}${t('٪')} ${t('تکمیل شده است')}`}</p>
                <p className="mt-1 text-xs text-slate-500">{t('با تکمیل اطلاعات، شانس استفاده از فرصت‌های بورسیه را افزایش دهید.')}</p>
              </div>
              <Link to="/dashboard/profile" className="btn-primary">{t('تکمیل پروفایل')}</Link>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8f0eb]" role="progressbar" aria-label={t('درصد تکمیل پروفایل')} aria-valuenow={data.completion} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-[#14534c] transition-all" style={{ width: `${data.completion}%` }} />
            </div>
          </Panel>

          <Panel title={t('درخواست‌های من')}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[22rem] text-right text-sm">
                <thead className="bg-[#f5f5f1] text-xs text-slate-500">
                  <tr><th className="px-3 py-2 font-medium">{t('بخش')}</th><th className="px-3 py-2 font-medium">{t('وضعیت')}</th><th className="px-3 py-2 font-medium">{t('تعداد')}</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="px-3 py-3 font-bold">{t('مدارک تأییدشده')}</td><td className="px-3 py-3"><Badge tone="green">{t('تأیید شده')}</Badge></td><td className="px-3 py-3">{formatNumber(data.documents.approved)}</td></tr>
                  <tr><td className="px-3 py-3 font-bold">{t('مدارک در حال بررسی')}</td><td className="px-3 py-3"><Badge tone="yellow">{t('در انتظار')}</Badge></td><td className="px-3 py-3">{formatNumber(data.documents.pending)}</td></tr>
                  {data.documents.rejected > 0 && <tr><td className="px-3 py-3 font-bold">{t('مدارک نیازمند اصلاح')}</td><td className="px-3 py-3"><Badge tone="red">{t('نیازمند اصلاح')}</Badge></td><td className="px-3 py-3">{formatNumber(data.documents.rejected)}</td></tr>}
                </tbody>
              </table>
            </div>
            <Link to="/dashboard/documents" className="btn-ghost mt-3">{t('رفتن به اسناد')}</Link>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title={t('جلسه مشاوره بعدی')}>
            {data.next_meeting ? (
              <>
                <p className="font-bold">{data.next_meeting.topic}</p>
                <p className="mt-2 text-sm text-slate-600">{fmtDateTime(data.next_meeting.starts_at)}</p>
                <p className="mt-1 text-xs text-slate-500">{formatNumber(data.next_meeting.duration_min)} {t('دقیقه')}</p>
                {data.next_meeting.meeting_link
                  ? <a className="btn-primary mt-3" href={data.next_meeting.meeting_link} target="_blank" rel="noopener noreferrer">{t('ورود به جلسه')}</a>
                  : <p className="mt-3 text-xs text-slate-500">{t('لینک جلسه به‌زودی اضافه می‌شود.')}</p>}
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-slate-600">{t('هنوز جلسه‌ای رزرو نکرده‌اید. برای دریافت راهنمایی می‌توانید زمان مناسبی انتخاب کنید.')}</p>
                <Link to="/dashboard/meet" className="btn-primary mt-3">{t('رزرو جلسه')}</Link>
              </>
            )}
          </Panel>

          <Panel title={t('کارهای باقی‌مانده')}>
            <ul className="space-y-3 text-sm">
              <li><Link to="/dashboard/profile" className="hover:text-[#14534c] hover:underline">{t('تکمیل اطلاعات پروفایل')}</Link></li>
              <li><Link to="/dashboard/documents" className="hover:text-[#14534c] hover:underline">{t('بررسی وضعیت مدارک')}</Link></li>
              <li><Link to="/dashboard/referral" className="hover:text-[#14534c] hover:underline">{t('معرفی دوستان')}</Link></li>
            </ul>
            <Link to="/dashboard/profile" className="btn-ghost mt-4">{t('رفتن به پروفایل')}</Link>
          </Panel>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">{t('فرصت‌های بورسیه با مهلت نزدیک')}</h2>
          <Link to="/scholarships" className="btn-ghost shrink-0 text-xs">{t('همه بورسیه‌ها')}</Link>
        </div>
        {data.closing_soon.length === 0 ? (
          <Panel title={t('بورسیه‌ها')}><p className="text-sm text-slate-500">{t('فعلاً بورسیه‌ای با مهلت نزدیک موجود نیست.')}</p></Panel>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.closing_soon.map((scholarship) => (
              <article key={scholarship.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Badge tone="green">{scholarship.country}</Badge>
                <h3 className="mt-3 font-bold">{scholarship.title}</h3>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <span>{t('مهلت:')} {fmtDate(scholarship.deadline)}</span>
                  <Link to={`/scholarships/${scholarship.id}`} className="shrink-0 font-bold text-[#14534c] hover:underline">{t('مشاهده جزئیات')}</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
