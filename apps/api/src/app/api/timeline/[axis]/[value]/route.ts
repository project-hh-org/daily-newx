import { getTimeline, isTimelineAxis } from "@/services/newsRepository";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

// GET /api/timeline/{axis}/{value}
//   axis: category | tag | entity, value: 해당 축의 값(카테고리 키 / 태그 / 주체)
//   같은 축의 항목을 일자 내림차순으로 모아 반환.
export async function GET(
  _req: Request,
  ctx: { params: { axis: string; value: string } },
): Promise<Response> {
  const { axis, value } = ctx.params;
  if (!isTimelineAxis(axis)) {
    return corsJson({ error: "axis must be category | tag | entity" }, 400);
  }
  // Next 가 라우트 파라미터를 이미 디코딩해 전달한다.
  if (value.trim().length === 0) {
    return corsJson({ error: "value required" }, 400);
  }

  try {
    const items = await getTimeline(axis, value);
    return corsJson({ axis, value, items }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return corsJson({ error: message }, 500);
  }
}
