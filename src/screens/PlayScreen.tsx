import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  Share,
  Platform,
  useWindowDimensions,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getLevel, type Task } from '../data/levelsBank';
import { addPoints, markLevelDone } from '../storage/progress';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

const ICON_BACK = require('../assets/back.png');
const ICON_LOGO = require('../assets/logo_small.png');
const RING = require('../assets/result_ring.png');

const GREEN = '#5BFF74';
const RED = '#FF5E5E';

type Phase = 'task' | 'done' | 'over';

export default function PlayScreen({ route, navigation }: Props) {
  const { height: H, width: W } = useWindowDimensions();
  const isSmall = H < 720;

  const levelId = route.params?.levelId ?? '1';
  const levelNumber = useMemo(() => {
    const n = parseInt(levelId, 10);
    return Number.isFinite(n) ? n : 1;
  }, [levelId]);

  const level = useMemo(() => getLevel(levelNumber), [levelNumber]);
  const tasks = level.tasks;

  const [phase, setPhase] = useState<Phase>('task');
  const [taskIndex, setTaskIndex] = useState(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const task: Task = tasks[taskIndex];

  const panelA = useRef(new Animated.Value(0)).current;
  const panelY = useRef(new Animated.Value(20)).current;
  const o1 = useRef(new Animated.Value(0)).current;
  const o2 = useRef(new Animated.Value(0)).current;
  const o3 = useRef(new Animated.Value(0)).current;
  const o4 = useRef(new Animated.Value(0)).current;
  const optAnims = useMemo(() => [o1, o2, o3, o4], [o1, o2, o3, o4]);

  const runAppear = () => {
    panelA.setValue(0);
    panelY.setValue(20);
    optAnims.forEach(v => v.setValue(0));

    Animated.sequence([
      Animated.parallel([
        Animated.timing(panelA, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(panelY, { toValue: 0, duration: 450, easing: Easing.out(Easing.back(1)), useNativeDriver: true }),
      ]),
      Animated.stagger(80, optAnims.map(v => Animated.timing(v, { toValue: 1, duration: 350, useNativeDriver: true }))),
    ]).start();
  };

  useEffect(() => {
    if (phase === 'task') runAppear();
  }, [taskIndex, phase]);

  const onPick = (idx: 0 | 1 | 2 | 3) => {
    if (locked || phase !== 'task') return;
    setLocked(true);
    setPickedIndex(idx);
    const isCorrect = idx === task.correctIndex;
    if (isCorrect) setCorrectCount(c => c + 1);

    setTimeout(async () => {
      if (!isCorrect) {
        setPhase('over');
        setLocked(false);
        return;
      }
      const isLast = taskIndex === tasks.length - 1;
      if (isLast) {
        await addPoints(correctCount + 1);
        await markLevelDone(levelNumber);
        setPhase('done');
        setLocked(false);
        return;
      }
      setTaskIndex(i => i + 1);
      setPickedIndex(null);
      setLocked(false);
    }, 600);
  };

  const resetLevel = () => {
    setPhase('task');
    setTaskIndex(0);
    setPickedIndex(null);
    setLocked(false);
    setCorrectCount(0);
  };

  const nextLevel = () => {
    const n = Math.min(30, levelNumber + 1);
    navigation.replace('Play', { levelId: String(n) });
  };

  const shareResult = async () => {
    try {
      const msg = phase === 'done' 
        ? `I finished Level ${levelNumber} with ${correctCount + 1} points!` 
        : `I'm training my logic on Level ${levelNumber}.`;
      await Share.share({ message: msg });
    } catch {}
  };

  const getOptionStyle = (idx: number, pressed: boolean): StyleProp<ViewStyle> => {
    const isPicked = pickedIndex === idx;
    const isCorrect = idx === task.correctIndex;
    const base: StyleProp<ViewStyle> = [
      styles.option,
      { height: isSmall ? 52 : 68, borderRadius: 16 },
      pressed && !locked ? { transform: [{ scale: 0.96 }] } : null,
    ];
    if (pickedIndex !== null) {
      if (isPicked && !isCorrect) return [base, { borderColor: RED }];
      if (isCorrect) return [base, { backgroundColor: GREEN, borderColor: GREEN }];
      if (!isPicked && locked) return [base, { opacity: 0.4 }];
    }
    return base;
  };

  const panelWidth = Math.min(W - 32, 420);
  const ringSize = isSmall ? 200 : 280;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <View style={[styles.topBar, { height: isSmall ? 56 : 72 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={15} style={styles.backBtn}>
            <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>
          <Text style={[styles.topTitle, { fontSize: isSmall ? 18 : 22 }]}>{`LEVEL ${levelNumber}`}</Text>
          <Image source={ICON_LOGO} style={styles.topLogo} resizeMode="contain" />
        </View>

        {phase === 'task' && (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
            <Animated.View style={[styles.panel, { width: panelWidth, opacity: panelA, transform: [{ translateY: panelY }] }]}>
              <Text style={styles.sectionTitle}>QUESTION</Text>
              <View style={[styles.questionBox, { minHeight: isSmall ? 90 : 140 }]}>
                <Text style={[styles.questionText, { fontSize: isSmall ? 17 : 21, lineHeight: isSmall ? 24 : 30 }]}>
                  {task.question}
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 30 }]}>SELECT ANSWER</Text>
              <View style={styles.optionsGrid}>
                {task.options.map((opt, idx) => {
                  const anim = optAnims[idx] ?? optAnims[0];
                  return (
                    <Animated.View key={idx} style={[styles.optionAnimWrap, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }]}>
                      <Pressable onPress={() => onPick(idx as 0 | 1 | 2 | 3)} style={({ pressed }) => getOptionStyle(idx, pressed)}>
                        <Text style={[styles.optionText, { fontSize: isSmall ? 15 : 19, color: pickedIndex !== null && idx === task.correctIndex ? '#000' : GREEN }]}>
                          {opt}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          </ScrollView>
        )}

        {(phase === 'over' || phase === 'done') && (
          <View style={styles.resultWrap}>
            <Image source={RING} style={{ width: ringSize, height: ringSize, marginBottom: 25 }} resizeMode="contain" />
            <Text style={[styles.resultTitle, { fontSize: isSmall ? 26 : 34 }]}>
              {phase === 'done' ? 'CALCULATION DONE' : 'SESSION ENDED'}
            </Text>
            <Text style={[styles.resultSub, { fontSize: isSmall ? 15 : 18 }]}>
              {phase === 'done' ? 'You have successfully solved this logic task.' : 'You can try again to find the correct solution.'}
            </Text>

            {phase === 'done' && <Text style={[styles.pointsRow, { fontSize: isSmall ? 20 : 26 }]}>+ {correctCount} ❄︎</Text>}

            <View style={styles.resultButtonsRow}>
              <Pressable onPress={shareResult} style={[styles.actionBtn, styles.sideBtn]}>
                <Text style={styles.actionBtnText}>↗</Text>
              </Pressable>
              <Pressable onPress={phase === 'done' ? nextLevel : resetLevel} style={[styles.actionBtn, styles.centerBtn]}>
                <Text style={styles.actionBtnText}>{phase === 'done' ? 'NEXT LEVEL' : 'TRY AGAIN'}</Text>
              </Pressable>
              <Pressable onPress={() => navigation.popToTop()} style={[styles.actionBtn, styles.sideBtn]}>
                <Text style={styles.actionBtnText}>⌂</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  root: { flex: 1 },
  topBar: { backgroundColor: '#0b0b0b', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { width: 24, height: 24, tintColor: '#fff' },
  topTitle: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '900', letterSpacing: 2 },
  topLogo: { width: 40, height: 40 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingVertical: 40 },
  panel: { borderRadius: 28, backgroundColor: '#111214', borderWidth: 1, borderColor: '#1f2024', padding: 24 },
  sectionTitle: { color: GREEN, fontSize: 13, fontWeight: '800', letterSpacing: 2, textAlign: 'center', opacity: 0.7 },
  questionBox: { marginTop: 15, width: '100%', borderRadius: 18, backgroundColor: '#070708', borderWidth: 1, borderColor: '#1f2024', alignItems: 'center', justifyContent: 'center', padding: 25 },
  questionText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  optionsGrid: { marginTop: 25, width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionAnimWrap: { width: '48%', marginBottom: 16 },
  option: { width: '100%', borderWidth: 2, borderColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontWeight: '900' },
  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  resultTitle: { color: '#fff', fontWeight: '900', textAlign: 'center' },
  resultSub: { marginTop: 15, color: '#D9D9D9', textAlign: 'center', lineHeight: 24, opacity: 0.8 },
  pointsRow: { color: GREEN, fontWeight: '900', marginTop: 25 },
  resultButtonsRow: { marginTop: 45, flexDirection: 'row', alignItems: 'center', gap: 15 },
  actionBtn: { backgroundColor: GREEN, borderRadius: 16, alignItems: 'center', justifyContent: 'center', height: 60 },
  sideBtn: { width: 60 },
  centerBtn: { flex: 1, paddingHorizontal: 20 },
  actionBtnText: { color: '#000', fontSize: 17, fontWeight: '900' },
});