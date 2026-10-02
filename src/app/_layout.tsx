import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { DdayStoreProvider } from '../features/dday/DdayStoreProvider';
import { ddayStrings } from '../features/dday/strings';
import { settingsStrings } from '../features/settings/strings';
import { applyThemePreference, loadThemePreference } from '../features/settings/themePreference';
import { useTheme } from '../theme/useTheme';

export default function RootLayout() {
  const { colors } = useTheme();

  useEffect(() => {
    loadThemePreference()
      .then(applyThemePreference)
      .catch((error: unknown) => {
        // 읽지 못하면 시스템 설정을 따르는 기본 동작으로 둔다.
        console.warn('화면 모드 설정을 읽지 못함', error);
      });
  }, []);
  return (
    <DdayStoreProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: ddayStrings.appTitle, headerShown: false }} />
        <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="dday/[id]" options={{ title: '' }} />
        <Stack.Screen name="categories" options={{ title: ddayStrings.categoriesTitle }} />
        <Stack.Screen name="settings" options={{ title: settingsStrings.title }} />
      </Stack>
    </DdayStoreProvider>
  );
}
