import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboard'>;

const IMG_1 = require('../assets/onboard1.png');
const IMG_2 = require('../assets/onboard2.png');
const IMG_3 = require('../assets/onboard3.png');
const IMG_4 = require('../assets/onboard4.png');

type Slide = { image: any; text: string; primaryLabel: string };
const GREEN = '#5BFF74';

export default function OnboardScreen({ navigation }: Props) {
  const { height: H, width: W } = useWindowDimensions();
  const isSmall = H < 720;

  const slides: Slide[] = useMemo(() => [
    { 
      image: IMG_1, 
      text: 'This is a place for calm thinking.\nNo rush. No noise.', 
      primaryLabel: 'Next' 
    },
    { 
      image: IMG_2, 
      text: 'Each level\ncontains several logic tasks.\nComplete to get rewards.', 
      primaryLabel: 'Next' 
    },
    { 
      image: IMG_3, 
      text: 'Solved levels give points.\nPoints unlock wallpapers.\nNothing random.', 
      primaryLabel: 'Next' 
    },
    { 
      image: IMG_4, 
      text: 'Between problems,\nyou’ll find scientific facts.\nSave the best ones.', 
      primaryLabel: 'Start' 
    },
  ], []);

  const [index, setIndex] = useState(0);
  const a = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(10)).current;

  const runAppear = () => {
    a.setValue(0);
    y.setValue(10);
    Animated.parallel([
      Animated.timing(a, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { runAppear(); }, [index]);

  const onPrimary = () => {
    if (index < slides.length - 1) setIndex(p => p + 1);
    else navigation.replace('Home');
  };

  const imageSize = isSmall ? H * 0.4 : H * 0.45;
  const captionFont = isSmall ? 18 : 22;
  const captionLine = isSmall ? 24 : 30;
  const primaryW = Math.min(W - 80, 280);
  const primaryH = isSmall ? 48 : 58;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.stage, { opacity: a, transform: [{ translateY: y }] }]}>
          
          <View style={{ width: W, height: imageSize, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={slides[index].image} style={styles.image} resizeMode="contain" />
          </View>

          <View style={[styles.content, { marginTop: isSmall ? 15 : 30 }]}>
            <Text style={[styles.caption, { fontSize: captionFont, lineHeight: captionLine }]}>
              {slides[index].text}
            </Text>

            <View style={{ marginTop: isSmall ? 35 : 50, alignItems: 'center' }}>
              <Pressable
                onPress={onPrimary}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { width: primaryW, height: primaryH },
                  pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 }
                ]}
              >
                <Text style={[styles.primaryText, { fontSize: isSmall ? 15 : 17 }]}>
                  {slides[index].primaryLabel}
                </Text>
              </Pressable>

              <Pressable 
                onPress={() => navigation.replace('Home')} 
                hitSlop={20} 
                style={styles.skipBtn}
              >
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 10 },
  stage: { width: '100%', alignItems: 'center' },
  image: { width: '85%', height: '85%' },
  content: { width: '100%', alignItems: 'center', paddingHorizontal: 40 },
  caption: { color: '#FFF', textAlign: 'center', fontWeight: '700', opacity: 0.9 },
  primaryBtn: {
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { 
        shadowColor: GREEN, 
        shadowOpacity: 0.3, 
        shadowRadius: 10, 
        shadowOffset: { width: 0, height: 4 } 
      },
      android: { elevation: 6 },
    }),
  },
  primaryText: { color: '#000', fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  skipBtn: { marginTop: 20, padding: 8 },
  skipText: { color: '#FFF', opacity: 0.4, fontSize: 14, fontWeight: '600' },
});