import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import Card from '../components/Card';
import { LEVELS, Page, ScholarshipCard } from '../types';
import { translate as t } from '../i18n';
import { formatNumber } from '../i18n';

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8 shrink-0">
      <path d="M3.5 5.5c3.2-.8 6.1-.2 8.5 1.7v12c-2.4-1.9-5.3-2.5-8.5-1.7v-12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20.5 5.5c-3.2-.8-6.1-.2-8.5 1.7v12c2.4-1.9 5.3-2.5 8.5-1.7v-12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState<Page<ScholarshipCard> | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [countriesError, setCountriesError] = useState('');
  const [error, setError] = useState('');
  const [q, setQ] = useState(sp.get('q') || '');

  useEffect(() => {
    api<string[]>('/scholarships/countries')
      .then(setCountries)
      .catch((e: Error) => setCountriesError(e.message));
  }, []);

  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    api<Page<ScholarshipCard>>(`/scholarships?${sp.toString()}`)
      .then((result) => { if (active) setData(result); })
      .catch((e: Error) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [sp]);

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    if (k !== 'page') n.delete('page');
    setSp(n);
  };
  const page = Number(sp.get('page') || 1);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    set('q', q.trim());
  };

  return (
    <div className="home-page space-y-8 pb-2 sm:space-y-10">
      <div className="flex items-start gap-2 rounded-md bg-[#fff4d9] px-4 py-3 text-xs leading-6 text-[#66562f]">
        <span aria-hidden="true" className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">i</span>
        {t('اطلاعات هر فرصت را پیش از ارسال درخواست، در وب‌سایت رسمی دانشگاه یا نهاد ارائه‌دهنده بررسی کنید.')}
      </div>

      <section className="grid items-center gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(280px,.8fr)] md:gap-10">
        <div>
          <span className="mb-3 inline-flex rounded-full bg-[#e6f1eb] px-3 py-1 text-xs font-bold text-[#19564c]">{t('راه آینده از همین‌جا آغاز می‌شود')}</span>
          <h1 className="mb-4 text-3xl font-black leading-[1.65] text-[#173f3b] sm:text-4xl">
            {t('آیندهٔ تحصیلی شما، از یک فرصت آغاز می‌شود.')}
          </h1>
          <p className="mb-5 max-w-2xl text-sm leading-7 text-[#697a73] sm:text-base">
            {t('فرصت‌های معتبر بورسیه را یک‌جا پیدا کنید، شرایط را بسنجید و با اطمینان برای ادامهٔ تحصیل برنامه‌ریزی کنید.')}
          </p>
          <p className="mb-2 text-sm font-bold text-[#244b45]">{t('چه فرصتی می‌خواهید؟')}</p>
          <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-md border border-[#dce4dc] bg-white px-3 py-3 text-sm text-[#244b45] placeholder:text-[#9aa69f] focus:border-[#1a6558] focus:outline-none focus:ring-2 focus:ring-[#1a6558]/15"
              placeholder={t('نام بورسیه، دانشگاه یا کشور را بنویسید')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label={t('جستجوی بورسیه')}
            />
            <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#14594f] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0f453d]">
              <SearchIcon />
              {t('جستجوی بورسیه')}
            </button>
          </form>
          <p className="mt-3 text-xs leading-6 text-[#718078]">{t('فرصت‌های تازه را بر اساس مقطع، کشور و نوع تمویل پیدا کنید.')}</p>
        </div>

        <div className="relative mx-auto w-full max-w-[440px] md:mr-auto">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=85"
            alt={t('دانشجویان در محیط دانشگاه')}
            className="aspect-[1.42/1] w-full rounded-2xl object-cover shadow-[0_16px_40px_-22px_rgba(20,72,61,.55)]"
          />
          <div className="absolute inset-x-3 bottom-3 rounded-lg bg-[#123f38]/90 px-4 py-3 text-xs leading-6 text-white shadow-lg sm:inset-x-4 sm:bottom-4">
            {t('مسیر تحصیلی خود را با فرصت مناسب و اطلاعات معتبر بسازید.')}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e2e8e0] bg-white p-4 shadow-[0_4px_20px_-16px_rgba(20,72,61,.28)] sm:p-5" aria-label={t('فیلتر بورسیه‌ها')}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#234a43]">{t('فرصت مناسب شرایط خود را پیدا کنید')}</h2>
          <label className="inline-flex items-center gap-2 text-xs text-[#65756d]">
            <input
              type="checkbox"
              className="accent-[#14594f]"
              checked={sp.get('open') === '1'}
              onChange={(e) => set('open', e.target.checked ? '1' : '')}
            />
            {t('فقط مهلت‌های باز')}
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <label className="block text-xs font-medium text-[#52655d]">
            {t('کشور مقصد')}
            <select className="mt-1.5 w-full rounded-md border border-[#e0e7e0] bg-white px-3 py-2.5 text-sm text-[#40574e] focus:border-[#1a6558] focus:outline-none" value={sp.get('country') || ''} onChange={(e) => set('country', e.target.value)}>
              <option value="">{t('همه کشورها')}</option>
              {countries.map((country) => <option key={country}>{country}</option>)}
            </select>
            {countriesError && <span className="mt-1 block text-[11px] text-red-700">{countriesError}</span>}
          </label>
          <label className="block text-xs font-medium text-[#52655d]">
            {t('مقطع تحصیلی')}
            <select className="mt-1.5 w-full rounded-md border border-[#e0e7e0] bg-white px-3 py-2.5 text-sm text-[#40574e] focus:border-[#1a6558] focus:outline-none" value={sp.get('level') || ''} onChange={(e) => set('level', e.target.value)}>
              <option value="">{t('همه مقاطع')}</option>
              {Object.entries(LEVELS).map(([key, value]) => <option key={key} value={key}>{t(value)}</option>)}
            </select>
          </label>
          <label className="block text-xs font-medium text-[#52655d]">
            {t('روش تمویل')}
            <select className="mt-1.5 w-full rounded-md border border-[#e0e7e0] bg-white px-3 py-2.5 text-sm text-[#40574e] focus:border-[#1a6558] focus:outline-none" value={sp.get('funding') || ''} onChange={(e) => set('funding', e.target.value)}>
              <option value="">{t('همه نوع تمویل')}</option>
              <option value="full">{t('تمویل کامل')}</option>
              <option value="partial">{t('تمویل بخشی')}</option>
            </select>
          </label>
          <Link to={`/scholarships?${sp.toString()}`} className="inline-flex items-center justify-center rounded-md bg-[#14594f] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0f453d]">
            {t('نمایش فرصت‌ها')}
          </Link>
        </div>
      </section>

      <section id="scholarships" className="scroll-mt-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#234a43] sm:text-2xl">{t('فرصت‌های منتخب برای شما')}</h2>
            <p className="mt-1 text-xs leading-6 text-[#7b8982]">{t('فرصت‌های تحصیلی تازه را بررسی کنید و گزینهٔ مناسب خود را بیابید.')}</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-[#176154]">
            {data ? `${formatNumber(data.total)} ${t('فرصت')}` : t('همهٔ بورسیه‌ها')}
          </span>
        </div>

        {error && <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!data && !error && <p className="rounded-lg bg-white py-12 text-center text-sm text-[#718078]">{t('در حال بارگذاری فرصت‌ها…')}</p>}
        {data && data.items.length === 0 && <p className="rounded-lg bg-white py-12 text-center text-sm text-[#718078]">{t('بورسیه‌ای با این فیلترها پیدا نشد. فیلترها را تغییر دهید.')}</p>}

        {data && data.items.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((scholarship) => <Card key={scholarship.id} s={scholarship} />)}
            </div>
            {data.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button className="rounded-md border border-[#dce4dc] bg-white px-4 py-2 text-sm text-[#36584e] transition-colors hover:bg-[#f3f7f3] disabled:opacity-50" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>{t('قبلی')}</button>
                <span className="text-sm text-[#65756d]">{formatNumber(page)} {t('از')} {formatNumber(data.pages)}</span>
                <button className="rounded-md border border-[#dce4dc] bg-white px-4 py-2 text-sm text-[#36584e] transition-colors hover:bg-[#f3f7f3] disabled:opacity-50" disabled={page >= data.pages} onClick={() => set('page', String(page + 1))}>{t('بعدی')}</button>
              </div>
            )}
          </>
        )}
      </section>

      <section id="guide" className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#f0dfb6] bg-[#fff5dd] p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <span className="text-[#176154]"><BookIcon /></span>
          <div>
            <p className="mb-1 text-xs font-bold text-[#8b713d]">{t('دلیل ساخته‌شدن این پلتفرم')}</p>
            <h2 className="text-lg font-black leading-8 text-[#244a42]">{t('یک قدم نزدیک‌تر به هدف‌های تحصیلی‌تان')}</h2>
            <p className="mt-1 text-xs leading-6 text-[#6e796e]">{t('فرصت‌های معتبر و راهنمایی لازم را در یک مسیر ساده و قابل‌اعتماد دنبال کنید.')}</p>
          </div>
        </div>
        <Link to="/register" className="shrink-0 rounded-md border border-[#d7e3da] bg-white px-4 py-2 text-sm font-bold text-[#176154] transition-colors hover:bg-[#f2f7f2]">
          {t('ساخت حساب')}
        </Link>
      </section>

      <section id="about" className="grid gap-3 sm:grid-cols-3">
        {[
          { number: 1, title: 'شرایط را مقایسه کنید', text: 'مقطع، کشور و جزئیات هر فرصت را با شرایط خود بسنجید.' },
          { number: 2, title: 'اسناد را آماده بسازید', text: 'مدارک موردنیاز را پیش از رسیدن مهلت درخواست آماده کنید.' },
          { number: 3, title: 'درخواست را ارسال کنید', text: 'از مسیر رسمی دانشگاه یا نهاد ارائه‌دهنده درخواست دهید.' },
        ].map((step) => (
          <article key={step.number} className="rounded-lg border border-[#e4e9e3] bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#244a42]">{t(step.title)}</h3>
              <span className="rounded-full bg-[#e8f2eb] px-2 py-1 text-[10px] font-bold text-[#176154]">{t('گام')} {formatNumber(step.number)}</span>
            </div>
            <p className="text-xs leading-6 text-[#78867e]">{t(step.text)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
