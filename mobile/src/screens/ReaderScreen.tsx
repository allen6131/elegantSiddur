import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReaderSegment } from "../components/ReaderSegment";
import { ReaderToolbar } from "../components/ReaderToolbar";
import { getServiceData } from "../data/loader";
import { useBookmarks } from "../state/BookmarksContext";
import { useRecents } from "../state/RecentsContext";
import { useSettings } from "../state/SettingsContext";
import { useThemeColors } from "../theme/useThemeColors";
import { spacing } from "../theme/spacing";
import { RootStackParamList } from "../navigation/types";
import { typography } from "../theme/typography";
import type { ThemeColors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Reader">;

export function ReaderScreen({ navigation, route }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { serviceId, sectionId } = route.params;
  const service = getServiceData(serviceId);

  const sectionIndex = service.sections.findIndex((section) => section.id === sectionId);
  const section = sectionIndex >= 0 ? service.sections[sectionIndex] : service.sections[0];
  const fallbackIndex = sectionIndex >= 0 ? sectionIndex : 0;

  const { settings, setFontScale, setLanguageMode } = useSettings();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { openRecent } = useRecents();

  const canGoPrevious = sectionIndex > 0;
  const canGoNext = sectionIndex < service.sections.length - 1 && sectionIndex >= 0;

  const bookmarkActive = isBookmarked(section.id);
  const readerLanguageOptions = settings.showEnglish
    ? (["hebrew", "english", "bilingual"] as const)
    : (["hebrew"] as const);

  useMemo(() => {
    void openRecent({
      sectionId: section.id,
      serviceId,
      sectionTitle: section.title,
    });
  }, [openRecent, section.id, section.title, serviceId]);

  const goToSibling = (direction: -1 | 1) => {
    const nextIndex = sectionIndex + direction;
    const nextSection = service.sections[nextIndex];
    if (!nextSection) {
      return;
    }

    navigation.replace("Reader", {
      serviceId,
      sectionId: nextSection.id,
    });
  };

  const jumpToSection = () => {
    navigation.navigate("Service", { serviceId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionHebrew}>{section.heTitle}</Text>
            <Text style={styles.sectionRef}>{section.sourceRef}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => toggleBookmark(section.id)}
            style={[styles.bookmarkButton, bookmarkActive && styles.bookmarkButtonActive]}
          >
            <Text style={[styles.bookmarkButtonText, bookmarkActive && styles.bookmarkButtonTextActive]}>
              {bookmarkActive ? "Bookmarked" : "Bookmark"}
            </Text>
          </Pressable>
        </View>

        <ReaderToolbar
          canGoPrev={canGoPrevious}
          canGoNext={canGoNext}
          isBookmarked={bookmarkActive}
          onGoPrev={() => goToSibling(-1)}
          onGoNext={() => goToSibling(1)}
          onToggleBookmark={() => toggleBookmark(section.id)}
        />

        <View style={styles.readerControls}>
          <Text style={styles.controlsLabel}>Language</Text>
          <View style={styles.modeGroup}>
            {readerLanguageOptions.map((modeOption) => {
              const isActive = settings.languageMode === modeOption;
              return (
                <Pressable
                  key={modeOption}
                  style={[styles.modeButton, isActive && styles.modeButtonActive]}
                  onPress={() => setLanguageMode(modeOption)}
                >
                  <Text style={[styles.modeButtonText, isActive && styles.modeButtonTextActive]}>
                    {modeOption === "hebrew"
                      ? "HE"
                      : modeOption === "english"
                      ? "EN"
                      : "Both"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.fontScaleWrap}>
            <Pressable
              style={styles.fontScaleButton}
              onPress={() => setFontScale(settings.fontScale - 0.1)}
            >
              <Text style={styles.fontScaleButtonText}>A-</Text>
            </Pressable>
            <Text style={styles.fontScaleText}>
              {Math.round(settings.fontScale * 100)}%
            </Text>
            <Pressable
              style={styles.fontScaleButton}
              onPress={() => setFontScale(settings.fontScale + 0.1)}
            >
              <Text style={styles.fontScaleButtonText}>A+</Text>
            </Pressable>
            <Pressable style={styles.jumpButton} onPress={jumpToSection}>
              <Text style={styles.jumpButtonText}>Sections</Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          data={section.segments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ReaderSegment
              segment={item}
              mode={
                settings.showEnglish
                  ? settings.languageMode
                  : settings.languageMode === "english" ||
                    settings.languageMode === "bilingual"
                  ? "hebrew"
                  : settings.languageMode
              }
              fontScale={settings.fontScale}
              showNikud={settings.showNikud}
            />
          )}
          initialNumToRender={16}
          maxToRenderPerBatch={20}
          windowSize={12}
          removeClippedSubviews
          ListFooterComponent={<View style={styles.footerSpace} />}
        />

        <View style={styles.bottomNav}>
          <Pressable
            accessibilityRole="button"
            disabled={!canGoPrevious}
            onPress={() => goToSibling(-1)}
            style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Alert.alert("Section", `${fallbackIndex + 1} of ${service.sections.length}`);
            }}
            style={[styles.navButton, styles.navButtonCenter]}
          >
            <Text style={[styles.navButtonText, styles.navButtonCenterText]}>
              {fallbackIndex + 1}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!canGoNext}
            onPress={() => goToSibling(1)}
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  headerText: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  sectionHebrew: {
    fontSize: 21,
    lineHeight: 28,
    textAlign: "right",
    color: colors.hebrewText,
    writingDirection: "rtl",
  },
  sectionRef: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bookmarkButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceAlt,
  },
  bookmarkButtonActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  bookmarkButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  bookmarkButtonTextActive: {
    color: colors.accent,
  },
  readerControls: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  controlsLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  modeGroup: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  modeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modeButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  modeButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: colors.accent,
  },
  fontScaleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  fontScaleButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  fontScaleButtonText: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  fontScaleText: {
    fontSize: 14,
    color: colors.textSecondary,
    minWidth: 44,
  },
  jumpButton: {
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  jumpButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  footerSpace: {
    height: spacing.xl,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  navButtonCenter: {
    flex: 0.6,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  navButtonCenterText: {
    color: colors.textPrimary,
  },
  });
