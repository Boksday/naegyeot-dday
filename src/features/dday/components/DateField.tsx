import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AssetPlaceholder } from '../../../components/AssetPlaceholder';
import { colors, fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../../theme/tokens';
import { formatKoreanDate, type LocalDate, toLocalDate } from '../logic/dates';
import { DatePickerSheet } from './DatePickerSheet';

type DateFieldProps = {
  value: LocalDate;
  onChange: (value: LocalDate) => void;
  accessibilityLabel: string;
};

export function DateField({ value, onChange, accessibilityLabel }: DateFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}, ${formatKoreanDate(value)}`}
        onPress={() => setIsPickerOpen(true)}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <Text style={styles.text}>{formatKoreanDate(value)}</Text>
        <AssetPlaceholder name="달력 아이콘" size={20} />
      </Pressable>
      {/* 열 때마다 새로 만들어 휠이 현재 값에서 시작하게 한다. */}
      {isPickerOpen && (
        <DatePickerSheet
          visible
          value={value}
          today={toLocalDate(new Date())}
          onClose={() => setIsPickerOpen(false)}
          onConfirm={(next) => {
            onChange(next);
            setIsPickerOpen(false);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    fontSize: fontSize.body,
    color: colors.text,
  },
});
