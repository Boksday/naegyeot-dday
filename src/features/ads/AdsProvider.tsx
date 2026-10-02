import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import mobileAds, {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads';

import { getBannerUnitId } from './adsConfig';

type AdsState = {
  /** 동의 확인과 SDK 초기화가 끝나 광고를 요청해도 되는지 */
  canShowAds: boolean;
  bannerUnitId: string | null;
  /** 동의가 필요한 지역이라 설정에 개인정보 옵션을 보여야 하는지 */
  isPrivacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const AdsContext = createContext<AdsState | null>(null);

export function AdsProvider({ children }: { children: ReactNode }) {
  const [bannerUnitId] = useState(getBannerUnitId);
  const [canShowAds, setCanShowAds] = useState(false);
  const [isPrivacyOptionsRequired, setIsPrivacyOptionsRequired] = useState(false);

  useEffect(() => {
    // 광고 ID가 없는 빌드는 동의 창도 띄우지 않는다.
    if (!bannerUnitId) return;
    let isActive = true;
    AdsConsent.gatherConsent()
      .then(async (info) => {
        if (!isActive) return;
        setIsPrivacyOptionsRequired(
          info.privacyOptionsRequirementStatus ===
            AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
        );
        if (!info.canRequestAds) return;
        await mobileAds().initialize();
        if (isActive) setCanShowAds(true);
      })
      .catch((error: unknown) => {
        // 광고를 못 띄워도 앱의 핵심 기능은 그대로 쓸 수 있어야 한다.
        console.warn('광고 초기화 실패', error);
      });
    return () => {
      isActive = false;
    };
  }, [bannerUnitId]);

  const showPrivacyOptions = useCallback(async () => {
    const info = await AdsConsent.showPrivacyOptionsForm();
    setCanShowAds((current) => current && info.canRequestAds);
  }, []);

  return (
    <AdsContext.Provider
      value={{ canShowAds, bannerUnitId, isPrivacyOptionsRequired, showPrivacyOptions }}
    >
      {children}
    </AdsContext.Provider>
  );
}

export function useAds(): AdsState {
  const state = useContext(AdsContext);
  if (!state) throw new Error('AdsProvider 안에서 사용해야 해요.');
  return state;
}
