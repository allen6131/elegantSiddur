import type { ThemeMode } from "../data/types";

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  hebrewText: string;
};

export const lightColors: ThemeColors = {
  background: "#F7F7FB",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F3FA",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  accent: "#3B82F6",
  accentSoft: "#DBEAFE",
  success: "#16A34A",
  danger: "#DC2626",
  hebrewText: "#0F172A",
};

export const darkColors: ThemeColors = {
  background: "#0B1220",
  surface: "#111827",
  surfaceAlt: "#1F2937",
  textPrimary: "#F9FAFB",
  textSecondary: "#D1D5DB",
  textMuted: "#9CA3AF",
  border: "#374151",
  accent: "#60A5FA",
  accentSoft: "#1E3A8A",
  success: "#4ADE80",
  danger: "#F87171",
  hebrewText: "#F3F4F6",
};

export function getThemeColors(themeMode: ThemeMode): ThemeColors {
  return themeMode === "dark" ? darkColors : lightColors;
}

export const colors = lightColors;

export const serviceColors = {
  shacharit: "#3B82F6",
  mincha: "#F59E0B",
  maariv: "#8B5CF6",
  birkatHamazon: "#10B981",
};
