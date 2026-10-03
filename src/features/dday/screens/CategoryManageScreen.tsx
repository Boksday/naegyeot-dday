import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import {
  CATEGORY_COLOR_KEYS,
  type CategoryColorKey,
  fontSize,
  MIN_TOUCH_SIZE,
  radius,
  spacing,
} from '../../../theme/tokens';
import { type Theme, useTheme, useThemedStyles } from '../../../theme/useTheme';
import { useDdayStore } from '../DdayStoreProvider';
import {
  canAddCategory,
  type CategoryNameError,
  countItemsInCategory,
  getFallbackCategory,
  validateCategoryName,
} from '../logic/categories';
import { colorNames, ddayStrings } from '../strings';
import { type Category, MAX_CATEGORIES, MAX_CATEGORY_NAME_LENGTH } from '../types';

function describeNameError(error: CategoryNameError): string {
  const messages = ddayStrings.categoryNameErrors;
  if (error === 'too-long') return messages['too-long'](MAX_CATEGORY_NAME_LENGTH);
  return messages[error];
}

export function CategoryManageScreen() {
  const styles = useThemedStyles(createStyles);
  // 하단 내비게이션 바에 마지막 내용이 가려지지 않도록 안전 영역만큼 띄운다.
  const insets = useSafeAreaInsets();
  const { colors, categoryPalette } = useTheme();
  const { items, categories, addCategory, removeCategory } = useDdayStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState<CategoryColorKey>('green');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const canAdd = canAddCategory(categories);

  const submit = async () => {
    if (isBusy) return;
    const error = validateCategoryName(name, categories);
    if (error) {
      setNameError(describeNameError(error));
      return;
    }
    setIsBusy(true);
    try {
      await addCategory(name, color);
      setName('');
      setNameError(null);
    } catch (addError) {
      Alert.alert(
        ddayStrings.saveFailed,
        addError instanceof Error ? addError.message : String(addError),
      );
    } finally {
      setIsBusy(false);
    }
  };

  const confirmRemove = (category: Category) => {
    const fallback = getFallbackCategory(categories, category.id);
    if (!fallback) {
      Alert.alert(ddayStrings.categoryDeleteLast);
      return;
    }
    const count = countItemsInCategory({ categories, items }, category.id);
    Alert.alert(
      ddayStrings.categoryDeleteTitle(category.name),
      count > 0
        ? ddayStrings.categoryDeleteMove(count, fallback.name)
        : ddayStrings.categoryDeleteEmpty,
      [
        { text: ddayStrings.cancel, style: 'cancel' },
        {
          text: ddayStrings.delete,
          style: 'destructive',
          onPress: () => {
            removeCategory(category.id).catch((error: unknown) => {
              Alert.alert(
                ddayStrings.deleteFailed,
                error instanceof Error ? error.message : String(error),
              );
            });
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{ddayStrings.categoryAdd}</Text>
          <Card style={styles.sectionCard}>
            {canAdd ? (
              <>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError(null);
                  }}
                  placeholder={ddayStrings.categoryNamePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  maxLength={MAX_CATEGORY_NAME_LENGTH}
                  accessibilityLabel={ddayStrings.categoryNamePlaceholder}
                  returnKeyType="done"
                  onSubmitEditing={() => void submit()}
                  style={[styles.input, nameError !== null && styles.inputError]}
                />
                {nameError !== null && <Text style={styles.error}>{nameError}</Text>}
                <Text style={styles.label}>{ddayStrings.categoryColor}</Text>
                <View style={styles.swatches} accessibilityRole="radiogroup">
                  {CATEGORY_COLOR_KEYS.map((key) => (
                    <Pressable
                      key={key}
                      accessibilityRole="radio"
                      accessibilityLabel={colorNames[key]}
                      accessibilityState={{ selected: key === color }}
                      onPress={() => setColor(key)}
                      style={[styles.swatchRing, key === color && styles.swatchRingSelected]}
                    >
                      <View
                        style={[styles.swatch, { backgroundColor: categoryPalette[key].dot }]}
                      />
                    </Pressable>
                  ))}
                </View>
                <PrimaryButton
                  label={ddayStrings.categoryAdd}
                  onPress={() => void submit()}
                  disabled={isBusy}
                />
              </>
            ) : (
              <Text style={styles.muted}>{ddayStrings.categoryLimit(MAX_CATEGORIES)}</Text>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{ddayStrings.categoryListTitle}</Text>
          <Card style={styles.list}>
            {categories.map((category, index) => (
              <View key={category.id} style={[styles.row, index > 0 && styles.rowDivider]}>
                <View
                  style={[styles.dot, { backgroundColor: categoryPalette[category.color].dot }]}
                />
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{category.name}</Text>
                  <Text style={styles.muted}>
                    {ddayStrings.categoryItemCount(
                      countItemsInCategory({ categories, items }, category.id),
                    )}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${category.name} ${ddayStrings.delete}`}
                  onPress={() => confirmRemove(category)}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                >
                  <Text style={styles.deleteText}>{ddayStrings.delete}</Text>
                </Pressable>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const SWATCH_SIZE = 32;

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.xl,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSize.caption,
      fontWeight: '700',
      color: colors.textMuted,
      marginLeft: spacing.xs,
    },
    sectionCard: {
      gap: spacing.md,
    },
    label: {
      fontSize: fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    input: {
      minHeight: MIN_TOUCH_SIZE,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      fontSize: fontSize.body,
      color: colors.text,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    inputError: {
      borderColor: colors.danger,
    },
    error: {
      fontSize: fontSize.caption,
      color: colors.danger,
    },
    swatches: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    swatchRing: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      borderRadius: MIN_TOUCH_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swatchRingSelected: {
      borderColor: colors.text,
    },
    swatch: {
      width: SWATCH_SIZE,
      height: SWATCH_SIZE,
      borderRadius: SWATCH_SIZE / 2,
    },
    list: {
      paddingVertical: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    rowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    dot: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    rowText: {
      flex: 1,
      gap: 2,
    },
    rowName: {
      fontSize: fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    muted: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
    },
    deleteButton: {
      minHeight: MIN_TOUCH_SIZE,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
    },
    pressed: {
      opacity: 0.6,
    },
    deleteText: {
      fontSize: fontSize.body,
      color: colors.danger,
      fontWeight: '600',
    },
  });
