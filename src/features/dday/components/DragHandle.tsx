import { Pressable, StyleSheet, View } from 'react-native';

import { type Theme, useThemedStyles } from '../../../theme/useTheme';

const BAR_WIDTH = 11;
const BAR_HEIGHT = 2;
const BAR_GAP = 2.5;
const BAR_COUNT = 3;
/** 내용보다 튀지 않도록 연하게 둔다. */
const HANDLE_OPACITY = 0.25;
/** 보이는 폭은 좁게, 누르는 영역은 바깥 여백으로 넓힌다. */
const HIT_SLOP = { top: 16, bottom: 16, left: 16, right: 10 };

/** 직접 정렬 손잡이(≡). 누르는 즉시 끌기를 시작한다. */
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
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <View key={index} style={styles.bar} />
      ))}
    </Pressable>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    handle: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: BAR_GAP,
      opacity: HANDLE_OPACITY,
      // 카드 안쪽 간격보다 손잡이와 내용 사이를 좁혀 보이게 한다.
      marginRight: -4,
    },
    bar: {
      width: BAR_WIDTH,
      height: BAR_HEIGHT,
      borderRadius: BAR_HEIGHT / 2,
      backgroundColor: colors.text,
    },
  });
