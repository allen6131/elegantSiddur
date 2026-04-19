import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import type { DisplayMode, ThemeMode } from '../data/types';

const STORAGE_KEY = 'siddur.settings.v1';

export type SettingsState = {
  fontScale: number;
  languageMode: DisplayMode;
  showNikud: boolean;
  showEnglish: boolean;
  themeMode: ThemeMode;
};

const defaultSettings: SettingsState = {
  fontScale: 1,
  languageMode: 'bilingual',
  showNikud: true,
  showEnglish: true,
  themeMode: 'system',
};

type SettingsContextValue = {
  settings: SettingsState;
  isHydrated: boolean;
  effectiveTheme: ThemeMode;
  setFontScale: (fontScale: number) => void;
  setLanguageMode: (languageMode: DisplayMode) => void;
  setShowNikud: (showNikud: boolean) => void;
  setShowEnglish: (showEnglish: boolean) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const clampFontScale = (fontScale: number) => Math.min(1.8, Math.max(0.8, fontScale));

export function SettingsProvider({ children }: React.PropsWithChildren) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);
  const [deviceTheme, setDeviceTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const readCurrent = () => {
      const scheme = Appearance.getColorScheme();
      setDeviceTheme(scheme === 'dark' ? 'dark' : 'light');
    };

    readCurrent();
    const subscription = Appearance.addChangeListener((next) => {
      setDeviceTheme(next.colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
          showEnglish: parsed.showEnglish ?? defaultSettings.showEnglish,
          themeMode: parsed.themeMode ?? defaultSettings.themeMode,
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

  const setLanguageMode = useCallback((languageMode: DisplayMode) => {
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

  const setShowEnglish = useCallback((showEnglish: boolean) => {
    setSettings((current) => {
      const nextMode =
        !showEnglish && current.languageMode === 'english'
          ? 'hebrew'
          : !showEnglish && current.languageMode === 'bilingual'
          ? 'hebrew'
          : current.languageMode;

      return {
        ...current,
        showEnglish,
        languageMode: nextMode,
      };
    });
  }, []);

  const setThemeMode = useCallback((themeMode: ThemeMode) => {
    setSettings((current) => ({
      ...current,
      themeMode,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const effectiveTheme =
    settings.themeMode === 'system' ? deviceTheme : settings.themeMode;

  const value = useMemo(
    () => ({
      settings,
      isHydrated,
      effectiveTheme,
      setFontScale,
      setLanguageMode,
      setShowNikud,
      setShowEnglish,
      setThemeMode,
      resetSettings,
    }),
    [
      effectiveTheme,
      isHydrated,
      resetSettings,
      setFontScale,
      setLanguageMode,
      setShowEnglish,
      setShowNikud,
      setThemeMode,
      settings,
    ]
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
