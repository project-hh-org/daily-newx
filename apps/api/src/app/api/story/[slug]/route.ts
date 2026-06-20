import { getStoryThread } from "@/services/newsRepository";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

const SLUG_RE = /^[a-z0-9-]+$/i;

// GET /api/story/{slug} — 같은 이야기(스토리 슬러그) 흐름을 일자 오름차순으로.
export async function GET(
  _req: Request,
  ctx: { params: { slug: string } },
): Promise<Response> {
  const slug = ctx.params.slug;
  if (!SLUG_RE.test(slug)) {
    return corsJson({ error: "slug must be kebab-case" }, 400);
  }
  try {
    const items = await getStoryThread(slug);
    return corsJson({ slug, items }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return corsJson({ error: message }, 500);
  }
}
