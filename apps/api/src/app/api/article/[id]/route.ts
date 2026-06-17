import { getArticleById } from "@/services/newsRepository";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/article/{uuid} — 아티클 단건 조회 (공개 읽기)
export async function GET(
  _req: Request,
  ctx: { params: { id: string } },
): Promise<Response> {
  const id = ctx.params.id;
  if (!UUID_RE.test(id)) {
    return corsJson({ error: "id must be a uuid" }, 400);
  }

  try {
    const article = await getArticleById(id);
    if (!article) {
      return corsJson({ error: "not found" }, 404);
    }
    return corsJson(article, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return corsJson({ error: message }, 500);
  }
}
