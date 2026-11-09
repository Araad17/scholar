import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import Card from '../components/Card';
import { LEVELS, Page, ScholarshipCard } from '../types';
import { formatNumber, translate as t } from '../i18n';

export default function Scholarships() {
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState<Page<ScholarshipCard> | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [countriesError, setCountriesError] = useState('');
  const [error, setError] = useState('');
  const [q, setQ] = useState(sp.get('q') || '');
  const page = Number(sp.get('page') || 1);

  useEffect(() => {
    api<string[]>('/scholarships/countries')
      .then(setCountries)
      .catch((e: Error) => setCountriesError(e.message));
  }, []);

  useEffect(() => {
    setQ(sp.get('q') || '');
  }, [sp]);

  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    api<Page<ScholarshipCard>>(`/scholarships?${sp.toString()}`)
      .then((result) => { if (active) setData(result); })
      .catch((e: Error) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [sp]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(sp);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.delete('page');
    setSp(next);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilter('q', q.trim());
  };

  const clearFilters = () => {
    setQ('');
    setSp(new URLSearchParams());
  };

  const hasFilters = ['q', 'country', 'level', 'funding', 'open'].some((key) => sp.has(key));

  return (
    <div className="space-y-5 pb-8">
      <section className="text-center">
        <h1 className="text-2xl font-black leading-relaxed text-[#173f3b] sm:text-3xl">{t('فرصت بعدی خود را پیدا کنید')}</h1>
        <p className="mt-1 text-xs leading-6 text-[#77857e]">{t('بورسیه‌ها را جستجو کنید و با فیلترهای کاربردی، فرصت مناسب خود را بیابید.')}</p>
      </section>

      <div className="flex items-start gap-2 rounded-md bg-[#fff4d9] px-4 py-3 text-xs leading-6 text-[#66562f]">
        <span aria-hidden="true" className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">i</span>
        {t('اطلاعات هر فرصت را پیش از ارسال درخواست، در وب‌سایت رسمی دانشگاه یا نهاد ارائه‌دهنده بررسی کنید.')}
      </div>

      <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="scholarship-search" className="sr-only">{t('نام بورسیه را جستجو کنید')}</label>
        <input
          id="scholarship-search"
          className="min-w-0 flex-1 rounded-md border border-[#dce4dc] bg-white px-3 py-2.5 text-sm text-[#244b45] placeholder:text-[#9aa69f] focus:border-[#1a6558] focus:outline-none focus:ring-2 focus:ring-[#1a6558]/15"
          placeholder={t('نام بورسیه را جستجو کنید')}
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <button className="rounded-md bg-[#14594f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0f453d]">{t('جستجو')}</button>
      </form>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
        <section className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-[#234a43]">{t('فرصت‌های یافت‌شده')}</h2>
              <p className="mt-1 text-xs text-[#849188]">
                {data ? `${formatNumber(data.total)} ${t('فرصت تحصیلی')}` : t('فرصت‌های تحصیلی')}
              </p>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs font-bold text-[#176154] hover:text-[#0f453d]">
                {t('پاک‌کردن فیلترها')}
              </button>
            )}
          </div>

          {error && <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {!data && !error && <p className="rounded-lg bg-white py-12 text-center text-sm text-[#718078]">{t('در حال بارگذاری فرصت‌ها…')}</p>}
          {data && data.items.length === 0 && (
            <div className="rounded-lg border border-[#e4e9e3] bg-white px-5 py-12 text-center">
              <p className="font-bold text-[#244a42]">{t('فرصتی با این مشخصات پیدا نشد.')}</p>
              <p className="mt-2 text-sm text-[#78867e]">{t('فیلترها را تغییر دهید یا دوباره جستجو کنید.')}</p>
              {hasFilters && <button onClick={clearFilters} className="mt-4 rounded-md bg-[#14594f] px-4 py-2 text-sm font-bold text-white">{t('نمایش همهٔ فرصت‌ها')}</button>}
            </div>
          )}

          {data && data.items.length > 0 && (
            <>
              <div className="grid gap-3">
                {data.items.map((scholarship, index) => (
                  <div key={scholarship.id} className="contents">
                    <Card s={scholarship} />
                    {index === 1 && (
                      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#f0dfb6] bg-[#fff5dd] p-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="text-xl text-[#176154]" aria-hidden="true">▤</span>
                          <div>
                            <h3 className="text-sm font-bold text-[#244a42]">{t('یک قدم نزدیک‌تر به هدف تحصیلی‌تان')}</h3>
                            <p className="mt-1 text-xs leading-5 text-[#6e796e]">{t('حساب بسازید و برای مسیر تحصیلی خود آماده شوید.')}</p>
                          </div>
                        </div>
                        <Link to="/register" className="shrink-0 rounded-md bg-white px-3 py-2 text-xs font-bold text-[#176154]">{t('ساخت حساب')}</Link>
                      </section>
                    )}
                  </div>
                ))}
              </div>

              {data.pages > 1 && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    className="rounded-md border border-[#dce4dc] bg-white px-4 py-2 text-sm text-[#36584e] transition-colors hover:bg-[#f3f7f3] disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setFilter('page', String(page - 1))}
                  >
                    {t('قبلی')}
                  </button>
                  <span className="text-sm text-[#65756d]">{formatNumber(page)} {t('از')} {formatNumber(data.pages)}</span>
                  <button
                    className="rounded-md border border-[#dce4dc] bg-white px-4 py-2 text-sm text-[#36584e] transition-colors hover:bg-[#f3f7f3] disabled:opacity-50"
                    disabled={page >= data.pages}
                    onClick={() => setFilter('page', String(page + 1))}
                  >
                    {t('بعدی')}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="space-y-3 lg:col-start-2 lg:row-start-1">
          <section className="rounded-lg border border-[#e2e8e0] bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-black text-[#234a43]">{t('محدود کردن نتایج')}</h2>
              <span className="text-xs text-[#9aa69f]">{t('فیلترها')}</span>
            </div>

            <label className="mb-3 block text-xs font-bold text-[#52655d]">
              {t('کشور')}
              <select className="mt-1.5 w-full rounded-md border border-[#e0e7e0] bg-white px-3 py-2 text-xs font-normal text-[#40574e] focus:border-[#1a6558] focus:outline-none" value={sp.get('country') || ''} onChange={(event) => setFilter('country', event.target.value)}>
                <option value="">{t('همه کشورها')}</option>
                {countries.map((country) => <option key={country}>{country}</option>)}
              </select>
              {countriesError && <span className="mt-1 block font-normal text-red-700">{countriesError}</span>}
            </label>

            <label className="mb-3 block text-xs font-bold text-[#52655d]">
              {t('مقطع')}
              <select className="mt-1.5 w-full rounded-md border border-[#e0e7e0] bg-white px-3 py-2 text-xs font-normal text-[#40574e] focus:border-[#1a6558] focus:outline-none" value={sp.get('level') || ''} onChange={(event) => setFilter('level', event.target.value)}>
                <option value="">{t('همهٔ مقاطع')}</option>
                {Object.entries(LEVELS).map(([key, value]) => <option key={key} value={key}>{t(value)}</option>)}
              </select>
            </label>

            <label className="mb-3 block text-xs font-bold text-[#52655d]">
              {t('نوع تمویل')}
              <select className="mt-1.5 w-full rounded-md border border-[#e0e7e0] bg-white px-3 py-2 text-xs font-normal text-[#40574e] focus:border-[#1a6558] focus:outline-none" value={sp.get('funding') || ''} onChange={(event) => setFilter('funding', event.target.value)}>
                <option value="">{t('همهٔ نوع‌ها')}</option>
                <option value="full">{t('تمویل کامل')}</option>
                <option value="partial">{t('تمویل بخشی')}</option>
              </select>
            </label>

            <label className="flex cursor-pointer items-start gap-2 border-t border-[#edf0eb] py-3 text-xs leading-5 text-[#52655d]">
              <input type="checkbox" className="mt-1 accent-[#14594f]" checked={sp.get('open') === '1'} onChange={(event) => setFilter('open', event.target.checked ? '1' : '')} />
              {t('فقط فرصت‌هایی با مهلت باز')}
            </label>

            <button onClick={clearFilters} className="w-full rounded-md bg-[#14594f] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0f453d]">
              {t('پاک‌کردن فیلترها')}
            </button>
          </section>

          <section className="rounded-lg border border-[#e2e8e0] bg-white p-4">
            <h2 className="text-sm font-black text-[#234a43]">{t('چیزی پیدا نشد؟')}</h2>
            <p className="mt-2 text-xs leading-6 text-[#78867e]">{t('جستجوی خود را ساده‌تر کنید یا همهٔ فرصت‌ها را ببینید.')}</p>
            <button onClick={clearFilters} className="mt-3 rounded-md border border-[#dce4dc] px-3 py-2 text-xs font-bold text-[#176154] hover:bg-[#f3f7f3]">
              {t('نمایش همه')}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
