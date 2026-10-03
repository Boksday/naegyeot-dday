import {
  addDays,
  daysBetween,
  formatLocalDate,
  getYear,
  type LocalDate,
} from '../dday/logic/dates';
import { baseYear, occurrenceInYear } from '../dday/logic/ddayStatus';
import { MILESTONE_STEP_DAYS } from '../dday/logic/milestones';
import type { Dday } from '../dday/types';

export type CalendarEvent = {
  date: LocalDate;
  itemId: string;
  title: string;
  categoryId: string;
  /** dday: 디데이 날짜(반복이면 그해의 날짜), milestone: 100일 단위 기념일 */
  kind: 'dday' | 'milestone';
  /** milestone일 때 기준일을 1일째로 센 일수 */
  dayCount?: number;
};

function isWithin(date: LocalDate, start: LocalDate, end: LocalDate): boolean {
  return daysBetween(start, date) >= 0 && daysBetween(date, end) >= 0;
}

function ddayDates(item: Dday, start: LocalDate, end: LocalDate): LocalDate[] {
  if (!item.repeatYearly) return isWithin(item.date, start, end) ? [item.date] : [];
  // 음력 연말은 이듬해 양력에 오므로 한 해 앞부터 본다.
  const firstYear = Math.max(baseYear(item), getYear(start) - (item.calendar === 'lunar' ? 1 : 0));
  const dates: LocalDate[] = [];
  for (let year = firstYear; year <= getYear(end); year++) {
    const date = occurrenceInYear(item, year);
    // 반복은 기준 날짜부터 시작한다.
    if (date && isWithin(date, start, end) && daysBetween(item.date, date) >= 0) dates.push(date);
  }
  return dates;
}

function milestoneEvents(item: Dday, start: LocalDate, end: LocalDate): CalendarEvent[] {
  if (!item.showMilestones) return [];
  // N일째 = 기준일 + (N - 1)일
  const firstStep = Math.max(
    1,
    Math.ceil((daysBetween(item.date, start) + 1) / MILESTONE_STEP_DAYS),
  );
  const lastStep = Math.floor((daysBetween(item.date, end) + 1) / MILESTONE_STEP_DAYS);
  const events: CalendarEvent[] = [];
  for (let step = firstStep; step <= lastStep; step++) {
    const dayCount = step * MILESTONE_STEP_DAYS;
    events.push({
      date: addDays(item.date, dayCount - 1),
      itemId: item.id,
      title: item.title,
      categoryId: item.categoryId,
      kind: 'milestone',
      dayCount,
    });
  }
  return events;
}

/** start~end(양 끝 포함) 사이의 디데이·기념일. 날짜 순, 같은 날은 디데이가 먼저다. */
export function getEventsInRange(
  items: readonly Dday[],
  start: LocalDate,
  end: LocalDate,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const item of items) {
    for (const date of ddayDates(item, start, end)) {
      events.push({
        date,
        itemId: item.id,
        title: item.title,
        categoryId: item.categoryId,
        kind: 'dday',
      });
    }
    events.push(...milestoneEvents(item, start, end));
  }
  return events.sort(
    (a, b) =>
      daysBetween(b.date, a.date) ||
      (a.kind === b.kind ? 0 : a.kind === 'dday' ? -1 : 1) ||
      a.title.localeCompare(b.title, 'ko'),
  );
}

export type MonthCell = { date: LocalDate; isCurrentMonth: boolean };

/** 일요일부터 시작하는 6주(42칸) 달력. */
export function buildMonthGrid(year: number, month: number): MonthCell[] {
  const first = formatLocalDate({ year, month, day: 1 });
  const weekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const gridStart = addDays(first, -weekday);
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return { date, isCurrentMonth: Number(date.slice(5, 7)) === month };
  });
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}
