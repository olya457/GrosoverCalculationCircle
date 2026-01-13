import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  Modal,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallpapers'>;

const ICON_BACK = require('../assets/back.png');
const ICON_LOGO = require('../assets/logo_small.png');
const ICON_LOCK = require('../assets/lock.png');

const GREEN = '#5BFF74';

const STORAGE_POINTS = 'points_v1';

const STORAGE_WP_UNLOCKED = 'wallpapers_unlocked_v1';

type WallpaperItem = {
  id: string;
  title: string;
  cost: number;
  source: any;
};

const WP_1 = require('../assets/wp1.png');
const WP_2 = require('../assets/wp2.png');
const WP_3 = require('../assets/wp3.png');
const WP_4 = require('../assets/wp4.png');
const WP_5 = require('../assets/wp5.png');
const WP_6 = require('../assets/wp6.png');

const WALLPAPERS: WallpaperItem[] = [
  { id: 'wp1', title: 'Radial Balance', cost: 5, source: WP_1 },
  { id: 'wp2', title: 'Cold Orbit', cost: 10, source: WP_2 },
  { id: 'wp3', title: 'Night Halo', cost: 20, source: WP_3 },
  { id: 'wp4', title: 'Blue Pulse', cost: 30, source: WP_4 },
  { id: 'wp5', title: 'Arc Reflection', cost: 40, source: WP_5 },
  { id: 'wp6', title: 'Deep Ring', cost: 50, source: WP_6 },
];

async function readPoints(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_POINTS);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function writePoints(n: number) {
  try {
    await AsyncStorage.setItem(STORAGE_POINTS, String(Math.max(0, Math.floor(n))));
  } catch {}
}

async function spendPoints(cost: number): Promise<boolean> {
  const cur = await readPoints();
  if (cur < cost) return false;
  await writePoints(cur - cost);
  return true;
}

async function readUnlockedMap(): Promise<Record<string, boolean>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_WP_UNLOCKED);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    const list = Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];
    const map: Record<string, boolean> = {};
    for (const id of list) map[id] = true;
    return map;
  } catch {
    return {};
  }
}

async function setUnlocked(id: string) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_WP_UNLOCKED);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    const list = Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];

    if (!list.includes(id)) list.push(id);
    await AsyncStorage.setItem(STORAGE_WP_UNLOCKED, JSON.stringify(list));
  } catch {}
}

