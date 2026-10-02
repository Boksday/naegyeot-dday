import type { ViewStyle } from 'react-native';

export const colors = {
  background: '#FFF8F5',
  surface: '#FFFFFF',
  surfaceMuted: '#FBF1EE',
  text: '#3D2B28',
  textMuted: '#7A6661',
  /** 버튼·강조 배경용 파스텔 코랄. 위에는 onPrimary(진한 글자)를 올린다. */
  primary: '#FFB5A7',
  onPrimary: '#3D2B28',
  primarySoft: '#FFE5DE',
  /** 흰 배경 위 강조 글자용. 파스텔은 글자로 쓰면 대비가 부족하다. */
  primaryText: '#A8432F',
  border: '#F0E2DD',
  danger: '#B83227',
  overlay: 'rgba(61, 43, 40, 0.4)',
} as const;

/**
 * 분류 색. 키는 저장 데이터에 들어가므로 이름을 바꾸지 않는다.
 * - dot: 파스텔 점·강조 배경
 * - soft: 더 연한 배경
 * - text: soft·흰 배경 위에서 대비 4.5 이상인 글자색
 */
export const categoryPalette = {
  rose: { dot: '#FFB3C7', soft: '#FFE6EE', text: '#A3365A' },
  terracotta: { dot: '#FFC4A8', soft: '#FFEDE3', text: '#9C4521' },
  blue: { dot: '#A8D0FF', soft: '#E5F1FF', text: '#2D5C96' },
  green: { dot: '#B5E5B9', soft: '#E8F7E9', text: '#2E6A39' },
  purple: { dot: '#CDB8F5', soft: '#F1EBFD', text: '#5F439E' },
  amber: { dot: '#FFE08A', soft: '#FFF6D9', text: '#7A5700' },
  teal: { dot: '#A6E3DA', soft: '#E4F7F4', text: '#1E6961' },
  gray: { dot: '#D9D2CF', soft: '#F3EFED', text: '#5B5552' },
} as const;

export type CategoryColorKey = keyof typeof categoryPalette;
export const CATEGORY_COLOR_KEYS = Object.keys(categoryPalette) as CategoryColorKey[];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
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
