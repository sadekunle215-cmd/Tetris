import { useState, useEffect } from 'react';
import {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { ACTIVE_ADS } from './adConfig';

export const useInterstitialAd = () => {
  const [loaded, setLoaded] = useState(false);
  const [ad] = useState(() =>
    InterstitialAd.createForAdRequest(ACTIVE_ADS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    })
  );

  useEffect(() => {
    const unsubscribeLoaded = ad.addAdEventListener(
      AdEventType.LOADED,
      () => setLoaded(true)
    );
    const unsubscribeClosed = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        ad.load();
      }
    );
    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      () => {
        setLoaded(false);
        ad.load();
      }
    );
    ad.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [ad]);

  const showAd = () => {
    if (loaded) {
      ad.show();
    }
  };

  return { loaded, showAd };
};
