import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, type ListRenderItemInfo } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReaderSegment } from "../components/ReaderSegment";
import { SectionJumpSheet } from "../components/SectionJumpSheet";
import { ReaderToolbar } from "../components/ReaderToolbar";
import { getServiceData } from "../data/loader";
import type { OfflineSection } from "../data/types";
import { useBookmarks } from "../state/BookmarksContext";
import { useRecents } from "../state/RecentsContext";
import { useSettings } from "../state/SettingsContext";
import { useThemeColors } from "../theme/useThemeColors";
import { spacing } from "../theme/spacing";
import { RootStackParamList } from "../navigation/types";
import { typography } from "../theme/typography";
import type { ThemeColors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Reader">;

type SectionHeaderRow = {
  key: string;
  type: "sectionHeader";
  section: OfflineSection;
  absoluteSectionIndex: number;
};

type SegmentRow = {
  key: string;
  type: "segment";
  sectionId: string;
  segment: OfflineSection["segments"][number];
};

type ReaderRow = SectionHeaderRow | SegmentRow;

const WINDOW_BEFORE = 4;
const WINDOW_AFTER = 40;

export function ReaderScreen({ navigation, route }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { serviceId, sectionId } = route.params;
  const service = getServiceData(serviceId);
  const listRef = useRef<FlatList<ReaderRow>>(null);
  const [isJumpSheetVisible, setIsJumpSheetVisible] = useState(false);

  const sectionById = useMemo(() => {
    return new Map(service.sections.map((section) => [section.id, section]));
  }, [service.sections]);
  const sectionIndexById = useMemo(
    () => new Map(service.sections.map((section, index) => [section.id, index])),
    [service.sections],
  );
  const fallbackSection = service.sections[0];
  const initialSectionId = sectionById.has(sectionId) ? sectionId : fallbackSection.id;
  const initialSectionIndex = sectionIndexById.get(initialSectionId) ?? 0;
  const windowStart = Math.max(0, initialSectionIndex - WINDOW_BEFORE);
  const windowEnd = Math.min(service.sections.length, initialSectionIndex + WINDOW_AFTER);
  const visibleSections = useMemo(
    () => service.sections.slice(windowStart, windowEnd),
    [service.sections, windowEnd, windowStart],
  );

  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const activeSectionIdRef = useRef(initialSectionId);
  const sectionHeaderOffsetByIdRef = useRef<Record<string, number>>({});
  const lastRecentSectionRef = useRef("");
  const scrollRetryRef = useRef(0);

  const { settings, setFontScale, setLanguageMode } = useSettings();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { openRecent } = useRecents();

  const readerLanguageOptions = settings.showEnglish
    ? (["hebrew", "english", "bilingual"] as const)
    : (["hebrew"] as const);
  const activeSection = sectionById.get(activeSectionId) ?? fallbackSection;
  const activeSectionIndex = sectionIndexById.get(activeSection.id) ?? 0;
  const canGoPrevious = activeSectionIndex > 0;
  const canGoNext = activeSectionIndex < service.sections.length - 1;
  const bookmarkActive = isBookmarked(activeSection.id);
  const currentReadingMode =
    settings.showEnglish ||
    (settings.languageMode !== "english" && settings.languageMode !== "bilingual")
      ? settings.languageMode
      : "hebrew";

  const { readerRows, headerRowIndexBySectionId } = useMemo(() => {
    const rows: ReaderRow[] = [];
    const sectionHeaderIndices = new Map<string, number>();

    visibleSections.forEach((section, sectionOffset) => {
      const absoluteSectionIndex = windowStart + sectionOffset;
      sectionHeaderIndices.set(section.id, rows.length);
      rows.push({
        key: `${section.id}:header`,
        type: "sectionHeader",
        section,
        absoluteSectionIndex,
      });
      section.segments.forEach((segment) => {
        rows.push({
          key: segment.id,
          type: "segment",
          sectionId: section.id,
          segment,
        });
      });
    });

    return { readerRows: rows, headerRowIndexBySectionId: sectionHeaderIndices };
  }, [visibleSections, windowStart]);

  useEffect(() => {
    setActiveSectionId(initialSectionId);
  }, [initialSectionId]);

  useEffect(() => {
    activeSectionIdRef.current = activeSectionId;
  }, [activeSectionId]);

  useEffect(() => {
    navigation.setOptions({ title: activeSection.title });
  }, [activeSection.title, navigation]);

  useEffect(() => {
    const sectionForRecent = sectionById.get(initialSectionId);
    if (!sectionForRecent || lastRecentSectionRef.current === sectionForRecent.id) {
      return;
    }

    lastRecentSectionRef.current = sectionForRecent.id;
    void openRecent({
      sectionId: sectionForRecent.id,
      serviceId,
      sectionTitle: sectionForRecent.title,
    });
  }, [initialSectionId, openRecent, sectionById, serviceId]);

  const scrollToSection = useCallback(
    (targetSectionId: string, animated = true) => {
      const targetIndex = headerRowIndexBySectionId.get(targetSectionId);
      if (targetIndex === undefined) {
        const targetSection = sectionById.get(targetSectionId);
        if (!targetSection) {
          return;
        }
        navigation.replace("Reader", {
          serviceId,
          sectionId: targetSectionId,
          sectionTitle: targetSection.title,
        });
        return;
      }

      scrollRetryRef.current = 0;
      setActiveSectionId(targetSectionId);
      listRef.current?.scrollToIndex({ index: targetIndex, animated, viewPosition: 0 });
    },
    [headerRowIndexBySectionId, navigation, sectionById, serviceId],
  );

  const goToSiblingSection = (direction: -1 | 1) => {
    const nextSection = service.sections[activeSectionIndex + direction];
    if (!nextSection) {
      return;
    }
    scrollToSection(nextSection.id);
  };

  const updateActiveSectionFromOffset = useCallback(
    (yOffset: number) => {
      let nextActiveSectionId = visibleSections[0]?.id;

      for (const section of visibleSections) {
        const headerOffset = sectionHeaderOffsetByIdRef.current[section.id];
        if (headerOffset === undefined) {
          continue;
        }

        if (headerOffset <= yOffset + spacing.md) {
          nextActiveSectionId = section.id;
        } else {
          break;
        }
      }

      if (nextActiveSectionId && nextActiveSectionId !== activeSectionIdRef.current) {
        setActiveSectionId(nextActiveSectionId);
      }
    },
    [visibleSections],
  );

  const renderReaderRow = useCallback(
    ({ item }: ListRenderItemInfo<ReaderRow>) => {
      if (item.type === "sectionHeader") {
        const headerBookmarked = isBookmarked(item.section.id);

        return (
          <View
            style={[
              styles.sectionHeaderCard,
              item.section.id === activeSection.id && styles.sectionHeaderCardActive,
            ]}
            onLayout={(event) => {
              sectionHeaderOffsetByIdRef.current[item.section.id] = event.nativeEvent.layout.y;
            }}
          >
            <View style={styles.sectionHeaderTop}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionHeaderTitle}>{item.section.title}</Text>
                <Text style={styles.sectionHeaderHebrew}>{item.section.heTitle}</Text>
                <Text style={styles.sectionHeaderSource}>{item.section.sourceRef}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => toggleBookmark(item.section.id)}
                style={[
                  styles.sectionHeaderBookmark,
                  headerBookmarked && styles.sectionHeaderBookmarkActive,
                ]}
              >
                <Text
                  style={[
                    styles.sectionHeaderBookmarkText,
                    headerBookmarked && styles.sectionHeaderBookmarkTextActive,
                  ]}
                >
                  {headerBookmarked ? "Bookmarked" : "Bookmark"}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.sectionHeaderIndex}>
              Section {item.absoluteSectionIndex + 1} of {service.sections.length}
            </Text>
          </View>
        );
      }

      return (
        <ReaderSegment
          segment={item.segment}
          mode={currentReadingMode}
          fontScale={settings.fontScale}
          showNikud={settings.showNikud}
        />
      );
    },
    [
      activeSection.id,
      currentReadingMode,
      isBookmarked,
      service.sections.length,
      settings.fontScale,
      settings.showNikud,
      styles.sectionHeaderBookmark,
      styles.sectionHeaderBookmarkActive,
      styles.sectionHeaderBookmarkText,
      styles.sectionHeaderBookmarkTextActive,
      styles.sectionHeaderCard,
      styles.sectionHeaderCardActive,
      styles.sectionHeaderHebrew,
      styles.sectionHeaderIndex,
      styles.sectionHeaderSource,
      styles.sectionHeaderText,
      styles.sectionHeaderTitle,
      styles.sectionHeaderTop,
      toggleBookmark,
    ],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <View style={styles.readerControls}>
          <Text style={styles.activeTitleLabel}>Now reading</Text>
          <Text style={styles.activeTitleText} numberOfLines={1}>
            {activeSection.title}
          </Text>
          <Text style={styles.activeTitleHebrew} numberOfLines={1}>
            {activeSection.heTitle}
          </Text>
          <Text style={styles.windowLabel}>
            Showing sections {windowStart + 1}–{windowEnd} of {service.sections.length}
          </Text>
        </View>

        <ReaderToolbar
          canGoPrev={canGoPrevious}
          canGoNext={canGoNext}
          isBookmarked={bookmarkActive}
          onGoPrev={() => goToSiblingSection(-1)}
          onGoNext={() => goToSiblingSection(1)}
          onOpenSections={() => setIsJumpSheetVisible(true)}
          onToggleBookmark={() => toggleBookmark(activeSection.id)}
        />

        <View style={styles.displayControls}>
          <Text style={styles.controlsLabel}>Display</Text>
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
            <Text style={styles.fontScaleText}>{Math.round(settings.fontScale * 100)}%</Text>
            <Pressable
              style={styles.fontScaleButton}
              onPress={() => setFontScale(settings.fontScale + 0.1)}
            >
              <Text style={styles.fontScaleButtonText}>A+</Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={readerRows}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          renderItem={renderReaderRow}
          onScrollEndDrag={(event) => {
            updateActiveSectionFromOffset(event.nativeEvent.contentOffset.y);
          }}
          onMomentumScrollEnd={(event) => {
            updateActiveSectionFromOffset(event.nativeEvent.contentOffset.y);
          }}
          initialNumToRender={24}
          maxToRenderPerBatch={24}
          windowSize={12}
          removeClippedSubviews
          onScrollToIndexFailed={({ index, averageItemLength, highestMeasuredFrameIndex }) => {
            if (scrollRetryRef.current >= 1) {
              return;
            }
            scrollRetryRef.current += 1;
            const safeTarget = Math.min(index, highestMeasuredFrameIndex + 1);
            listRef.current?.scrollToOffset({
              offset: Math.max(0, averageItemLength * safeTarget),
              animated: false,
            });
          }}
          ListFooterComponent={<View style={styles.footerSpace} />}
        />
      </View>

      <SectionJumpSheet
        visible={isJumpSheetVisible}
        sections={service.sections}
        activeSectionId={activeSection.id}
        onSelectSection={(targetSectionId) => {
          setIsJumpSheetVisible(false);
          scrollToSection(targetSectionId);
        }}
        onClose={() => setIsJumpSheetVisible(false)}
      />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  readerControls: {
    gap: spacing.xxs,
  },
  activeTitleLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  activeTitleText: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  activeTitleHebrew: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: "right",
    color: colors.hebrewText,
    writingDirection: "rtl",
  },
  windowLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  displayControls: {
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
  listContent: {
    paddingBottom: spacing.lg,
  },
  sectionHeaderCard: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sectionHeaderCardActive: {
    borderColor: colors.accent,
  },
  sectionHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  sectionHeaderText: {
    flex: 1,
    gap: spacing.xxs,
  },
  sectionHeaderTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  sectionHeaderHebrew: {
    fontSize: 20,
    lineHeight: 28,
    color: colors.hebrewText,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sectionHeaderSource: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  sectionHeaderBookmark: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceAlt,
  },
  sectionHeaderBookmarkActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  sectionHeaderBookmarkText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeaderBookmarkTextActive: {
    color: colors.accent,
  },
  sectionHeaderIndex: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footerSpace: {
    height: spacing.xxl,
  },
  });
