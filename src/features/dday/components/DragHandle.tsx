import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme/tokens';
import { type Theme, useThemedStyles } from '../../../theme/useTheme';

const GRABBER_WIDTH = 22;
const GRABBER_HEIGHT = 4;
/** 내용보다 튀지 않도록 연하게 둔다. */
const GRABBER_OPACITY = 0.22;
/** 보이는 막대는 작게, 누르는 영역은 바깥 여백으로 넓힌다. */
const HIT_SLOP = { top: 12, bottom: 14, left: 14, right: 14 };

/**
 * 직접 정렬 손잡이. 카드 왼쪽 위 모서리에 작은 막대로 떠 있다.
 * 누르는 즉시 끌기를 시작한다.
 */
export function DragHandle({ onDragStart }: { onDragStart: () => void }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPressIn={onDragStart}
      hitSlop={HIT_SLOP}
      // 화면 읽기 사용자는 카드의 위로·아래로 옮기기 동작을 쓴다.
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={styles.handle}
    >
      <View style={styles.grabber} />
    </Pressable>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    handle: {
      position: 'absolute',
      top: 6,
      left: spacing.lg,
      paddingVertical: 2,
    },
    grabber: {
      width: GRABBER_WIDTH,
      height: GRABBER_HEIGHT,
      borderRadius: GRABBER_HEIGHT / 2,
      backgroundColor: colors.text,
      opacity: GRABBER_OPACITY,
    },
  });
