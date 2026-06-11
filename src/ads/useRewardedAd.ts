import { useState, useEffect } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { ACTIVE_ADS } from './adConfig';

export const useRewardedAd = () => {
  const [loaded, setLoaded] = useState(false);
  const [ad] = useState(() =>
    RewardedAd.createForAdRequest(ACTIVE_ADS.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    })
  );

  useEffect(() => {
    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setLoaded(true)
    );
    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {}
    );
    const unsubscribeClosed = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        ad.load();
      }
    );
    ad.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, [ad]);

  const showAd = (onRewarded: (coins: number) => void) => {
    if (loaded) {
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        onRewarded(100);
      });
      ad.show();
    }
  };

  return { loaded, showAd };
};
