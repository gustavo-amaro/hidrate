import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { rescheduleReminders } from "@/lib/notifications";
import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ActivityLevel, UserProfile } from "@/types";

const STEPS = 3;

export default function Onboarding() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const router = useRouter();
  const { saveProfile } = useApp();

  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [wake, setWake] = useState("07:00");
  const [sleep, setSleep] = useState("23:00");
  const [goalText, setGoalText] = useState<string>("");
  const [manualOverride, setManualOverride] = useState(false);

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
    if (!validNumbers) return 0;
    return calcGoalMl(weightNum, heightNum, activity);
  }, [weightNum, heightNum, activity, validNumbers]);

  const finalGoal = manualOverride
    ? Math.max(500, parseInt(goalText.replace(/[^0-9]/g, ""), 10) || computedGoal)
    : computedGoal;

  const canAdvance = step === 0 ? validNumbers : step === 1 ? true : finalGoal > 0;

  const handleNext = async () => {
    if (step < STEPS - 1) {
      if (step === 1) setGoalText(String(computedGoal));
      setStep(step + 1);
      return;
    }

    const profile: UserProfile = {
      weightKg: weightNum,
      heightCm: heightNum,
      activityLevel: activity,
      wakeTime: wake,
      sleepTime: sleep,
      dailyGoalMl: finalGoal,
      manualGoalOverride: manualOverride,
      notificationsEnabled: true,
      reminderCupMl: 250,
      createdAt: new Date().toISOString(),
    };

    await saveProfile(profile, { rescheduleNotifications: false });
    try {
      await rescheduleReminders(profile);
    } catch (err) {
      console.warn("Falha ao agendar lembretes iniciais", err);
    }
    router.replace("/");
  };

  return (
    <LinearGradient
      colors={[theme.colors.accent, theme.colors.primary]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Ionicons name="water" size={28} color="#FFFFFF" />
              <Text style={styles.brand}>Hidrate</Text>
            </View>
            <View style={styles.progressRow}>
              {Array.from({ length: STEPS }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor:
                        i <= step ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              {step === 0 ? (
                <>
                  <Text style={[styles.title, { color: theme.colors.text }]}>Conte sobre você</Text>
                  <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                    Usamos seu peso e altura para sugerir uma meta diária.
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Peso</Text>
                    <View
                      style={[
                        styles.inputRow,
                        {
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <TextInput
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="decimal-pad"
                        style={[styles.input, { color: theme.colors.text }]}
                        maxLength={5}
                      />
                      <Text style={[styles.inputUnit, { color: theme.colors.textMuted }]}>kg</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Altura</Text>
                    <View
                      style={[
                        styles.inputRow,
                        {
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <TextInput
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="decimal-pad"
                        style={[styles.input, { color: theme.colors.text }]}
                        maxLength={5}
                      />
                      <Text style={[styles.inputUnit, { color: theme.colors.textMuted }]}>cm</Text>
                    </View>
                  </View>

                  <Text style={[styles.inputLabel, { color: theme.colors.textMuted, marginTop: 8 }]}>
                    Nível de atividade
                  </Text>
                  <View style={styles.activityList}>
                    {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => {
                      const selected = activity === level;
                      return (
                        <Pressable
                          key={level}
                          onPress={() => setActivity(level)}
                          style={[
                            styles.activityCard,
                            {
                              backgroundColor: selected
                                ? theme.colors.surfaceAlt
                                : theme.colors.surface,
                              borderColor: selected ? theme.colors.primary : theme.colors.border,
                            },
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.activityTitle,
                                { color: theme.colors.text },
                              ]}
                            >
                              {ACTIVITY_LABELS[level]}
                            </Text>
                            <Text
                              style={[
                                styles.activityDesc,
                                { color: theme.colors.textMuted },
                              ]}
                            >
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
                  </View>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <Text style={[styles.title, { color: theme.colors.text }]}>Sua rotina</Text>
                  <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                    Vamos distribuir os lembretes entre seu horário de acordar e dormir.
                  </Text>
                  <View style={{ marginTop: 12 }}>
                    <TimeField
                      label="Acordo às"
                      value={wake}
                      onChange={setWake}
                      icon="sunny-outline"
                    />
                    <View
                      style={[styles.divider, { backgroundColor: theme.colors.border }]}
                    />
                    <TimeField
                      label="Durmo às"
                      value={sleep}
                      onChange={setSleep}
                      icon="moon-outline"
                    />
                  </View>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <Text style={[styles.title, { color: theme.colors.text }]}>Sua meta diária</Text>
                  <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                    Calculada com base nos seus dados. Você pode ajustar se quiser.
                  </Text>

                  <View
                    style={[
                      styles.goalCard,
                      { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
                    ]}
                  >
                    <Ionicons name="water" size={32} color={theme.colors.primary} />
                    <Text style={[styles.goalValue, { color: theme.colors.text }]}>
                      {formatMl(finalGoal)}
                    </Text>
                    <Text style={[styles.goalHint, { color: theme.colors.textMuted }]}>
                      ≈ {Math.ceil(finalGoal / 250)} copos de 250 ml por dia
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => {
                      setManualOverride((v) => {
                        const next = !v;
                        if (next) setGoalText(String(computedGoal));
                        return next;
                      });
                    }}
                    style={styles.overrideRow}
                  >
                    <Ionicons
                      name={manualOverride ? "checkbox" : "square-outline"}
                      size={22}
                      color={manualOverride ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text style={{ color: theme.colors.text, marginLeft: 8 }}>
                      Quero definir uma meta personalizada
                    </Text>
                  </Pressable>

                  {manualOverride ? (
                    <View
                      style={[
                        styles.inputRow,
                        {
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.border,
                          marginTop: 8,
                        },
                      ]}
                    >
                      <TextInput
                        value={goalText}
                        onChangeText={setGoalText}
                        keyboardType="number-pad"
                        style={[styles.input, { color: theme.colors.text }]}
                        maxLength={5}
                        placeholder="2000"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                      <Text style={[styles.inputUnit, { color: theme.colors.textMuted }]}>ml</Text>
                    </View>
                  ) : null}

                  <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                    Você ainda precisará permitir notificações para receber os lembretes.
                  </Text>
                </>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {step > 0 ? (
              <Pressable
                onPress={() => setStep(step - 1)}
                style={[styles.secondaryBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              >
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                <Text style={styles.secondaryText}>Voltar</Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable
              onPress={handleNext}
              disabled={!canAdvance}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: "#FFFFFF",
                  opacity: canAdvance ? 1 : 0.55,
                },
              ]}
            >
              <Text style={[styles.primaryText, { color: theme.colors.primaryDark }]}>
                {step < STEPS - 1 ? "Continuar" : "Vamos lá!"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.primaryDark} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  inputGroup: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: 12,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityList: {
    gap: 8,
    marginTop: 8,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  goalCard: {
    marginTop: 16,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 24,
    alignItems: "center",
    gap: 4,
  },
  goalValue: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
  },
  goalHint: {
    fontSize: 13,
  },
  overrideRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  note: {
    fontSize: 12,
    marginTop: 16,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
  },
  secondaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
