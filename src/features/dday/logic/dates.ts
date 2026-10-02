/** 시간대와 무관한 달력 날짜. 'YYYY-MM-DD' 형식. */
export type LocalDate = string;

type DateParts = { year: number; month: number; day: number };

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  // Date.UTC의 day 0은 이전 달의 마지막 날이다.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parseLocalDate(value: string): DateParts | null {
  const match = LOCAL_DATE_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function isValidLocalDate(value: string): boolean {
  return parseLocalDate(value) !== null;
}

function mustParse(value: LocalDate): DateParts {
  const parts = parseLocalDate(value);
  if (!parts) throw new Error(`잘못된 날짜 형식: ${value}`);
  return parts;
}

export function formatLocalDate({ year, month, day }: DateParts): LocalDate {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** 기기 시간대 기준으로 Date가 가리키는 날짜. */
export function toLocalDate(date: Date): LocalDate {
  return formatLocalDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

// 일광절약시간 등으로 하루 길이가 달라지는 문제를 피하려고 UTC 자정 기준으로 센다.
function toEpochDay(value: LocalDate): number {
  const { year, month, day } = mustParse(value);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

/** from에서 to까지의 일수. to가 미래면 양수. */
export function daysBetween(from: LocalDate, to: LocalDate): number {
  return toEpochDay(to) - toEpochDay(from);
}

export function addDays(value: LocalDate, days: number): LocalDate {
  const date = new Date((toEpochDay(value) + days) * MS_PER_DAY);
  return formatLocalDate({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

/** 해당 연도의 같은 월·일. 윤년이 아닌 해의 2월 29일은 2월 28일로 맞춘다. */
export function sameDayInYear(value: LocalDate, year: number): LocalDate {
  const { month, day } = mustParse(value);
  const adjustedDay = month === 2 && day === 29 && !isLeapYear(year) ? 28 : day;
  return formatLocalDate({ year, month, day: adjustedDay });
}

export function getYear(value: LocalDate): number {
  return mustParse(value).year;
}

/** 기기 시간대 기준으로 해당 날짜의 특정 시각. */
export function toDateAtTime(value: LocalDate, hour: number, minute: number): Date {
  const { year, month, day } = mustParse(value);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function fromLocalDateToDate(value: LocalDate): Date {
  return toDateAtTime(value, 0, 0);
}

export function formatKoreanDate(value: LocalDate): string {
  const { year, month, day } = mustParse(value);
  const weekday = WEEKDAYS_KO[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}
