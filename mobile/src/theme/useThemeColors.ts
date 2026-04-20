import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "./colors";
import { useSettings } from "../state/SettingsContext";

export function useThemeColors() {
  const { settings } = useSettings();
  const deviceScheme = useColorScheme();

  return useMemo(() => {
    const resolvedMode =
      settings.themeMode === "system"
        ? deviceScheme === "dark"
          ? "dark"
          : "light"
        : settings.themeMode;

    return resolvedMode === "dark" ? darkColors : lightColors;
  }, [deviceScheme, settings.themeMode]);
}
