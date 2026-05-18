import { format, isToday, parseISO, subDays } from "date-fns";

import { getLog } from "@/lib/storage";
import type { DailyLog } from "@/types";

export async function computeStreak(goalMl: number, maxLookback = 365): Promise<number> {
  if (goalMl <= 0) return 0;
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < maxLookback; i++) {
    const date = format(cursor, "yyyy-MM-dd");
    const log = await getLog(date);
    const hit = log.totalMl >= goalMl;
    if (hit) {
      streak += 1;
    } else if (isToday(cursor)) {
      // today not yet completed — don't break the streak for past days
    } else {
      break;
    }
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function summarizeLogs(logs: DailyLog[], goalMl: number) {
  if (logs.length === 0) {
    return { averageMl: 0, bestMl: 0, bestDate: null as string | null, hitDays: 0 };
  }
  let totalMl = 0;
  let bestMl = 0;
  let bestDate: string | null = null;
  let hitDays = 0;
  for (const log of logs) {
    totalMl += log.totalMl;
    if (log.totalMl > bestMl) {
      bestMl = log.totalMl;
      bestDate = log.date;
    }
    if (goalMl > 0 && log.totalMl >= goalMl) hitDays += 1;
  }
  return {
    averageMl: Math.round(totalMl / logs.length),
    bestMl,
    bestDate,
    hitDays,
  };
}

export function formatDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days[date.getDay()];
}
