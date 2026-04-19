import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'siddur.settings.v1';

export type LanguageMode = 'hebrew' | 'english' | 'bilingual';

export type SettingsState = {
  fontScale: number;
  languageMode: LanguageMode;
  showNikud: boolean;
};

const defaultSettings: SettingsState = {
  fontScale: 1,
  languageMode: 'bilingual',
  showNikud: true,
};

type SettingsContextValue = {
  settings: SettingsState;
  isHydrated: boolean;
  setFontScale: (fontScale: number) => void;
  setLanguageMode: (languageMode: LanguageMode) => void;
  setShowNikud: (showNikud: boolean) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const clampFontScale = (fontScale: number) => Math.min(1.8, Math.max(0.8, fontScale));

export function SettingsProvider({ children }: React.PropsWithChildren) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrateSettings() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (!active || !raw) {
          return;
        }

        const parsed = JSON.parse(raw) as Partial<SettingsState>;

        setSettings({
          fontScale: clampFontScale(parsed.fontScale ?? defaultSettings.fontScale),
          languageMode: parsed.languageMode ?? defaultSettings.languageMode,
          showNikud: parsed.showNikud ?? defaultSettings.showNikud,
        });
      } catch {
        // ignore hydration errors and use defaults
      } finally {
        if (active) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [isHydrated, settings]);

  const setFontScale = useCallback((fontScale: number) => {
    setSettings((current) => ({
      ...current,
      fontScale: clampFontScale(fontScale),
    }));
  }, []);

  const setLanguageMode = useCallback((languageMode: LanguageMode) => {
    setSettings((current) => ({
      ...current,
      languageMode,
    }));
  }, []);

  const setShowNikud = useCallback((showNikud: boolean) => {
    setSettings((current) => ({
      ...current,
      showNikud,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isHydrated,
      setFontScale,
      setLanguageMode,
      setShowNikud,
      resetSettings,
    }),
    [isHydrated, resetSettings, setFontScale, setLanguageMode, setShowNikud, settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}
