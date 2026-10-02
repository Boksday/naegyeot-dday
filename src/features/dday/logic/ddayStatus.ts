import type { Dday } from '../types';
import { daysBetween, getYear, type LocalDate, sameDayInYear } from './dates';
import { lunarToSolarForYear } from './lunar';

type Schedulable = Pick<Dday, 'date' | 'repeatYearly' | 'calendar' | 'lunar'>;

/** 매년 반복 디데이가 그해에 돌아오는 양력 날짜. 음력이면 그해 음력 날짜를 양력으로 바꾼다. */
function occurrenceInYear(item: Schedulable, year: number): LocalDate | null {
  if (item.calendar === 'lunar' && item.lunar) return lunarToSolarForYear(item.lunar, year);
  return sameDayInYear(item.date, year);
}

function baseYear(item: Schedulable): number {
  return item.calendar === 'lunar' && item.lunar ? item.lunar.year : getYear(item.date);
}

/**
 * 오늘 이후(오늘 포함) 돌아오는 날짜들. 반복이 아니면 기준 날짜 하나만 돌려준다.
 * 음력 연말 날짜는 이듬해 양력에 오므로 음력은 한 해 앞에서부터 찾는다.
 */
export function getOccurrences(item: Schedulable, today: LocalDate, count: number): LocalDate[] {
  if (!item.repeatYearly) return [item.date];
  const firstCandidateYear = item.calendar === 'lunar' ? getYear(today) - 1 : getYear(today);
  const startYear = Math.max(baseYear(item), firstCandidateYear);
  const occurrences: LocalDate[] = [];
  for (let year = startYear; occurrences.length < count && year <= startYear + count + 2; year++) {
    const date = occurrenceInYear(item, year);
    if (date && daysBetween(today, date) >= 0) occurrences.push(date);
  }
  return occurrences;
}

/**
 * 표시·알림 기준이 되는 날짜.
 * 매년 반복은 기준 날짜가 아직 오지 않았으면 그 날짜, 지났으면 오늘 이후 가장 가까운 같은 날이다.
 * 음력 변환 범위(2050년)를 벗어나면 기준 날짜를 쓴다.
 */
export function getTargetDate(item: Schedulable, today: LocalDate): LocalDate {
  if (!item.repeatYearly) return item.date;
  return getOccurrences(item, today, 1)[0] ?? item.date;
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

export function getDdayStatus(item: Schedulable, today: LocalDate): DdayStatus {
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
