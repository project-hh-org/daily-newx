import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { ensurePermission } from "@/services/notifications";
import { API_BASE, EAS_PROJECT_ID } from "@/services/config";

let registered = false;

/**
 * 기기 Expo 푸시 토큰을 발급받아 서버에 등록.
 * 발행 시점 서버 브로드캐스트의 대상이 된다. 웹/권한거부/실패 시 조용히 통과(best-effort).
 */
export async function registerPushToken(): Promise<void> {
  if (Platform.OS === "web") return;
  if (registered) return;

  const ok = await ensurePermission();
  if (!ok) return;

  let token: string;
  try {
    const res = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    token = res.data;
  } catch {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/push/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
    if (res.ok) registered = true;
  } catch {
    // best-effort — 다음 실행 때 재시도.
  }
}
