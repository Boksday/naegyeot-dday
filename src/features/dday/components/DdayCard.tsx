import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryPalette, colors, fontSize, radius, shadow, spacing } from '../../../theme/tokens';
import { formatKoreanDate, type LocalDate } from '../logic/dates';
import { getDayCount, getDdayStatus } from '../logic/ddayStatus';
import { ddayStrings } from '../strings';
import type { Category, Dday } from '../types';
import { CategoryDot } from './CategoryDot';

type DdayCardProps = {
  item: Dday;
  category: Category | undefined;
  today: LocalDate;
  onPress: (id: string) => void;
};

export function DdayCard({ item, category, today, onPress }: DdayCardProps) {
  const status = getDdayStatus(item, today);
  const dayCount = !item.repeatYearly ? getDayCount(item.date, today) : null;
  const color = category?.color ?? 'gray';
  const palette = categoryPalette[color];
  const isToday = status.daysUntil === 0;
  const isPast = status.daysUntil < 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${category?.name ?? ''}, ${item.title}, ${status.label}, ${formatKoreanDate(status.targetDate)}`}
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <CategoryDot color={color} size={12} />
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {formatKoreanDate(status.targetDate)}
          {item.repeatYearly ? ` · ${ddayStrings.repeatBadge}` : ''}
        </Text>
        {dayCount !== null && <Text style={styles.meta}>{ddayStrings.dayCount(dayCount)}</Text>}
      </View>
      <View
        style={[
          styles.labelPill,
          {
            backgroundColor: isToday ? palette.dot : isPast ? colors.surfaceMuted : palette.soft,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: isToday ? colors.text : isPast ? colors.textMuted : palette.text },
          ]}
        >
          {status.label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow,
  },
  pressed: {
    opacity: 0.8,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  labelPill: {
    minWidth: 72,
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: fontSize.title,
    fontWeight: '800',
  },
});
