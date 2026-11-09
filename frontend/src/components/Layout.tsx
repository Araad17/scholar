import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearSession, getUser, homeFor } from '../api';
import { LanguageToggle, translate as t } from '../i18n';

export default function Layout() {
  const nav = useNavigate();
  const user = getUser();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#103f39] text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-3 py-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-black sm:text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e8ae3b] text-[#173f3b]" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="m3 9 9-5 9 5-9 5-9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M7 11.2v4.3c2.8 2.2 7.2 2.2 10 0v-4.3M21 9v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>{t('بورسیه‌یاب')}</span>
          </Link>
          <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-[#d3dfd8] sm:text-xs md:order-none md:w-auto md:gap-5">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'font-bold text-[#e8ae3b]' : 'transition-colors hover:text-white'}>{t('خانه')}</NavLink>
            <NavLink to="/scholarships" className={({ isActive }) => isActive ? 'font-bold text-[#e8ae3b]' : 'transition-colors hover:text-white'}>{t('بورسیه‌ها')}</NavLink>
            <NavLink to="/guide" className={({ isActive }) => isActive ? 'font-bold text-[#e8ae3b]' : 'transition-colors hover:text-white'}>{t('راهنمای بورسیه')}</NavLink>
            <Link to="/#about" className="transition-colors hover:text-white">{t('دربارهٔ ما')}</Link>
          </nav>
          <nav className="flex items-center gap-2 text-xs sm:gap-4">
            <LanguageToggle />
            {user ? (
              <>
                <Link to={homeFor(user)} className="transition-colors hover:text-[#e8ae3b]">{t(user.role === 'admin' ? 'پنل مدیریت' : 'داشبورد من')}</Link>
                <button onClick={() => { clearSession(); nav('/'); }} className="transition-colors hover:text-[#e8ae3b]">{t('خروج')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="transition-colors hover:text-[#e8ae3b]">{t('ورود')}</Link>
                <Link to="/register" className="rounded-md bg-[#e8ae3b] px-3 py-2 font-bold text-[#173f3b] transition-colors hover:bg-[#f1c45f]">{t('ساخت حساب')}</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-4 sm:py-7">
        <Outlet />
      </main>
      <footer className="border-t border-[#e1e9e2] bg-[#edf5ef] px-4 py-3 text-center text-[11px] leading-6 text-[#567167]">
        {t('اطلاعات بورسیه‌ها از منابع مختلف گردآوری می‌شود؛ پیش از درخواست، شرایط را در وب‌سایت رسمی بررسی کنید.')}
      </footer>
    </div>
  );
}
