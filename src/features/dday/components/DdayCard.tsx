import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '../../../theme/tokens';
import { formatKoreanDate, type LocalDate } from '../logic/dates';
import { getDayCount, getDdayStatus } from '../logic/ddayStatus';
import { ddayStrings } from '../strings';
import type { Dday } from '../types';

type DdayCardProps = {
  item: Dday;
  today: LocalDate;
  onPress: (id: string) => void;
};

export function DdayCard({ item, today, onPress }: DdayCardProps) {
  const status = getDdayStatus(item, today);
  const dayCount = !item.repeatYearly ? getDayCount(item.date, today) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${status.label}, ${formatKoreanDate(status.targetDate)}`}
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.repeatYearly && <Text style={styles.badge}>{ddayStrings.repeatBadge}</Text>}
        </View>
        <Text style={styles.date}>{formatKoreanDate(status.targetDate)}</Text>
        {dayCount !== null && <Text style={styles.date}>{ddayStrings.dayCount(dayCount)}</Text>}
      </View>
      <Text style={styles.label}>{status.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.text,
  },
  badge: {
    fontSize: fontSize.caption,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  date: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  label: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.primary,
  },
});
