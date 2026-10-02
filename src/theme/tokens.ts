import type { ViewStyle } from 'react-native';

export const colors = {
  background: '#FFF6F1',
  surface: '#FFFFFF',
  surfaceMuted: '#F7EEEA',
  text: '#2B2321',
  textMuted: '#6B5D58',
  primary: '#B5452F',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#FBE4DC',
  primarySoft: '#FBE4DC',
  border: '#EADBD4',
  danger: '#B3261E',
  overlay: 'rgba(43, 35, 33, 0.45)',
} as const;

/** 분류별 강조색. strong은 흰 글자, soft 위에는 strong 글자를 올려도 대비 4.5 이상이다. */
export const categoryColors = {
  couple: { strong: '#B83A62', soft: '#FBE3EA' },
  personal: { strong: '#B5452F', soft: '#FBE4DC' },
  work: { strong: '#2F5D9E', soft: '#E1EAF7' },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const fontSize = {
  caption: 13,
  body: 16,
  title: 18,
  headline: 24,
  hero: 32,
  display: 52,
} as const;

/** 접근성 권장 최소 터치 영역 */
export const MIN_TOUCH_SIZE = 48;

export const shadow: ViewStyle = {
  shadowColor: '#5A2E22',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};
