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

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const LOGO = require('../assets/logo.png');
type BtnKey = 'levels' | 'wallpapers' | 'facts' | 'savedFacts';
const GREEN = '#5BFF74';

export default function HomeScreen({ navigation }: Props) {
  const { height: H, width: W } = useWindowDimensions();
  const isSmall = H < 700;

  const [selected, setSelected] = useState<BtnKey>('levels');

  const logoA = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(20)).current;
  const buttonsAnim = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoA, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      Animated.stagger(100, buttonsAnim.map(v => 
        Animated.timing(v, { toValue: 1, duration: 500, useNativeDriver: true })
      )),
    ]).start();
  }, []);

  const logoSize = Math.min(W * 0.6, isSmall ? 200 : 260); 
  const buttonWidth = Math.min(320, W - 60); 
  const buttonHeight = isSmall ? 50 : 60;  
  const fontSize = isSmall ? 16 : 18;     

  const go = (key: BtnKey) => {
    setSelected(key);
    setTimeout(() => {
      if (key === 'levels') navigation.navigate('Levels');
      if (key === 'wallpapers') navigation.navigate('Wallpapers');
      if (key === 'facts') navigation.navigate('FactsSaved');
      if (key === 'savedFacts') navigation.navigate('Saved');
    }, 150);
  };

  const HomeBtn = ({ k, title, anim }: { k: BtnKey; title: string; anim: Animated.Value }) => {
    const isOn = selected === k;
    return (
      <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <Pressable
          onPress={() => go(k)}
          style={({ pressed }) => [
            styles.btnBase,
            { width: buttonWidth, height: buttonHeight, backgroundColor: isOn ? GREEN : 'transparent', borderColor: GREEN },
            pressed && { opacity: 0.7, scale: 0.97 }
          ]}
        >
          <Text style={[styles.btnText, { color: isOn ? '#000' : GREEN, fontSize }]}>
            {title.toUpperCase()}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <Animated.View style={[styles.header, { opacity: logoA, transform: [{ translateY: logoY }] }]}>
            <Image source={LOGO} style={{ width: logoSize, height: logoSize }} resizeMode="contain" />
            <Text style={styles.subtitle}>MASTER YOUR MIND</Text>
          </Animated.View>

          <View style={{ height: isSmall ? 30 : 50 }} />

          <HomeBtn k="levels" title="Logic Tasks" anim={buttonsAnim[0]} />
          <View style={styles.gap} />
          <HomeBtn k="wallpapers" title="Wallpapers" anim={buttonsAnim[1]} />
          <View style={styles.gap} />
          <HomeBtn k="facts" title="Scientific Facts" anim={buttonsAnim[2]} />
          <View style={styles.gap} />
          <HomeBtn k="savedFacts" title="Saved Collection" anim={buttonsAnim[3]} />
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: { alignItems: 'center', marginBottom: 20 },
  subtitle: {
    color: GREEN,
    fontSize: 14,
    letterSpacing: 4,
    marginTop: 10,
    fontWeight: '300',
    opacity: 0.8,
  },
  gap: { height: 16 }, 
  btnBase: {
    borderWidth: 2, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: GREEN, shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  btnText: { fontWeight: '900', letterSpacing: 1 },
});