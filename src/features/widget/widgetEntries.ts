import type { CategoryColorKey } from '../../theme/tokens';
import { findCategory } from '../dday/logic/categories';
import { formatKoreanDate, type LocalDate } from '../dday/logic/dates';
import { getDdayStatus, sortForDisplay } from '../dday/logic/ddayStatus';
import type { DdayData } from '../dday/types';

export const WIDGET_NAME = 'DdayWidget';
export const WIDGET_MAX_ENTRIES = 3;

export type WidgetEntry = {
  id: string;
  title: string;
  color: CategoryColorKey;
  label: string;
  dateText: string;
};

export function buildWidgetEntries(data: DdayData, today: LocalDate): WidgetEntry[] {
  return sortForDisplay(data.items, today)
    .slice(0, WIDGET_MAX_ENTRIES)
    .map((item) => {
      const status = getDdayStatus(item, today);
      return {
        id: item.id,
        title: item.title,
        color: findCategory(data.categories, item.categoryId)?.color ?? 'gray',
        label: status.label,
        dateText: formatKoreanDate(status.targetDate),
      };
    });
}
