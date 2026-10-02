import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssetPlaceholder } from '../../../components/AssetPlaceholder';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fontSize, radius, shadow, spacing } from '../../../theme/tokens';
import { type CategoryFilter, CategoryFilterChips } from '../components/CategoryChips';
import { DdayCard } from '../components/DdayCard';
import { useDdayStore } from '../DdayStoreProvider';
import { useToday } from '../hooks/useToday';
import { formatKoreanDate } from '../logic/dates';
import { sortForDisplay } from '../logic/ddayStatus';
import { ddayStrings } from '../strings';

const FAB_SIZE = 60;

export function DdayListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const { items, loadState, notificationSync, reload } = useDdayStore();
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const visible = useMemo(() => {
    const filtered = filter === 'all' ? items : items.filter((item) => item.category === filter);
    return sortForDisplay(filtered, today);
  }, [items, filter, today]);

  const openDetail = useCallback(
    (id: string) => router.push({ pathname: '/dday/[id]', params: { id } }),
    [router],
  );
  const openNew = useCallback(
    () =>
      router.push(filter === 'all' ? '/edit' : { pathname: '/edit', params: { category: filter } }),
    [router, filter],
  );

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

  const header = (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <AssetPlaceholder name="앱 로고" size={36} />
        <View>
          <Text style={styles.appTitle}>{ddayStrings.appTitle}</Text>
          <Text style={styles.today}>{ddayStrings.today(formatKoreanDate(today))}</Text>
        </View>
      </View>
      {items.length > 0 && <CategoryFilterChips value={filter} onChange={setFilter} />}
      {notificationSync === 'permission-denied' && (
        <Text style={styles.banner}>{ddayStrings.notificationBlocked}</Text>
      )}
    </View>
  );

  const empty =
    items.length === 0 ? (
      <View style={styles.empty}>
        <AssetPlaceholder name="빈 화면 일러스트" size={120} showLabel />
        <Text style={styles.emptyTitle}>{ddayStrings.emptyTitle}</Text>
        <Text style={styles.emptyBody}>{ddayStrings.emptyBody}</Text>
        <PrimaryButton label={ddayStrings.emptyAction} onPress={openNew} />
      </View>
    ) : (
      <View style={styles.empty}>
        <Text style={styles.emptyBody}>{ddayStrings.emptyCategory}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DdayCard item={item} today={today} onPress={openDetail} />}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + FAB_SIZE + 48 },
        ]}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
      />
      {items.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ddayStrings.addTitle}
          onPress={openNew}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + spacing.xl },
            pressed && styles.fabPressed,
          ]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
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
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  appTitle: {
    fontSize: fontSize.headline,
    fontWeight: '800',
    color: colors.text,
  },
  today: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
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
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabText: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.onPrimary,
    fontWeight: '400',
  },
});
