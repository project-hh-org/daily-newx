import { getFacets, isFacetKind } from "@/services/newsRepository";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

// GET /api/facets/{kind} — kind: tag | entity. distinct 값 + 개수(내림차순).
export async function GET(
  _req: Request,
  ctx: { params: { kind: string } },
): Promise<Response> {
  const { kind } = ctx.params;
  if (!isFacetKind(kind)) {
    return corsJson({ error: "kind must be tag | entity" }, 400);
  }
  try {
    const facets = await getFacets(kind);
    return corsJson({ kind, facets }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return corsJson({ error: message }, 500);
  }
}
