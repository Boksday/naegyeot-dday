import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fontSize, radius, spacing } from '../../../theme/tokens';
import { useDdayStore } from '../DdayStoreProvider';
import { useToday } from '../hooks/useToday';
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
  const { items, removeDday } = useDdayStore();
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
      <View style={styles.hero}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.label}>{status.label}</Text>
        {dayCount !== null && <Text style={styles.muted}>{ddayStrings.dayCount(dayCount)}</Text>}
      </View>

      <View style={styles.section}>
        <InfoRow label={ddayStrings.baseDate} value={formatKoreanDate(item.date)} />
        {item.repeatYearly && (
          <InfoRow label={ddayStrings.targetDate} value={formatKoreanDate(status.targetDate)} />
        )}
        <InfoRow label={ddayStrings.fieldRepeat} value={item.repeatYearly ? '켜짐' : '꺼짐'} />
        <InfoRow label={ddayStrings.notifications} value={describeNotifications(item)} />
      </View>

      {milestones && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{ddayStrings.milestonesTitle}</Text>
          {milestones.latestPassed && (
            <MilestoneRow
              milestone={milestones.latestPassed}
              prefix={ddayStrings.milestoneLatest}
            />
          )}
          {milestones.upcoming.map((milestone) => (
            <MilestoneRow key={milestone.dayCount} milestone={milestone} />
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <PrimaryButton
          label={ddayStrings.edit}
          variant="outline"
          onPress={() => router.push({ pathname: '/edit', params: { id: item.id } })}
        />
        <PrimaryButton
          label={ddayStrings.delete}
          variant="danger"
          onPress={confirmDelete}
          disabled={isDeleting}
        />
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

function MilestoneRow({ milestone, prefix }: { milestone: Milestone; prefix?: string }) {
  const name = ddayStrings.milestoneLabel(milestone.dayCount);
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.value}>{prefix ? `${prefix} · ${name}` : name}</Text>
        <Text style={styles.muted}>{formatKoreanDate(milestone.date)}</Text>
      </View>
      <Text style={styles.milestoneLabel}>{formatDdayLabel(milestone.daysUntil)}</Text>
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
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  label: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
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
  milestoneLabel: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.primary,
  },
  actions: {
    gap: spacing.md,
  },
});
