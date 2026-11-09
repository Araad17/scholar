import { Link } from 'react-router-dom';
import { formatNumber, translate as t } from '../i18n';

const checklist = [
  'بررسی شرایط و معیارهای پذیرش',
  'آماده‌سازی اسناد تحصیلی',
  'ترجمهٔ رسمی مدارک موردنیاز',
  'رزومه و انگیزه‌نامه',
  'توصیه‌نامه از استادان',
  'مدرک زبان، در صورت نیاز',
];

const steps = [
  {
    title: 'شرایط بورسیه را با دقت بخوانید',
    text: 'مقطع، رشته، شرایط سنی یا تابعیت و فهرست اسناد لازم را از صفحهٔ رسمی بورسیه بررسی کنید. شرایط هر برنامه می‌تواند متفاوت باشد.',
  },
  {
    title: 'اسناد و درخواست خود را آماده کنید',
    text: 'مدارک را با قالب و زبان خواسته‌شده آماده سازید. برای انگیزه‌نامه و رزومه زمان بگذارید و از کامل بودن اطلاعات اطمینان حاصل کنید.',
  },
  {
    title: 'درخواست را از مسیر رسمی بفرستید',
    text: 'فرم درخواست را فقط از وب‌سایت رسمی دانشگاه یا نهاد ارائه‌دهنده تکمیل کنید و رسید یا شمارهٔ پیگیری را نگه دارید.',
  },
];

