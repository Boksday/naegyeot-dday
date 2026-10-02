import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
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
    saveThemePreference(next).catch((error: unknown) => {
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
    </ScrollView>
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
    chevron: {
      fontSize: fontSize.headline,
      color: colors.textMuted,
    },
  });
