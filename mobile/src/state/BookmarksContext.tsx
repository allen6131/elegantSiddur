import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'siddur.bookmarks.v1';

type BookmarksContextValue = {
  bookmarks: string[];
  isBookmarked: (sectionId: string) => boolean;
  toggleBookmark: (sectionId: string) => void;
  removeBookmark: (sectionId: string) => void;
};

const BookmarksContext = createContext<BookmarksContextValue | undefined>(undefined);

export function BookmarksProvider({ children }: PropsWithChildren) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      } catch {
        // ignore load failures
      }
    })();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (sectionId: string) => {
      return bookmarks.includes(sectionId);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback((sectionId: string) => {
    setBookmarks((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId);
      }

      return [sectionId, ...prev];
    });
  }, []);

  const removeBookmark = useCallback((sectionId: string) => {
    setBookmarks((prev) => prev.filter((id) => id !== sectionId));
  }, []);

  const value = useMemo<BookmarksContextValue>(
    () => ({
      bookmarks,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
    }),
    [bookmarks, isBookmarked, removeBookmark, toggleBookmark]
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) {
    throw new Error('useBookmarks must be used within BookmarksProvider');
  }

  return ctx;
}
