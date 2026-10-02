import { useRouter } from 'expo-router';

import { AdBanner } from '../../ads/AdBanner';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { fontSize, radius, spacing } from '../../../theme/tokens';
import { type Theme, useTheme, useThemedStyles } from '../../../theme/useTheme';
import { CategoryDot } from '../components/CategoryDot';
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
  const styles = useThemedStyles(createStyles);
  const { colors, categoryPalette } = useTheme();
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
  const milestones = item.showMilestones ? getMilestones(item.date, today) : null;
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: palette.dot }]}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <CategoryDot color={color} size={10} />
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
          {!hasNotification(item) && (
            <Text style={styles.nudge}>{ddayStrings.notifyDetailNudge}</Text>
          )}
        </Card>

        {item.showMilestones && !milestones && (
          <Card>
            <Text style={styles.sectionTitle}>{ddayStrings.milestonesTitle}</Text>
            <Text style={styles.muted}>{ddayStrings.milestonesPending}</Text>
          </Card>
        )}

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
              <MilestoneRow key={milestone.dayCount} milestone={milestone} accent={palette.text} />
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
      </ScrollView>
      {/* 목록 화면과 같이 하단 고정. 버튼과는 content의 아래 여백만큼 떨어진다. */}
      <AdBanner />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

type MilestoneRowProps = { milestone: Milestone; prefix?: string; accent: string };

function MilestoneRow({ milestone, prefix, accent }: MilestoneRowProps) {
  const styles = useThemedStyles(createStyles);
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

const createStyles = ({ colors, shadow }: Theme) =>
  StyleSheet.create({
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
      // 맨 아래 수정·삭제 버튼과 하단 광고를 떨어뜨려 오클릭을 막는다.
      paddingBottom: spacing.xxl + spacing.lg,
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
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    heroBadgeText: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: colors.onPastel,
    },
    heroTitle: {
      marginTop: spacing.md,
      fontSize: fontSize.title,
      fontWeight: '600',
      color: colors.onPastel,
    },
    heroLabel: {
      fontSize: fontSize.display,
      fontWeight: '800',
      color: colors.onPastel,
    },
    heroMeta: {
      fontSize: fontSize.caption,
      color: colors.onPastel,
      opacity: 0.75,
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
    nudge: {
      fontSize: fontSize.caption,
      color: colors.primaryText,
      backgroundColor: colors.primarySoft,
      borderRadius: radius.sm,
      padding: spacing.md,
      overflow: 'hidden',
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
  });
