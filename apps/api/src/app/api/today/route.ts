import { createHash } from "node:crypto";
import { getIssue, getIssuesList } from "@/services/newsRepository";
import { corsJson, corsPreflight, CORS_HEADERS } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 기준 오늘 YYYY-MM-DD. */
function kstToday(): string {
  return new Date(Date.now() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

type WidgetItem = { id: string | null; title: string; source_name: string };
type WidgetPayload = {
  issue_date: string;
  issue_no: number | null;
  intro: string | null;
  is_today: boolean;
  items: WidgetItem[];
};

function pickLatestDate(list: readonly unknown[]): string | null {
  const dates = list
    .map((row) => (row as { issue_date?: unknown }).issue_date)
    .filter((d): d is string => typeof d === "string");
  if (dates.length === 0) return null;
  return [...dates].sort((a, b) => b.localeCompare(a))[0] ?? null;
}

// CDN(Vercel Edge) 캐시 — 위젯이 여러 대·여러 인스턴스에서 주기적으로 호출하므로
// s-maxage 동안은 함수 실행·DB 조회 없이 엣지에서 그대로 응답한다.
// 발행이 하루 한 번(오전 9시)뿐이라 널널하게: 30분 하드캐시 + 1시간 stale-while-revalidate.
// 최악의 경우도 함수는 30분에 한 번만 실행 — 그 이후엔 아래 ETag로 실제 내용이
// 같으면 304 만 내려줘 응답 바디 전송도 생략한다("서버 데이터 다를 때만 갱신").
const SUCCESS_CACHE_CONTROL = "public, s-maxage=1800, stale-while-revalidate=3600";

/** 내용 기반 ETag — issue_date·issue_no·is_today·아이템 id 조합이 같으면 응답도 동일하다고 본다. */
function computeETag(body: WidgetPayload): string {
  const fingerprint = JSON.stringify({
    issue_date: body.issue_date,
    issue_no: body.issue_no,
    is_today: body.is_today,
    ids: body.items.map((it) => it.id),
  });
  return `"${createHash("sha1").update(fingerprint).digest("hex")}"`;
}

/**
 * GET /api/today — 위젯(iOS/Android)용 경량 페이로드.
 * 오늘 브리핑이 없으면 가장 최신 브리핑으로 폴백(is_today=false).
 * 상위 3건의 id·제목·출처만 담아 응답을 작게 유지한다.
 * id 는 위젯에서 아티클 상세로 딥링크할 때 사용(dailynewx://article/{id}).
 * 성공 응답만 CDN 캐시(위 SUCCESS_CACHE_CONTROL) — 404/500 은 캐시하지 않아 장애가 오래 박히지 않게 한다.
 * ETag/If-None-Match 지원: 캐시 만료 후 재검증해도 내용이 그대로면 바디 없이 304 만 응답한다.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const today = kstToday();
    let issueDate = today;
    let payload = await getIssue(today);

    if (payload === null) {
      const latest = pickLatestDate(await getIssuesList());
      if (latest === null) return corsJson({ error: "not found" }, 404);
      issueDate = latest;
      payload = await getIssue(latest);
      if (payload === null) return corsJson({ error: "not found" }, 404);
    }

    const items: WidgetItem[] = payload.items
      .slice()
      .sort((a, b) => a.position - b.position)
      .slice(0, 3)
      .map((it) => ({ id: it.id, title: it.title, source_name: it.source_name }));

    const body: WidgetPayload = {
      issue_date: issueDate,
      issue_no: payload.issue.issue_no ?? null,
      intro: payload.issue.intro ?? null,
      is_today: issueDate === today,
      items,
    };
    const etag = computeETag(body);
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, {
        status: 304,
        headers: { ...CORS_HEADERS, "cache-control": SUCCESS_CACHE_CONTROL, etag },
      });
    }
    return corsJson(body, 200, { "cache-control": SUCCESS_CACHE_CONTROL, etag });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return corsJson({ error: message }, 500);
  }
}
