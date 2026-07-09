import { getIssue, getIssuesList } from "@/services/newsRepository";
import { corsJson, corsPreflight } from "@/lib/cors";

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

type WidgetItem = { title: string; source_name: string };
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

/**
 * GET /api/today — 위젯(iOS/Android)용 경량 페이로드.
 * 오늘 브리핑이 없으면 가장 최신 브리핑으로 폴백(is_today=false).
 * 상위 3건의 제목·출처만 담아 응답을 작게 유지한다.
 */
export async function GET(): Promise<Response> {
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
      .map((it) => ({ title: it.title, source_name: it.source_name }));

    const body: WidgetPayload = {
      issue_date: issueDate,
      issue_no: payload.issue.issue_no ?? null,
      intro: payload.issue.intro ?? null,
      is_today: issueDate === today,
      items,
    };
    return corsJson(body, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return corsJson({ error: message }, 500);
  }
}
