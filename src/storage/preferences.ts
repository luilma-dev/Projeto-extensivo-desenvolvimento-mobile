// Persistência chave-valor (AsyncStorage).
// Guarda informações pequenas e simples: sessão, última aba, data da última
// sincronização e o cache das marcas da Tabela FIPE (para uso offline).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tab } from '../data';

const KEYS = {
  session: '@truckflow:session',
  lastTab: '@truckflow:lastTab',
  lastSync: '@truckflow:lastSync',
  fipeBrands: '@truckflow:fipeBrands',
} as const;

export type Session = { email: string; loggedAt: string };

async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

export const preferences = {
  getSession: () => readJSON<Session>(KEYS.session),
  saveSession: (email: string) => writeJSON(KEYS.session, { email, loggedAt: new Date().toISOString() } satisfies Session),
  clearSession: () => AsyncStorage.removeItem(KEYS.session),

  getLastTab: () => readJSON<Tab>(KEYS.lastTab),
  saveLastTab: (tab: Tab) => writeJSON(KEYS.lastTab, tab),

  getLastSync: () => readJSON<string>(KEYS.lastSync),
  saveLastSync: (isoDate: string) => writeJSON(KEYS.lastSync, isoDate),

  getCachedBrands: <T>() => readJSON<T>(KEYS.fipeBrands),
  saveCachedBrands: (brands: unknown) => writeJSON(KEYS.fipeBrands, brands),
};
