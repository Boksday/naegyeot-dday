import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, radius, spacing } from '../../../theme/tokens';
import { type Theme, useTheme, useThemedStyles } from '../../../theme/useTheme';
import { formatKoreanDate, type LocalDate } from '../logic/dates';
import { formatDdayLabel, getDayCount, getDdayStatus } from '../logic/ddayStatus';
import { getMilestones } from '../logic/milestones';
import { ddayStrings } from '../strings';
import type { Category, Dday } from '../types';
import { CategoryDot } from './CategoryDot';

type DdayCardProps = {
  item: Dday;
  category: Category | undefined;
  today: LocalDate;
  onPress: (id: string) => void;
  /** 직접 정렬에서 길게 눌러 끌기 시작 */
  onLongPress?: () => void;
  /** 직접 정렬에서 화면 읽기 사용자를 위한 한 칸 이동 */
  onMove?: (id: string, delta: -1 | 1) => void;
};

export function DdayCard({ item, category, today, onPress, onLongPress, onMove }: DdayCardProps) {
  const styles = useThemedStyles(createStyles);
  const { colors, categoryPalette } = useTheme();
  const status = getDdayStatus(item, today);
  const dayCount = !item.repeatYearly ? getDayCount(item.date, today) : null;
  const color = category?.color ?? 'gray';
  const palette = categoryPalette[color];
  const nextMilestone = item.showMilestones
    ? getMilestones(item.date, today, 1)?.upcoming[0]
    : undefined;
  const isToday = status.daysUntil === 0;
  const isPast = status.daysUntil < 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${category?.name ?? ''}, ${item.title}, ${status.label}, ${formatKoreanDate(status.targetDate)}`}
      onPress={() => onPress(item.id)}
      onLongPress={onLongPress}
      delayLongPress={250}
      accessibilityActions={
        onMove
          ? [
              { name: 'moveUp', label: ddayStrings.moveUp },
              { name: 'moveDown', label: ddayStrings.moveDown },
            ]
          : undefined
      }
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'moveUp') onMove?.(item.id, -1);
        if (event.nativeEvent.actionName === 'moveDown') onMove?.(item.id, 1);
      }}
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
        {nextMilestone && (
          <Text style={[styles.meta, { color: palette.text }]}>
            {ddayStrings.nextMilestone(
              nextMilestone.dayCount,
              formatDdayLabel(nextMilestone.daysUntil),
            )}
          </Text>
        )}
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
            { color: isToday ? colors.onPastel : isPast ? colors.textMuted : palette.text },
          ]}
        >
          {status.label}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = ({ colors, shadow }: Theme) =>
  StyleSheet.create({
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
