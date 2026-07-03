// Expo Push API 전송(https://docs.expo.dev/push-notifications/sending-notifications/).
// 서버 전용. 100개 단위 청크로 전송하고, DeviceNotRegistered 토큰을 프루닝 대상으로 반환.

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type PushContent = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

type ExpoTicket = {
  status: "ok" | "error";
  message?: string;
  details?: { error?: string };
};

function isExpoToken(t: string): boolean {
  return t.startsWith("ExponentPushToken") || t.startsWith("ExpoPushToken");
}

export async function sendExpoPush(
  tokens: readonly string[],
  content: PushContent,
): Promise<{ sent: number; invalidTokens: string[] }> {
  const valid = tokens.filter(isExpoToken);
  const invalidTokens: string[] = [];
  let sent = 0;

  for (let i = 0; i < valid.length; i += 100) {
    const chunk = valid.slice(i, i + 100);
    const messages = chunk.map((to) => ({
      to,
      title: content.title,
      body: content.body,
      data: content.data ?? {},
      sound: "default" as const,
    }));

    let tickets: ExpoTicket[] = [];
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(messages),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { data?: ExpoTicket[] };
      tickets = json.data ?? [];
    } catch {
      continue;
    }

    tickets.forEach((tk, idx) => {
      if (tk.status === "ok") {
        sent += 1;
      } else if (tk.details?.error === "DeviceNotRegistered") {
        const bad = chunk[idx];
        if (bad !== undefined) invalidTokens.push(bad);
      }
    });
  }

  return { sent, invalidTokens };
}
