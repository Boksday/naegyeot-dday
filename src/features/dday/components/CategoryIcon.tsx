import { AssetPlaceholder } from '../../../components/AssetPlaceholder';
import { categoryColors } from '../../../theme/tokens';
import type { DdayCategory } from '../types';

const ICON_NAMES: Record<DdayCategory, string> = {
  couple: '연인 아이콘(하트)',
  personal: '개인 아이콘(별)',
  work: '업무 아이콘(가방)',
};

/** 분류 아이콘 자리. 아이콘 자산이 준비되면 이미지로 바꾼다. */
export function CategoryIcon({ category, size }: { category: DdayCategory; size: number }) {
  return (
    <AssetPlaceholder
      name={ICON_NAMES[category]}
      size={size}
      tint={categoryColors[category].strong}
    />
  );
}
