import { getIssuesList } from "@/services/newsRepository";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

// GET /api/issues — 게시된 호 목록 (일자 내림차순, 공개 읽기)
export async function GET(): Promise<Response> {
  try {
    const issues = await getIssuesList();
    return corsJson({ issues }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return corsJson({ error: message }, 500);
  }
}
