import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { type CategoryColorKey, lightCategoryPalette, lightColors } from '../../theme/tokens';
import type { ShareCardContent } from './shareCardContent';

/** 공유 이미지 비율(4:5). 인스타그램 피드·카카오톡에서 잘리지 않는 세로형이다. */
export const SHARE_CARD_WIDTH = 320;
export const SHARE_CARD_HEIGHT = 400;

const APP_LOGO = require('../../../assets/logo.png');

type ShareCardProps = {
  content: ShareCardContent;
  color: CategoryColorKey;
  categoryName: string | null;
};

/**
 * 공유용 카드. 받는 사람 화면과 상관없이 보이도록 항상 라이트 색을 쓴다.
 * 이 뷰를 그대로 이미지로 캡처한다.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { content, color, categoryName },
  ref,
) {
  const palette = lightCategoryPalette[color];
  return (
    <View ref={ref} collapsable={false} style={[styles.card, { backgroundColor: palette.dot }]}>
      <View style={[styles.bubble, styles.bubbleLarge, { backgroundColor: palette.soft }]} />
      <View style={[styles.bubble, styles.bubbleSmall, { backgroundColor: palette.soft }]} />

      {categoryName && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{categoryName}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>
        <Text style={styles.headline} adjustsFontSizeToFit numberOfLines={1}>
          {content.headline}
        </Text>
        <Text style={styles.caption}>{content.caption}</Text>
      </View>

      <View style={styles.footer}>
        <Image source={APP_LOGO} style={styles.logo} />
        <Text style={styles.brand}>내곁의 디데이</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  bubbleLarge: {
    width: 220,
    height: 220,
    top: -70,
    right: -70,
  },
  bubbleSmall: {
    width: 120,
    height: 120,
    bottom: 40,
    left: -50,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: lightColors.onPastel,
  },
  body: {
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: lightColors.onPastel,
  },
  headline: {
    fontSize: 64,
    fontWeight: '800',
    color: lightColors.onPastel,
  },
  caption: {
    fontSize: 15,
    color: lightColors.onPastel,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 7,
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    color: lightColors.onPastel,
  },
});
