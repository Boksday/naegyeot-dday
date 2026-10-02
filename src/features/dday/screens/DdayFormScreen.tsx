import { Stack, useRouter } from 'expo-router';
import { type ReactNode, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../../theme/tokens';
import { CategoryPicker } from '../components/CategoryChips';
import { DateField } from '../components/DateField';
import { useDdayStore } from '../DdayStoreProvider';
import { toLocalDate } from '../logic/dates';
import { NOTIFY_HOUR } from '../notifications/notificationPlan';
import { requestNotificationPermission } from '../notifications/notificationScheduler';
import { ddayStrings } from '../strings';
import {
  type DdayInput,
  hasNotification,
  MAX_TITLE_LENGTH,
  NOTIFY_DAYS_BEFORE_OPTIONS,
  type NotifyDaysBefore,
} from '../types';

/** 새 디데이의 기본 분류. 없으면 첫 분류를 쓴다. */
const DEFAULT_NEW_CATEGORY_ID = 'personal';

type DdayFormScreenProps = {
  editingId?: string;
  initialCategoryId?: string;
};

function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) return ddayStrings.titleRequired;
  if (trimmed.length > MAX_TITLE_LENGTH) return ddayStrings.titleTooLong(MAX_TITLE_LENGTH);
  return null;
}

export function DdayFormScreen({ editingId, initialCategoryId }: DdayFormScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, categories, addDday, updateDday } = useDdayStore();
  const editing = editingId ? items.find((item) => item.id === editingId) : undefined;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [selectedCategoryId, setCategoryId] = useState(
    editing?.categoryId ?? initialCategoryId ?? DEFAULT_NEW_CATEGORY_ID,
  );
  // 고른 분류가 없어졌으면(삭제 등) 첫 분류를 쓴다.
  const categoryId = categories.some((category) => category.id === selectedCategoryId)
    ? selectedCategoryId
    : (categories[0]?.id ?? selectedCategoryId);
  const [date, setDate] = useState(editing?.date ?? toLocalDate(new Date()));
  const [repeatYearly, setRepeatYearly] = useState(editing?.repeatYearly ?? false);
  const [notifyOnDay, setNotifyOnDay] = useState(editing?.notifyOnDay ?? false);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState<NotifyDaysBefore | null>(
    editing?.notifyDaysBefore ?? null,
  );
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (editingId && !editing) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>{ddayStrings.notFound}</Text>
      </View>
    );
  }

  const save = async () => {
    if (isSaving) return;
    const error = validateTitle(title);
    setTitleError(error);
    if (error) return;

    const input: DdayInput = {
      title: title.trim(),
      categoryId,
      date,
      repeatYearly,
      notifyOnDay,
      notifyDaysBefore,
    };

    setIsSaving(true);
    try {
      const permissionGranted = hasNotification(input)
        ? await requestNotificationPermission()
        : true;
      if (editingId) {
        await updateDday(editingId, input);
      } else {
        await addDday(input);
      }
      if (!permissionGranted) {
        Alert.alert(ddayStrings.permissionDeniedTitle, ddayStrings.permissionDeniedBody);
      }
      router.back();
    } catch (saveError) {
      Alert.alert(
        ddayStrings.saveFailed,
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: editingId ? ddayStrings.editTitle : ddayStrings.addTitle }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section title={ddayStrings.sectionBasic}>
          <Field label={ddayStrings.fieldCategory}>
            <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
          </Field>
          <Field label={ddayStrings.fieldTitle}>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError(null);
              }}
              placeholder={ddayStrings.fieldTitlePlaceholder}
              placeholderTextColor={colors.textMuted}
              maxLength={MAX_TITLE_LENGTH}
              accessibilityLabel={ddayStrings.fieldTitle}
              returnKeyType="done"
              style={[styles.input, titleError !== null && styles.inputError]}
            />
            {titleError !== null && <Text style={styles.error}>{titleError}</Text>}
          </Field>
          <Field label={ddayStrings.fieldDate}>
            <DateField value={date} onChange={setDate} accessibilityLabel={ddayStrings.fieldDate} />
          </Field>
        </Section>

        <Section title={ddayStrings.sectionRepeat}>
          <ToggleRow
            label={ddayStrings.fieldRepeat}
            hint={ddayStrings.fieldRepeatHint}
            value={repeatYearly}
            onChange={setRepeatYearly}
          />
        </Section>

        <Section title={ddayStrings.sectionNotification}>
          <ToggleRow
            label={ddayStrings.fieldNotifyOnDay}
            value={notifyOnDay}
            onChange={setNotifyOnDay}
          />
          <Field label={ddayStrings.fieldNotifyBefore}>
            <View style={styles.chips}>
              <OptionChip
                label={ddayStrings.notifyBeforeNone}
                selected={notifyDaysBefore === null}
                onPress={() => setNotifyDaysBefore(null)}
              />
              {NOTIFY_DAYS_BEFORE_OPTIONS.map((days) => (
                <OptionChip
                  key={days}
                  label={ddayStrings.notifyBeforeOption(days)}
                  selected={notifyDaysBefore === days}
                  onPress={() => setNotifyDaysBefore(days)}
                />
              ))}
            </View>
          </Field>
          <Text style={styles.hint}>{ddayStrings.notifyTimeHint(NOTIFY_HOUR)}</Text>
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label={isSaving ? ddayStrings.saving : ddayStrings.save}
          onPress={() => void save()}
          disabled={isSaving}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.sectionCard}>{children}</Card>
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

type ToggleRowProps = {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ label, hint, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

type OptionChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function OptionChip({ label, selected, onPress }: OptionChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
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
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
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
  hint: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: MIN_TOUCH_SIZE,
  },
  toggleText: {
    flex: 1,
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: MIN_TOUCH_SIZE - 4,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipLabel: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
