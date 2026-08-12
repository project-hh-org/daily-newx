import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/auth";
import { corsJson, corsPreflight } from "@/lib/cors";
import { toolCatalogIngestSchema, toolCatalogFullNameUpdatesIngestSchema } from "@/types/news.types";
import {
  getActiveToolCatalog,
  insertPendingToolCatalog,
  upsertToolVersions,
} from "@/services/toolCatalogRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

// GET /api/tool-catalog — 공개 읽기(활성 카탈로그만). "내 도구" 설정/피드 화면이 이걸로
// 도구 목록을 렌더링한다(이전엔 apps/reader의 하드코딩 배열이었음). full_names는
// tool_catalog_versions을 last_seen 내림차순으로 모은 배열(2026-08-12).
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

// PATCH /api/tool-catalog — Bearer. tool_catalog_versions에 { key, full_name } 조합을
// upsert한다(2026-08-12). 이미 있는 조합이면 last_seen만 갱신, 처음이면 새 버전 이력
// 행 추가 — 그래서 한 key(브랜드)가 여러 버전을 동시에 가질 수 있다(예: Claude Opus 5,
// Claude Sonnet 5 모두 유지). tool_catalog 본 행(name/vendor/blurb/links/status)은
// 절대 건드리지 않고, 카탈로그에 없는 key는 조용히 건너뛴다.
export async function PATCH(req: Request): Promise<Response> {
  if (!verifyBearer(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = toolCatalogFullNameUpdatesIngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  try {
    const result = await upsertToolVersions(parsed.data.updates);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
