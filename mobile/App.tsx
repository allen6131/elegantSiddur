import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BookmarksProvider } from "./src/state/BookmarksContext";
import { RecentsProvider } from "./src/state/RecentsContext";
import { SettingsProvider } from "./src/state/SettingsContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/colors";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
    notification: colors.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <BookmarksProvider>
          <RecentsProvider>
            <NavigationContainer theme={navTheme}>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </RecentsProvider>
        </BookmarksProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
