import type { ThemePreference } from './themePreference';

export const settingsStrings = {
  title: '설정',
  openSettings: '설정 열기',
  themeSection: '화면 모드',
  themeOptions: {
    system: '시스템 설정 따르기',
    light: '라이트',
    dark: '다크',
  } satisfies Record<ThemePreference, string>,
  themeSystemHint: '휴대폰의 라이트·다크 설정에 맞춰 자동으로 바뀌어요.',
  categorySection: '분류',
  manageCategories: '분류 관리',
  privacySection: '개인정보',
  adPrivacyOptions: '광고 개인정보 설정',
  saveFailed: '설정을 저장하지 못했어요',
  devSection: '개발용 (개발 빌드에서만 보임)',
  devTestNotification: '10초 뒤 테스트 알림',
  devScheduledList: '예약된 알림 보기',
  devPinWidget: '위젯을 홈 화면에 추가',
  devWidgetPreview: '위젯 미리보기 이미지 화면',
  devPinUnsupported: '이 런처는 위젯 추가 요청을 지원하지 않아요.',
  devScheduledCount: (count: number) => `예약된 알림 ${count}개`,
} as const;
