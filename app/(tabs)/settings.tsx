import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TimeField } from "@/components/TimeField";
import { useApp } from "@/lib/AppContext";
import {
  ACTIVITY_DESCRIPTIONS,
  ACTIVITY_LABELS,
  calcGoalMl,
  formatMl,
} from "@/lib/goal";
import { computeReminderTimes } from "@/lib/notifications";
import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ActivityLevel, UserProfile } from "@/types";

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const { profile, saveProfile, resetAll } = useApp();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [wake, setWake] = useState("07:00");
  const [sleep, setSleep] = useState("23:00");
  const [goalText, setGoalText] = useState("");
  const [manual, setManual] = useState(false);
  const [notif, setNotif] = useState(true);
  const [cup, setCup] = useState("250");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setWeight(String(profile.weightKg));
    setHeight(String(profile.heightCm));
    setActivity(profile.activityLevel);
    setWake(profile.wakeTime);
    setSleep(profile.sleepTime);
    setGoalText(String(profile.dailyGoalMl));
    setManual(profile.manualGoalOverride);
    setNotif(profile.notificationsEnabled);
    setCup(String(profile.reminderCupMl ?? 250));
  }, [profile]);

  const weightNum = parseFloat(weight.replace(",", "."));
  const heightNum = parseFloat(height.replace(",", "."));
  const validNumbers =
    Number.isFinite(weightNum) &&
    weightNum >= 20 &&
    weightNum <= 300 &&
    Number.isFinite(heightNum) &&
    heightNum >= 80 &&
    heightNum <= 250;

  const computedGoal = useMemo(() => {
    if (!validNumbers) return profile?.dailyGoalMl ?? 0;
    return calcGoalMl(weightNum, heightNum, activity);
  }, [weightNum, heightNum, activity, validNumbers, profile]);

  const cupNum = Math.max(100, parseInt(cup.replace(/[^0-9]/g, ""), 10) || 250);
  const finalGoal = manual
    ? Math.max(500, parseInt(goalText.replace(/[^0-9]/g, ""), 10) || computedGoal)
    : computedGoal;

  const previewTimes = useMemo(() => {
    if (!profile) return [];
    const draft: UserProfile = {
      ...profile,
      weightKg: validNumbers ? weightNum : profile.weightKg,
      heightCm: validNumbers ? heightNum : profile.heightCm,
      activityLevel: activity,
      wakeTime: wake,
      sleepTime: sleep,
      dailyGoalMl: finalGoal,
      manualGoalOverride: manual,
      notificationsEnabled: notif,
      reminderCupMl: cupNum,
    };
    return computeReminderTimes(draft);
  }, [profile, wake, sleep, finalGoal, cupNum, notif, manual, activity, validNumbers, weightNum, heightNum]);

  if (!profile) return null;

  const handleSave = async () => {
    if (!validNumbers) {
      Alert.alert("Dados inválidos", "Verifique peso e altura antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await saveProfile({
        ...profile,
        weightKg: weightNum,
        heightCm: heightNum,
        activityLevel: activity,
        wakeTime: wake,
        sleepTime: sleep,
        dailyGoalMl: finalGoal,
        manualGoalOverride: manual,
        notificationsEnabled: notif,
        reminderCupMl: cupNum,
      });
      Alert.alert("Pronto!", "Seus dados foram atualizados e os lembretes reagendados.");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar suas alterações.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Apagar todos os dados?",
      "Isso remove seu perfil e todo o histórico. Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar tudo",
          style: "destructive",
          onPress: () => {
            resetAll();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Ajustes</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Personalize sua meta e seus lembretes.
            </Text>
          </View>

          <Section title="Você">
            <FieldRow
              label="Peso"
              unit="kg"
              value={weight}
              onChange={setWeight}
              keyboardType="decimal-pad"
              theme={theme}
            />
            <Divider color={theme.colors.border} />
            <FieldRow
              label="Altura"
              unit="cm"
              value={height}
              onChange={setHeight}
              keyboardType="decimal-pad"
              theme={theme}
            />
          </Section>

          <Section title="Nível de atividade">
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => {
              const selected = activity === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => setActivity(level)}
                  style={[
                    styles.activityRow,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
                      {ACTIVITY_LABELS[level]}
                    </Text>
                    <Text style={[styles.activityDesc, { color: theme.colors.textMuted }]}>
                      {ACTIVITY_DESCRIPTIONS[level]}
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={selected ? theme.colors.primary : theme.colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </Section>

          <Section title="Meta diária">
            <View style={styles.goalPreview}>
              <Text style={[styles.goalLabel, { color: theme.colors.textMuted }]}>Sugerida</Text>
              <Text style={[styles.goalValue, { color: theme.colors.text }]}>
                {formatMl(computedGoal)}
              </Text>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                  Meta personalizada
                </Text>
                <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
                  Defina manualmente quanto você quer beber por dia.
                </Text>
              </View>
              <Switch
                value={manual}
                onValueChange={(v) => {
                  setManual(v);
                  if (v && (!goalText || parseInt(goalText, 10) <= 0)) {
                    setGoalText(String(computedGoal));
                  }
                }}
                trackColor={{ true: theme.colors.primary, false: theme.colors.ringTrack }}
              />
            </View>

            {manual ? (
              <FieldRow
                label="Meta"
                unit="ml"
                value={goalText}
                onChange={setGoalText}
                keyboardType="number-pad"
                theme={theme}
              />
            ) : null}
          </Section>

          <Section title="Lembretes">
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                  Notificações
                </Text>
                <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
                  Avisamos você ao longo do dia para beber água.
                </Text>
              </View>
              <Switch
                value={notif}
                onValueChange={setNotif}
                trackColor={{ true: theme.colors.primary, false: theme.colors.ringTrack }}
              />
            </View>
            <Divider color={theme.colors.border} />
            <TimeField label="Acordo às" value={wake} onChange={setWake} icon="sunny-outline" />
            <Divider color={theme.colors.border} />
            <TimeField label="Durmo às" value={sleep} onChange={setSleep} icon="moon-outline" />
            <Divider color={theme.colors.border} />
            <FieldRow
              label="Tamanho médio do copo"
              unit="ml"
              value={cup}
              onChange={setCup}
              keyboardType="number-pad"
              theme={theme}
            />

            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
                Lembretes ({previewTimes.length})
              </Text>
              <View style={styles.previewChips}>
                {previewTimes.length === 0 ? (
                  <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                    Ative as notificações para receber lembretes.
                  </Text>
                ) : (
                  previewTimes.map((t, idx) => (
                    <View
                      key={`${t.hour}:${t.minute}-${idx}`}
                      style={[styles.chip, { backgroundColor: theme.colors.surface }]}
                    >
                      <Text style={[styles.chipText, { color: theme.colors.primaryDark }]}>
                        {String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </Section>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[
              styles.primaryBtn,
              { backgroundColor: theme.colors.primary, opacity: saving ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>{saving ? "Salvando..." : "Salvar alterações"}</Text>
          </Pressable>

          <Pressable onPress={handleReset} style={styles.dangerBtn}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            <Text style={[styles.dangerText, { color: theme.colors.danger }]}>
              Apagar todos os dados
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>{title.toUpperCase()}</Text>
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={{ height: 1, backgroundColor: color, marginVertical: 4 }} />;
}

type FieldRowProps = {
  label: string;
  unit?: string;
  value: string;
  onChange: (text: string) => void;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  theme: ReturnType<typeof getTheme>;
};

function FieldRow({ label, unit, value, onChange, keyboardType = "default", theme }: FieldRowProps) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{label}</Text>
      <View
        style={[
          styles.fieldInputBox,
          { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          style={[styles.fieldInput, { color: theme.colors.text }]}
          maxLength={5}
        />
        {unit ? <Text style={[styles.fieldUnit, { color: theme.colors.textMuted }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 32, gap: 20 },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 2 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  fieldLabel: { fontSize: 15, fontWeight: "500" },
  fieldInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    minWidth: 120,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 8,
    textAlign: "right",
  },
  fieldUnit: { marginLeft: 6, fontSize: 13, fontWeight: "600" },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  activityTitle: { fontSize: 15, fontWeight: "600" },
  activityDesc: { fontSize: 12, marginTop: 2 },
  goalPreview: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  goalLabel: { fontSize: 13 },
  goalValue: { fontSize: 22, fontWeight: "700" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  switchLabel: { fontSize: 15, fontWeight: "600" },
  switchHint: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  previewBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
  },
  previewTitle: { fontSize: 13, fontWeight: "700" },
  previewChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: "700" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  dangerText: { fontWeight: "600", fontSize: 14 },
});
