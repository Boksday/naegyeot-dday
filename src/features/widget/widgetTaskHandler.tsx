import { Appearance } from 'react-native';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { buildMonthGrid, getEventsInRange } from '../calendar/calendarEvents';
import { calendarStrings } from '../calendar/strings';
import { parseLocalDate, toLocalDate } from '../dday/logic/dates';
import { loadDdayData } from '../dday/storage/ddayRepository';
import { loadCachedPro } from '../pro/proCache';
import { loadThemePreference } from '../settings/themePreference';
import { CALENDAR_WIDGET_NAME, DdayCalendarWidget } from './DdayCalendarWidget';
import { DdayWidget, type WidgetTheme } from './DdayWidget';
import { buildWidgetEntries, formatWidgetDate } from './widgetEntries';

/** 앱의 화면 모드 설정을 따른다. 시스템 설정 따르기면 기기 설정을 본다. */
async function resolveWidgetTheme(): Promise<WidgetTheme> {
  try {
    const preference = await loadThemePreference();
    if (preference !== 'system') return preference;
  } catch {
    // 설정을 못 읽으면 기기 설정을 따른다.
  }
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export async function renderDdayWidget(): Promise<React.JSX.Element> {
  const today = toLocalDate(new Date());
  const [result, theme, isPro] = await Promise.all([
    loadDdayData(),
    resolveWidgetTheme(),
    loadCachedPro().catch(() => false),
  ]);
  const entries = result.ok ? buildWidgetEntries(result, today) : null;
  return (
    <DdayWidget
      entries={entries}
      todayText={formatWidgetDate(today)}
      theme={theme}
      isLocked={!isPro}
    />
  );
}

export async function renderCalendarWidget(): Promise<React.JSX.Element> {
  const today = toLocalDate(new Date());
  const { year, month } = parseLocalDate(today) ?? { year: 2026, month: 1 };
  const [result, theme, isPro] = await Promise.all([
    loadDdayData(),
    resolveWidgetTheme(),
    loadCachedPro().catch(() => false),
  ]);
  const grid = buildMonthGrid(year, month);
  const first = grid[0]?.date ?? today;
  const last = grid[grid.length - 1]?.date ?? today;
  const colorById = new Map(
    result.ok ? result.categories.map((category) => [category.id, category.color] as const) : [],
  );
  const events = result.ok ? getEventsInRange(result.items, first, last) : [];
  const cells = grid.map((cell) => ({
    ...cell,
    labels: events
      .filter((event) => event.date === cell.date)
      .map((event) => ({
        text:
          event.kind === 'milestone' && event.dayCount
            ? calendarStrings.milestone(event.dayCount)
            : event.title,
        color: colorById.get(event.categoryId) ?? 'gray',
      })),
  }));
  return (
    <DdayCalendarWidget
      title={calendarStrings.monthTitle(year, month)}
      cells={cells}
      today={today}
      theme={theme}
      isLocked={!isPro}
    />
  );
}

export async function widgetTaskHandler({
  widgetInfo,
  widgetAction,
  renderWidget,
}: WidgetTaskHandlerProps) {
  if (widgetAction === 'WIDGET_DELETED') return;
  renderWidget(
    widgetInfo.widgetName === CALENDAR_WIDGET_NAME
      ? await renderCalendarWidget()
      : await renderDdayWidget(),
  );
}
