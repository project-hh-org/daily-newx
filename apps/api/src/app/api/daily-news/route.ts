import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/auth";
import { upsertIssue } from "@/services/newsRepository";
import { ingestPayloadSchema } from "@/types/news.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/daily-news — 루틴/어드민이 하루치 호를 인제스트. 순수 인제스트만 하고
// 절대 푸시하지 않는다(2026-07-18부터 — 알림 발송은 /api/daily-news/notify로 분리됨).
// ?dry_run=1 이면 스키마 검증만 하고 DB 반영 없이 결과만 보고한다.
// (2026-07-18 사고: 에이전트가 500 에러를 진단하려고 실제 엔드포인트에
//  대고 반복 재시도하다가 매번 실사용자에게 푸시가 나갔음 — dry_run + 알림 분리로 예방)
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
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
