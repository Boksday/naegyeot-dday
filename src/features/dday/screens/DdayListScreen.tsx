import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ReorderableList, {
  type ReorderableListReorderEvent,
  reorderItems,
  useIsActive,
  useReorderableDrag,
} from 'react-native-reorderable-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AD_BANNER_HEIGHT, AdBannerSlot } from '../../../components/AdBannerSlot';
import { AssetPlaceholder } from '../../../components/AssetPlaceholder';
import { Icon } from '../../../components/Icon';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../../theme/tokens';
import { type Theme, useTheme, useThemedStyles } from '../../../theme/useTheme';
import {
  ALL_CATEGORIES,
  type CategoryFilter,
  CategoryFilterChips,
} from '../components/CategoryChips';
import { DdayCard } from '../components/DdayCard';
import { DragHandle } from '../components/DragHandle';
import { SortSheet } from '../components/SortSheet';
import { useDdayStore } from '../DdayStoreProvider';
import { useSortMode } from '../hooks/useSortMode';
import { useToday } from '../hooks/useToday';
import { formatKoreanDate } from '../logic/dates';
import { sortDdays } from '../logic/sorting';
import { settingsStrings } from '../../settings/strings';
import { ddayStrings } from '../strings';
import type { Category, Dday } from '../types';

const FAB_SIZE = 60;
const LOGO_SIZE = 40;
const APP_LOGO = require('../../../../assets/logo.png');

export function DdayListScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const { items, categories, loadState, notificationSync, reload, reorderDdays } = useDdayStore();
  const [sortMode, setSortMode] = useSortMode();
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const isManual = sortMode === 'manual';
  const [selectedFilter, setFilter] = useState<CategoryFilter>(ALL_CATEGORIES);
  // 고른 분류가 삭제되면 전체로 돌아간다.
  const filter = categories.some((category) => category.id === selectedFilter)
    ? selectedFilter
    : ALL_CATEGORIES;
  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const visible = useMemo(() => {
    const filtered =
      filter === ALL_CATEGORIES ? items : items.filter((item) => item.categoryId === filter);
    return sortDdays(filtered, sortMode, today);
  }, [items, filter, sortMode, today]);

  const openDetail = useCallback(
    (id: string) => router.push({ pathname: '/dday/[id]', params: { id } }),
    [router],
  );
  const openNew = useCallback(
    () =>
      router.push(
        filter === ALL_CATEGORIES ? '/edit' : { pathname: '/edit', params: { category: filter } },
      ),
    [router, filter],
  );
  const openCategories = useCallback(() => router.push('/categories'), [router]);
  const openSettings = useCallback(() => router.push('/settings'), [router]);

  const saveOrder = useCallback(
    (ordered: readonly Dday[]) => {
      reorderDdays(ordered.map((item) => item.id)).catch((error: unknown) => {
        Alert.alert(
          ddayStrings.reorderFailed,
          error instanceof Error ? error.message : String(error),
        );
      });
    },
    [reorderDdays],
  );
  const handleReorder = useCallback(
    ({ from, to }: ReorderableListReorderEvent) => saveOrder(reorderItems(visible, from, to)),
    [saveOrder, visible],
  );
  const moveByOne = useCallback(
    (id: string, delta: -1 | 1) => {
      const from = visible.findIndex((item) => item.id === id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= visible.length) return;
      saveOrder(reorderItems(visible, from, to));
    },
    [saveOrder, visible],
  );

  if (loadState.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primaryText} />
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
        <Image
          source={APP_LOGO}
          style={styles.logo}
          accessibilityIgnoresInvertColors
          accessible={false}
        />
        <View style={styles.brandText}>
          <Text style={styles.appTitle}>{ddayStrings.appTitle}</Text>
          <Text style={styles.today}>{ddayStrings.today(formatKoreanDate(today))}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={settingsStrings.openSettings}
          onPress={openSettings}
          style={({ pressed }) => [styles.headerButton, pressed && styles.fabPressed]}
        >
          <Icon name="settings" size={24} />
        </Pressable>
      </View>
      <CategoryFilterChips
        categories={categories}
        value={filter}
        onChange={setFilter}
        onManage={openCategories}
      />
      {items.length > 0 && (
        <View style={styles.sortRow}>
          <Text style={styles.count}>{ddayStrings.countSummary(visible.length)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${ddayStrings.sortTitle}, ${ddayStrings.sortLabels[sortMode]}`}
            onPress={() => setIsSortSheetOpen(true)}
            style={({ pressed }) => [styles.sortButton, pressed && styles.fabPressed]}
          >
            <Text style={styles.sortButtonText}>
              {ddayStrings.sortButton(ddayStrings.sortLabels[sortMode])}
            </Text>
          </Pressable>
        </View>
      )}
      {isManual && items.length > 1 && (
        <Text style={styles.hint}>{ddayStrings.sortManualHint}</Text>
      )}
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
      <ReorderableList
        data={visible}
        keyExtractor={(item) => item.id}
        onReorder={handleReorder}
        dragEnabled={isManual}
        shouldUpdateActiveItem
        renderItem={({ item }) => (
          <ReorderableCard
            item={item}
            category={categoryById.get(item.categoryId)}
            today={today}
            onPress={openDetail}
            onMove={isManual ? moveByOne : undefined}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + spacing.lg, paddingBottom: FAB_SIZE + 48 },
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
            { bottom: insets.bottom + AD_BANNER_HEIGHT + spacing.xl },
            pressed && styles.fabPressed,
          ]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
      <View style={{ paddingBottom: insets.bottom }}>
        <AdBannerSlot label={ddayStrings.adBanner} />
      </View>
      <SortSheet
        visible={isSortSheetOpen}
        value={sortMode}
        onSelect={setSortMode}
        onClose={() => setIsSortSheetOpen(false)}
      />
    </View>
  );
}

type ReorderableCardProps = {
  item: Dday;
  category: Category | undefined;
  today: string;
  onPress: (id: string) => void;
  onMove?: (id: string, delta: -1 | 1) => void;
};

/** useReorderableDrag는 ReorderableList 안에서만 부를 수 있어 카드를 감싼다. */
function ReorderableCard({ onMove, ...props }: ReorderableCardProps) {
  const drag = useReorderableDrag();
  const isActive = useIsActive();
  if (!onMove) return <DdayCard {...props} />;
  return (
    <DdayCard
      {...props}
      onMove={onMove}
      onLongPress={drag}
      isActive={isActive}
      leading={<DragHandle onDragStart={drag} />}
    />
  );
}

function Separator() {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.separator} />;
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
    brandText: {
      flex: 1,
    },
    headerButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    logo: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      borderRadius: LOGO_SIZE * 0.28,
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
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: -spacing.sm,
    },
    count: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
    },
    sortButton: {
      minHeight: MIN_TOUCH_SIZE - 8,
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    sortButtonText: {
      fontSize: fontSize.caption,
      fontWeight: '700',
      color: colors.primaryText,
    },
    hint: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
      marginTop: -spacing.sm,
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
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      // 떠 있는 버튼은 테마와 상관없이 같은 그림자를 쓴다(테마 전환 시 그림자 자국 방지).
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    fabPressed: {
      opacity: 0.85,
    },
    fabText: {
      fontSize: 32,
      lineHeight: 36,
      color: colors.onAccent,
      fontWeight: '400',
    },
  });
