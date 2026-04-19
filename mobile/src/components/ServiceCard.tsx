import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { OfflineService } from "../data/types";
import { colors, serviceColors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type ServiceCardProps = {
  service: OfflineService;
  onPress: () => void;
};

const serviceGradients: Record<OfflineService["id"], [string, string]> = {
  shacharit: [serviceColors.shacharit, "#1D4ED8"],
  mincha: [serviceColors.mincha, "#D97706"],
  maariv: [serviceColors.maariv, "#6D28D9"],
  birkatHamazon: [serviceColors.birkatHamazon, "#0F766E"],
};

export function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <LinearGradient
        colors={serviceGradients[service.id]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.heTitle}>{service.heTitle}</Text>
        </View>
        <Text style={styles.description}>{service.description}</Text>
        <Text style={styles.meta}>
          {service.sectionCount} sections • {service.segmentCount} lines
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 20,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading,
    color: colors.surface,
  },
  heTitle: {
    ...typography.subheading,
    color: "#E2E8F0",
    writingDirection: "rtl",
    textAlign: "right",
  },
  description: {
    ...typography.bodySmall,
    color: "#F8FAFC",
    marginBottom: spacing.md,
  },
  meta: {
    ...typography.caption,
    color: "#E2E8F0",
  },
});
