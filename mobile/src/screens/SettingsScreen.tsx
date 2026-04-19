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
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

const languageModeOptions = [
  { key: "hebrew", label: "Hebrew" },
  { key: "english", label: "English" },
  { key: "bilingual", label: "Bilingual" },
] as const;

export function SettingsScreen() {
  const { settings, setFontScale, setLanguageMode, setShowNikud, resetSettings } =
    useSettings();

  const fontPreview = useMemo(() => Math.round(settings.fontScale * 100), [settings.fontScale]);

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
            {languageModeOptions.map((mode) => {
              const isActive = settings.languageMode === mode.key;
              return (
                <TouchableOpacity
                  key={mode.key}
                  style={[styles.modeButton, isActive && styles.modeButtonActive]}
                  onPress={() => setLanguageMode(mode.key)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[styles.modeButtonText, isActive && styles.modeButtonTextActive]}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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

const styles = StyleSheet.create({
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
  modeButtonText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: "#fff",
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
    backgroundColor: "#fff",
  },
  resetButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "700",
  },
});
