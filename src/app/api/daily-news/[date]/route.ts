import { NextResponse } from "next/server";
import { getIssue } from "@/services/newsRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 링크는 대시 없는 날짜: /api/daily-news/20260616
const COMPACT_RE = /^(\d{4})(\d{2})(\d{2})$/;
// 하위호환: 대시 포함도 허용
const DASHED_RE = /^\d{4}-\d{2}-\d{2}$/;

function toIsoDate(slug: string): string | null {
  const m = slug.match(COMPACT_RE);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  if (DASHED_RE.test(slug)) return slug;
  return null;
}

// GET /api/daily-news/20260616 — 호 단위 조회 (공개 읽기)
export async function GET(
  _req: Request,
  ctx: { params: { date: string } },
): Promise<NextResponse> {
  const isoDate = toIsoDate(ctx.params.date);
  if (isoDate === null) {
    return NextResponse.json({ error: "date must be YYYYMMDD" }, { status: 400 });
  }

  try {
    const issue = await getIssue(isoDate);
    if (!issue) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(issue, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
