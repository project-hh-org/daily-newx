import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/auth";
import { corsJson, corsPreflight } from "@/lib/cors";
import { toolCatalogIngestSchema } from "@/types/news.types";
import { getActiveToolCatalog, insertPendingToolCatalog } from "@/services/toolCatalogRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

// GET /api/tool-catalog — 공개 읽기(활성 카탈로그만). "내 도구" 설정/피드 화면이 이걸로
// 도구 목록을 렌더링한다(이전엔 apps/reader의 하드코딩 배열이었음).
export async function GET(): Promise<Response> {
  try {
    const catalog = await getActiveToolCatalog();
    return corsJson({ catalog });
  } catch (err) {
    return corsJson({ error: err instanceof Error ? err.message : "unknown error" }, 500);
  }
}

// POST /api/tool-catalog — Bearer. 루틴(리서처/작성 에이전트)이 대상 key 목록에 없는
// 새 도구·모델을 발견했을 때, 코드 배포 없이 최소 정보(key/name/vendor/category)만으로
// 스스로 후보 등록한다. 항상 status=pending_review로만 들어가고, 기존 key는 이 경로로
// 절대 수정되지 않는다(insertPendingToolCatalog 참조) — 사람이 검수해 active로 승격하고
// blurb/links를 채우기 전까지는 "내 도구" 화면에 노출되지 않는다.
export async function POST(req: Request): Promise<Response> {
  if (!verifyBearer(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = toolCatalogIngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  try {
    const inserted = await insertPendingToolCatalog(parsed.data.entries);
    return NextResponse.json({ ok: true, inserted });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
