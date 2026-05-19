import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StatCard } from "@/components/StatCard";
import { StreakBadge } from "@/components/StreakBadge";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useApp } from "@/lib/AppContext";
import { formatMl } from "@/lib/goal";
import { getCurrentWeekLogs } from "@/lib/storage";
import { computeStreak, summarizeLogs } from "@/lib/streak";
import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { DailyLog } from "@/types";

function formatDateLong(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(`${dateStr}T00:00:00`);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export default function HistoryScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const { profile, todayLog } = useApp();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [streak, setStreak] = useState(0);

  const goalMl = profile?.dailyGoalMl ?? 0;
  const todayTotal = todayLog.totalMl;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const weekLogs = await getCurrentWeekLogs();
        const streakValue = await computeStreak(goalMl);
        if (!active) return;
        setLogs(weekLogs);
        setStreak(streakValue);
      })();
      return () => {
        active = false;
      };
      // todayTotal triggers a refresh when the user adds water on the Home tab
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goalMl, todayTotal]),
  );

  if (!profile) return null;

  const summary = summarizeLogs(logs, goalMl);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Histórico</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Acompanhe sua hidratação nesta semana (domingo a sábado).
            </Text>
          </View>

          <StreakBadge streak={streak} />

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Esta semana</Text>
              <View style={styles.legend}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>
                  Meta {formatMl(goalMl)}
                </Text>
              </View>
            </View>
            <WeeklyChart logs={logs} goalMl={goalMl} />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="trending-up"
              label="Média semanal"
              value={formatMl(summary.averageMl)}
            />
            <StatCard
              icon="trophy-outline"
              label="Melhor dia"
              value={summary.bestMl ? formatMl(summary.bestMl) : "—"}
              hint={formatDateLong(summary.bestDate)}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="checkmark-done"
              label="Dias na meta"
              value={`${summary.hitDays} / ${logs.length}`}
              tint={theme.colors.success}
            />
            <StatCard
              icon="water"
              label="Total semanal"
              value={formatMl(summary.averageMl * logs.length)}
            />
          </View>

          <View
            style={[
              styles.tipCard,
              { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
            ]}
          >
            <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.text }]}>
              {streak >= 3
                ? `Você está há ${streak} dias seguidos batendo a meta. Continue assim!`
                : "Manter pequenos goles regulares ajuda a bater a meta sem esforço."}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 32, gap: 16 },
  header: { gap: 4 },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 14 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: { fontSize: 12, fontWeight: "500" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  tipCard: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
