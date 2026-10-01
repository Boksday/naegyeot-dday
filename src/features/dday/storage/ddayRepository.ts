import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Dday } from '../types';
import { type ParseResult, parseStoredData, serializeStoredData } from './ddaySchema';

const STORAGE_KEY = 'naegyeot-dday:store';

export type LoadResult = ParseResult;

export async function loadDdays(): Promise<LoadResult> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseStoredData(raw);
}

export async function saveDdays(items: readonly Dday[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, serializeStoredData(items));
}
