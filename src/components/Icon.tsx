import { Image } from 'react-native';

import { useTheme } from '../theme/useTheme';

const ICONS = {
  settings: require('../../assets/icons/settings.png'),
  editDate: require('../../assets/icons/edit-date.png'),
} as const;

export type IconName = keyof typeof ICONS;

/** 단색 아이콘. 원본은 브랜드 청록이고, 테마에 맞는 색으로 다시 칠한다. */
export function Icon({ name, size, color }: { name: IconName; size: number; color?: string }) {
  const { colors } = useTheme();
  return (
    <Image
      source={ICONS[name]}
      accessible={false}
      style={{ width: size, height: size, tintColor: color ?? colors.primaryText }}
    />
  );
}
