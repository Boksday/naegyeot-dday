import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DdayStoreProvider } from '../features/dday/DdayStoreProvider';
import { ddayStrings } from '../features/dday/strings';
import { colors } from '../theme/tokens';

export default function RootLayout() {
  return (
    <DdayStoreProvider>
      <StatusBar style="dark" />
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
      </Stack>
    </DdayStoreProvider>
  );
}
