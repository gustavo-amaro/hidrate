import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { AppProvider, useApp } from "@/lib/AppContext";
import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { ready, profile } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === "onboarding";
    if (!profile && !inOnboarding) {
      router.replace("/onboarding");
    } else if (profile && inOnboarding) {
      router.replace("/");
    }
  }, [ready, profile, segments, router]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const navigationTheme =
    scheme === "dark"
      ? {
          ...DarkTheme,
          colors: { ...DarkTheme.colors, background: getTheme("dark").colors.background },
        }
      : {
          ...DefaultTheme,
          colors: { ...DefaultTheme.colors, background: getTheme("light").colors.background },
        };

  return (
    <AppProvider>
      <ThemeProvider value={navigationTheme}>
        <OnboardingGate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
          </Stack>
        </OnboardingGate>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </AppProvider>
  );
}
