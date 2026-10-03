import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DdayData } from '../types';
import { type ParseResult, parseStoredData, serializeStoredData } from './ddaySchema';

const STORAGE_KEY = 'naegyeot-dday:store';
/** 백업으로 통째로 바꾸기 직전 기록. 실수로 바꿨을 때 되살릴 수 있게 하나만 남긴다. */
const BEFORE_RESTORE_KEY = 'naegyeot-dday:store:before-restore';

export type LoadResult = ParseResult;

export async function loadDdayData(): Promise<LoadResult> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseStoredData(raw);
}

export async function saveDdayData(data: DdayData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, serializeStoredData(data));
}

export async function saveBeforeRestoreSnapshot(data: DdayData): Promise<void> {
  await AsyncStorage.setItem(BEFORE_RESTORE_KEY, serializeStoredData(data));
}
