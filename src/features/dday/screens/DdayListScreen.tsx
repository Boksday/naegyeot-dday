import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fontSize, radius, spacing } from '../../../theme/tokens';
import { DdayCard } from '../components/DdayCard';
import { useDdayStore } from '../DdayStoreProvider';
import { useToday } from '../hooks/useToday';
import { sortForDisplay } from '../logic/ddayStatus';
import { ddayStrings } from '../strings';

export function DdayListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const { items, loadState, notificationSync, reload } = useDdayStore();
  const sorted = useMemo(() => sortForDisplay(items, today), [items, today]);

  const openDetail = useCallback(
    (id: string) => router.push({ pathname: '/dday/[id]', params: { id } }),
    [router],
  );
  const openNew = useCallback(() => router.push('/edit'), [router]);

  if (loadState.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (loadState.status === 'error') {
    return (
      <View style={[styles.center, styles.padded]}>
        <Text style={styles.emptyTitle}>{ddayStrings.loadErrorTitle}</Text>
        <Text style={styles.emptyBody}>{ddayStrings.loadErrorBody}</Text>
        <PrimaryButton label={ddayStrings.retry} onPress={() => void reload()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DdayCard item={item} today={today} onPress={openDetail} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          notificationSync === 'permission-denied' ? (
            <Text style={styles.banner}>{ddayStrings.notificationBlocked}</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{ddayStrings.emptyTitle}</Text>
            <Text style={styles.emptyBody}>{ddayStrings.emptyBody}</Text>
            <PrimaryButton label={ddayStrings.emptyAction} onPress={openNew} />
          </View>
        }
      />
      {sorted.length > 0 && (
        <View style={[styles.fabArea, { bottom: insets.bottom + spacing.lg }]}>
          <PrimaryButton label={ddayStrings.addTitle} onPress={openNew} />
        </View>
      )}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
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
    gap: spacing.md,
  },
  padded: {
    padding: spacing.xl,
  },
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
  banner: {
    backgroundColor: colors.primarySoft,
    color: colors.text,
    fontSize: fontSize.caption,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  fabArea: {
    position: 'absolute',
    right: spacing.lg,
  },
});
