import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../theme/tokens';
import { type Theme, useTheme, useThemedStyles } from '../../theme/useTheme';
import { formatKoreanDate, type LocalDate, parseLocalDate } from '../dday/logic/dates';
import { getDdayStatus } from '../dday/logic/ddayStatus';
import type { Category, Dday } from '../dday/types';
import { buildMonthGrid, type CalendarEvent, getEventsInRange, shiftMonth } from './calendarEvents';
import { calendarStrings } from './strings';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const MAX_DOTS = 3;

type CalendarViewProps = {
  items: readonly Dday[];
  categories: readonly Category[];
  today: LocalDate;
  onOpenDetail: (id: string) => void;
};

export function CalendarView({ items, categories, today, onOpenDetail }: CalendarViewProps) {
  const styles = useThemedStyles(createStyles);
  const { colors, categoryPalette } = useTheme();
  const todayParts = parseLocalDate(today) ?? { year: 2026, month: 1, day: 1 };
  const [visibleMonth, setVisibleMonth] = useState({
    year: todayParts.year,
    month: todayParts.month,
  });
  const [selected, setSelected] = useState<LocalDate>(today);

  const cells = useMemo(
    () => buildMonthGrid(visibleMonth.year, visibleMonth.month),
    [visibleMonth],
  );
  const eventsByDate = useMemo(() => {
    const first = cells[0]?.date ?? today;
    const last = cells[cells.length - 1]?.date ?? today;
    const map = new Map<LocalDate, CalendarEvent[]>();
    for (const event of getEventsInRange(items, first, last)) {
      map.set(event.date, [...(map.get(event.date) ?? []), event]);
    }
    return map;
  }, [cells, items, today]);
  const colorOf = (categoryId: string) =>
    categoryPalette[categories.find((category) => category.id === categoryId)?.color ?? 'gray'];
  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const selectedEvents = eventsByDate.get(selected) ?? [];

  const move = (delta: number) =>
    setVisibleMonth((current) => shiftMonth(current.year, current.month, delta));
  const goToday = () => {
    setVisibleMonth({ year: todayParts.year, month: todayParts.month });
    setSelected(today);
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={calendarStrings.previousMonth}
          onPress={() => move(-1)}
          style={styles.arrow}
        >
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle} accessibilityRole="header">
          {calendarStrings.monthTitle(visibleMonth.year, visibleMonth.month)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={calendarStrings.nextMonth}
          onPress={() => move(1)}
          style={styles.arrow}
        >
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={goToday} style={styles.todayButton}>
          <Text style={styles.todayText}>{calendarStrings.today}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.weekRow}>
          {WEEKDAYS.map((weekday, index) => (
            <Text
              key={weekday}
              style={[
                styles.weekday,
                index === 0 && { color: categoryPalette.rose.text },
                index === 6 && { color: categoryPalette.blue.text },
              ]}
            >
              {weekday}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((cell, index) => {
            const events = eventsByDate.get(cell.date) ?? [];
            const isToday = cell.date === today;
            const isSelected = cell.date === selected;
            const dayNumber = Number(cell.date.slice(8, 10));
            const weekday = index % 7;
            return (
              <Pressable
                key={cell.date}
                accessibilityRole="button"
                accessibilityLabel={calendarStrings.cellLabel(
                  formatKoreanDate(cell.date),
                  events.length,
                )}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(cell.date)}
                style={styles.cell}
              >
                <View
                  style={[
                    styles.dayBubble,
                    isToday && { backgroundColor: colors.primarySoft },
                    isSelected && styles.daySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      weekday === 0 && { color: categoryPalette.rose.text },
                      weekday === 6 && { color: categoryPalette.blue.text },
                      isToday && styles.dayTextToday,
                      !cell.isCurrentMonth && styles.dayTextOutside,
                    ]}
                  >
                    {dayNumber}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {events.slice(0, MAX_DOTS).map((event) => (
                    <View
                      key={`${event.itemId}-${event.kind}`}
                      style={[
                        styles.dot,
                        { backgroundColor: colorOf(event.categoryId).dot },
                        !cell.isCurrentMonth && styles.dotOutside,
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.selectedTitle}>{formatKoreanDate(selected)}</Text>
      {selectedEvents.length === 0 ? (
        <Text style={styles.empty}>{calendarStrings.noEvents}</Text>
      ) : (
        <View style={styles.card}>
          {selectedEvents.map((event, index) => {
            const item = itemById.get(event.itemId);
            const palette = colorOf(event.categoryId);
            const detail =
              event.kind === 'milestone' && event.dayCount
                ? calendarStrings.milestone(event.dayCount)
                : item
                  ? getDdayStatus(item, today).label
                  : '';
            return (
              <Pressable
                key={`${event.itemId}-${event.kind}`}
                accessibilityRole="button"
                onPress={() => onOpenDetail(event.itemId)}
                style={[styles.eventRow, index > 0 && styles.eventDivider]}
              >
                <View style={[styles.eventDot, { backgroundColor: palette.dot }]} />
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={[styles.eventDetail, { color: palette.text }]}>{detail}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const DOT_SIZE = 5;
const BUBBLE_SIZE = 34;

const createStyles = ({ colors, shadow }: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    arrow: {
      width: MIN_TOUCH_SIZE - 8,
      height: MIN_TOUCH_SIZE - 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowText: {
      fontSize: fontSize.headline,
      color: colors.text,
    },
    monthTitle: {
      fontSize: fontSize.title,
      fontWeight: '700',
      color: colors.text,
      minWidth: 120,
      textAlign: 'center',
    },
    todayButton: {
      marginLeft: 'auto',
      minHeight: 36,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceMuted,
    },
    todayText: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: colors.text,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.sm,
      ...shadow,
    },
    weekRow: {
      flexDirection: 'row',
      paddingVertical: spacing.xs,
    },
    weekday: {
      flex: 1,
      textAlign: 'center',
      fontSize: fontSize.caption,
      color: colors.textMuted,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: `${100 / 7}%`,
      alignItems: 'center',
      paddingVertical: 3,
      minHeight: 50,
    },
    dayBubble: {
      width: BUBBLE_SIZE,
      height: BUBBLE_SIZE,
      borderRadius: BUBBLE_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    daySelected: {
      borderColor: colors.primary,
    },
    dayText: {
      fontSize: fontSize.body,
      color: colors.text,
    },
    dayTextToday: {
      fontWeight: '800',
      color: colors.primaryText,
    },
    dayTextOutside: {
      opacity: 0.35,
    },
    dots: {
      flexDirection: 'row',
      gap: 2,
      height: DOT_SIZE + 2,
      marginTop: 1,
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
    },
    dotOutside: {
      opacity: 0.4,
    },
    selectedTitle: {
      fontSize: fontSize.body,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.sm,
    },
    empty: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
    },
    eventRow: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    eventDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    eventDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    eventTitle: {
      flex: 1,
      fontSize: fontSize.body,
      color: colors.text,
    },
    eventDetail: {
      fontSize: fontSize.body,
      fontWeight: '700',
    },
  });
