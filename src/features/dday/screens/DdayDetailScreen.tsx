import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdBannerSlot } from '../../../components/AdBannerSlot';
import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { categoryPalette, colors, fontSize, radius, shadow, spacing } from '../../../theme/tokens';
import { CategoryIcon } from '../components/CategoryIcon';
import { useDdayStore } from '../DdayStoreProvider';
import { useToday } from '../hooks/useToday';
import { findCategory } from '../logic/categories';
import { formatKoreanDate } from '../logic/dates';
import { formatDdayLabel, getDayCount, getDdayStatus } from '../logic/ddayStatus';
import { getMilestones, type Milestone } from '../logic/milestones';
import { ddayStrings } from '../strings';
import { type Dday, hasNotification } from '../types';

function describeNotifications(item: Dday): string {
  if (!hasNotification(item)) return ddayStrings.notificationsOff;
  const parts: string[] = [];
  if (item.notifyOnDay) parts.push(ddayStrings.fieldNotifyOnDay);
  if (item.notifyDaysBefore !== null)
    parts.push(ddayStrings.notifyBeforeOption(item.notifyDaysBefore));
  return parts.join(', ');
}

export function DdayDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const today = useToday();
  const { items, categories, removeDday } = useDdayStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{ddayStrings.notFound}</Text>
      </View>
    );
  }

  const status = getDdayStatus(item, today);
  const dayCount = getDayCount(item.date, today);
  const milestones = getMilestones(item.date, today);
  const category = findCategory(categories, item.categoryId);
  const color = category?.color ?? 'gray';
  const palette = categoryPalette[color];

  const confirmDelete = () => {
    Alert.alert(ddayStrings.deleteConfirmTitle, ddayStrings.deleteConfirmBody, [
      { text: ddayStrings.cancel, style: 'cancel' },
      {
        text: ddayStrings.delete,
        style: 'destructive',
        onPress: () => {
          setIsDeleting(true);
          removeDday(item.id)
            .then(() => router.back())
            .catch((error: unknown) => {
              setIsDeleting(false);
              Alert.alert(
                ddayStrings.deleteFailed,
                error instanceof Error ? error.message : String(error),
              );
            });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: palette.strong }]}>
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <CategoryIcon color={color} size={14} tint={colors.onPrimary} />
            <Text style={styles.heroBadgeText}>{category?.name ?? ''}</Text>
          </View>
          {item.repeatYearly && <Text style={styles.heroMeta}>{ddayStrings.repeatBadge}</Text>}
        </View>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroLabel}>{status.label}</Text>
        <Text style={styles.heroMeta}>
          {formatKoreanDate(status.targetDate)}
          {dayCount !== null ? ` · ${ddayStrings.dayCount(dayCount)}` : ''}
        </Text>
      </View>

      <Card style={styles.section}>
        <InfoRow label={ddayStrings.baseDate} value={formatKoreanDate(item.date)} />
        {item.repeatYearly && (
          <InfoRow label={ddayStrings.targetDate} value={formatKoreanDate(status.targetDate)} />
        )}
        <InfoRow label={ddayStrings.fieldRepeat} value={item.repeatYearly ? '켜짐' : '꺼짐'} />
        <InfoRow label={ddayStrings.notifications} value={describeNotifications(item)} />
      </Card>

      {milestones && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{ddayStrings.milestonesTitle}</Text>
          {milestones.latestPassed && (
            <MilestoneRow
              milestone={milestones.latestPassed}
              prefix={ddayStrings.milestoneLatest}
              accent={colors.textMuted}
            />
          )}
          {milestones.upcoming.map((milestone) => (
            <MilestoneRow key={milestone.dayCount} milestone={milestone} accent={palette.strong} />
          ))}
        </Card>
      )}

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <PrimaryButton
            label={ddayStrings.edit}
            variant="outline"
            onPress={() => router.push({ pathname: '/edit', params: { id: item.id } })}
          />
        </View>
        <View style={styles.actionItem}>
          <PrimaryButton
            label={ddayStrings.delete}
            variant="danger"
            onPress={confirmDelete}
            disabled={isDeleting}
          />
        </View>
      </View>

      <View style={styles.adArea}>
        <AdBannerSlot label={ddayStrings.adBanner} />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

type MilestoneRowProps = { milestone: Milestone; prefix?: string; accent: string };

function MilestoneRow({ milestone, prefix, accent }: MilestoneRowProps) {
  const name = ddayStrings.milestoneLabel(milestone.dayCount);
  return (
    <View style={styles.row}>
      <View style={styles.milestoneInfo}>
        <Text style={styles.milestoneName}>{prefix ? `${prefix} · ${name}` : name}</Text>
        <Text style={styles.muted}>{formatKoreanDate(milestone.date)}</Text>
      </View>
      <Text style={[styles.milestoneLabel, { color: accent }]}>
        {formatDdayLabel(milestone.daysUntil)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadow,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroBadgeText: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  heroTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  heroLabel: {
    fontSize: fontSize.display,
    fontWeight: '800',
    color: colors.onPrimary,
  },
  heroMeta: {
    fontSize: fontSize.caption,
    color: colors.onPrimaryMuted,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 32,
  },
  muted: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  value: {
    fontSize: fontSize.body,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  milestoneInfo: {
    gap: 2,
  },
  milestoneName: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  milestoneLabel: {
    fontSize: fontSize.body,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionItem: {
    flex: 1,
  },
  adArea: {
    // 수정·삭제 버튼과 광고를 떨어뜨려 오클릭을 막는다.
    marginTop: spacing.xxl,
  },
});
