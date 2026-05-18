import type { ActivityLevel } from "@/types";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.0,
  moderate: 1.15,
  active: 1.3,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentário",
  moderate: "Moderado",
  active: "Ativo",
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Pouco ou nenhum exercício",
  moderate: "Exercício 3–5 vezes/semana",
  active: "Exercício diário ou trabalho físico",
};

const ML_PER_BSA = 1500;
const ROUND_TO = 50;

export function calcGoalMl(
  weightKg: number,
  heightCm: number,
  activityLevel: ActivityLevel,
): number {
  const safeWeight = Math.max(20, weightKg || 0);
  const safeHeight = Math.max(80, heightCm || 0);
  const bsa = Math.sqrt((safeWeight * safeHeight) / 3600);
  const factor = ACTIVITY_FACTORS[activityLevel] ?? 1.0;
  const raw = bsa * ML_PER_BSA * factor;
  return Math.round(raw / ROUND_TO) * ROUND_TO;
}

export function formatMl(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000;
    return `${liters.toFixed(liters % 1 === 0 ? 0 : 1).replace(".", ",")} L`;
  }
  return `${Math.round(ml)} ml`;
}
