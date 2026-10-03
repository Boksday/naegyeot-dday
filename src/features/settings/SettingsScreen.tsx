import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { useAds } from '../ads/AdsProvider';
import { exportBackup, pickBackup } from '../backup/backupActions';
import { useDdayStore } from '../dday/DdayStoreProvider';
import { usePro } from '../pro/ProProvider';
import { PrimaryButton } from '../../components/PrimaryButton';
import {
  getScheduledSummaries,
  type ScheduledSummary,
  scheduleTestNotification,
} from '../dday/notifications/notificationScheduler';
import { pinWidget } from '../widget/pinWidget';
import { refreshWidget } from '../widget/refreshWidget';
import { fontSize, MIN_TOUCH_SIZE, spacing } from '../../theme/tokens';
import { type Theme, useThemedStyles } from '../../theme/useTheme';
import { settingsStrings } from './strings';
import {
  applyThemePreference,
  loadThemePreference,
  saveThemePreference,
  THEME_PREFERENCES,
  type ThemePreference,
} from './themePreference';

export function SettingsScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { isPrivacyOptionsRequired, showPrivacyOptions } = useAds();
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    let isActive = true;
    loadThemePreference()
      .then((loaded) => {
        if (isActive) setPreference(loaded);
      })
      .catch(() => {
        if (isActive) setPreference('system');
      });
    return () => {
      isActive = false;
    };
  }, []);

  const choose = (next: ThemePreference) => {
    const previous = preference;
    setPreference(next);
    applyThemePreference(next);
    saveThemePreference(next)
      .then(() =>
        // 위젯도 같은 화면 모드로 다시 그린다. 실패해도 설정 저장은 유지한다.
        refreshWidget().catch((error: unknown) => console.warn('위젯 갱신 실패', error)),
      )
      .catch((error: unknown) => {
        if (previous) {
          setPreference(previous);
          applyThemePreference(previous);
        }
        Alert.alert(
          settingsStrings.saveFailed,
          error instanceof Error ? error.message : String(error),
        );
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ProSection />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{settingsStrings.themeSection}</Text>
        <Card style={styles.list}>
          <View accessibilityRole="radiogroup">
            {THEME_PREFERENCES.map((option, index) => {
              const selected = option === preference;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => choose(option)}
                  style={[styles.row, index > 0 && styles.rowDivider]}
                >
                  <Text style={styles.rowLabel}>{settingsStrings.themeOptions[option]}</Text>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>
        <Text style={styles.hint}>{settingsStrings.themeSystemHint}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{settingsStrings.categorySection}</Text>
        <Card style={styles.list}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/categories')}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>{settingsStrings.manageCategories}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </Card>
      </View>

      <BackupSection />

      {isPrivacyOptionsRequired && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{settingsStrings.privacySection}</Text>
          <Card style={styles.list}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                showPrivacyOptions().catch((error: unknown) => {
                  Alert.alert(
                    settingsStrings.saveFailed,
                    error instanceof Error ? error.message : String(error),
                  );
                });
              }}
              style={styles.row}
            >
              <Text style={styles.rowLabel}>{settingsStrings.adPrivacyOptions}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Card>
        </View>
      )}

      {__DEV__ && <DevNotificationTools />}
    </ScrollView>
  );
}

function showError(title: string, error: unknown) {
  Alert.alert(title, error instanceof Error ? error.message : String(error));
}

function BackupSection() {
  const styles = useThemedStyles(createStyles);
  const { items, categories, mergeFromBackup, replaceWithBackup } = useDdayStore();
  const [isBusy, setIsBusy] = useState(false);

  const run = (task: () => Promise<void>, failTitle: string) => {
    if (isBusy) return;
    setIsBusy(true);
    task()
      .catch((error: unknown) => showError(failTitle, error))
      .finally(() => setIsBusy(false));
  };

  const startRestore = async () => {
    const result = await pickBackup();
    if (!result) return;
    if (!result.ok) {
      Alert.alert(
        settingsStrings.restoreFailed,
        result.reason === 'unsupported-version'
          ? settingsStrings.restoreNewer
          : settingsStrings.restoreInvalid,
      );
      return;
    }
    const { data } = result;
    Alert.alert(
      settingsStrings.restoreConfirmTitle,
      settingsStrings.restoreConfirmBody(data.items.length, data.categories.length),
      [
        { text: settingsStrings.cancel, style: 'cancel' },
        {
          text: settingsStrings.restoreReplace,
          style: 'destructive',
          onPress: () =>
            run(async () => {
              await replaceWithBackup(data);
              Alert.alert(settingsStrings.restoreReplaced);
            }, settingsStrings.restoreFailed),
        },
        {
          text: settingsStrings.restoreMerge,
          onPress: () =>
            run(async () => {
              const added = await mergeFromBackup(data);
              Alert.alert(settingsStrings.restoreMerged(added));
            }, settingsStrings.restoreFailed),
        },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{settingsStrings.backupSection}</Text>
      <Card style={styles.list}>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() =>
            run(
              () => exportBackup({ items, categories }, settingsStrings.backupShareTitle),
              settingsStrings.backupFailed,
            )
          }
          style={styles.row}
        >
          <Text style={styles.rowLabel}>{settingsStrings.backupExport}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() => run(startRestore, settingsStrings.restoreFailed)}
          style={[styles.row, styles.rowDivider]}
        >
          <Text style={styles.rowLabel}>{settingsStrings.backupImport}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </Card>
      <Text style={styles.hint}>{settingsStrings.backupHint}</Text>
    </View>
  );
}

