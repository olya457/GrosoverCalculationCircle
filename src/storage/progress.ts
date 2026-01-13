import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_DONE_LEVELS = 'done_levels_v1';
const KEY_POINTS = 'points_v1';

export async function getDoneLevels(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_DONE_LEVELS);
    const arr = raw ? (JSON.parse(raw) as number[]) : [];
    if (!Array.isArray(arr)) return [];
    return arr.filter(n => typeof n === 'number' && Number.isFinite(n));
  } catch {
    return [];
  }
}

export async function setDoneLevels(levels: number[]) {
  try {
    const cleaned = Array.from(new Set(levels))
      .filter(n => typeof n === 'number' && Number.isFinite(n))
      .sort((a, b) => a - b);
    await AsyncStorage.setItem(KEY_DONE_LEVELS, JSON.stringify(cleaned));
  } catch {}
}

export async function markLevelDone(level: number) {
  const done = await getDoneLevels();
  if (!done.includes(level)) {
    done.push(level);
    await setDoneLevels(done);
  }
}

export async function getPoints(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY_POINTS);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function setPoints(points: number) {
  try {
    const safe = Math.max(0, Math.floor(points));
    await AsyncStorage.setItem(KEY_POINTS, String(safe));
  } catch {}
}

export async function addPoints(delta: number) {
  const cur = await getPoints();
  await setPoints(cur + delta);
}

export async function spendPoints(cost: number): Promise<boolean> {
  const cur = await getPoints();
  const c = Math.max(0, Math.floor(cost));
  if (cur < c) return false;
  await setPoints(cur - c);
  return true;
}
