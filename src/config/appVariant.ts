import Constants from 'expo-constants';

/**
 * 개발용 앱(APP_VARIANT=dev, 패키지 com.naegyeot.dday.dev)인지.
 * 스토어 앱과 패키지가 달라 스토어에 올라갈 수 없으므로, Pro를 켜 두고 테스트 광고만 쓴다.
 */
export const IS_DEV_VARIANT = Constants.expoConfig?.extra?.variant === 'dev';

/**
 * 내부 테스트 배포용: 결제 없이 Pro 기능을 연다(EXPO_PUBLIC_UNLOCK_PRO=1로 빌드).
 * 이 빌드를 프로덕션으로 승격하면 모든 사용자에게 Pro가 풀리므로 내부 테스트에만 쓴다(docs/release.md).
 */
export const IS_PRO_UNLOCKED_BUILD = process.env.EXPO_PUBLIC_UNLOCK_PRO === '1';

/** 결제 없이 Pro를 켜 두는 빌드인지 */
export const IS_PRO_FREE = IS_DEV_VARIANT || IS_PRO_UNLOCKED_BUILD;
