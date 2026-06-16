import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/auth";
import { upsertIssue } from "@/services/newsRepository";
import { ingestPayloadSchema } from "@/types/news.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/daily-news — 루틴/어드민이 하루치 호를 인제스트
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

  const parsed = ingestPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
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
