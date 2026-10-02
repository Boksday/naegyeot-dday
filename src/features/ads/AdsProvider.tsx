import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import mobileAds, {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads';

import { getBannerUnitId, getTestDeviceIds } from './adsConfig';

type AdsState = {
  /** 동의 확인과 SDK 초기화가 끝나 광고를 요청해도 되는지 */
  canShowAds: boolean;
  bannerUnitId: string | null;
  /** 동의 확인에 실패했으면 false이고, 이때는 비개인화 광고만 요청한다. */
  isPersonalizedAllowed: boolean;
  /** 동의가 필요한 지역이라 설정에 개인정보 옵션을 보여야 하는지 */
  isPrivacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const AdsContext = createContext<AdsState | null>(null);

export function AdsProvider({ children }: { children: ReactNode }) {
  const [bannerUnitId] = useState(getBannerUnitId);
  const [canShowAds, setCanShowAds] = useState(false);
  const [isPrivacyOptionsRequired, setIsPrivacyOptionsRequired] = useState(false);
  const [isPersonalizedAllowed, setIsPersonalizedAllowed] = useState(false);

  useEffect(() => {
    // 광고 ID가 없는 빌드는 동의 창도 띄우지 않는다.
    if (!bannerUnitId) return;
    let isActive = true;

    const startAds = async (personalized: boolean) => {
      await mobileAds().setRequestConfiguration({ testDeviceIdentifiers: getTestDeviceIds() });
      await mobileAds().initialize();
      if (!isActive) return;
      setIsPersonalizedAllowed(personalized);
      setCanShowAds(true);
    };

    AdsConsent.gatherConsent()
      .then(async (info) => {
        if (!isActive) return;
        setIsPrivacyOptionsRequired(
          info.privacyOptionsRequirementStatus ===
            AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
        );
        if (info.canRequestAds) await startAds(true);
      })
      .catch(async (error: unknown) => {
        // 동의 확인이 실패하면(동의 메시지 미설정, 네트워크 오류 등) 사용자 정보를 쓰지 않는
        // 비개인화 광고로만 시작한다. 광고가 실패해도 앱의 핵심 기능은 그대로 동작한다.
        console.warn('광고 동의 확인 실패, 비개인화 광고로 시작', error);
        try {
          await startAds(false);
        } catch (initError) {
          console.warn('광고 초기화 실패', initError);
        }
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
      value={{
        canShowAds,
        bannerUnitId,
        isPersonalizedAllowed,
        isPrivacyOptionsRequired,
        showPrivacyOptions,
      }}
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
