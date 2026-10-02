import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { PrimaryButton } from '../../components/PrimaryButton';
import { fontSize, spacing } from '../../theme/tokens';
import { type Theme, useThemedStyles } from '../../theme/useTheme';
import { useDdayStore } from '../dday/DdayStoreProvider';
import { useToday } from '../dday/hooks/useToday';
import { findCategory } from '../dday/logic/categories';
import { ddayStrings } from '../dday/strings';
import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH, ShareCard } from './ShareCard';
import { buildShareCardContent } from './shareCardContent';

/** 공유 이미지 해상도(px). 화면 밀도와 상관없이 같은 크기로 만든다. */
const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = Math.round((EXPORT_WIDTH * SHARE_CARD_HEIGHT) / SHARE_CARD_WIDTH);

export function ShareScreen({ id }: { id: string }) {
  const styles = useThemedStyles(createStyles);
  const today = useToday();
  const { items, categories } = useDdayStore();
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>{ddayStrings.notFound}</Text>
      </View>
    );
  }

  const category = findCategory(categories, item.categoryId);
  const content = buildShareCardContent(item, today);

  const share = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(ddayStrings.shareUnavailable);
        return;
      }
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
      });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: content.title });
    } catch (error) {
      Alert.alert(ddayStrings.shareFailed, error instanceof Error ? error.message : String(error));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        <ShareCard
          ref={cardRef}
          content={content}
          color={category?.color ?? 'gray'}
          categoryName={category?.name ?? null}
        />
      </View>
      <Text style={styles.hint}>{ddayStrings.shareHint}</Text>
      <PrimaryButton
        label={isSharing ? ddayStrings.sharing : ddayStrings.share}
        onPress={() => void share()}
        disabled={isSharing}
      />
    </View>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
      gap: spacing.lg,
      justifyContent: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    preview: {
      alignItems: 'center',
    },
    hint: {
      fontSize: fontSize.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
