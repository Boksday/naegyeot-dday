import { StyleSheet, Text, View } from 'react-native';

import { type Theme, useTheme, useThemedStyles } from '../theme/useTheme';

type AssetPlaceholderProps = {
  /** 어떤 아이콘·이미지가 들어갈 자리인지. docs/assets.md의 이름과 맞춘다. */
  name: string;
  size: number;
  showLabel?: boolean;
  tint?: string;
};

/**
 * 디자인 자산이 준비되기 전 자리 표시용 X 상자.
 * 실제 자산으로 바꾸면 이 컴포넌트 사용처를 지운다.
 */
export function AssetPlaceholder({
  name,
  size,
  showLabel = false,
  tint: tintProp,
}: AssetPlaceholderProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const tint = tintProp ?? colors.textMuted;
  const diagonal = size * Math.SQRT2;
  const lineStyle = {
    width: diagonal,
    left: (size - diagonal) / 2,
    top: size / 2 - 0.5,
    backgroundColor: tint,
  };

  return (
    <View style={styles.wrapper} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={[styles.box, { width: size, height: size, borderColor: tint }]}>
        <View style={[styles.line, lineStyle, { transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.line, lineStyle, { transform: [{ rotate: '-45deg' }] }]} />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: tint, maxWidth: Math.max(size, 80) }]}>{name}</Text>
      )}
    </View>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      gap: 4,
    },
    box: {
      borderWidth: 1,
      overflow: 'hidden',
    },
    line: {
      position: 'absolute',
      height: 1,
      opacity: 0.6,
    },
    label: {
      fontSize: 11,
      textAlign: 'center',
    },
  });
