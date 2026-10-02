import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DdayData } from '../types';
import { type ParseResult, parseStoredData, serializeStoredData } from './ddaySchema';

const STORAGE_KEY = 'naegyeot-dday:store';

export type LoadResult = ParseResult;

export async function loadDdayData(): Promise<LoadResult> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseStoredData(raw);
}

export async function saveDdayData(data: DdayData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, serializeStoredData(data));
}
