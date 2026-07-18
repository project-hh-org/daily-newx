import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/auth";
import { upsertIssue, tryClaimNotification } from "@/services/newsRepository";
import { listPushTokens, deletePushTokens } from "@/services/pushRepository";
import { sendExpoPush } from "@/services/expoPush";
import { ingestPayloadSchema, type IngestPayload } from "@/types/news.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 발행 시점 푸시 — best-effort(실패해도 인제스트는 성공 처리). 전송 건수 반환.
async function broadcastIssue(payload: IngestPayload): Promise<number> {
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

// POST /api/daily-news — 루틴/어드민이 하루치 호를 인제스트
// ?dry_run=1 이면 스키마 검증만 하고 DB 반영·푸시 없이 결과만 보고한다.
// (2026-07-18 사고: 에이전트가 500 에러를 진단하려고 실제 엔드포인트에
//  대고 반복 재시도하다가 매번 실사용자에게 푸시가 나갔음 — dry_run으로 예방)
export async function POST(req: Request): Promise<NextResponse> {
  if (!verifyBearer(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(req.url).searchParams.get("dry_run") === "1";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = ingestPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  if (dryRun) {
    return NextResponse.json(
      {
        ok: true,
        dry_run: true,
        issue_date: parsed.data.issue.issue_date,
        status: parsed.data.issue.status,
        items_count: parsed.data.items.length,
      },
      { status: 200 },
    );
  }

  try {
    const result = await upsertIssue(parsed.data);
    let pushed = 0;
    if (parsed.data.issue.status === "published") {
      try {
        // 같은 issue_date에 대해 이미 알림을 보냈으면(재시도·디버깅용 재게시 포함)
        // 다시 보내지 않는다 — 원자적 클레임(tryClaimNotification)만 통과해야 발송.
        const claimed = await tryClaimNotification(parsed.data.issue.issue_date);
        if (claimed) {
          pushed = await broadcastIssue(parsed.data);
        }
      } catch {
        // 푸시 실패가 인제스트를 막지 않는다.
      }
    }
    return NextResponse.json({ ok: true, ...result, pushed }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
