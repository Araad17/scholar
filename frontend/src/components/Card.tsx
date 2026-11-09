import { Link } from 'react-router-dom';
import { FUNDING, LEVELS, ScholarshipCard, daysLeft, fmtDate } from '../types';
import { translate as t } from '../i18n';

export default function Card({ s }: { s: ScholarshipCard }) {
  const left = daysLeft(s.deadline);
  const expired = left !== null && left < 0;
  const urgent = left !== null && left >= 0 && left <= 14;

  return (
    <Link
      to={`/scholarships/${s.id}`}
      className={`flex flex-col rounded-lg border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#c5d9cd] hover:shadow-[0_8px_24px_-16px_rgba(20,72,61,.38)] sm:p-5 ${expired ? 'border-slate-200 opacity-60' : 'border-[#e2e8e0]'}`}
    >
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-[#e8f2eb] px-2.5 py-1 font-medium text-[#176154]">{t(LEVELS[s.level])}</span>
        <span className={`rounded-full px-2.5 py-1 font-medium ${s.funding === 'full' ? 'bg-[#e8f2eb] text-[#176154]' : 'bg-[#f1f3ef] text-[#68766e]'}`}>
          {t(FUNDING[s.funding])}
        </span>
      </div>
      <h3 className="mb-1 text-base font-bold leading-7 text-[#244a42]">{s.title}</h3>
      <p className="mb-3 text-sm text-[#7b8982]">{s.country}</p>
      <p className="mb-4 flex-1 text-sm leading-7 text-[#68776f]">{s.excerpt}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0eb] pt-3 text-xs">
        <span className="break-words text-[#176154]">{t('مشاهدهٔ جزئیات ←')}</span>
        <span className={`break-words ${expired ? 'text-red-700' : urgent ? 'font-bold text-[#ad7510]' : 'text-[#849188]'}`}>
          {expired ? t('مهلت تمام شده') : left === null ? t('مهلت نامشخص') : `${fmtDate(s.deadline)}`}
        </span>
      </div>
    </Link>
  );
}
