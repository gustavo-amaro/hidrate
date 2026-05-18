import type { Theme } from "@/types";

const baseSpacing = 4;
const spacing = (n: number) => baseSpacing * n;

const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

const typography = {
  display: 56,
  title: 28,
  subtitle: 20,
  body: 16,
  small: 13,
};

export const lightTheme: Theme = {
  colors: {
    background: "#F4FAFE",
    surface: "#FFFFFF",
    surfaceAlt: "#E9F4FB",
    primary: "#1E90D6",
    primaryDark: "#0B6BCB",
    accent: "#7EE8FA",
    text: "#0F2233",
    textMuted: "#6B7E8F",
    border: "#D6E6F2",
    success: "#34C77B",
    danger: "#E55353",
    gradient: ["#7EE8FA", "#5BB6E5"] as const,
    ringTrack: "#DCEEF9",
  },
  spacing,
  radius,
  typography,
};

export const darkTheme: Theme = {
  colors: {
    background: "#0B1620",
    surface: "#13212E",
    surfaceAlt: "#1B2D3E",
    primary: "#5BB6E5",
    primaryDark: "#1E90D6",
    accent: "#7EE8FA",
    text: "#EAF4FB",
    textMuted: "#8AA0B3",
    border: "#22384C",
    success: "#34C77B",
    danger: "#FF7676",
    gradient: ["#13212E", "#1B2D3E"] as const,
    ringTrack: "#1F3447",
  },
  spacing,
  radius,
  typography,
};

export function getTheme(scheme: "light" | "dark" | null | undefined): Theme {
  return scheme === "dark" ? darkTheme : lightTheme;
}
