import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { ACTIVE_ADS } from './adConfig';

interface Props {
  size?: BannerAdSize;
}

export const BannerAdComponent: React.FC<Props> = ({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
}) => {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={ACTIVE_ADS.BANNER}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
});
