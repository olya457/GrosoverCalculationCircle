import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

const ICON_BACK = require('../assets/back.png');
const ICON_LOGO = require('../assets/logo_small.png');
const CENTER_IMAGE = require('../assets/onboard2.png');

const GREEN = '#5BFF74';
const DARK = '#0b0b0b';

const STORAGE_POINTS = 'points_v1';

export default function LevelsScreen({ navigation }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const isSmall = H < 700;

  const [points, setPoints] = useState<number>(0);

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  const playIntro = useCallback(() => {
    fade.setValue(0);
    y.setValue(20);
    scale.setValue(0.96);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, y, scale]);

  const loadPoints = useCallback(async () => {
    try {
      const rawPoints = await AsyncStorage.getItem(STORAGE_POINTS);
      const parsed = rawPoints ? Number(rawPoints) : 0;
      setPoints(Number.isFinite(parsed) ? parsed : 0);
    } catch {
      setPoints(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPoints();
      playIntro();
      return () => {};
    }, [loadPoints, playIntro])
  );

  const imageSize = Math.min(W * 0.62, isSmall ? 220 : 280);
  const buttonWidth = Math.min(W - 48, 340);

  const onStart = () => {
    navigation.navigate('Play', { levelId: '1' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed ? { opacity: 0.7 } : null]}
          >
            <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={[styles.topTitle, { fontSize: isSmall ? 17 : 18 }]}>
            Logic Tasks
          </Text>

          <View style={styles.rightBox}>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsText}>{points}</Text>
              <Text style={styles.pointsIcon}>❄︎</Text>
            </View>
            <Image source={ICON_LOGO} style={styles.topLogo} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.centerWrap,
              {
                opacity: fade,
                transform: [{ translateY: y }, { scale }],
              },
            ]}
          >
            <Image
              source={CENTER_IMAGE}
              resizeMode="contain"
              style={{
                width: imageSize,
                height: imageSize,
                marginBottom: isSmall ? 24 : 30,
              }}
            />

            <Pressable
              onPress={onStart}
              style={({ pressed }) => [
                styles.startBtn,
                { width: buttonWidth },
                pressed ? { opacity: 0.85, transform: [{ scale: 0.99 }] } : null,
              ]}
            >
              <Text style={styles.startText}>Start Game</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },

  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  topBar: {
    height: 56,
    backgroundColor: DARK,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },

  topTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  rightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  pointsPill: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  pointsText: {
    color: GREEN,
    fontWeight: '900',
    fontSize: 13,
  },

  pointsIcon: {
    color: GREEN,
    fontWeight: '900',
    fontSize: 12,
    marginTop: -1,
  },

  topLogo: {
    width: 32,
    height: 32,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  startBtn: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: GREEN,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },

  startText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});