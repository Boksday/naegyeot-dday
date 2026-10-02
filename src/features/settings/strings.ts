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
  saveFailed: '설정을 저장하지 못했어요',
} as const;
