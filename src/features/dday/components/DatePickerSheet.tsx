import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/PrimaryButton';
import { fontSize, radius, spacing } from '../../../theme/tokens';
import { type Theme, useThemedStyles } from '../../../theme/useTheme';
import { daysInMonth } from '../logic/dates';
import { hasLeapMonth, lunarMonthLength, MAX_LUNAR_YEAR } from '../logic/lunar';
import { ddayStrings } from '../strings';
import type { DdayCalendar } from '../types';
import { WheelColumn } from './WheelColumn';

export const MIN_PICKER_YEAR = 1900;
export const MAX_PICKER_YEAR = 2100;

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

function yearRange(calendar: DdayCalendar): number[] {
  // 음력 변환은 2050년까지만 지원한다.
  const max = calendar === 'lunar' ? MAX_LUNAR_YEAR : MAX_PICKER_YEAR;
  return Array.from({ length: max - MIN_PICKER_YEAR + 1 }, (_, index) => MIN_PICKER_YEAR + index);
}

/** 양력·음력 공통 날짜. 양력에서는 isLeapMonth가 늘 false다. */
export type PickerDate = { year: number; month: number; day: number; isLeapMonth: boolean };

type DatePickerSheetProps = {
  visible: boolean;
  calendar: DdayCalendar;
  value: PickerDate;
  today: PickerDate;
  onConfirm: (value: PickerDate) => void;
  onClose: () => void;
};

function monthLength(calendar: DdayCalendar, date: PickerDate): number {
  if (calendar === 'solar') return daysInMonth(date.year, date.month);
  return lunarMonthLength(date.year, date.month, date.isLeapMonth);
}

/** 달이 바뀌면 그달에 맞게 다듬는다. 윤달이 없는 달이면 평달로, 날짜가 넘치면 마지막 날로. */
function normalize(calendar: DdayCalendar, date: PickerDate): PickerDate {
  const isLeapMonth =
    calendar === 'lunar' && date.isLeapMonth && hasLeapMonth(date.year, date.month);
  const next = { ...date, isLeapMonth };
  return { ...next, day: Math.min(next.day, monthLength(calendar, next)) };
}

export function DatePickerSheet({
  visible,
  calendar,
  value,
  today,
  onConfirm,
  onClose,
}: DatePickerSheetProps) {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<PickerDate>(() => normalize(calendar, value));
  const years = useMemo(() => yearRange(calendar), [calendar]);
  const length = monthLength(calendar, draft);
  const days = useMemo(() => Array.from({ length }, (_, index) => index + 1), [length]);
  const canPickLeap = calendar === 'lunar' && hasLeapMonth(draft.year, draft.month);

  const update = (change: Partial<PickerDate>) =>
    setDraft((current) => normalize(calendar, { ...current, ...change }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="닫기" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>
              {calendar === 'lunar' ? ddayStrings.lunarPickerTitle : ddayStrings.datePickerTitle}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDraft(normalize(calendar, today))}
              style={styles.todayButton}
            >
              <Text style={styles.todayText}>{ddayStrings.datePickerToday}</Text>
            </Pressable>
          </View>
          <View style={styles.wheels}>
            <WheelColumn
              values={years}
              selected={draft.year}
              format={(year) => `${year}${ddayStrings.year}`}
              onChange={(year) => update({ year })}
              accessibilityLabel={ddayStrings.year}
            />
            <WheelColumn
              values={MONTHS}
              selected={draft.month}
              format={(month) => `${month}${ddayStrings.month}`}
              onChange={(month) => update({ month })}
              accessibilityLabel={ddayStrings.month}
            />
            <WheelColumn
              values={days}
              selected={draft.day}
              format={(day) => `${day}${ddayStrings.day}`}
              onChange={(day) => update({ day })}
              accessibilityLabel={ddayStrings.day}
            />
          </View>
          {canPickLeap && (
            <View style={styles.leapRow} accessibilityRole="radiogroup">
              {[false, true].map((isLeapMonth) => {
                const selected = draft.isLeapMonth === isLeapMonth;
                return (
                  <Pressable
                    key={String(isLeapMonth)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => update({ isLeapMonth })}
                    style={[styles.leapChip, selected && styles.leapChipSelected]}
                  >
                    <Text style={[styles.leapText, selected && styles.leapTextSelected]}>
                      {isLeapMonth
                        ? ddayStrings.leapMonth(draft.month)
                        : ddayStrings.plainMonth(draft.month)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <PrimaryButton label={ddayStrings.datePickerConfirm} onPress={() => onConfirm(draft)} />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.lg,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: fontSize.title,
      fontWeight: '700',
      color: colors.text,
    },
    todayButton: {
      minHeight: 40,
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
    wheels: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    leapRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
    },
    leapChip: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceMuted,
    },
    leapChipSelected: {
      backgroundColor: colors.primarySoft,
    },
    leapText: {
      fontSize: fontSize.body,
      color: colors.text,
    },
    leapTextSelected: {
      color: colors.primaryText,
      fontWeight: '700',
    },
  });
