import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDays, format, parseISO, startOfWeek, subDays } from "date-fns";

import type { DailyLog, DrinkEntry, UserProfile } from "@/types";

const PROFILE_KEY = "profile";
const LOG_PREFIX = "log:";

export function todayKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function setProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}

function logKey(date: string): string {
  return `${LOG_PREFIX}${date}`;
}

export async function getLog(date: string = todayKey()): Promise<DailyLog> {
  try {
    const raw = await AsyncStorage.getItem(logKey(date));
    if (!raw) return { date, totalMl: 0, entries: [] };
    return JSON.parse(raw) as DailyLog;
  } catch {
    return { date, totalMl: 0, entries: [] };
  }
}

export async function saveLog(log: DailyLog): Promise<void> {
  await AsyncStorage.setItem(logKey(log.date), JSON.stringify(log));
}

export async function addEntry(amountMl: number, when: Date = new Date()): Promise<DailyLog> {
  const date = todayKey(when);
  const log = await getLog(date);
  const entry: DrinkEntry = {
    time: when.toISOString(),
    amountMl,
  };
  const updated: DailyLog = {
    date,
    totalMl: Math.max(0, log.totalMl + amountMl),
    entries: [...log.entries, entry],
  };
  await saveLog(updated);
  return updated;
}

export async function removeLastEntry(date: string = todayKey()): Promise<DailyLog> {
  const log = await getLog(date);
  if (log.entries.length === 0) return log;
  const last = log.entries[log.entries.length - 1];
  const updated: DailyLog = {
    date,
    entries: log.entries.slice(0, -1),
    totalMl: Math.max(0, log.totalMl - last.amountMl),
  };
  await saveLog(updated);
  return updated;
}

export async function resetToday(): Promise<DailyLog> {
  const date = todayKey();
  const empty: DailyLog = { date, totalMl: 0, entries: [] };
  await saveLog(empty);
  return empty;
}

export async function getLastNLogs(n: number): Promise<DailyLog[]> {
  const today = new Date();
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(todayKey(subDays(today, i)));
  }
  const results = await Promise.all(dates.map((d) => getLog(d)));
  return results;
}

/** Domingo a sábado da semana que contém `anchor` (padrão: hoje). */
export async function getCurrentWeekLogs(anchor: Date = new Date()): Promise<DailyLog[]> {
  const sunday = startOfWeek(anchor, { weekStartsOn: 0 });
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(todayKey(addDays(sunday, i)));
  }
  return Promise.all(dates.map((d) => getLog(d)));
}

export async function getAllLogs(): Promise<DailyLog[]> {
  const keys = await AsyncStorage.getAllKeys();
  const logKeys = keys.filter((k) => k.startsWith(LOG_PREFIX));
  if (logKeys.length === 0) return [];
  const entries = await AsyncStorage.multiGet(logKeys);
  const logs: DailyLog[] = [];
  for (const [, value] of entries) {
    if (!value) continue;
    try {
      logs.push(JSON.parse(value) as DailyLog);
    } catch {
      // skip malformed
    }
  }
  return logs.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
}

export async function clearAllData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k === PROFILE_KEY || k.startsWith(LOG_PREFIX));
  if (ours.length > 0) {
    await AsyncStorage.multiRemove(ours);
  }
}
