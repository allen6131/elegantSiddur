import { Pressable, StyleSheet, Text, View } from "react-native";
import type { OfflineSection } from "../data/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type SectionRowProps = {
  section: OfflineSection;
  onPress: () => void;
};

export function SectionRow({ section, onPress }: SectionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{section.title}</Text>
        <Text style={styles.heTitle}>{section.heTitle}</Text>
        <Text style={styles.subtitle}>{section.segmentCount} lines</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  heTitle: {
    ...typography.body,
    color: colors.hebrewText,
    textAlign: "right",
    writingDirection: "rtl",
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  chevron: {
    marginLeft: spacing.sm,
    fontSize: 26,
    color: colors.textMuted,
  },
});
