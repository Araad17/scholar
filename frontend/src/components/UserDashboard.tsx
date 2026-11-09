import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../api';
import { LanguageToggle, translate as t } from '../i18n';

const links = [
  {
    to: '/dashboard',
    label: 'خانه',
    end: true,
    icon: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" />,
  },
  {
    to: '/dashboard/profile',
    label: 'پروفایل',
    icon: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  },
  {
    to: '/dashboard/documents',
    label: 'اسناد',
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
  },
  {
    to: '/dashboard/meet',
    label: 'مشاوره',
    icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3V9Z" /></>,
  },
  {
    to: '/dashboard/referral',
    label: 'معرفی دوستان',
    icon: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1" /></>,
  },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
      {children}
    </svg>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    clearSession();
    navigate('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f1] text-[#173f3b]">
      <header className="z-10 flex min-h-14 items-center justify-between gap-2 border-b border-[#e6e9e4] bg-white px-3 py-2 sm:gap-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-base font-black text-[#14534c]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8ae3b] text-[#173f3b]" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="m3 9 9-5 9 5-9 5-9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M7 11.2v4.3c2.8 2.2 7.2 2.2 10 0v-4.3M21 9v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{t('بورسیه‌یاب')}</span>
        </Link>
        <p className="hidden text-xs text-slate-500 sm:block">{t('خانه')} <span className="mx-1">/</span> {t('داشبورد من')}</p>
        <div className="flex items-center gap-2 text-xs sm:gap-3">
          <span className="hidden text-slate-500 sm:inline">{t('خوش آمدید')}، {user?.name}</span>
          <LanguageToggle />
          <button type="button" onClick={logout} className="rounded-md border border-slate-200 px-3 py-2 font-bold text-[#14534c] transition hover:bg-[#f1f5f2]">
            {t('خروج')}
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-[#14534c] transition hover:bg-[#f1f5f2] md:hidden"
            aria-label={menuOpen ? t('بستن منو') : t('باز کردن منو')}
            aria-expanded={menuOpen}
            aria-controls="user-dashboard-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
              {menuOpen ? <><path d="m6 6 12 12M18 6 6 18" /></> : <><path d="M4 6h16M4 12h16M4 18h16" /></>}
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav id="user-dashboard-mobile-menu" aria-label={t('منوی داشبورد کاربر')} className="flex flex-col gap-1 bg-[#103f39] px-3 pb-3 text-white md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-[#1d5a51] font-bold text-[#f0bd4b]' : 'text-[#d3e1da] hover:bg-[#1a5149]'
                }`
              }
            >
              <Icon>{link.icon}</Icon>
              {t(link.label)}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="grid min-w-0 flex-1 md:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden border-b border-white/10 bg-[#103f39] px-3 py-3 text-white md:block md:border-b-0 md:px-4 md:py-5">
          <p className="mb-3 hidden px-2 text-[11px] text-[#a9c5bb] md:block">{t('داشبورد شخصی من')}</p>
          <nav aria-label={t('داشبورد کاربر')} className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive ? 'bg-[#1d5a51] font-bold text-[#f0bd4b]' : 'text-[#d3e1da] hover:bg-[#1a5149]'
                  }`
                }
              >
                <Icon>{link.icon}</Icon>
                {t(link.label)}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-[#c8d9d2] md:block">
            <p className="mb-1 font-bold text-white">{t('با اطمینان پیش بروید')}</p>
            <p>{t('برای استفاده از فرصت‌ها، اطلاعات پروفایل و مدارک خود را به‌روز نگه دارید.')}</p>
            <Link to="/dashboard/profile" className="mt-2 inline-block font-bold text-[#f0bd4b] hover:underline">{t('تکمیل پروفایل')}</Link>
          </div>
        </aside>

        <main className="min-w-0 px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
            <p className="mt-6 text-center text-[11px] leading-5 text-slate-500">
              {t('بورسیه‌یاب؛ همراه شما در مسیر تحصیل و فرصت‌های آموزشی.')}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
