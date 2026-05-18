import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { UserProfile } from "@/types";

const REMINDER_CHANNEL_ID = "water-reminders";

const REMINDER_MESSAGES: { title: string; body: string }[] = [
  { title: "Hora de hidratar!", body: "Que tal um copo de água agora?" },
  { title: "Lembrete amigável", body: "Seu corpo agradece um gole de água." },
  { title: "Não esqueça da água", body: "Mantenha o ritmo para bater sua meta de hoje." },
  { title: "Pausa para a água", body: "Respira fundo e bebe um copinho." },
  { title: "Hidrate-se", body: "Pequenos goles ao longo do dia fazem diferença." },
  { title: "Está na hora", body: "Mais um copo e você se aproxima da meta." },
  { title: "Tudo certo?", body: "Aproveite para beber água agora." },
];

function pickMessage(index: number) {
  return REMINDER_MESSAGES[index % REMINDER_MESSAGES.length];
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Lembretes de hidratação",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1E90D6",
    sound: "default",
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  await ensureAndroidChannel();
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

function parseHHMM(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map((p) => parseInt(p, 10));
  const hour = Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 8;
  const minute = Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0;
  return { hour, minute };
}

export function computeReminderTimes(profile: UserProfile): { hour: number; minute: number }[] {
  const wake = parseHHMM(profile.wakeTime);
  const sleep = parseHHMM(profile.sleepTime);
  const wakeMinutes = wake.hour * 60 + wake.minute;
  let sleepMinutes = sleep.hour * 60 + sleep.minute;
  if (sleepMinutes <= wakeMinutes) {
    sleepMinutes += 24 * 60;
  }
  const windowMinutes = sleepMinutes - wakeMinutes;
  const cup = Math.max(100, profile.reminderCupMl || 250);
  const count = Math.max(3, Math.min(12, Math.ceil(profile.dailyGoalMl / cup)));
  const slots: { hour: number; minute: number }[] = [];
  const step = windowMinutes / (count + 1);
  for (let i = 1; i <= count; i++) {
    const minutes = Math.round(wakeMinutes + step * i) % (24 * 60);
    slots.push({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
  }
  return slots;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleReminders(profile: UserProfile): Promise<number> {
  await ensureAndroidChannel();
  await cancelAllReminders();
  if (!profile.notificationsEnabled) return 0;

  const granted = await requestNotificationPermissions();
  if (!granted) return 0;

  const slots = computeReminderTimes(profile);
  for (let i = 0; i < slots.length; i++) {
    const { hour, minute } = slots[i];
    const msg = pickMessage(i);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: "default",
        data: { type: "water-reminder", slot: i },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  }
  return slots.length;
}

export async function getScheduledCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}
