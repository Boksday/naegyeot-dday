import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const STORAGE_KEY = 'naegyeot-dday:theme-preference';
const DEFAULT_PREFERENCE: ThemePreference = 'system';

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.some((preference) => preference === value);
}

export async function loadThemePreference(): Promise<ThemePreference> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return isThemePreference(raw) ? raw : DEFAULT_PREFERENCE;
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, preference);
}

/** 앱 안에서만 라이트·다크를 고정한다. useColorScheme이 이 값을 따른다. */
export function applyThemePreference(preference: ThemePreference): void {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}
