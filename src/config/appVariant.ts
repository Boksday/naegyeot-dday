import Constants from 'expo-constants';

/**
 * 개발용 앱(APP_VARIANT=dev, 패키지 com.naegyeot.dday.dev)인지.
 * 스토어 앱과 패키지가 달라 스토어에 올라갈 수 없으므로, Pro를 켜 두고 테스트 광고만 쓴다.
 */
export const IS_DEV_VARIANT = Constants.expoConfig?.extra?.variant === 'dev';
