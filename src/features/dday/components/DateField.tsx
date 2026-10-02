import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../../components/Icon';
import { fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../../theme/tokens';
import { type Theme, useThemedStyles } from '../../../theme/useTheme';
import {
  formatKoreanDate,
  formatLocalDate,
  type LocalDate,
  parseLocalDate,
  toLocalDate,
} from '../logic/dates';
import { formatLunarDate, type LunarDate, lunarToSolarExact, solarToLunar } from '../logic/lunar';
import { ddayStrings } from '../strings';
import type { DdayCalendar } from '../types';
import { DatePickerSheet, type PickerDate } from './DatePickerSheet';

export type DateValue = { date: LocalDate; lunar: LunarDate | null };

type DateFieldProps = {
  calendar: DdayCalendar;
  value: DateValue;
  onChange: (value: DateValue) => void;
  accessibilityLabel: string;
};

function solarToPicker(date: LocalDate): PickerDate {
  const parts = parseLocalDate(date) ?? { year: 2000, month: 1, day: 1 };
  return { ...parts, isLeapMonth: false };
}

export function DateField({ calendar, value, onChange, accessibilityLabel }: DateFieldProps) {
  const styles = useThemedStyles(createStyles);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const lunar = calendar === 'lunar' ? value.lunar : null;
  const mainText = lunar ? formatLunarDate(lunar, true) : formatKoreanDate(value.date);
  const subText = lunar ? ddayStrings.solarEquivalent(formatKoreanDate(value.date)) : null;

  const today = toLocalDate(new Date());
  const pickerValue: PickerDate = lunar ?? solarToPicker(value.date);
  const pickerToday: PickerDate =
    calendar === 'lunar' ? (solarToLunar(today) ?? solarToPicker(today)) : solarToPicker(today);

  const confirm = (picked: PickerDate) => {
    setIsPickerOpen(false);
    if (calendar === 'solar') {
      onChange({ date: formatLocalDate(picked), lunar: null });
      return;
    }
    const date = lunarToSolarExact(picked);
    if (!date) {
      Alert.alert(ddayStrings.lunarOutOfRange);
      return;
    }
    onChange({ date, lunar: picked });
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}, ${mainText}${subText ? `, ${subText}` : ''}`}
        onPress={() => setIsPickerOpen(true)}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <View style={styles.texts}>
          <Text style={styles.text}>{mainText}</Text>
          {subText && <Text style={styles.subText}>{subText}</Text>}
        </View>
        <Icon name="editDate" size={22} />
      </Pressable>
      {/* 열 때마다 새로 만들어 휠이 현재 값에서 시작하게 한다. */}
      {isPickerOpen && (
        <DatePickerSheet
          visible
          calendar={calendar}
          value={pickerValue}
          today={pickerToday}
          onClose={() => setIsPickerOpen(false)}
          onConfirm={confirm}
        />
      )}
    </>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    field: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surfaceMuted,
    },
    pressed: {
      opacity: 0.7,
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    text: {
      fontSize: fontSize.body,
      color: colors.text,
    },
    subText: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
    },
  });
