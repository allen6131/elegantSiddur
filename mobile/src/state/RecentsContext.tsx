import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ServiceId } from '../data/types';

const STORAGE_KEY = '@siddur-recents';
const MAX_RECENTS = 24;

export type RecentEntry = {
  sectionId: string;
  serviceId: ServiceId;
  sectionTitle: string;
  lastOpenedAt: string;
};

type RecentsContextValue = {
  recents: RecentEntry[];
  isHydrated: boolean;
  openRecent: (entry: Omit<RecentEntry, 'lastOpenedAt'>) => Promise<void>;
  clearRecents: () => Promise<void>;
};

const RecentsContext = createContext<RecentsContextValue | undefined>(undefined);

export function RecentsProvider({ children }: { children: React.ReactNode }) {
  const [recents, setRecents] = useState<RecentEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const recentsRef = useRef<RecentEntry[]>([]);

  useEffect(() => {
    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setIsHydrated(true);
          return;
        }
        const parsed = JSON.parse(raw) as RecentEntry[];
        if (Array.isArray(parsed)) {
          recentsRef.current = parsed;
          setRecents(parsed);
        }
      } catch {
        // noop
      } finally {
        setIsHydrated(true);
      }
    }
    hydrate();
  }, []);

  useEffect(() => {
    recentsRef.current = recents;
  }, [recents]);

  const persist = useCallback(async (next: RecentEntry[]) => {
    recentsRef.current = next;
    setRecents(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const openRecent = useCallback(
    async (entry: Omit<RecentEntry, 'lastOpenedAt'>) => {
      const nextEntry: RecentEntry = {
        ...entry,
        lastOpenedAt: new Date().toISOString(),
      };
      const deduped = recentsRef.current.filter((item) => item.sectionId !== entry.sectionId);
      const next = [nextEntry, ...deduped].slice(0, MAX_RECENTS);
      await persist(next);
    },
    [persist],
  );

  const clearRecents = useCallback(async () => {
    recentsRef.current = [];
    setRecents([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      recents,
      isHydrated,
      openRecent,
      clearRecents,
    }),
    [recents, isHydrated, openRecent, clearRecents],
  );

  return <RecentsContext.Provider value={value}>{children}</RecentsContext.Provider>;
}

export function useRecents() {
  const context = useContext(RecentsContext);
  if (!context) {
    throw new Error('useRecents must be used within RecentsProvider');
  }
  return context;
}
