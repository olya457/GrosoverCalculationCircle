import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'wallpapers_unlocked_v1';

export async function isWallpaperUnlocked(id: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(arr) ? arr.includes(id) : false;
  } catch {
    return false;
  }
}

export async function unlockWallpaper(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    const list = Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];
    if (!list.includes(id)) list.push(id);
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}
