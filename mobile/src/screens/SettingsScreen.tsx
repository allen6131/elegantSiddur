import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useSettings } from "../state/SettingsContext";
import { useThemeColors } from "../theme/useThemeColors";
import { spacing } from "../theme/spacing";
import type { DisplayMode, ThemeMode } from "../data/types";

const languageModeOptions: { key: DisplayMode; label: string }[] = [
  { key: "hebrew", label: "Hebrew" },
  { key: "english", label: "English" },
  { key: "bilingual", label: "Bilingual" },
];

const themeOptions: { key: ThemeMode; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

export function SettingsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const {
    settings,
    effectiveTheme,
    setFontScale,
    setLanguageMode,
    setShowNikud,
    setShowEnglish,
    setThemeMode,
    resetSettings,
  } = useSettings();

  const fontPreview = useMemo(() => Math.round(settings.fontScale * 100), [settings.fontScale]);
  const englishEnabled = settings.showEnglish;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reading Display</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Font size ({fontPreview}%)</Text>
        </View>
        <Slider
          minimumValue={0.8}
          maximumValue={1.8}
          step={0.05}
          value={settings.fontScale}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          onValueChange={setFontScale}
        />

        <View style={styles.modeGroup}>
          <Text style={styles.label}>Language mode</Text>
          <View style={styles.modeButtons}>
            {languageModeOptions.map((modeOption) => {
              const isActive = settings.languageMode === modeOption.key;
              const disabled = !englishEnabled && modeOption.key !== "hebrew";
              return (
                <TouchableOpacity
                  key={modeOption.key}
                  style={[
                    styles.modeButton,
                    isActive && styles.modeButtonActive,
                    disabled && styles.modeButtonDisabled,
                  ]}
                  onPress={() => setLanguageMode(modeOption.key)}
                  accessibilityRole="button"
                  disabled={disabled}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      isActive && styles.modeButtonTextActive,
                      disabled && styles.modeButtonTextDisabled,
                    ]}
                  >
                    {modeOption.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Enable English text</Text>
            <Text style={styles.helperText}>
              Turn this off to force Hebrew-only reading throughout the app.
            </Text>
          </View>
          <Switch value={settings.showEnglish} onValueChange={setShowEnglish} />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Show niqqud (vowels)</Text>
            <Text style={styles.helperText}>
              Toggle to simplify Hebrew text rendering while praying.
            </Text>
          </View>
          <Switch value={settings.showNikud} onValueChange={setShowNikud} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Sync theme with device</Text>
            <Text style={styles.helperText}>
              Automatically follow your phone&apos;s light/dark mode preference.
            </Text>
          </View>
          <Switch
            value={settings.themeMode === "system"}
            onValueChange={(value) => setThemeMode(value ? "system" : effectiveTheme)}
          />
        </View>

        <Text style={styles.label}>Theme</Text>
        <View style={styles.modeButtons}>
          {themeOptions.map((themeOption) => {
            const isActive = settings.themeMode === themeOption.key;
            return (
              <TouchableOpacity
                key={themeOption.key}
                style={[
                  styles.modeButton,
                  isActive && styles.modeButtonActive,
                  settings.themeMode === "system" && styles.modeButtonDisabled,
                ]}
                onPress={() => setThemeMode(themeOption.key)}
                accessibilityRole="button"
                disabled={settings.themeMode === "system"}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    isActive && styles.modeButtonTextActive,
                    settings.themeMode === "system" && styles.modeButtonTextDisabled,
                  ]}
                >
                  {themeOption.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.helperText}>Current effective theme: {effectiveTheme}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Source</Text>
        <Text style={styles.body}>
          Prayer texts are bundled for offline use and sourced from Sefaria.
        </Text>
        <Text style={styles.body}>
          If you refresh data in development, run:
          {"\n"}• npm run build:offline-data{"\n"}• npm run validate:offline-data
        </Text>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
        <Text style={styles.resetButtonText}>Reset Preferences</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderColor: colors.border,
      borderWidth: 1,
      padding: spacing.lg,
      gap: spacing.md,
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    helperText: {
      marginTop: spacing.xs,
      color: colors.textMuted,
      fontSize: 13,
      maxWidth: 240,
    },
    modeGroup: {
      gap: spacing.sm,
    },
    modeButtons: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    modeButton: {
      flex: 1,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    modeButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    modeButtonDisabled: {
      opacity: 0.45,
    },
    modeButtonText: {
      color: colors.textSecondary,
      fontWeight: "600",
    },
    modeButtonTextActive: {
      color: "#fff",
    },
    modeButtonTextDisabled: {
      color: colors.textMuted,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.md,
    },
    body: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    resetButton: {
      paddingVertical: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.danger,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    resetButtonText: {
      color: colors.danger,
      fontSize: 15,
      fontWeight: "700",
    },
  });