export default function WallpapersScreen({ navigation }: Props) {
  const { height: H, width: W } = useWindowDimensions();
  const isSmall = H < 700;

  const [points, setPointsState] = useState(0);
  const [unlocked, setUnlockedState] = useState<Record<string, boolean>>({});

  const [unlockModal, setUnlockModal] = useState(false);
  const [pending, setPending] = useState<WallpaperItem | null>(null);

  const [previewModal, setPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<WallpaperItem | null>(null);

  const fadeA = useRef(new Animated.Value(0)).current;
  const fadeY = useRef(new Animated.Value(10)).current;

  const previewA = useRef(new Animated.Value(0)).current;
  const previewS = useRef(new Animated.Value(0.96)).current;

  const cardW = Math.min(W - 48, 320);
  const cardH = Math.round(cardW * 1.05);

  const load = useCallback(async () => {
    const p = await readPoints();
    const m = await readUnlockedMap();

    setPointsState(p);
    setUnlockedState(m);

    fadeA.setValue(0);
    fadeY.setValue(10);
    Animated.parallel([
      Animated.timing(fadeA, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeA, fadeY]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openPreview = (it: WallpaperItem) => {
    setPreviewItem(it);
    setPreviewModal(true);

    previewA.setValue(0);
    previewS.setValue(0.96);

    Animated.parallel([
      Animated.timing(previewA, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(previewS, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const askUnlock = (it: WallpaperItem) => {
    setPending(it);
    setUnlockModal(true);
  };

  const onWallpaperPress = (it: WallpaperItem) => {
    const isOpen = !!unlocked[it.id];
    if (isOpen) openPreview(it);
    else askUnlock(it);
  };

  const confirmUnlock = async () => {
    if (!pending) return;

    const cost = pending.cost;
    const ok = await spendPoints(cost);

    if (!ok) {
      setUnlockModal(false);
      setPending(null);
      Alert.alert('Not enough points', `You need ${cost} points to unlock this wallpaper.`);
      return;
    }

    await setUnlocked(pending.id);

    const newPoints = await readPoints();
    setPointsState(newPoints);
    setUnlockedState(prev => ({ ...prev, [pending.id]: true }));

    const opened = pending;
    setUnlockModal(false);
    setPending(null);

    setTimeout(() => openPreview(opened), 120);
  };

  const renderItem = ({ item }: { item: WallpaperItem }) => {
    const isOpen = !!unlocked[item.id];

    return (
      <View style={{ marginBottom: isSmall ? 20 : 24, alignItems: 'center' }}>
        <Pressable
          onPress={() => onWallpaperPress(item)}
          style={({ pressed }) => [
            styles.cardWrap,
            { width: cardW, height: cardH, opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <Image source={item.source} style={styles.cardImg} resizeMode="cover" />

          {!isOpen && (
            <View style={styles.lockOverlay}>
              <Image source={ICON_LOCK} style={styles.lockIcon} resizeMode="contain" />
            </View>
          )}
        </Pressable>

        <View style={[styles.captionRow, { width: cardW }]}>
          <Text style={[styles.captionText, { fontSize: isSmall ? 12 : 13 }]}>{item.title}</Text>
        </View>
      </View>
    );
  };

  const modalCost = pending?.cost ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
            <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={[styles.topTitle, { fontSize: isSmall ? 16.5 : 18 }]}>Wallpapers</Text>

          <Image source={ICON_LOGO} style={styles.topLogo} resizeMode="contain" />
        </View>

        <View style={styles.pointsWrap}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{points}</Text>
            <Text style={styles.pointsIcon}>❄︎</Text>
          </View>
        </View>

        <Animated.View style={{ flex: 1, opacity: fadeA, transform: [{ translateY: fadeY }] }}>
          <FlatList
            data={WALLPAPERS}
            keyExtractor={it => it.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: isSmall ? 14 : 18,
              paddingBottom: isSmall ? 22 : 28,
              alignItems: 'center',
            }}
          />
        </Animated.View>
        <Modal
          visible={unlockModal}
          transparent
          animationType="fade"
          onRequestClose={() => setUnlockModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setUnlockModal(false)}>
            <Pressable style={styles.modalBox} onPress={() => {}}>
              <Text style={[styles.modalTitle, { fontSize: isSmall ? 12.5 : 13 }]}>
                Unlock these Wallpapers for:
              </Text>

              <View style={styles.modalCostRow}>
                <Text style={styles.modalCostText}>{modalCost}</Text>
                <Text style={styles.modalCostIcon}>❄︎</Text>
              </View>

              <View style={styles.modalBtnsRow}>
                <Pressable
                  onPress={() => {
                    setUnlockModal(false);
                    setPending(null);
                  }}
                  style={[styles.modalBtn, styles.modalBtnGhost]}
                >
                  <Text style={[styles.modalBtnText, { color: GREEN }]}>No</Text>
                </Pressable>

                <Pressable onPress={confirmUnlock} style={[styles.modalBtn, styles.modalBtnSolid]}>
                  <Text style={[styles.modalBtnText, { color: '#000' }]}>Yes</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          visible={previewModal}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewModal(false)}
        >
          <Pressable
            style={styles.previewOverlay}
            onPress={() => {
              setPreviewModal(false);
              setPreviewItem(null);
            }}
          >
            <Pressable style={styles.previewBox} onPress={() => {}}>
              <Animated.View
                style={[
                  styles.previewInner,
                  { opacity: previewA, transform: [{ scale: previewS }] },
                ]}
              >
                {previewItem && (
                  <>
                    <Image source={previewItem.source} style={styles.previewImg} resizeMode="cover" />
                    <Text style={[styles.previewTitle, { fontSize: isSmall ? 12.5 : 13 }]}>
                      {previewItem.title}
                    </Text>

                    <Pressable
                      onPress={() => {
                        setPreviewModal(false);
                        setPreviewItem(null);
                      }}
                      style={[styles.closeBtn, { width: Math.min(180, W - 120), height: isSmall ? 34 : 36 }]}
                    >
                      <Text style={styles.closeText}>Close</Text>
                    </Pressable>
                  </>
                )}
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  root: { flex: 1, backgroundColor: '#000' },

  topBar: {
    height: 56,
    backgroundColor: '#0b0b0b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { width: 20, height: 20, tintColor: '#fff' },
  topTitle: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '700', letterSpacing: 0.2 },
  topLogo: { width: 34, height: 34 },

  pointsWrap: { paddingHorizontal: 18, paddingTop: 10, alignItems: 'flex-end' },
  pointsBadge: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pointsText: { color: GREEN, fontWeight: '900', fontSize: 12 },
  pointsIcon: { color: GREEN, fontWeight: '900', fontSize: 12, marginTop: -1 },

  cardWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0f1012',
    borderWidth: 1,
    borderColor: '#1e2024',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 12 } },
      android: { elevation: 3 },
    }),
  },
  cardImg: { width: '100%', height: '100%' },

  lockOverlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  lockIcon: { width: 18, height: 18, tintColor: '#fff' },

  captionRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  captionText: { color: '#fff', opacity: 0.9, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  modalBox: {
    width: '86%',
    maxWidth: 320,
    borderRadius: 8,
    backgroundColor: '#0b0b0b',
    borderWidth: 1,
    borderColor: '#1f2024',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalTitle: { color: '#fff', opacity: 0.9, fontWeight: '700', textAlign: 'center' },
  modalCostRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  modalCostText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  modalCostIcon: { color: '#fff', opacity: 0.9, fontWeight: '900', fontSize: 13, marginTop: -1 },

  modalBtnsRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modalBtn: { flex: 1, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: GREEN },
  modalBtnGhost: { backgroundColor: 'transparent' },
  modalBtnSolid: { backgroundColor: GREEN },
  modalBtnText: { fontWeight: '900', fontSize: 12 },

  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  previewBox: { width: '100%', alignItems: 'center' },
  previewInner: {
    width: '92%',
    maxWidth: 360,
    borderRadius: 12,
    backgroundColor: '#0f1012',
    borderWidth: 1,
    borderColor: '#1e2024',
    overflow: 'hidden',
  },
  previewImg: { width: '100%', height: 420 },
  previewTitle: { paddingTop: 10, paddingBottom: 12, textAlign: 'center', color: '#fff', opacity: 0.9, fontWeight: '700' },
  closeBtn: { alignSelf: 'center', marginBottom: 14, borderRadius: 8, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#000', fontWeight: '900', fontSize: 12.5 },
});
