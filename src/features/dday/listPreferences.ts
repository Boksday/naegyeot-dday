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
