import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BookmarksProvider } from "./src/state/BookmarksContext";
import { RecentsProvider } from "./src/state/RecentsContext";
import { SettingsProvider, useSettings } from "./src/state/SettingsContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useMemo } from "react";
import { useThemeColors } from "./src/theme/useThemeColors";

function AppWithProviders() {
  const { effectiveTheme } = useSettings();
  const palette = useThemeColors();
  const navTheme = useMemo(
    () => ({
      ...(effectiveTheme === "dark" ? DarkTheme : DefaultTheme),
      dark: effectiveTheme === "dark",
      colors: {
        ...(effectiveTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
        background: palette.background,
        card: palette.surface,
        text: palette.textPrimary,
        border: palette.border,
        primary: palette.accent,
        notification: palette.accent,
      },
    }),
    [effectiveTheme, palette],
  );

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <BookmarksProvider>
          <RecentsProvider>
            <AppWithProviders />
          </RecentsProvider>
        </BookmarksProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
