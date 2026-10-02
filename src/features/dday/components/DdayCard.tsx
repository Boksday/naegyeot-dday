import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryColors, colors, fontSize, radius, shadow, spacing } from '../../../theme/tokens';
import { formatKoreanDate, type LocalDate } from '../logic/dates';
import { getDayCount, getDdayStatus } from '../logic/ddayStatus';
import { categoryLabels, ddayStrings } from '../strings';
import type { Dday } from '../types';
import { CategoryIcon } from './CategoryIcon';

type DdayCardProps = {
  item: Dday;
  today: LocalDate;
  onPress: (id: string) => void;
};

export function DdayCard({ item, today, onPress }: DdayCardProps) {
  const status = getDdayStatus(item, today);
  const dayCount = !item.repeatYearly ? getDayCount(item.date, today) : null;
  const palette = categoryColors[item.category];
  const isToday = status.daysUntil === 0;
  const isPast = status.daysUntil < 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${categoryLabels[item.category]}, ${item.title}, ${status.label}, ${formatKoreanDate(status.targetDate)}`}
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.accent, { backgroundColor: palette.strong }]} />
      <View style={[styles.iconWrap, { backgroundColor: palette.soft }]}>
        <CategoryIcon category={item.category} size={22} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
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
            backgroundColor: isToday ? palette.strong : isPast ? colors.surfaceMuted : palette.soft,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: isToday ? colors.onPrimary : isPast ? colors.textMuted : palette.strong },
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
    paddingVertical: spacing.lg,
    paddingRight: spacing.lg,
    paddingLeft: spacing.lg + 4,
    gap: spacing.md,
    overflow: 'hidden',
    ...shadow,
  },
  pressed: {
    opacity: 0.8,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
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
