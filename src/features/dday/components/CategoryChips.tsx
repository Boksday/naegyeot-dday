import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../../theme/tokens';
import { categoryLabels, ddayStrings } from '../strings';
import { DDAY_CATEGORIES, type DdayCategory } from '../types';
import { CategoryIcon } from './CategoryIcon';

export type CategoryFilter = DdayCategory | 'all';

type ChipRowProps = {
  options: readonly CategoryFilter[];
  value: CategoryFilter;
  onSelect: (value: CategoryFilter) => void;
  isFilter: boolean;
};

/** 목록 화면의 분류 필터 (전체 포함) */
export function CategoryFilterChips({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}) {
  return (
    <ChipRow options={['all', ...DDAY_CATEGORIES]} value={value} onSelect={onChange} isFilter />
  );
}

/** 입력 화면의 분류 선택 */
export function CategoryPicker({
  value,
  onChange,
}: {
  value: DdayCategory;
  onChange: (value: DdayCategory) => void;
}) {
  return (
    <ChipRow
      options={DDAY_CATEGORIES}
      value={value}
      onSelect={(option) => {
        if (option !== 'all') onChange(option);
      }}
      isFilter={false}
    />
  );
}

function ChipRow({ options, value, onSelect, isFilter }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole={isFilter ? 'tablist' : 'radiogroup'}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole={isFilter ? 'tab' : 'radio'}
            accessibilityState={{ selected }}
            onPress={() => onSelect(option)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            {option !== 'all' && <CategoryIcon category={option} size={16} />}
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option === 'all' ? ddayStrings.filterAll : categoryLabels[option]}
            </Text>
          </Pressable>
        );
      })}
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
