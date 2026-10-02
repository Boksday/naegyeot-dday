import type { CategoryColorKey } from '../../theme/tokens';
import { findCategory } from '../dday/logic/categories';
import { type LocalDate, parseLocalDate } from '../dday/logic/dates';
import { getDdayStatus, sortForDisplay } from '../dday/logic/ddayStatus';
import type { DdayData } from '../dday/types';

export const WIDGET_NAME = 'DdayWidget';
export const WIDGET_MAX_ENTRIES = 3;

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

export type WidgetEntry = {
  id: string;
  title: string;
  color: CategoryColorKey;
  label: string;
  dateText: string;
  isToday: boolean;
  isPast: boolean;
};

/** 위젯은 폭이 좁아 연도 없이 짧게 쓴다. 예: 10.3 (토) */
export function formatWidgetDate(value: LocalDate): string {
  const parts = parseLocalDate(value);
  if (!parts) return value;
  const weekday =
    WEEKDAYS_KO[new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()];
  return `${parts.month}.${parts.day} (${weekday})`;
}

/** 위젯은 가장 가까운 디데이를 보여주는 용도라 목록 정렬 설정과 무관하게 가까운 순이다. */
export function buildWidgetEntries(data: DdayData, today: LocalDate): WidgetEntry[] {
  return sortForDisplay(data.items, today)
    .slice(0, WIDGET_MAX_ENTRIES)
    .map((item) => {
      const status = getDdayStatus(item, today);
      const sameYear = status.targetDate.slice(0, 4) === today.slice(0, 4);
      return {
        id: item.id,
        title: item.title,
        color: findCategory(data.categories, item.categoryId)?.color ?? 'gray',
        label: status.label,
        dateText: sameYear
          ? formatWidgetDate(status.targetDate)
          : `${status.targetDate.slice(0, 4)}.${formatWidgetDate(status.targetDate)}`,
        isToday: status.daysUntil === 0,
        isPast: status.daysUntil < 0,
      };
    });
}
