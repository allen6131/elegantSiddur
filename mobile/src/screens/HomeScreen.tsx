import { useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { getDataset } from "../data/loader";
import { ServiceCard } from "../components/ServiceCard";
import { RootStackParamList } from "../navigation/types";
import { useRecents } from "../state/RecentsContext";
import { EmptyState } from "../components/EmptyState";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { findSectionById } from "../data/selectors";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const dataset = useMemo(() => getDataset(), []);
  const { recents } = useRecents();
  const recentItems = useMemo(() => recents.slice(0, 5), [recents]);

  const openRecent = (sectionId: string) => {
    const sectionLookup = findSectionById(sectionId);
    if (!sectionLookup) {
      return;
    }

    navigation.navigate("Reader", {
      serviceId: sectionLookup.serviceId,
      sectionId: sectionLookup.section.id,
      sectionTitle: sectionLookup.section.title,
    });
  };

  return (
    <FlatList
      data={dataset.serviceOrder}
      keyExtractor={(id) => id}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl },
      ]}
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={["#EEF2FF", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.title}>Siddur</Text>
            <Text style={styles.subtitle}>סידור</Text>
            <Text style={styles.description}>
              Weekday prayers with fully offline text and a focused reader
              experience.
            </Text>
          </LinearGradient>
          <View style={styles.quickLinks}>
            <Pressable
              style={styles.quickLinkButton}
              onPress={() => navigation.navigate("Bookmarks")}
            >
              <Text style={styles.quickLinkText}>Bookmarks</Text>
            </Pressable>
            <Pressable
              style={styles.quickLinkButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Text style={styles.quickLinkText}>Settings</Text>
            </Pressable>
          </View>
        </View>
      }
      renderItem={({ item: serviceId }) => {
        const service = dataset.services[serviceId];
        return (
          <ServiceCard
            service={service}
            onPress={() => navigation.navigate("Service", { serviceId })}
          />
        );
      }}
      ListFooterComponent={
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Recent Sections</Text>
          {recentItems.length === 0 ? (
            <EmptyState
              title="No recent sections yet"
              description="Open any prayer section and it will appear here for quick access."
            />
          ) : (
            recentItems.map((recent) => (
              <Pressable
                key={recent.sectionId}
                style={styles.recentItem}
                onPress={() => openRecent(recent.sectionId)}
              >
                <Text style={styles.recentService}>{recent.serviceId}</Text>
                <Text style={styles.recentTitle} numberOfLines={1}>
                  {recent.sectionTitle}
                </Text>
              </Pressable>
            ))
          )}
          <Text style={styles.attribution}>
            Text source: Sefaria (bundled locally for offline use).
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  headerWrap: {
    gap: spacing.md,
  },
  hero: {
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "right",
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  quickLinks: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickLinkButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  quickLinkText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  footer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  footerTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  recentItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  recentService: {
    ...typography.caption,
    color: colors.textMuted,
  },
  recentTitle: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  attribution: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
