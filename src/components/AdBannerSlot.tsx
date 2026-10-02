import { StyleSheet, Text, View } from 'react-native';

import { fontSize } from '../theme/tokens';
import { type Theme, useThemedStyles } from '../theme/useTheme';

/** 표준 배너(320×50)와 적응형 배너 높이 변화를 감당할 수 있게 잡은 높이 */
export const AD_BANNER_HEIGHT = 60;

/**
 * 광고 배너가 들어갈 자리 표시. 광고 SDK를 연결하면 이 컴포넌트 안을 실제 배너로 바꾼다.
 * 오클릭을 막기 위해 버튼과 붙여 두지 않는다(docs/ads.md).
 */
export function AdBannerSlot({ label }: { label: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.slot} accessible={false} importantForAccessibility="no-hide-descendants">
      <Text style={styles.label}>{label} · 320×50</Text>
    </View>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    slot: {
      height: AD_BANNER_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.textMuted,
      backgroundColor: colors.surfaceMuted,
    },
    label: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
    },
  });
