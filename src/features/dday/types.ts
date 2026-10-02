import type { CategoryColorKey } from '../../theme/tokens';
import type { LocalDate } from './logic/dates';

export const NOTIFY_DAYS_BEFORE_OPTIONS = [1, 3, 7] as const;
export type NotifyDaysBefore = (typeof NOTIFY_DAYS_BEFORE_OPTIONS)[number];

export const MAX_TITLE_LENGTH = 30;

export const MAX_CATEGORY_NAME_LENGTH = 10;
/** 칩 한 줄이 감당할 수 있는 정도로 제한한다. */
export const MAX_CATEGORIES = 12;

export type Category = {
  id: string;
  name: string;
  color: CategoryColorKey;
  createdAt: string;
};

const BUILT_IN_CREATED_AT = '2026-10-02T00:00:00.000Z';

/** 처음 설치했을 때와 이전 버전 기록을 옮길 때 쓰는 기본 분류. 사용자가 지울 수 있다. */
export const DEFAULT_CATEGORIES: readonly Category[] = [
  { id: 'couple', name: '연인', color: 'rose', createdAt: BUILT_IN_CREATED_AT },
  { id: 'personal', name: '개인', color: 'terracotta', createdAt: BUILT_IN_CREATED_AT },
  { id: 'work', name: '업무', color: 'blue', createdAt: BUILT_IN_CREATED_AT },
];

export type Dday = {
  id: string;
  title: string;
  categoryId: string;
  /** 기준 날짜. 매년 반복이면 월·일만 반복에 쓰이고, 연도는 지난 일수 계산에 쓰인다. */
  date: LocalDate;
  repeatYearly: boolean;
  /** 기준일부터 100일·200일… 기념일을 보여줄지 */
  showMilestones: boolean;
  /** 직접 정렬 순서. 작을수록 앞이다. */
  order: number;
  notifyOnDay: boolean;
  notifyDaysBefore: NotifyDaysBefore | null;
  createdAt: string;
  updatedAt: string;
};

export type DdayInput = Pick<
  Dday,
  | 'title'
  | 'categoryId'
  | 'date'
  | 'repeatYearly'
  | 'showMilestones'
  | 'notifyOnDay'
  | 'notifyDaysBefore'
>;

export type DdayData = {
  categories: Category[];
  items: Dday[];
};

export function hasNotification(item: Pick<Dday, 'notifyOnDay' | 'notifyDaysBefore'>): boolean {
  return item.notifyOnDay || item.notifyDaysBefore !== null;
}
