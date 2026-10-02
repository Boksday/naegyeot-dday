import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontSize, MIN_TOUCH_SIZE, radius, spacing } from '../../../theme/tokens';
import { type Theme, useThemedStyles } from '../../../theme/useTheme';
import { SORT_MODES, type SortMode } from '../logic/sorting';
import { ddayStrings } from '../strings';

type SortSheetProps = {
  visible: boolean;
  value: SortMode;
  onSelect: (mode: SortMode) => void;
  onClose: () => void;
};

export function SortSheet({ visible, value, onSelect, onClose }: SortSheetProps) {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="닫기" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{ddayStrings.sortTitle}</Text>
          <View accessibilityRole="radiogroup">
            {SORT_MODES.map((mode) => {
              const selected = mode === value;
              return (
                <Pressable
                  key={mode}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(mode);
                    onClose();
                  }}
                  style={styles.row}
                >
                  <Text style={[styles.label, selected && styles.labelSelected]}>
                    {ddayStrings.sortLabels[mode]}
                  </Text>
                  {selected && <Text style={styles.check}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    title: {
      fontSize: fontSize.title,
      fontWeight: '700',
      color: colors.text,
      paddingVertical: spacing.sm,
    },
    row: {
      minHeight: MIN_TOUCH_SIZE + 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: fontSize.body,
      color: colors.text,
    },
    labelSelected: {
      color: colors.primaryText,
      fontWeight: '700',
    },
    check: {
      fontSize: fontSize.title,
      color: colors.primaryText,
      fontWeight: '700',
    },
  });
