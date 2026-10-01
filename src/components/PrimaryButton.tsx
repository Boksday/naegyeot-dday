import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../theme/tokens';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outline' | 'danger';
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'filled',
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'filled' && styles.filled,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'filled' && styles.filledLabel,
          variant === 'outline' && styles.outlineLabel,
          variant === 'danger' && styles.dangerLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_SIZE,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  danger: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  dimmed: {
    opacity: 0.6,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  filledLabel: {
    color: colors.onPrimary,
  },
  outlineLabel: {
    color: colors.primary,
  },
  dangerLabel: {
    color: colors.danger,
  },
});
