import { useMemo } from 'react';
import { useColorScheme, type ViewStyle } from 'react-native';

import {
  type CategoryPalette,
  darkCategoryPalette,
  darkColors,
  darkShadow,
  lightCategoryPalette,
  lightColors,
  lightShadow,
  type ThemeColors,
} from './tokens';

export type Theme = {
  isDark: boolean;
  colors: ThemeColors;
  categoryPalette: CategoryPalette;
  shadow: ViewStyle;
};

export const LIGHT_THEME: Theme = {
  isDark: false,
  colors: lightColors,
  categoryPalette: lightCategoryPalette,
  shadow: lightShadow,
};

export const DARK_THEME: Theme = {
  isDark: true,
  colors: darkColors,
  categoryPalette: darkCategoryPalette,
  shadow: darkShadow,
};

/** 기기의 라이트·다크 설정을 따른다. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? DARK_THEME : LIGHT_THEME;
}

/** factory는 모듈 수준에 두어 테마가 바뀔 때만 스타일을 다시 만든다. */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
