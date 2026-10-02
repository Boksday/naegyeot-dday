import type { ViewStyle } from 'react-native';

/** 위젯 등 일부 API가 '#'으로 시작하는 색 문자열만 받는다. */
export type HexColor = `#${string}`;

export type ThemeColors = {
  background: HexColor;
  surface: HexColor;
  surfaceMuted: HexColor;
  text: HexColor;
  textMuted: HexColor;
  /** 주 버튼·스위치 등 브랜드 청록. 위에는 onPrimary를 올린다. */
  primary: HexColor;
  onPrimary: HexColor;
  primarySoft: HexColor;
  /** 파스텔 배경(분류 점 색) 위 글자. 다크에서도 진한 색이어야 읽힌다. */
  onPastel: HexColor;
  /** 바탕 위 강조 글자용 */
  primaryText: HexColor;
  /** 보조 강조(+ 버튼 등) 브랜드 살구 */
  accent: HexColor;
  onAccent: HexColor;
  border: HexColor;
  danger: HexColor;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: '#FCF8F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F5EFE7',
  text: '#3D2B28',
  textMuted: '#7A6661',
  primary: '#1F6B68',
  onPrimary: '#FFFFFF',
  primarySoft: '#DCEFEA',
  onPastel: '#3D2B28',
  primaryText: '#1F6B68',
  accent: '#F0AE81',
  onAccent: '#0E4644',
  border: '#ECE3D8',
  danger: '#B83227',
  overlay: 'rgba(30, 40, 38, 0.4)',
};

export const darkColors: ThemeColors = {
  background: '#171918',
  surface: '#222625',
  surfaceMuted: '#2C3130',
  text: '#F3EEEA',
  textMuted: '#B5B9B6',
  primary: '#7CC4B8',
  onPrimary: '#0F2E2B',
  primarySoft: '#1E3634',
  onPastel: '#3D2B28',
  primaryText: '#8FD6CA',
  accent: '#F0AE81',
  onAccent: '#3A2414',
  border: '#363C3A',
  danger: '#FF8F85',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

type CategoryColors = { dot: HexColor; soft: HexColor; text: HexColor };

/**
 * 분류 색. 키는 저장 데이터에 들어가므로 이름을 바꾸지 않는다.
 * - dot: 파스텔 점·강조 배경
 * - soft: 연한(다크에서는 어두운) 배경
 * - text: soft·바탕 위에서 대비 4.5 이상인 글자색
 */
export const lightCategoryPalette = {
  rose: { dot: '#FFB3C7', soft: '#FFE6EE', text: '#A3365A' },
  terracotta: { dot: '#FFC4A8', soft: '#FFEDE3', text: '#9C4521' },
  blue: { dot: '#A8D0FF', soft: '#E5F1FF', text: '#2D5C96' },
  green: { dot: '#B5E5B9', soft: '#E8F7E9', text: '#2E6A39' },
  purple: { dot: '#CDB8F5', soft: '#F1EBFD', text: '#5F439E' },
  amber: { dot: '#FFE08A', soft: '#FFF6D9', text: '#7A5700' },
  teal: { dot: '#A6E3DA', soft: '#E4F7F4', text: '#1E6961' },
  gray: { dot: '#D9D2CF', soft: '#F3EFED', text: '#5B5552' },
} as const satisfies Record<string, CategoryColors>;

export type CategoryColorKey = keyof typeof lightCategoryPalette;
export type CategoryPalette = Record<CategoryColorKey, CategoryColors>;
export const CATEGORY_COLOR_KEYS = Object.keys(lightCategoryPalette) as CategoryColorKey[];

export const darkCategoryPalette: CategoryPalette = {
  rose: { dot: '#FFB3C7', soft: '#45252F', text: '#FFC2D2' },
  terracotta: { dot: '#FFC4A8', soft: '#47291E', text: '#FFCDB6' },
  blue: { dot: '#A8D0FF', soft: '#1F3047', text: '#B8D8FF' },
  green: { dot: '#B5E5B9', soft: '#213826', text: '#C1EAC4' },
  purple: { dot: '#CDB8F5', soft: '#33294A', text: '#D8C7F7' },
  amber: { dot: '#FFE08A', soft: '#41361A', text: '#FFE49B' },
  teal: { dot: '#A6E3DA', soft: '#1D3A36', text: '#B4E8E0' },
  gray: { dot: '#D9D2CF', soft: '#3A3331', text: '#DED8D5' },
};

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

/**
 * 라이트·다크가 같은 속성을 모두 가져야 한다. 테마 전환 때 속성이 빠지면 Android가
 * 둥근 모서리 그림자를 다시 계산하지 않아 네모난 그림자 자국이 남는다.
 */
export const lightShadow: ViewStyle = {
  shadowColor: '#3A2E25',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
  borderWidth: 0,
  borderColor: 'transparent',
};

/** 어두운 바탕에서는 그림자가 보이지 않으므로 테두리로 면을 구분한다. */
export const darkShadow: ViewStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
  borderWidth: 1,
  borderColor: darkColors.border,
};
