import { View } from 'react-native';

import { type CategoryColorKey } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';

export function CategoryDot({ color, size = 10 }: { color: CategoryColorKey; size?: number }) {
  const { categoryPalette } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: categoryPalette[color].dot,
      }}
    />
  );
}
