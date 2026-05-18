import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AmountModal } from "@/components/AmountModal";
import { QuickAddRow } from "@/components/QuickAddRow";
import { WaterRing } from "@/components/WaterRing";
import { useApp } from "@/lib/AppContext";
import { formatMl } from "@/lib/goal";
import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HomeScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const { profile, todayLog, addEntry, removeLastEntry, refreshLog } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshLog();
    }, [refreshLog]),
  );

  if (!profile) return null;

  const totalMl = todayLog.totalMl;
  const goalMl = profile.dailyGoalMl;
  const remaining = Math.max(0, goalMl - totalMl);
  const entries = [...todayLog.entries].reverse().slice(0, 6);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.accent, theme.colors.background]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textMuted }]}>
                {greeting()}
              </Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {remaining > 0 ? "Vamos beber água?" : "Meta atingida!"}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="water" size={18} color={theme.colors.primary} />
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>{formatMl(goalMl)}</Text>
            </View>
          </View>

          <View style={styles.ringWrap}>
            <WaterRing totalMl={totalMl} goalMl={goalMl} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Adicionar rapidamente
            </Text>
            <QuickAddRow onAdd={(amount) => addEntry(amount)} onCustom={() => setModalOpen(true)} />
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Histórico de hoje
              </Text>
              {todayLog.entries.length > 0 ? (
                <Pressable onPress={removeLastEntry} hitSlop={10} style={styles.undoBtn}>
                  <Ionicons name="arrow-undo" size={16} color={theme.colors.primary} />
                  <Text style={[styles.undoText, { color: theme.colors.primary }]}>Desfazer</Text>
                </Pressable>
              ) : null}
            </View>

            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="water-outline" size={28} color={theme.colors.textMuted} />
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Nenhum registro ainda hoje. Comece com um copo!
                </Text>
              </View>
            ) : (
              <View style={{ gap: 6 }}>
                {entries.map((entry, idx) => (
                  <View
                    key={`${entry.time}-${idx}`}
                    style={[
                      styles.entryRow,
                      { borderBottomColor: theme.colors.border },
                      idx === entries.length - 1 ? { borderBottomWidth: 0 } : null,
                    ]}
                  >
                    <View style={[styles.entryDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.entryAmount, { color: theme.colors.text }]}>
                      {formatMl(entry.amountMl)}
                    </Text>
                    <Text style={[styles.entryTime, { color: theme.colors.textMuted }]}>
                      {formatTime(entry.time)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <AmountModal
        visible={modalOpen}
        initialAmount={profile.reminderCupMl ?? 250}
        onCancel={() => setModalOpen(false)}
        onConfirm={async (amount) => {
          setModalOpen(false);
          await addEntry(amount);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    opacity: 0.35,
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  undoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  undoText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  entryDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 10,
  },
  entryAmount: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  entryTime: {
    fontSize: 13,
    fontWeight: "500",
  },
});
