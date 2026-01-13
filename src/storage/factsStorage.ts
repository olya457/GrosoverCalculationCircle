import AsyncStorage from '@react-native-async-storage/async-storage';

export const FACTS_STORAGE_KEY = 'saved_scientific_facts_v1';

export async function loadSavedFacts(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FACTS_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(x => typeof x === 'string');
  } catch {
    return [];
  }
}

export async function saveFact(fact: string): Promise<void> {
  try {
    const list = await loadSavedFacts();
    if (!list.includes(fact)) {
      const updated = [fact, ...list];
      await AsyncStorage.setItem(FACTS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {}
}

export async function removeFact(fact: string): Promise<void> {
  try {
    const list = await loadSavedFacts();
    const updated = list.filter(x => x !== fact);
    await AsyncStorage.setItem(FACTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export async function isFactSaved(fact: string): Promise<boolean> {
  const list = await loadSavedFacts();
  return list.includes(fact);
}
