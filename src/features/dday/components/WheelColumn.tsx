import { useEffect, useRef } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontSize } from '../../../theme/tokens';

export const WHEEL_ITEM_HEIGHT = 44;
const VISIBLE_ITEM_COUNT = 5;
const EDGE_PADDING = WHEEL_ITEM_HEIGHT * Math.floor(VISIBLE_ITEM_COUNT / 2);

type WheelColumnProps = {
  values: readonly number[];
  selected: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
  accessibilityLabel: string;
};

/** 스크롤해서 가운데 칸에 멈춘 값을 고르는 휠. 화면 읽기 사용자는 위·아래 조절 동작으로 바꾼다. */
export function WheelColumn({
  values,
  selected,
  format,
  onChange,
  accessibilityLabel,
}: WheelColumnProps) {
  const listRef = useRef<FlatList<number>>(null);
  const selectedIndex = Math.max(0, values.indexOf(selected));

  // 다른 휠 때문에 값이 바뀌면(예: 31일 → 30일) 보이는 위치도 맞춘다.
  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: selectedIndex * WHEEL_ITEM_HEIGHT,
      animated: true,
    });
  }, [selectedIndex]);

  const selectIndex = (index: number) => {
    const clamped = Math.min(values.length - 1, Math.max(0, index));
    const value = values[clamped];
    if (value !== undefined && value !== selected) onChange(value);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    selectIndex(Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT));
  };

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: format(selected) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        selectIndex(selectedIndex + (event.nativeEvent.actionName === 'increment' ? 1 : -1));
      }}
    >
      <View pointerEvents="none" style={styles.highlight} />
      <FlatList
        ref={listRef}
        data={values}
        keyExtractor={(value) => String(value)}
        getItemLayout={(_, index) => ({
          length: WHEEL_ITEM_HEIGHT,
          offset: WHEEL_ITEM_HEIGHT * index,
          index,
        })}
        initialScrollIndex={selectedIndex}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(event) => {
          // 손을 떼고 관성 스크롤이 없으면 momentum 이벤트가 오지 않는다.
          if (Math.abs(event.nativeEvent.velocity?.y ?? 0) < 0.1) handleScrollEnd(event);
        }}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.item}
            onPress={() => selectIndex(index)}
            importantForAccessibility="no"
          >
            <Text style={[styles.text, item === selected && styles.selectedText]}>
              {format(item)}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: WHEEL_ITEM_HEIGHT * VISIBLE_ITEM_COUNT,
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: EDGE_PADDING,
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  content: {
    paddingVertical: EDGE_PADDING,
  },
  item: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  selectedText: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.primaryText,
  },
});
