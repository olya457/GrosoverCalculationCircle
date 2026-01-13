import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const LOGO = require('../assets/logo.png'); 

export default function LoaderScreen({ navigation }: Props) {
  const [phase, setPhase] = useState<'web' | 'logo'>('web');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 2000);
    const t2 = setTimeout(() => navigation.replace('Onboard'), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigation]);

  const loaderHtml = useMemo(
    () => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        height: 100%;
        background: transparent;
      }
      .wrap {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, 18px);
        grid-auto-rows: 18px;
        gap: 6px;
        transform: translateY(2px);
      }

      .sq {
        width: 18px;
        height: 18px;
        background: #ffffff;
        border-radius: 2px;
        opacity: 0.25;
        transform: scale(0.92);
        animation: pulse 1.1s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.25; transform: scale(0.92); }
        50% { opacity: 1; transform: scale(1); }
      }
      .d1 { animation-delay: 0.00s; }
      .d2 { animation-delay: 0.08s; }
      .d3 { animation-delay: 0.16s; }
      .d4 { animation-delay: 0.24s; }
      .d5 { animation-delay: 0.32s; }
      .d6 { animation-delay: 0.40s; }
      .d7 { animation-delay: 0.48s; }
      .d8 { animation-delay: 0.56s; }
      .d9 { animation-delay: 0.64s; }

      .r1c2 { grid-column: 2; grid-row: 1; }
      .r1c3 { grid-column: 3; grid-row: 1; }

      .r2c2 { grid-column: 2; grid-row: 2; }
      .r2c3 { grid-column: 3; grid-row: 2; }
      .r2c4 { grid-column: 4; grid-row: 2; }

      .r3c1 { grid-column: 1; grid-row: 3; }
      .r3c2 { grid-column: 2; grid-row: 3; }
      .r3c3 { grid-column: 3; grid-row: 3; }
      .r3c4 { grid-column: 4; grid-row: 3; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="grid" aria-label="loader">
        <div class="sq d1 r1c2"></div>
        <div class="sq d2 r1c3"></div>

        <div class="sq d3 r2c2"></div>
        <div class="sq d4 r2c3"></div>
        <div class="sq d5 r2c4"></div>

        <div class="sq d6 r3c1"></div>
        <div class="sq d7 r3c2"></div>
        <div class="sq d8 r3c3"></div>
        <div class="sq d9 r3c4"></div>
      </div>
    </div>
  </body>
</html>
`,
    []
  );

  return (
    <View style={styles.root}>
      {phase === 'web' ? (
        <View style={styles.centerBox}>
          <WebView
            originWhitelist={['*']}
            source={{ html: loaderHtml }}
            style={styles.web}
            containerStyle={styles.webContainer}
            javaScriptEnabled
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            setBuiltInZoomControls={false}
            setDisplayZoomControls={false}
          />
        </View>
      ) : (
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerBox: {
    width: 180,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  webContainer: {
    backgroundColor: 'transparent',
  },

  web: {
    width: 160,
    height: 110,
    backgroundColor: 'transparent',
  },

  logo: {
    width: 220,
    height: 220,
  },
});
