import { ReactNode, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../api';
import { LanguageToggle, translate as t } from '../i18n';

const links = [
  { to: '/admin', label: 'نمای کلی', end: true, icon: '▦' },
  { to: '/admin/scholarships', label: 'بورسیه‌ها', icon: '◇' },
  { to: '/admin/users', label: 'کاربران', icon: '♙' },
  { to: '/admin/documents', label: 'مدارک', icon: '▤' },
  { to: '/admin/meetings', label: 'جلسات', icon: '▣' },
];

export default function AdminDashboard() {
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
        <Link to="/admin" className="flex items-center gap-2 text-base font-black text-[#14534c]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8ae3b] text-[#173f3b]" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="m3 9 9-5 9 5-9 5-9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M7 11.2v4.3c2.8 2.2 7.2 2.2 10 0v-4.3M21 9v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{t('بورسیه‌یاب')}</span>
        </Link>
        <p className="hidden text-xs text-slate-500 sm:block">{t('مدیریت سایت')} <span className="mx-1">/</span> {t('نمای کلی')}</p>
        <div className="flex items-center gap-2 text-xs sm:gap-3">
          <span className="hidden text-slate-500 sm:inline">{t('مدیر سایت')}، {user?.name}</span>
          <LanguageToggle />
          <button type="button" onClick={logout} className="rounded-md border border-slate-200 px-3 py-2 font-bold text-[#14534c] transition hover:bg-[#f1f5f2]">
            {t('خروج')}
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-[#14534c] transition hover:bg-[#f1f5f2] md:hidden"
            aria-label={menuOpen ? t('بستن منو') : t('باز کردن منو')}
            aria-expanded={menuOpen}
            aria-controls="admin-dashboard-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
              {menuOpen ? <><path d="m6 6 12 12M18 6 6 18" /></> : <><path d="M4 6h16M4 12h16M4 18h16" /></>}
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav id="admin-dashboard-mobile-menu" aria-label={t('منوی مدیریت سایت')} className="flex flex-col gap-1 bg-[#103f39] px-3 pb-3 text-white md:hidden">
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
              <span aria-hidden="true" className="w-4 shrink-0 text-center text-base">{link.icon}</span>
              {t(link.label)}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="grid min-w-0 flex-1 md:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden border-b border-white/10 bg-[#103f39] px-3 py-3 text-white md:block md:border-b-0 md:px-4 md:py-5">
          <p className="mb-3 hidden px-2 text-[11px] text-[#a9c5bb] md:block">{t('مدیریت سایت')}</p>
          <nav aria-label={t('مدیریت سایت')} className="flex flex-col gap-2">
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
                <span aria-hidden="true" className="w-4 shrink-0 text-center text-base">{link.icon}</span>
                {t(link.label)}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-[#c8d9d2] md:block">
            <p className="mb-1 font-bold text-white">{t('مدیریت مسئولانه')}</p>
            <p>{t('اطلاعات کاربران و فرصت‌های بورسیه را با دقت بررسی و به‌روز نگه دارید.')}</p>
            <Link to="/admin/documents" className="mt-2 inline-flex items-center gap-2 font-bold text-[#f0bd4b] hover:underline">
              <span aria-hidden="true">♢</span> {t('بررسی مدارک')}
            </Link>
          </div>
        </aside>

        <main className="min-w-0 px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
            <p className="mt-6 text-center text-[11px] leading-5 text-slate-500">
              {t('بورسیه‌یاب؛ پنل مدیریت و نظارت بر فرصت‌های آموزشی.')}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-base font-black">{t(title)}</h2>
      {children}
    </section>
  );
}
