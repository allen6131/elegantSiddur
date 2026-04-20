import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../theme/useThemeColors";
import { spacing } from "../theme/spacing";

type ReaderToolbarProps = {
  canGoPrev: boolean;
  canGoNext: boolean;
  isBookmarked: boolean;
  onGoPrev: () => void;
  onGoNext: () => void;
  onToggleBookmark: () => void;
};

export function ReaderToolbar({
  canGoPrev,
  canGoNext,
  isBookmarked,
  onGoPrev,
  onGoNext,
  onToggleBookmark,
}: ReaderToolbarProps) {
  const themeColors = useThemeColors();
  const styles = makeStyles(themeColors);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        disabled={!canGoPrev}
        style={[styles.button, !canGoPrev && styles.buttonDisabled]}
        onPress={onGoPrev}
      >
        <Text style={[styles.buttonText, !canGoPrev && styles.buttonTextDisabled]}>
          Previous
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.bookmarkButton}
        onPress={onToggleBookmark}
      >
        <Text style={styles.bookmarkText}>
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={!canGoNext}
        style={[styles.button, !canGoNext && styles.buttonDisabled]}
        onPress={onGoNext}
      >
        <Text style={[styles.buttonText, !canGoNext && styles.buttonTextDisabled]}>
          Next
        </Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceAlt,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
  bookmarkButton: {
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentSoft,
  },
  bookmarkText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent,
  },
  });
