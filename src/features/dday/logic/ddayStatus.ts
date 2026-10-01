import type { Dday } from '../types';
import { daysBetween, getYear, type LocalDate, sameDayInYear } from './dates';

/**
 * 표시·알림 기준이 되는 날짜.
 * 매년 반복은 기준 날짜가 아직 오지 않았으면 그 날짜, 지났으면 오늘 이후 가장 가까운 같은 월·일이다.
 */
export function getTargetDate(
  item: Pick<Dday, 'date' | 'repeatYearly'>,
  today: LocalDate,
): LocalDate {
  if (!item.repeatYearly || daysBetween(today, item.date) >= 0) return item.date;
  const thisYear = sameDayInYear(item.date, getYear(today));
  if (daysBetween(today, thisYear) >= 0) return thisYear;
  return sameDayInYear(item.date, getYear(today) + 1);
}

/** 기준이 되는 날짜부터 순서대로 돌아오는 날짜들. 반복이 아니면 하나만 돌려준다. */
export function getOccurrences(
  item: Pick<Dday, 'date' | 'repeatYearly'>,
  today: LocalDate,
  count: number,
): LocalDate[] {
  const first = getTargetDate(item, today);
  if (!item.repeatYearly) return [first];
  const firstYear = getYear(first);
  return Array.from({ length: count }, (_, index) => sameDayInYear(item.date, firstYear + index));
}

export function formatDdayLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'D-Day';
  return daysUntil > 0 ? `D-${daysUntil}` : `D+${-daysUntil}`;
}

/** 기준일을 1일째로 세는 한국식 일수. 기준일 전이면 null. */
export function getDayCount(start: LocalDate, today: LocalDate): number | null {
  const elapsed = daysBetween(start, today);
  return elapsed >= 0 ? elapsed + 1 : null;
}

export type DdayStatus = {
  targetDate: LocalDate;
  daysUntil: number;
  label: string;
};

export function getDdayStatus(
  item: Pick<Dday, 'date' | 'repeatYearly'>,
  today: LocalDate,
): DdayStatus {
  const targetDate = getTargetDate(item, today);
  const daysUntil = daysBetween(today, targetDate);
  return { targetDate, daysUntil, label: formatDdayLabel(daysUntil) };
}

/** 다가오는 디데이를 가까운 순으로, 지난 디데이는 최근 순으로 뒤에 둔다. */
export function sortForDisplay<T extends Dday>(items: readonly T[], today: LocalDate): T[] {
  return items
    .map((item) => ({ item, daysUntil: getDdayStatus(item, today).daysUntil }))
    .sort((a, b) => {
      const aUpcoming = a.daysUntil >= 0;
      const bUpcoming = b.daysUntil >= 0;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      return aUpcoming ? a.daysUntil - b.daysUntil : b.daysUntil - a.daysUntil;
    })
    .map(({ item }) => item);
}
