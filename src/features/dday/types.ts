import type { LocalDate } from './logic/dates';

export const NOTIFY_DAYS_BEFORE_OPTIONS = [1, 3, 7] as const;
export type NotifyDaysBefore = (typeof NOTIFY_DAYS_BEFORE_OPTIONS)[number];

export const MAX_TITLE_LENGTH = 30;

export type Dday = {
  id: string;
  title: string;
  /** 기준 날짜. 매년 반복이면 월·일만 반복에 쓰이고, 연도는 지난 일수 계산에 쓰인다. */
  date: LocalDate;
  repeatYearly: boolean;
  notifyOnDay: boolean;
  notifyDaysBefore: NotifyDaysBefore | null;
  createdAt: string;
  updatedAt: string;
};

export type DdayInput = Pick<
  Dday,
  'title' | 'date' | 'repeatYearly' | 'notifyOnDay' | 'notifyDaysBefore'
>;

export function hasNotification(item: Pick<Dday, 'notifyOnDay' | 'notifyDaysBefore'>): boolean {
  return item.notifyOnDay || item.notifyDaysBefore !== null;
}
