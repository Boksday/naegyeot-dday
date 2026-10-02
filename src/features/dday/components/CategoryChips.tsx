import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../../theme/tokens';
import { ddayStrings } from '../strings';
import type { Category } from '../types';
import { CategoryIcon } from './CategoryIcon';

export const ALL_CATEGORIES = 'all';
export type CategoryFilter = string;

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  role: 'tab' | 'radio' | 'button';
  category?: Category;
};

function Chip({ label, selected, onPress, role, category }: ChipProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={role === 'button' ? undefined : { selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {category && (
        <CategoryIcon
          color={category.color}
          size={16}
          tint={selected ? colors.surface : undefined}
        />
      )}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

/** 목록 화면의 분류 필터. 맨 앞은 전체, 맨 뒤는 분류 관리로 가는 버튼이다. */
export function CategoryFilterChips({
  categories,
  value,
  onChange,
  onManage,
}: {
  categories: readonly Category[];
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  onManage: () => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      <Chip
        label={ddayStrings.filterAll}
        selected={value === ALL_CATEGORIES}
        onPress={() => onChange(ALL_CATEGORIES)}
        role="tab"
      />
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          category={category}
          selected={value === category.id}
          onPress={() => onChange(category.id)}
          role="tab"
        />
      ))}
      <Chip
        label={`＋ ${ddayStrings.manageCategories}`}
        selected={false}
        onPress={onManage}
        role="button"
      />
    </ScrollView>
  );
}

/** 입력 화면의 분류 선택 */
export function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: readonly Category[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="radiogroup"
    >
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          category={category}
          selected={value === category.id}
          onPress={() => onChange(category.id)}
          role="radio"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
  },
  chip: {
    minHeight: MIN_TOUCH_SIZE - 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  labelSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
});
