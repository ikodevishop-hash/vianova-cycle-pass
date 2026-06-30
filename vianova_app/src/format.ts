/** Locale-aware formatting helpers. */
import { currentLang } from './i18n';

export const yen = (n: number) => '¥' + (n || 0).toLocaleString('en-US');

export function stockText(n: number): string {
  const l = currentLang();
  return l === 'en' ? `${n} units` : l === 'ko' ? `${n}대` : `${n}台`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const l = currentLang();
  if (l === 'ja' || l === 'zh') return `${y}年${m}月${day}日`;
  if (l === 'ko') return `${y}년 ${m}월 ${day}일`;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
