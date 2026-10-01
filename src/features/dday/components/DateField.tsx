import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../../theme/tokens';
import { formatKoreanDate, fromLocalDateToDate, type LocalDate, toLocalDate } from '../logic/dates';

type DateFieldProps = {
  value: LocalDate;
  onChange: (value: LocalDate) => void;
  accessibilityLabel: string;
};

export function DateField({ value, onChange, accessibilityLabel }: DateFieldProps) {
  const selected = fromLocalDateToDate(value);

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={selected}
        mode="date"
        display="compact"
        locale="ko-KR"
        accessibilityLabel={accessibilityLabel}
        onChange={(_, date) => {
          if (date) onChange(toLocalDate(date));
        }}
        style={styles.iosPicker}
      />
    );
  }

  const openPicker = () => {
    DateTimePickerAndroid.open({
      value: selected,
      mode: 'date',
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChange(toLocalDate(date));
      },
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${accessibilityLabel}, ${formatKoreanDate(value)}`}
      onPress={openPicker}
      style={({ pressed }) => [styles.androidField, pressed && styles.pressed]}
    >
      <Text style={styles.androidText}>{formatKoreanDate(value)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iosPicker: {
    alignSelf: 'flex-start',
  },
  androidField: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  androidText: {
    fontSize: fontSize.body,
    color: colors.text,
  },
});
