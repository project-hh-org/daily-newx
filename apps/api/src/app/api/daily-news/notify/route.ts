import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyBearer } from "@/lib/auth";
import { getIssue, tryClaimNotification } from "@/services/newsRepository";
import { broadcastIssue } from "@/services/broadcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  })
  .strict();

// POST /api/daily-news/notify — 파이프라인의 명시적인 마지막 스텝.
// daily-news·tool-updates 게시가 모두 끝난 뒤, 딱 한 번만 호출한다(writer 지침).
// body는 issue_date만 받고, 실제 발송 내용은 DB에서 published 상태로 다시 읽어와
// 구성한다 — 호출자가 보낸 본문을 그대로 신뢰하지 않는다.
// 같은 issue_date로 여러 번 불려도(실수·재시도 포함) tryClaimNotification의
// 원자적 클레임(UPDATE ... WHERE notified_at IS NULL) 덕분에 실제 발송은 최대 1회.
export async function POST(req: Request): Promise<NextResponse> {
  if (!verifyBearer(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { issue_date } = parsed.data;

  try {
    const payload = await getIssue(issue_date); // published 상태가 아니면 null
    if (!payload) {
      return NextResponse.json(
        { error: `issue_date ${issue_date} 는 published 상태로 존재하지 않습니다` },
        { status: 409 },
      );
    }

    const claimed = await tryClaimNotification(issue_date);
    if (!claimed) {
      return NextResponse.json({ ok: true, issue_date, already_notified: true, pushed: 0 });
    }

    const pushed = await broadcastIssue(payload);
    return NextResponse.json({ ok: true, issue_date, pushed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
