import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  Share,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { isFactSaved, saveFact, removeFact } from '../storage/factsStorage'; 

type Props = NativeStackScreenProps<RootStackParamList, 'FactsSaved'>;

const ICON_BACK = require('../assets/back.png');
const ICON_LOGO = require('../assets/logo_small.png');
const GREEN = '#5BFF74';

const FACTS: string[] = [
  'Zero was used in mathematics long before negative numbers became common.',
  'A straight line is the shortest distance between two points only in flat space.',
  'Prime numbers never follow a predictable pattern, yet they appear everywhere in mathematics.',
  'The human brain uses less energy when solving familiar problems than when solving new ones.',
  'A circle has the largest area of any shape with the same perimeter.',
  'Some infinities are larger than others, even though all are infinite.',
  'Most calculation mistakes happen because of assumptions, not arithmetic errors.',
  'The symbol “=” was invented to avoid writing the same thing twice.',
  'A perfect square can never end with the digit 2, 3, 7, or 8.',
  'Symmetry in nature often comes from simple mathematical rules.',
  'The Fibonacci sequence appears in plants, shells, and galaxies.',
  'Random-looking systems can follow strict mathematical laws.',
  'The brain often solves problems subconsciously before we are aware of the solution.',
  'Mathematics describes patterns, not numbers.',
  'Silence improves concentration more effectively than background noise.',
];

export default function FactsSavedScreen({ navigation }: Props) {
  const { height: H, width: W } = useWindowDimensions();
  const isSmall = H < 720;

  const [index, setIndex] = useState(0);
  const fact = useMemo(() => FACTS[index] ?? FACTS[0], [index]);
  const [saved, setSaved] = useState(false);

  const cardA = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(15)).current;
  const btnA = useRef(new Animated.Value(0)).current;
  const btnY = useRef(new Animated.Value(10)).current;

  const animateIn = useCallback(() => {
    cardA.setValue(0);
    cardY.setValue(15);
    btnA.setValue(0);
    btnY.setValue(10);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardA, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardY, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnA, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(btnY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, [cardA, cardY, btnA, btnY]);

  const checkStatus = useCallback(async () => {
    const ok = await isFactSaved(fact);
    setSaved(ok);
  }, [fact]);

  useEffect(() => {
    checkStatus();
    animateIn();
  }, [fact, animateIn, checkStatus]);

  const goPrev = () => setIndex(i => (i - 1 + FACTS.length) % FACTS.length);
  const goNext = () => setIndex(i => (i + 1) % FACTS.length);

  const onShare = async () => {
    try { await Share.share({ message: fact }); } catch {}
  };

  const onToggleSave = async () => {
    if (saved) {
      await removeFact(fact);
      setSaved(false);
    } else {
      await saveFact(fact);
      setSaved(true);
    }
  };

  const cardWidth = Math.min(W * 0.7, 300);
  const cardHeight = Math.min(H * 0.35, isSmall ? 240 : 300);
  const arrowBtnSize = isSmall ? 32 : 40;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <View style={[styles.topBar, { height: isSmall ? 52 : 64 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={15} style={styles.backBtn}>
            <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>
          <Text style={[styles.topTitle, { fontSize: isSmall ? 17 : 20 }]}>Scientific Facts</Text>
          <Image source={ICON_LOGO} style={styles.topLogo} resizeMode="contain" />
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.row}>
            <Pressable onPress={goPrev} hitSlop={12} style={[styles.arrowBtn, { width: arrowBtnSize, height: arrowBtnSize }]}>
              <Text style={[styles.arrowText, { fontSize: isSmall ? 22 : 26 }]}>{'‹'}</Text>
            </Pressable>

            <Animated.View
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: cardHeight,
                  opacity: cardA,
                  transform: [{ translateY: cardY }],
                },
              ]}
            >
              <Text style={[styles.factText, { fontSize: isSmall ? 15 : 18, lineHeight: isSmall ? 20 : 25 }]}>
                {fact}
              </Text>
            </Animated.View>

            <Pressable onPress={goNext} hitSlop={12} style={[styles.arrowBtn, { width: arrowBtnSize, height: arrowBtnSize }]}>
              <Text style={[styles.arrowText, { fontSize: isSmall ? 22 : 26 }]}>{'›'}</Text>
            </Pressable>
          </View>

          <Animated.View style={[styles.bottomButtons, { opacity: btnA, transform: [{ translateY: btnY }] }]}>
            <Pressable onPress={onShare} style={[styles.greenBtn, { height: isSmall ? 42 : 50 }]}>
              <Text style={[styles.greenBtnText, { fontSize: isSmall ? 14 : 16 }]}>SHARE ↗</Text>
            </Pressable>

            <Pressable 
              onPress={onToggleSave} 
              style={[
                styles.greenBtn, 
                { height: isSmall ? 42 : 50 }, 
                saved && styles.savedBtn 
              ]}
            >
              <Text style={[styles.greenBtnText, { fontSize: isSmall ? 14 : 16 }]}>
                {saved ? 'REMOVE FROM SAVED' : 'SAVE FACT ▣'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  root: { flex: 1 },
  topBar: { backgroundColor: '#0b0b0b', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  topTitle: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '800', letterSpacing: 1 },
  topLogo: { width: 34, height: 34 },
  mainContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  arrowBtn: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  arrowText: { color: GREEN, fontWeight: '900', marginTop: -3 },
  card: {
    borderRadius: 20,
    backgroundColor: '#bfc5cf',
    borderWidth: 1.5,
    borderColor: '#9aa2ad',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 6 },
    }),
  },
  factText: { color: '#000', fontWeight: '800', textAlign: 'center' },
  bottomButtons: { marginTop: 30, width: '100%', paddingHorizontal: 50, gap: 12 },
  greenBtn: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBtn: {
    opacity: 0.7,
    backgroundColor: '#3DAB4D', 
  },
  greenBtnText: { color: '#000', fontWeight: '900', letterSpacing: 1 },
});