export default function Guide() {
  return (
    <div className="space-y-4 pb-8">
      <nav aria-label={t('مسیر صفحه')} className="text-[11px] text-[#87938c]">
        <Link to="/" className="hover:text-[#176154]">{t('خانه')}</Link>
        <span className="mx-2">/</span>
        <span>{t('راهنمای بورسیه')}</span>
      </nav>

      <div className="flex items-start gap-2 rounded-md bg-[#fff4d9] px-4 py-3 text-xs leading-6 text-[#66562f]">
        <span aria-hidden="true" className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">i</span>
        {t('اطلاعات و شرایط هر بورسیه ممکن است تغییر کند؛ همیشه جزئیات نهایی را از منبع رسمی بررسی کنید.')}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
        <main className="min-w-0 space-y-3">
          <section className="flex flex-col-reverse items-center justify-between gap-5 rounded-lg border border-[#e2e8e0] bg-white p-5 sm:flex-row sm:p-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#e8f2eb] text-[#176154]" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9">
                <path d="m3 9 9-5 9 5-9 5-9-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7 11.2v4.3c2.8 2.2 7.2 2.2 10 0v-4.3M21 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-right">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#fff3d8] px-2.5 py-1 text-[10px] font-bold text-[#92702a]">{t('راهنمای درخواست')}</span>
                <span className="rounded-full bg-[#e8f2eb] px-2.5 py-1 text-[10px] font-bold text-[#176154]">{t('آمادگی تحصیلی')}</span>
              </div>
              <h1 className="text-xl font-black leading-9 text-[#173f3b] sm:text-2xl">{t('راهنمای درخواست بورسیهٔ تحصیلی')}</h1>
              <p className="mt-1 text-xs leading-6 text-[#819087]">{t('از بررسی شرایط تا ارسال درخواست، قدم‌به‌قدم آماده شوید.')}</p>
            </div>
          </section>

          <section className="rounded-lg border border-[#e2e8e0] bg-white p-5">
            <h2 className="mb-3 text-sm font-black text-[#234a43]">{t('دربارهٔ این راهنما')}</h2>
            <p className="text-xs leading-7 text-[#68776f]">
              {t('پیدا کردن بورسیهٔ مناسب تنها آغاز مسیر است. برای یک درخواست کامل، باید شرایط پذیرش را با وضعیت خود مقایسه کنید، اسناد را به‌موقع آماده سازید و مراحل را مطابق دستورالعمل نهاد ارائه‌دهنده انجام دهید. این راهنما کمک می‌کند کارها را منظم پیش ببرید؛ جزئیات نهایی هر برنامه را همیشه در وب‌سایت رسمی همان بورسیه تأیید کنید.')}
            </p>
            <p className="mt-3 text-[10px] leading-6 text-[#98a29b]">{t('این راهنما اطلاعات عمومی است و جایگزین شرایط رسمی برنامه یا مشاورهٔ تخصصی نیست.')}</p>
          </section>

          <section className="rounded-lg border border-[#e2e8e0] bg-white p-5">
            <h2 className="mb-3 text-sm font-black text-[#234a43]">{t('چه کسانی می‌توانند درخواست دهند؟')}</h2>
            <p className="text-xs leading-7 text-[#68776f]">
              {t('معیارهای واجد شرایط بودن در هر بورسیه فرق می‌کند. تابعیت، مدرک و سوابق تحصیلی، رشتهٔ موردنظر، سطح زبان و گاهی تجربهٔ کاری از مواردی هستند که ممکن است بررسی شوند. پیش از آماده‌سازی درخواست، تمام معیارهای برنامه را بخوانید و مطمئن شوید اسناد شما با آن‌ها مطابقت دارند.')}
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-md bg-[#fff5dd] px-3 py-2 text-[10px] leading-5 text-[#75633c]">
              <span aria-hidden="true" className="mt-0.5">ⓘ</span>
              {t('واجد شرایط بودن را از روی صفحهٔ رسمی بورسیه بسنجید؛ اطلاعات عمومی به‌تنهایی تضمین پذیرش نیست.')}
            </div>
          </section>

          <section className="rounded-lg border border-[#e2e8e0] bg-white p-5">
            <h2 className="mb-3 text-sm font-black text-[#234a43]">{t('پوشش مالی بورسیه شامل چه چیزهایی می‌شود؟')}</h2>
            <p className="text-xs leading-7 text-[#68776f]">
              {t('بورسیه‌ها ممکن است تمام یا بخشی از هزینه‌ها را پوشش دهند. شهریه، کمک‌هزینهٔ زندگی، بیمه، هزینهٔ سفر یا اقامت از موارد احتمالی‌اند؛ هیچ‌کدام را بدون بررسی شرایط رسمی، تضمین‌شده فرض نکنید.')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['شهریهٔ دانشگاه', 'کمک‌هزینهٔ زندگی', 'بیمه و سفر'].map((item) => (
                <span key={item} className="rounded-full bg-[#e8f2eb] px-2.5 py-1 text-[10px] font-bold text-[#176154]">{t(item)}</span>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-6 text-[#98a29b]">{t('موارد بالا نمونه‌اند؛ میزان و نوع پوشش را در توضیحات رسمی هر بورسیه بخوانید.')}</p>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#f0dfb6] bg-[#fff5dd] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-[#176154]" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                  <path d="M3.5 5.5c3.2-.8 6.1-.2 8.5 1.7v12c-2.4-1.9-5.3-2.5-8.5-1.7v-12ZM20.5 5.5c-3.2-.8-6.1-.2-8.5 1.7v12c2.4-1.9 5.3-2.5 8.5-1.7v-12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-bold text-[#8b713d]">{t('قدم بعدی شما')}</p>
                <h2 className="text-sm font-black leading-6 text-[#244a42]">{t('فرصت مناسب خود را پیدا کنید')}</h2>
                <p className="mt-1 text-[10px] leading-5 text-[#6e796e]">{t('فرصت‌ها را بر اساس مقطع، کشور و نوع تمویل بررسی کنید.')}</p>
              </div>
            </div>
            <Link to="/scholarships" className="shrink-0 rounded-md bg-white px-3 py-2 text-[10px] font-bold text-[#176154]">{t('دیدن بورسیه‌ها')}</Link>
          </section>

          <section className="rounded-lg border border-[#e2e8e0] bg-white p-5">
            <h2 className="mb-4 text-sm font-black text-[#234a43]">{t('مراحل درخواست')}</h2>
            <ol className="divide-y divide-[#edf0eb]">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f2eb] text-[10px] font-black text-[#176154]">{formatNumber(index + 1)}</span>
                  <div>
                    <h3 className="text-xs font-bold text-[#244a42]">{t(step.title)}</h3>
                    <p className="mt-1 text-[11px] leading-6 text-[#78867e]">{t(step.text)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </main>

        <aside className="space-y-3 lg:sticky lg:top-4">
          <section className="rounded-lg border border-[#e2e8e0] bg-white p-4">
            <h2 className="text-sm font-black text-[#234a43]">{t('برای درخواست آماده‌اید؟')}</h2>
            <p className="mt-3 text-[10px] leading-5 text-[#78867e]">{t('مهلت و شرایط هر فرصت را در صفحهٔ همان بورسیه بررسی کنید.')}</p>
            <Link to="/scholarships" className="mt-3 block rounded-md bg-[#14594f] px-3 py-2.5 text-center text-xs font-bold text-white transition-colors hover:bg-[#0f453d]">
              {t('مشاهدهٔ فرصت‌های باز')}
            </Link>
            <Link to="/register" className="mt-2 block rounded-md border border-[#dce4dc] px-3 py-2 text-center text-xs font-bold text-[#176154] hover:bg-[#f3f7f3]">
              {t('ساخت حساب کاربری')}
            </Link>
          </section>

          <section className="rounded-lg border border-[#e2e8e0] bg-white p-4">
            <h2 className="text-sm font-black text-[#234a43]">{t('چک‌لیست اسناد')}</h2>
            <ul className="mt-3 space-y-2.5">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[10px] leading-5 text-[#65766d]">
                  <span aria-hidden="true" className="mt-0.5 text-[#6a9a7e]">□</span>
                  {t(item)}
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-[#edf0eb] pt-3 text-[10px] leading-5 text-[#98a29b]">{t('فهرست نهایی مدارک را از نهاد ارائه‌دهندهٔ بورسیه بگیرید.')}</p>
          </section>

          <div className="flex items-start gap-2 rounded-md bg-[#edf5ef] px-3 py-2.5 text-[10px] leading-5 text-[#567167]">
            <span aria-hidden="true">ⓘ</span>
            {t('اسناد شخصی خود را فقط از راه‌های رسمی و امن ارسال کنید.')}
          </div>
        </aside>
      </div>
    </div>
  );
}
