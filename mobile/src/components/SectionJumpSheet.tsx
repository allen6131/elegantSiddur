import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { OfflineSection } from "../data/types";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useThemeColors";

type SectionJumpSheetProps = {
  visible: boolean;
  sections: OfflineSection[];
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
  onClose: () => void;
};

export function SectionJumpSheet({
  visible,
  sections,
  activeSectionId,
  onSelectSection,
  onClose,
}: SectionJumpSheetProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!visible) {
      setQuery("");
    }
  }, [visible]);

  const sectionIndexById = useMemo(
    () => new Map(sections.map((section, index) => [section.id, index])),
    [sections],
  );

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return sections;
    }

    return sections.filter((section) => {
      const matchesTitle = section.title.toLowerCase().includes(normalizedQuery);
      const matchesHebrew = section.heTitle.toLowerCase().includes(normalizedQuery);
      const matchesSource = section.sourceRef.toLowerCase().includes(normalizedQuery);
      return matchesTitle || matchesHebrew || matchesSource;
    });
  }, [query, sections]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Jump to section</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          placeholder="Search sections..."
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {filteredSections.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <Text style={styles.emptyStateText}>No sections found</Text>
            </View>
          ) : (
            filteredSections.map((item) => {
              const isActive = item.id === activeSectionId;
              const sectionIndex = sectionIndexById.get(item.id) ?? 0;

              return (
                <Pressable
                  key={item.id}
                  style={[styles.sectionRow, isActive && styles.sectionRowActive]}
                  onPress={() => onSelectSection(item.id)}
                >
                  <View style={styles.sectionTextWrap}>
                    <Text style={styles.sectionNumber}>{sectionIndex + 1}</Text>
                    <View style={styles.sectionTitles}>
                      <Text style={styles.sectionTitle}>{item.title}</Text>
                      <Text style={styles.sectionHebrewTitle}>{item.heTitle}</Text>
                    </View>
                  </View>
                  {isActive ? <Text style={styles.currentTag}>Current</Text> : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 20,
      backgroundColor: "rgba(17, 24, 39, 0.35)",
      justifyContent: "flex-end",
    },
    backdrop: {
      flex: 1,
    },
    sheet: {
      maxHeight: "82%",
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.sm,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sheetTitle: {
      ...typography.subheading,
      color: colors.textPrimary,
    },
    closeButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    closeButtonText: {
      color: colors.textPrimary,
      fontWeight: "600",
      fontSize: 13,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 15,
    },
    scrollArea: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.sm,
    },
    sectionRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    sectionRowActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    sectionTextWrap: {
      flexDirection: "row",
      flex: 1,
      gap: spacing.sm,
    },
    sectionNumber: {
      ...typography.caption,
      color: colors.textMuted,
      minWidth: 24,
    },
    sectionTitles: {
      flex: 1,
      gap: spacing.xxs,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontWeight: "600",
      fontSize: 15,
    },
    sectionHebrewTitle: {
      color: colors.hebrewText,
      fontSize: 17,
      textAlign: "right",
      writingDirection: "rtl",
    },
    currentTag: {
      color: colors.accent,
      fontWeight: "700",
      fontSize: 12,
      alignSelf: "center",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    emptyStateWrap: {
      paddingVertical: spacing.xl,
      alignItems: "center",
    },
    emptyStateText: {
      ...typography.bodySmall,
      color: colors.textMuted,
    },
  });
