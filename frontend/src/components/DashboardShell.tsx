import { NavLink, Outlet } from 'react-router-dom';

export interface Tab { to: string; label: string; end?: boolean }

export default function DashboardShell({ title, tabs }: { title: string; tabs: Tab[] }) {
  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-6">
      <aside className="min-w-0">
        <p className="mb-3 text-sm font-bold text-slate-500">{title}</p>
        <nav aria-label={title} className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
          {tabs.map((t) => (
            <NavLink
              key={t.to} to={t.to} end={t.end}
              className={({ isActive }) =>
                `shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-lapis text-white' : 'bg-white text-ink hover:bg-lapis-light'}`}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
