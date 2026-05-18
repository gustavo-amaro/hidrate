export type ActivityLevel = "sedentary" | "moderate" | "active";

export type UserProfile = {
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  wakeTime: string;
  sleepTime: string;
  dailyGoalMl: number;
  manualGoalOverride: boolean;
  notificationsEnabled: boolean;
  reminderCupMl: number;
  createdAt: string;
};

export type DrinkEntry = {
  time: string;
  amountMl: number;
};

export type DailyLog = {
  date: string;
  totalMl: number;
  entries: DrinkEntry[];
};

export type Theme = {
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    primaryDark: string;
    accent: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    danger: string;
    gradient: readonly [string, string, ...string[]];
    ringTrack: string;
  };
  spacing: (n: number) => number;
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  typography: {
    display: number;
    title: number;
    subtitle: number;
    body: number;
    small: number;
  };
};
