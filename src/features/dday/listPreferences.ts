import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SORT_MODE, isSortMode, type SortMode } from './logic/sorting';

const SORT_MODE_KEY = 'naegyeot-dday:list-sort-mode';

export async function loadSortMode(): Promise<SortMode> {
  const raw = await AsyncStorage.getItem(SORT_MODE_KEY);
  return isSortMode(raw) ? raw : DEFAULT_SORT_MODE;
}

export async function saveSortMode(mode: SortMode): Promise<void> {
  await AsyncStorage.setItem(SORT_MODE_KEY, mode);
}

export const VIEW_MODES = ['list', 'calendar'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];
const VIEW_MODE_KEY = 'naegyeot-dday:list-view-mode';

function isViewMode(value: unknown): value is ViewMode {
  return VIEW_MODES.some((mode) => mode === value);
}

export async function loadViewMode(): Promise<ViewMode> {
  const raw = await AsyncStorage.getItem(VIEW_MODE_KEY);
  return isViewMode(raw) ? raw : 'list';
}

export async function saveViewMode(mode: ViewMode): Promise<void> {
  await AsyncStorage.setItem(VIEW_MODE_KEY, mode);
}
