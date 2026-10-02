import { View } from 'react-native';

import { categoryPalette, type CategoryColorKey } from '../../../theme/tokens';

export function CategoryDot({ color, size = 10 }: { color: CategoryColorKey; size?: number }) {
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
