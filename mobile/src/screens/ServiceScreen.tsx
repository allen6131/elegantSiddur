import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getServiceData } from "../data/loader";
import { OfflineSection } from "../data/types";
import { RootStackParamList } from "../navigation/types";
import { SectionRow } from "../components/SectionRow";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { sectionMatchesQuery } from "../utils/search";

type Props = NativeStackScreenProps<RootStackParamList, "Service">;

export function ServiceScreen({ navigation, route }: Props) {
  const { serviceId } = route.params;
  const service = getServiceData(serviceId);
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    return service.sections.filter((section) => sectionMatchesQuery(section, query));
  }, [query, service.sections]);

  const openSection = (section: OfflineSection) => {
    navigation.navigate("Reader", {
      serviceId,
      sectionId: section.id,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.subtitle}>
            {service.heTitle} · {service.sectionCount} sections
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder="Find a section..."
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Pressable
            onPress={() =>
              navigation.navigate("Reader", {
                serviceId,
                sectionId: service.sections[0]?.id ?? "",
              })
            }
            disabled={service.sections.length === 0}
            style={styles.jumpButton}
          >
            <Text style={styles.jumpButtonText}>Open beginning</Text>
          </Pressable>
        </View>

        <FlatList
          data={filteredSections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <SectionRow
              section={item}
              onPress={() => openSection(item)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 16,
  },
  jumpButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  jumpButtonText: {
    color: colors.accent,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
