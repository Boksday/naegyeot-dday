import KoreanLunarCalendar from 'korean-lunar-calendar';

import { formatLocalDate, type LocalDate, parseLocalDate } from './dates';

/** 한국천문연구원 기준 음력 날짜 */
export type LunarDate = {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
};

/** 라이브러리가 지원하는 음력 연도 범위 */
export const MIN_LUNAR_YEAR = 1000;
export const MAX_LUNAR_YEAR = 2050;

const LONG_MONTH_DAYS = 30;
const SHORT_MONTH_DAYS = 29;

function tryLunarToSolar(lunar: LunarDate): LocalDate | null {
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setLunarDate(lunar.year, lunar.month, lunar.day, lunar.isLeapMonth)) return null;
  const solar = calendar.getSolarCalendar();
  return formatLocalDate({ year: solar.year, month: solar.month, day: solar.day });
}

/** 정확히 존재하는 음력 날짜만 양력으로 바꾼다. 없는 날짜면 null. */
export function lunarToSolarExact(lunar: LunarDate): LocalDate | null {
  return tryLunarToSolar(lunar);
}

/**
 * 해마다 돌아오는 음력 날짜를 양력으로 바꾼다. 그해에 없는 날짜는 관습대로 맞춘다.
 * - 윤달 날짜인데 그해에 그 윤달이 없으면 평달로 본다.
 * - 30일인데 그달이 29일까지면 29일로 본다.
 * 지원 범위를 벗어나면 null.
 */
export function lunarToSolarForYear(lunar: LunarDate, year: number): LocalDate | null {
  const candidates: LunarDate[] = [
    { ...lunar, year },
    { ...lunar, year, isLeapMonth: false },
    { ...lunar, year, isLeapMonth: false, day: Math.min(lunar.day, SHORT_MONTH_DAYS) },
  ];
  for (const candidate of candidates) {
    const solar = tryLunarToSolar(candidate);
    if (solar) return solar;
  }
  return null;
}

export function solarToLunar(value: LocalDate): LunarDate | null {
  const parts = parseLocalDate(value);
  if (!parts) return null;
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setSolarDate(parts.year, parts.month, parts.day)) return null;
  const lunar = calendar.getLunarCalendar();
  return {
    year: lunar.year,
    month: lunar.month,
    day: lunar.day,
    isLeapMonth: lunar.intercalation === true,
  };
}

/** 그해 그달(평달 또는 윤달)의 날 수. 그런 달이 없으면 0. */
export function lunarMonthLength(year: number, month: number, isLeapMonth: boolean): number {
  if (tryLunarToSolar({ year, month, day: LONG_MONTH_DAYS, isLeapMonth })) return LONG_MONTH_DAYS;
  if (tryLunarToSolar({ year, month, day: 1, isLeapMonth })) return SHORT_MONTH_DAYS;
  return 0;
}

export function hasLeapMonth(year: number, month: number): boolean {
  return lunarMonthLength(year, month, true) > 0;
}

/** 예: 음력 3월 5일, 음력 윤6월 1일 */
export function formatLunarDate(lunar: LunarDate, withYear = false): string {
  const year = withYear ? `${lunar.year}년 ` : '';
  return `음력 ${year}${lunar.isLeapMonth ? '윤' : ''}${lunar.month}월 ${lunar.day}일`;
}

/** 좁은 자리용. 예: 음 3.5, 음 윤6.1 */
export function formatLunarShort(lunar: LunarDate): string {
  return `음 ${lunar.isLeapMonth ? '윤' : ''}${lunar.month}.${lunar.day}`;
}
