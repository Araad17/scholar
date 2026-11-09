export type Level = 'bachelor' | 'master' | 'phd' | 'other';
export type Funding = 'full' | 'partial';

export interface ScholarshipCard {
  id: number;
  title: string;
  country: string;
  level: Level;
  funding: Funding;
  deadline: string | null;
  source_name: string;
  excerpt: string;
}

export interface Scholarship extends Omit<ScholarshipCard, 'excerpt'> {
  description: string;
  eligibility: string;
  apply_url: string;
  source_url: string;
  is_published: boolean;
}

export interface ScholarshipInput {
  title: string;
  country: string;
  level: Level;
  funding: Funding;
  deadline: string | null;
  description: string;
  eligibility: string;
  apply_url: string;
  source_name: string;
  source_url: string;
  is_published: boolean;
}

export interface Page<T> { items: T[]; total: number; page: number; pages: number }

export const LEVELS: Record<Level, string> = { bachelor: 'لیسانس', master: 'ماستری', phd: 'دوکتورا', other: 'سایر' };
export const FUNDING: Record<Funding, string> = { full: 'تمویل کامل', partial: 'تمویل بخشی' };

export function daysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  const end = new Date(deadline + 'T23:59:59').getTime();
  return Math.ceil((end - Date.now()) / 86400000);
}

export function fmtDate(d: string | null) {
  if (!d) return translate('مهلت مشخص نشده');
  const locale = currentLanguage() === 'fa' ? 'fa-AF-u-ca-persian' : 'en-US';
  return new Date(d + 'T00:00:00').toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export const DOC_TYPES: Record<string, string> = {
  passport: 'پاسپورت', tazkira: 'تذکره', transcript: 'ریزنمرات', certificate: 'سند فراغت',
  cv: 'رزومه (CV)', language: 'سند زبان (IELTS/TOEFL…)', recommendation: 'توصیه‌نامه', other: 'سایر',
};
export const DOC_STATUS: Record<string, string> = { pending: 'در انتظار بررسی', approved: 'تأیید شده', rejected: 'رد شده' };
export const MEET_STATUS: Record<string, string> = { open: 'آزاد', booked: 'رزرو شده', completed: 'انجام شد', cancelled: 'لغو شد' };
export const EDU: Record<string, string> = { highschool: 'لیسه (صنف ۱۲)', bachelor: 'لیسانس', master: 'ماستری', phd: 'دوکتورا' };
export const ENGLISH: Record<string, string> = { none: 'ندارم', basic: 'ابتدایی', intermediate: 'متوسط', advanced: 'پیشرفته' };

export function fmtDateTime(iso: string) {
  const locale = currentLanguage() === 'fa' ? 'fa-AF-u-ca-persian' : 'en-US';
  return new Date(iso).toLocaleString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export const fmtSize = (b: number) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
import { currentLanguage, translate } from './i18n';
