import { AssetPlaceholder } from '../../../components/AssetPlaceholder';
import { categoryPalette, type CategoryColorKey } from '../../../theme/tokens';
import { ddayStrings } from '../strings';

/** 분류 아이콘 자리. 아이콘 자산이 준비되면 이미지로 바꾼다. */
export function CategoryIcon({
  color,
  size,
  tint,
}: {
  color: CategoryColorKey;
  size: number;
  tint?: string;
}) {
  return (
    <AssetPlaceholder
      name={ddayStrings.categoryIconName}
      size={size}
      tint={tint ?? categoryPalette[color].strong}
    />
  );
}
