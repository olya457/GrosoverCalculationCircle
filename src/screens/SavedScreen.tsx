import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  Share,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { loadSavedFacts, removeFact } from '../storage/factsStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Saved'>;

const ICON_BACK = require('../assets/back.png');
const ICON_LOGO = require('../assets/logo_small.png');
const GREEN = '#5BFF74';

export default function SavedScreen({ navigation }: Props) {
  const { height: H, width: W } = useWindowDimensions();
  const isSmall = H < 720;

  const [facts, setFacts] = useState<string[]>([]);
  const a = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(10)).current;

  const load = useCallback(async () => {
    const list = await loadSavedFacts();
    setFacts(list);
    a.setValue(0);
    y.setValue(10);

    Animated.parallel([
      Animated.timing(a, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [a, y]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const onShare = async (fact: string) => {
    try { await Share.share({ message: fact }); } catch {}
  };

  const onRemove = async (fact: string) => {
    await removeFact(fact);
    await load();
  };

  const cardWidth = Math.min(W * 0.74, 290);
  const cardHeight = Math.min(H * 0.28, isSmall ? 180 : 240);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <View style={[styles.topBar, { height: isSmall ? 52 : 62 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={15} style={styles.backBtn}>
            <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>
          <Text style={[styles.topTitle, { fontSize: isSmall ? 17 : 20 }]}>Saved Facts</Text>
          <Image source={ICON_LOGO} style={styles.topLogo} resizeMode="contain" />
        </View>

        <Animated.View style={[styles.content, { opacity: a, transform: [{ translateY: y }] }]}>
          {facts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { fontSize: isSmall ? 15 : 17 }]}>
                No saved facts found
              </Text>
              <Pressable
                onPress={() => navigation.navigate('FactsSaved')}
                style={[styles.bigBtn, { width: W * 0.6, height: isSmall ? 48 : 56 }]}
              >
                <Text style={[styles.bigBtnText, { fontSize: isSmall ? 14 : 16 }]}>GO TO FACTS</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={facts}
              keyExtractor={(item, idx) => `${idx}-${item.slice(0, 15)}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                    <Text style={[styles.factText, { fontSize: isSmall ? 14 : 16, lineHeight: isSmall ? 19 : 23 }]}>
                      {item}
                    </Text>
                  </View>

                  <View style={[styles.actions, { width: cardWidth }]}>
                    <Pressable onPress={() => onShare(item)} style={[styles.iconBtn, { height: isSmall ? 40 : 46 }]}>
                      <Text style={styles.iconBtnText}>SHARE ↗</Text>
                    </Pressable>

                    <Pressable onPress={() => onRemove(item)} style={[styles.iconBtn, { height: isSmall ? 40 : 46 }]}>
                      <Text style={styles.iconBtnText}>REMOVE ▣</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
        </Animated.View>
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
  topLogo: { width: 32, height: 32 },
  content: { flex: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#fff', opacity: 0.5, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  bigBtn: { borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  bigBtnText: { color: '#000', fontWeight: '900', letterSpacing: 0.5 },
  itemContainer: { marginBottom: 30, alignItems: 'center', width: '100%' },
  card: {
    borderRadius: 18,
    backgroundColor: '#bfc5cf',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1.2,
    borderColor: '#9aa2ad',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 6 },
    }),
  },
  factText: { color: '#000', fontWeight: '700', textAlign: 'center' },
  actions: { 
    marginTop: 12, 
    flexDirection: 'row', 
    gap: 10, 
    justifyContent: 'center' 
  },
  iconBtn: { 
    flex: 1, 
    borderRadius: 10, 
    backgroundColor: GREEN, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  iconBtnText: { color: '#000', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
});