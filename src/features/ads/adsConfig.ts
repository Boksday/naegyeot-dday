import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

import { IS_DEV_VARIANT } from '../../config/appVariant';

// EXPO_PUBLIC_ 값은 번들을 만들 때 코드에 들어간다. 정적인 이름으로만 읽어야 한다.
const ANDROID_BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID;
const IOS_BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS;
const FORCE_TEST_IDS = process.env.EXPO_PUBLIC_ADMOB_USE_TEST_IDS === '1';
const TEST_DEVICE_IDS = process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS;

/**
 * 배너 광고 단위 ID. 개발 빌드와 확인용 빌드는 구글 테스트 ID를 쓴다.
 * 운영 빌드에 실제 ID가 없으면 null이고, 이때는 광고를 띄우지 않는다.
 */
export function getBannerUnitId(): string | null {
  if (__DEV__ || FORCE_TEST_IDS || IS_DEV_VARIANT) return TestIds.ADAPTIVE_BANNER;
  const id = Platform.OS === 'ios' ? IOS_BANNER_ID : ANDROID_BANNER_ID;
  return id ? id : null;
}

/**
 * 실제 광고 단위를 써도 테스트 광고만 받을 개발자 기기 ID 목록(쉼표로 구분).
 * 자기 광고를 보거나 누르면 무효 트래픽으로 계정이 정지될 수 있어 개발자 기기는 꼭 등록한다.
 */
export function getTestDeviceIds(): string[] {
  const raw: string = TEST_DEVICE_IDS ?? '';
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}
