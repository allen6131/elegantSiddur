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

import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { getDataset } from "../data/loader";
import { ServiceCard } from "../components/ServiceCard";
import { RootStackParamList } from "../navigation/types";
import { useRecents } from "../state/RecentsContext";
import { EmptyState } from "../components/EmptyState";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { findSectionById } from "../data/selectors";
import { useThemeColors } from "../theme/useThemeColors";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
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
            colors={[colors.accentSoft, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={[styles.title, { color: colors.textPrimary }]}>Siddur</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>סידור</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Weekday prayers with fully offline text and a focused reader
              experience.
            </Text>
          </LinearGradient>
          <View style={styles.quickLinks}>
            <Pressable
              style={[
                styles.quickLinkButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={() => navigation.navigate("Bookmarks")}
            >
              <Text style={[styles.quickLinkText, { color: colors.textPrimary }]}>
                Bookmarks
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.quickLinkButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={() => navigation.navigate("Settings")}
            >
              <Text style={[styles.quickLinkText, { color: colors.textPrimary }]}>
                Settings
              </Text>
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
          <Text style={[styles.footerTitle, { color: colors.textPrimary }]}>Recent Sections</Text>
          {recentItems.length === 0 ? (
            <EmptyState
              title="No recent sections yet"
              description="Open any prayer section and it will appear here for quick access."
            />
          ) : (
            recentItems.map((recent) => (
              <Pressable
                key={recent.sectionId}
                style={[
                  styles.recentItem,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                onPress={() => openRecent(recent.sectionId)}
              >
                <Text style={[styles.recentService, { color: colors.textMuted }]}>
                  {recent.serviceId}
                </Text>
                <Text style={[styles.recentTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {recent.sectionTitle}
                </Text>
              </Pressable>
            ))
          )}
          <Text style={[styles.attribution, { color: colors.textMuted }]}>
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
  },
  headerWrap: {
    gap: spacing.md,
  },
  hero: {
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "right",
  },
  description: {
    ...typography.bodySmall,
  },
  quickLinks: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickLinkButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  quickLinkText: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  footer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  footerTitle: {
    ...typography.subheading,
  },
  recentItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  recentService: {
    ...typography.caption,
  },
  recentTitle: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  attribution: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },
});
