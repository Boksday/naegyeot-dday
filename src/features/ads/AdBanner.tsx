import { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAds } from './AdsProvider';

/**
 * 화면 하단 고정 배너. 내비게이션 바 위에 놓인다.
 * 광고를 띄울 수 없거나 불러오지 못하면 자리를 차지하지 않는다(docs/ads.md).
 */
export function AdBanner() {
  const insets = useSafeAreaInsets();
  const { canShowAds, bannerUnitId, isPersonalizedAllowed } = useAds();
  const [hasFailed, setHasFailed] = useState(false);

  if (!canShowAds || !bannerUnitId || hasFailed) {
    return <View style={{ height: insets.bottom }} />;
  }

  return (
    <View style={{ paddingBottom: insets.bottom, alignItems: 'center' }}>
      <BannerAd
        unitId={bannerUnitId}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: !isPersonalizedAllowed }}
        onAdFailedToLoad={(error) => {
          console.warn('배너 광고 불러오기 실패', error.message);
          setHasFailed(true);
        }}
      />
    </View>
  );
}
