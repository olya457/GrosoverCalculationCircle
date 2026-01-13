import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
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

const GREEN = '#5BFF74';  
const BLUE = '#5B8CFF';  
const ORANGE = '#FFB45E'; 
const DARK = '#0b0b0b';

const STORAGE_DONE_LEVELS = 'done_levels_v1';
const STORAGE_POINTS = 'points_v1';

export default function LevelsScreen({ navigation }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const isSmall = H < 700;

  const levels = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [doneLevels, setDoneLevels] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(12)).current;

  const playIntro = useCallback(() => {
    fade.setValue(0);
    y.setValue(12);
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
    ]).start();
  }, [fade, y]);

  const loadProgress = useCallback(async () => {
    try {
      const rawDone = await AsyncStorage.getItem(STORAGE_DONE_LEVELS);
      const parsedDone = rawDone ? JSON.parse(rawDone) : [];
      const cleanedDone: number[] = Array.isArray(parsedDone)
        ? parsedDone.filter((n: any) => typeof n === 'number' && Number.isFinite(n))
        : [];

      cleanedDone.sort((a, b) => a - b);
      setDoneLevels(cleanedDone);
      const rawPoints = await AsyncStorage.getItem(STORAGE_POINTS);
      const p = rawPoints ? Number(rawPoints) : 0;
      setPoints(Number.isFinite(p) ? p : 0);
      const maxDone = cleanedDone.length ? Math.max(...cleanedDone) : 0;
      const unlockedMax = Math.min(30, Math.max(1, maxDone + 1)); 
      setSelectedLevel(prev => {
        if (prev >= 1 && prev <= unlockedMax) return prev;
        return unlockedMax;
      });
    } catch {
      setDoneLevels([]);
      setPoints(0);
      setSelectedLevel(1);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
      playIntro();
      return () => {};
    }, [loadProgress, playIntro])
  );

  const maxDone = doneLevels.length ? Math.max(...doneLevels) : 0;
  const unlockedMax = Math.min(30, Math.max(1, maxDone + 1)); 

  const cardW = Math.min(340, W - 48);
  const gap = isSmall ? 14 : 18;
  const tileSize = Math.floor((cardW - gap * 2) / 3);

  const isUnlocked = (n: number) => n <= unlockedMax;

  const tileColor = (n: number) => {
    if (n === selectedLevel) return ORANGE;
    if (doneLevels.includes(n)) return BLUE;
    return GREEN;
  };

  const tileBorderColor = (n: number) => {
 
    if (!isUnlocked(n)) return '#3a3a3a';
 
    if (n === selectedLevel) return ORANGE;
    if (doneLevels.includes(n)) return BLUE;
    return GREEN;
  };

  const onPickLevel = (n: number) => {
    if (!isUnlocked(n)) return;
    setSelectedLevel(n);
  };

  const onStart = () => {
    if (!isUnlocked(selectedLevel)) return;
    navigation.navigate('Play', { levelId: String(selectedLevel) });
  };

  const topPad = (isSmall ? 40 : 60) - 10;

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

          <Text style={[styles.topTitle, { fontSize: isSmall ? 17 : 18 }]}>Logic Tasks</Text>

          <View style={styles.rightBox}>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsText}>{points}</Text>
              <Text style={styles.pointsIcon}>❄︎</Text>
            </View>
            <Image source={ICON_LOGO} style={styles.topLogo} resizeMode="contain" />
          </View>
        </View>

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad, paddingBottom: isSmall ? 22 : 30 },
          ]}
        >
          <Animated.View style={{ opacity: fade, transform: [{ translateY: y }] }}>
            <View style={[styles.gridWrap, { width: cardW }]}>
              <View style={[styles.grid, { gap }]}>
                {levels.map(n => {
                  const unlocked = isUnlocked(n);
                  const bg = unlocked ? tileColor(n) : 'transparent';
                  const border = tileBorderColor(n);

                  return (
                    <Pressable
                      key={n}
                      onPress={() => onPickLevel(n)}
                      disabled={!unlocked}
                      style={({ pressed }) => [
                        styles.tile,
                        {
                          width: tileSize,
                          height: tileSize,
                          borderRadius: 8,
                          backgroundColor: bg,
                          borderWidth: 1.5,
                          borderColor: border,
                          opacity: unlocked ? 1 : 0.45,
                        },
                     
                        pressed && unlocked ? { opacity: 0.88, transform: [{ scale: 0.98 }] } : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tileText,
                          { fontSize: isSmall ? 15 : 16, color: unlocked ? '#000' : '#9a9a9a' },
                        ]}
                      >
                        {n}
                      </Text>

                      {!unlocked ? (
                        <Text style={styles.lock}>🔒</Text>
                      ) : doneLevels.includes(n) ? (
                        <Text style={styles.done}>✓</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.hint, { marginTop: isSmall ? 14 : 18 }]}>
                Complete a level to unlock the next one.
              </Text>
            </View>

            <View style={{ height: isSmall ? 34 : 46 }} />

            <Pressable
              onPress={onStart}
              disabled={!isUnlocked(selectedLevel)}
              style={({ pressed }) => [
                styles.startBtn,
                { width: cardW, borderColor: GREEN, opacity: isUnlocked(selectedLevel) ? 1 : 0.5 },
                pressed && isUnlocked(selectedLevel) ? { opacity: 0.85, transform: [{ scale: 0.99 }] } : null,
              ]}
            >
              <Text style={styles.startText}>Start Level {selectedLevel}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  root: { flex: 1, backgroundColor: '#000' },

  topBar: {
    height: 56,
    backgroundColor: DARK,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  backIcon: { width: 20, height: 20, tintColor: '#fff' },

  topTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  rightBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },

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
  pointsText: { color: GREEN, fontWeight: '900', fontSize: 13 },
  pointsIcon: { color: GREEN, fontWeight: '900', fontSize: 12, marginTop: -1 },

  topLogo: { width: 32, height: 32 },

  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },

  gridWrap: { alignItems: 'center', justifyContent: 'center' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
    }),
  },

  tileText: { fontWeight: '900' },

  lock: {
    position: 'absolute',
    bottom: 6,
    right: 7,
    fontSize: 12,
    opacity: 0.9,
  },

  done: {
    position: 'absolute',
    bottom: 6,
    right: 7,
    fontSize: 12,
    color: '#000',
    opacity: 0.9,
    fontWeight: '900',
  },

  hint: {
    color: '#fff',
    opacity: 0.55,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
  },

  startBtn: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startText: { color: GREEN, fontSize: 14, fontWeight: '800', letterSpacing: 0.2 },
});
