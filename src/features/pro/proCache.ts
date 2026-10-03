import AsyncStorage from '@react-native-async-storage/async-storage';

/** 오프라인과 홈 위젯(앱 밖에서 그려짐)에서 Pro 여부를 알기 위한 기기 저장 값. */
const PRO_CACHE_KEY = 'naegyeot-dday:pro';

export async function loadCachedPro(): Promise<boolean> {
  return (await AsyncStorage.getItem(PRO_CACHE_KEY)) === '1';
}

export async function saveCachedPro(isPro: boolean): Promise<void> {
  await AsyncStorage.setItem(PRO_CACHE_KEY, isPro ? '1' : '0');
}
