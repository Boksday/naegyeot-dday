import { formatKoreanDate, type LocalDate } from '../dday/logic/dates';
import { getDdayStatus, sortForDisplay } from '../dday/logic/ddayStatus';
import type { Dday } from '../dday/types';

export const WIDGET_NAME = 'DdayWidget';
export const WIDGET_MAX_ENTRIES = 3;

export type WidgetEntry = {
  id: string;
  title: string;
  label: string;
  dateText: string;
};

export function buildWidgetEntries(items: readonly Dday[], today: LocalDate): WidgetEntry[] {
  return sortForDisplay(items, today)
    .slice(0, WIDGET_MAX_ENTRIES)
    .map((item) => {
      const status = getDdayStatus(item, today);
      return {
        id: item.id,
        title: item.title,
        label: status.label,
        dateText: formatKoreanDate(status.targetDate),
      };
    });
}
