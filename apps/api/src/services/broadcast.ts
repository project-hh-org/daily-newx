import { listPushTokens, deletePushTokens } from "@/services/pushRepository";
import { sendExpoPush } from "@/services/expoPush";
import type { IngestPayload } from "@/types/news.types";

// 발행된 호를 전체 등록 기기에 브로드캐스트 — best-effort(실패해도 호출부를 막지 않음).
// 2026-07-18: daily-news 인제스트 POST에서 분리됨 — 이제 /api/daily-news/notify가
// 파이프라인의 명시적인 마지막 스텝으로 이걸 호출한다(인제스트 자체는 절대 푸시 안 함).
export async function broadcastIssue(payload: IngestPayload): Promise<number> {
  const tokens = await listPushTokens();
  if (tokens.length === 0) return 0;
  const { issue, items } = payload;
  const headline = items.find((i) => i.category === "headline")?.title ?? items[0]?.title;
  const intro = issue.intro?.trim();
  const body = intro && intro.length > 0 ? intro : (headline ?? `새 소식 ${items.length}건`);
  const { sent, invalidTokens } = await sendExpoPush(tokens, {
    title: "브리핑 LLM",
    body,
    data: { date: issue.issue_date.replace(/-/g, "") },
  });
  if (invalidTokens.length > 0) await deletePushTokens(invalidTokens);
  return sent;
}
