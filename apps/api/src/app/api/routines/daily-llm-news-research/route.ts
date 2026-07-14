// daily-llm-news 2단계 파이프라인(Haiku 검색 → Sonnet 작성) 중간 캐시 라우트.
//
// Haiku 리서처 에이전트가 스윕 A~H 원본 검색 결과(제목·URL·스니펫)를 POST로 저장하고,
// Sonnet 작성 에이전트가 GET으로 읽어서 브리핑을 쓰고 게시한다.
// 인증은 기존 INGEST_TOKEN 재사용(Vault의 environment_variable credential과 동일 값).

import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/auth";
import { upsertResearch, getResearch } from "@/services/researchCacheRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/routines/daily-llm-news-research — Haiku 에이전트가 스윕 결과 저장
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

  if (
    typeof body !== "object" ||
    body === null ||
    !("issue_date" in body) ||
    !("research" in body) ||
    typeof (body as Record<string, unknown>).issue_date !== "string" ||
    !DATE_RE.test((body as { issue_date: string }).issue_date)
  ) {
    return NextResponse.json(
      { error: "invalid body: expect { issue_date: 'YYYY-MM-DD', research: <any> }" },
      { status: 422 },
    );
  }

  const { issue_date: issueDate, research } = body as { issue_date: string; research: unknown };

  try {
    await upsertResearch(issueDate, research);
    return NextResponse.json({ ok: true, issue_date: issueDate }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/routines/daily-llm-news-research?date=YYYY-MM-DD — Sonnet 에이전트가 읽기
export async function GET(req: Request): Promise<NextResponse> {
  if (!verifyBearer(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const issueDate = url.searchParams.get("date") ?? "";
  if (!DATE_RE.test(issueDate)) {
    return NextResponse.json({ error: "missing or invalid ?date=YYYY-MM-DD" }, { status: 422 });
  }

  try {
    const row = await getResearch(issueDate);
    if (row === null) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(row, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
