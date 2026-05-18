import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { rescheduleReminders } from "@/lib/notifications";
import {
  addEntry as storageAddEntry,
  clearAllData,
  getLog,
  getProfile,
  removeLastEntry as storageRemoveLast,
  resetToday as storageResetToday,
  setProfile as storageSetProfile,
  todayKey,
} from "@/lib/storage";
import type { DailyLog, UserProfile } from "@/types";

type AppContextValue = {
  ready: boolean;
  profile: UserProfile | null;
  todayLog: DailyLog;
  saveProfile: (profile: UserProfile, options?: { rescheduleNotifications?: boolean }) => Promise<void>;
  addEntry: (amountMl: number) => Promise<void>;
  removeLastEntry: () => Promise<void>;
  resetToday: () => Promise<void>;
  refreshLog: () => Promise<void>;
  resetAll: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog>({ date: todayKey(), totalMl: 0, entries: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfileState(p);
      const log = await getLog();
      setTodayLog(log);
      setReady(true);
    })();
  }, []);

  const refreshLog = useCallback(async () => {
    const log = await getLog();
    setTodayLog(log);
  }, []);

  const saveProfile = useCallback<AppContextValue["saveProfile"]>(
    async (next, options) => {
      await storageSetProfile(next);
      setProfileState(next);
      if (options?.rescheduleNotifications !== false) {
        try {
          await rescheduleReminders(next);
        } catch (err) {
          console.warn("Falha ao reagendar lembretes", err);
        }
      }
    },
    [],
  );

  const addEntry = useCallback(async (amountMl: number) => {
    const updated = await storageAddEntry(amountMl);
    setTodayLog(updated);
  }, []);

  const removeLastEntry = useCallback(async () => {
    const updated = await storageRemoveLast();
    setTodayLog(updated);
  }, []);

  const resetToday = useCallback(async () => {
    const updated = await storageResetToday();
    setTodayLog(updated);
  }, []);

  const resetAll = useCallback(async () => {
    await clearAllData();
    setProfileState(null);
    setTodayLog({ date: todayKey(), totalMl: 0, entries: [] });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      profile,
      todayLog,
      saveProfile,
      addEntry,
      removeLastEntry,
      resetToday,
      refreshLog,
      resetAll,
    }),
    [ready, profile, todayLog, saveProfile, addEntry, removeLastEntry, resetToday, refreshLog, resetAll],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
