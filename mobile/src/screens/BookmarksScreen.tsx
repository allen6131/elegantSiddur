import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useBookmarks } from "../state/BookmarksContext";
import { EmptyState } from "../components/EmptyState";
import { getDataset } from "../data/loader";

type Props = NativeStackScreenProps<RootStackParamList, "Bookmarks">;

function findSectionById(sectionId: string) {
  const dataset = getDataset();
  for (const serviceId of dataset.serviceOrder) {
    const service = dataset.services[serviceId];
    for (const section of service.sections) {
      if (section.id === sectionId) {
        return { service, section };
      }
    }
  }
  return null;
}

export function BookmarksScreen({ navigation }: Props) {
  const { bookmarks, removeBookmark } = useBookmarks();

  const entries = bookmarks
    .map((sectionId) => {
      const found = findSectionById(sectionId);
      if (!found) return null;
      return {
        sectionId,
        serviceId: found.service.id,
        serviceTitle: found.service.title,
        sectionTitle: found.section.title,
        sectionHeTitle: found.section.heTitle,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bookmarks</Text>
          <Text style={styles.subtitle}>Quick access to frequently used sections</Text>
        </View>

        {entries.length === 0 ? (
          <EmptyState
            title="No bookmarks yet"
            description="Star sections while reading to save them for quick access."
          />
        ) : (
          entries.map((entry) => (
            <View key={entry.sectionId} style={styles.card}>
              <Pressable
                style={styles.cardMain}
                onPress={() =>
                  navigation.navigate("Reader", {
                    serviceId: entry.serviceId,
                    sectionId: entry.sectionId,
                  })
                }
              >
                <Text style={styles.serviceLabel}>{entry.serviceTitle}</Text>
                <Text style={styles.sectionTitle}>{entry.sectionTitle}</Text>
                <Text style={styles.heSectionTitle}>{entry.sectionHeTitle}</Text>
              </Pressable>
              <Pressable
                style={styles.removeButton}
                onPress={() => removeBookmark(entry.sectionId)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardMain: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  serviceLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  heSectionTitle: {
    ...typography.body,
    color: colors.hebrewText,
    textAlign: "right",
    writingDirection: "rtl",
  },
  removeButton: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  removeButtonText: {
    color: colors.danger,
    fontWeight: "600",
  },
});