function ProSection() {
  const styles = useThemedStyles(createStyles);
  const { isPro, storeStatus, displayPrice, isPurchasing, purchaseError, buy, restore } = usePro();

  const restorePurchases = () => {
    restore()
      .then((restored) =>
        Alert.alert(restored ? settingsStrings.proRestored : settingsStrings.proNothingToRestore),
      )
      .catch((error: unknown) => {
        Alert.alert(
          settingsStrings.proFailed,
          error instanceof Error ? error.message : String(error),
        );
      });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{settingsStrings.proSection}</Text>
      <Card style={styles.proCard}>
        {isPro ? (
          <Text style={styles.rowLabel}>{settingsStrings.proActive}</Text>
        ) : (
          <>
            <Text style={styles.proTitle}>{settingsStrings.proTitle}</Text>
            <Text style={styles.hint}>{settingsStrings.proBody}</Text>
            {storeStatus === 'ready' && displayPrice ? (
              <PrimaryButton
                label={
                  isPurchasing ? settingsStrings.proBuying : settingsStrings.proBuy(displayPrice)
                }
                onPress={() => void buy()}
                disabled={isPurchasing}
              />
            ) : (
              <Text style={styles.hint}>
                {storeStatus === 'connecting' ? '…' : settingsStrings.proUnavailable}
              </Text>
            )}
            {purchaseError && <Text style={styles.error}>{purchaseError}</Text>}
            <Pressable accessibilityRole="button" onPress={restorePurchases} style={styles.linkRow}>
              <Text style={styles.link}>{settingsStrings.proRestore}</Text>
            </Pressable>
          </>
        )}
      </Card>
    </View>
  );
}

const TEST_NOTIFICATION_DELAY_SECONDS = 10;

/** 알림 전달·예약을 기기에서 확인하기 위한 개발 빌드 전용 도구 */
function DevNotificationTools() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const [scheduled, setScheduled] = useState<ScheduledSummary[] | null>(null);

  const run = (task: () => Promise<void>) => {
    task().catch((error: unknown) => {
      Alert.alert('오류', error instanceof Error ? error.message : String(error));
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{settingsStrings.devSection}</Text>
      <Card style={styles.list}>
        <Pressable
          accessibilityRole="button"
          onPress={() => run(() => scheduleTestNotification(TEST_NOTIFICATION_DELAY_SECONDS))}
          style={styles.row}
        >
          <Text style={styles.rowLabel}>{settingsStrings.devTestNotification}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => run(async () => setScheduled(await getScheduledSummaries()))}
          style={[styles.row, styles.rowDivider]}
        >
          <Text style={styles.rowLabel}>{settingsStrings.devScheduledList}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            run(async () => {
              if (!(await pinWidget())) Alert.alert(settingsStrings.devPinUnsupported);
            })
          }
          style={[styles.row, styles.rowDivider]}
        >
          <Text style={styles.rowLabel}>{settingsStrings.devPinWidget}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/dev-widget-preview')}
          style={[styles.row, styles.rowDivider]}
        >
          <Text style={styles.rowLabel}>{settingsStrings.devWidgetPreview}</Text>
        </Pressable>
        {scheduled && (
          <View style={styles.devList}>
            <Text style={styles.hint}>{settingsStrings.devScheduledCount(scheduled.length)}</Text>
            {scheduled.map((item) => (
              <Text key={item.identifier} style={styles.hint}>
                {`${item.fireAt} · ${item.identifier}`}
              </Text>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}

const RADIO_SIZE = 22;

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
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
    list: {
      paddingVertical: spacing.xs,
    },
    row: {
      minHeight: MIN_TOUCH_SIZE + 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    rowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    rowLabel: {
      fontSize: fontSize.body,
      color: colors.text,
    },
    hint: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
      marginLeft: spacing.xs,
    },
    radio: {
      width: RADIO_SIZE,
      height: RADIO_SIZE,
      borderRadius: RADIO_SIZE / 2,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.primaryText,
    },
    radioDot: {
      width: RADIO_SIZE / 2,
      height: RADIO_SIZE / 2,
      borderRadius: RADIO_SIZE / 4,
      backgroundColor: colors.primaryText,
    },
    devList: {
      paddingBottom: spacing.md,
      gap: spacing.xs,
    },
    proCard: {
      gap: spacing.md,
    },
    proTitle: {
      fontSize: fontSize.title,
      fontWeight: '700',
      color: colors.text,
    },
    error: {
      fontSize: fontSize.caption,
      color: colors.danger,
    },
    linkRow: {
      minHeight: MIN_TOUCH_SIZE - 8,
      justifyContent: 'center',
      alignSelf: 'center',
    },
    link: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
      textDecorationLine: 'underline',
    },
    chevron: {
      fontSize: fontSize.headline,
      color: colors.textMuted,
    },
  });
