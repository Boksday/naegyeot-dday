import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_SIZE } from '../../../theme/tokens';
import { type Theme, useThemedStyles } from '../../../theme/useTheme';

const DOT_SIZE = 4;
const ROWS = 3;

/** 직접 정렬 손잡이. 누르는 즉시 끌기를 시작한다. */
export function DragHandle({ onDragStart }: { onDragStart: () => void }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPressIn={onDragStart}
      hitSlop={8}
      // 화면 읽기 사용자는 카드의 위로·아래로 옮기기 동작을 쓴다.
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={styles.handle}
    >
      {Array.from({ length: ROWS }, (_, row) => (
        <View key={row} style={styles.row}>
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      ))}
    </Pressable>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    handle: {
      width: MIN_TOUCH_SIZE / 2 + 4,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      gap: DOT_SIZE,
    },
    row: {
      flexDirection: 'row',
      gap: DOT_SIZE,
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: colors.textMuted,
    },
  });
