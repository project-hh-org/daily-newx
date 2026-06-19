import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { getReadSet } from "@/services/readState";

// 10시 퍼블리시 후 11시에 리마인드.
const REMIND_HOUR = 11;
const HORIZON_DAYS = 7;

// 포그라운드에서도 배너 표시.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function compactOf(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}${mo}${da}`;
}

/**
 * 향후 7일치 11시 리마인더를 "안 읽은 날"에만 예약. 앱 열 때마다 재계산.
 * (이미 읽었거나 시각이 지난 날은 건너뜀)
 */
export async function refreshReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  const ok = await ensurePermission();
  if (!ok) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const read = await getReadSet();
  const now = new Date();

  for (let i = 0; i < HORIZON_DAYS; i++) {
    const fireAt = new Date(now);
    fireAt.setDate(now.getDate() + i);
    fireAt.setHours(REMIND_HOUR, 0, 0, 0);
    if (fireAt.getTime() <= now.getTime()) continue;

    const compact = compactOf(fireAt);
    if (read.has(compact)) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `daily-${compact}`,
      content: {
        title: "오늘의 LLM 뉴스",
        body: "오늘 호가 올라왔어요 — 읽어보세요.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });
  }
}
