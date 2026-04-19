import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    ...typography.subheading,
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
