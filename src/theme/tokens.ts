export const colors = {
  background: '#FFF8F4',
  surface: '#FFFFFF',
  text: '#2B2321',
  textMuted: '#6B5D58',
  primary: '#B5452F',
  onPrimary: '#FFFFFF',
  primarySoft: '#FBE4DC',
  border: '#EADBD4',
  danger: '#B3261E',
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
  sm: 8,
  md: 14,
  pill: 999,
} as const;

export const fontSize = {
  caption: 13,
  body: 16,
  title: 18,
  headline: 24,
  display: 40,
} as const;

/** 접근성 권장 최소 터치 영역 */
export const MIN_TOUCH_SIZE = 48;
