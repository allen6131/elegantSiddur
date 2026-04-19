import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { DisplayMode, OfflineSegment } from "../data/types";
import { parseInlineMarkupToRuns } from "../utils/htmlInlineParser";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type ReaderSegmentProps = {
  segment: OfflineSegment;
  mode: DisplayMode;
  fontScale: number;
  showNikud: boolean;
};

function stripNikud(text: string) {
  return text.replace(/[\u0591-\u05C7]/g, "");
}

function renderInlineText(text: string, style: object, showNikud: boolean, isHebrew = false) {
  const preparedText = isHebrew && !showNikud ? stripNikud(text) : text;
  const runs = parseInlineMarkupToRuns(preparedText);

  return (
    <Text style={style}>
      {runs.map((run, index) => (
        <Text
          key={`${index}:${run.text.slice(0, 12)}`}
          style={[
            run.bold && styles.boldInline,
            run.italic && styles.italicInline,
            run.small && styles.smallInline,
          ]}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

export function ReaderSegment({ segment, mode, fontScale, showNikud }: ReaderSegmentProps) {
  const showHebrew = mode === "hebrew" || mode === "bilingual";
  const showEnglish = mode === "english" || mode === "bilingual";

  return (
    <View style={styles.container}>
      {showHebrew && segment.he ? (
        <View style={styles.hebrewContainer}>
          {renderInlineText(
            segment.he,
            [
              styles.hebrewText,
              {
                fontSize: typography.hebrew.fontSize * fontScale,
                lineHeight: typography.hebrew.lineHeight * fontScale,
              },
            ],
            showNikud,
            true,
          )}
        </View>
      ) : null}

      {showEnglish && segment.en ? (
        <View style={styles.englishContainer}>
          {renderInlineText(
            segment.en,
            [styles.englishText, { fontSize: typography.body.fontSize * fontScale }],
            true,
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  hebrewContainer: {
    alignItems: "flex-end",
  },
  hebrewText: {
    color: colors.hebrewText,
    textAlign: "right",
    writingDirection: "rtl",
  },
  englishContainer: {
    alignItems: "flex-start",
  },
  englishText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "left",
  },
  boldInline: {
    fontWeight: "700",
  },
  italicInline: {
    fontStyle: "italic",
  },
  smallInline: {
    fontSize: 12,
  },
});
