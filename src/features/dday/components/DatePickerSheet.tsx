import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fontSize, radius, spacing } from '../../../theme/tokens';
import { daysInMonth, formatLocalDate, type LocalDate, parseLocalDate } from '../logic/dates';
import { ddayStrings } from '../strings';
import { WheelColumn } from './WheelColumn';

export const MIN_PICKER_YEAR = 1900;
export const MAX_PICKER_YEAR = 2100;

const YEARS = Array.from(
  { length: MAX_PICKER_YEAR - MIN_PICKER_YEAR + 1 },
  (_, index) => MIN_PICKER_YEAR + index,
);
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

type DatePickerSheetProps = {
  visible: boolean;
  value: LocalDate;
  today: LocalDate;
  onConfirm: (value: LocalDate) => void;
  onClose: () => void;
};

type DateParts = { year: number; month: number; day: number };

function toParts(value: LocalDate): DateParts {
  return parseLocalDate(value) ?? { year: 2000, month: 1, day: 1 };
}

/** 월이 바뀌어 날짜가 넘치면 그 달의 마지막 날로 맞춘다. */
function withClampedDay(parts: DateParts): DateParts {
  return { ...parts, day: Math.min(parts.day, daysInMonth(parts.year, parts.month)) };
}

export function DatePickerSheet({
  visible,
  value,
  today,
  onConfirm,
  onClose,
}: DatePickerSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<DateParts>(() => toParts(value));
  const days = useMemo(
    () => Array.from({ length: daysInMonth(draft.year, draft.month) }, (_, index) => index + 1),
    [draft.year, draft.month],
  );

  const update = (change: Partial<DateParts>) =>
    setDraft((current) => withClampedDay({ ...current, ...change }));

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
            <Text style={styles.title}>{ddayStrings.datePickerTitle}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDraft(toParts(today))}
              style={styles.todayButton}
            >
              <Text style={styles.todayText}>{ddayStrings.datePickerToday}</Text>
            </Pressable>
          </View>
          <View style={styles.wheels}>
            <WheelColumn
              values={YEARS}
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
          <PrimaryButton
            label={ddayStrings.datePickerConfirm}
            onPress={() => onConfirm(formatLocalDate(draft))}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
