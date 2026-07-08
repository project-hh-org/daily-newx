import { getServiceClient } from "@/services/supabase";
import type { IngestPayload, IngestResult } from "@/types/news.types";

// 멱등 upsert: 호는 issue_date 기준, 항목은 (issue_date, source_url) 기준.
export async function upsertIssue(payload: IngestPayload): Promise<IngestResult> {
  const supabase = getServiceClient();
  const { issue, items } = payload;

  const { error: issueError } = await supabase
    .from("daily_issues")
    .upsert(
      {
        issue_date: issue.issue_date,
        issue_no: issue.issue_no,
        intro: issue.intro,
        outro: issue.outro,
        status: issue.status,
      },
      { onConflict: "issue_date" },
    );
  if (issueError) throw new Error("daily_issues upsert 실패: " + issueError.message);

  if (items.length === 0) {
    return { issue_date: issue.issue_date, items_upserted: 0 };
  }

  const rows = items.map((it) => ({
    issue_date: issue.issue_date,
    category: it.category,
    position: it.position,
    title: it.title,
    summary: it.summary,
    blocks: it.blocks,
    key_points: it.key_points,
    what_you_get: it.what_you_get,
    action: it.action,
    why_now: it.why_now,
    source_url: it.source_url,
    source_name: it.source_name,
    score: it.score,
    story_slug: it.story_slug,
    tldr: it.tldr,
    tags: it.tags,
    entities: it.entities,
    related: it.related,
    follow_up_of: it.follow_up_of,
    source_published_at: it.source_published_at,
  }));

  const { error: itemsError, count } = await supabase
    .from("daily_items")
    .upsert(rows, { onConflict: "issue_date,source_url", count: "exact" });
  if (itemsError) throw new Error("daily_items upsert 실패: " + itemsError.message);

  return { issue_date: issue.issue_date, items_upserted: count ?? rows.length };
}

// 공개 읽기는 기본 published 만. 로컬 개발에서 draft 까지 보려면 PUBLIC_READ_DRAFTS=1.
// service_role 은 RLS 를 우회하므로, 이 필터로 공개 노출을 직접 통제한다.
function includeDrafts(): boolean {
  return process.env.PUBLIC_READ_DRAFTS === "1";
}

export async function getIssue(issueDate: string): Promise<IngestPayload | null> {
  const supabase = getServiceClient();
  let issueQuery = supabase
    .from("daily_issues")
    .select("issue_date, issue_no, intro, outro, status")
    .eq("issue_date", issueDate);
  if (!includeDrafts()) issueQuery = issueQuery.eq("status", "published");
  const { data: issue, error: issueError } = await issueQuery.maybeSingle();
  if (issueError) throw new Error("daily_issues 조회 실패: " + issueError.message);
  if (!issue) return null;

  const { data: items, error: itemsError } = await supabase
    .from("daily_items")
    .select(
      "id, category, position, title, summary, blocks, key_points, what_you_get, action, why_now, source_url, source_name, score, story_slug, tldr, tags, entities, related, follow_up_of, source_published_at",
    )
    .eq("issue_date", issueDate)
    .order("category", { ascending: true })
    .order("position", { ascending: true });
  if (itemsError) throw new Error("daily_items 조회 실패: " + itemsError.message);

  return { issue, items: items ?? [] } as IngestPayload;
}

// 아티클/타임라인 공통 컬럼 — id 와 issue_date 포함(개별 행이 자기 날짜를 안다).
const ARTICLE_COLS =
  "id, issue_date, category, position, title, summary, blocks, key_points, what_you_get, action, why_now, source_url, source_name, score, story_slug, tldr, tags, entities, related, follow_up_of, source_published_at";

// 단건 조회: GET /api/article/{id}
export async function getArticleById(id: string): Promise<unknown | null> {
  const supabase = getServiceClient();
  const drafts = includeDrafts();
  const sel = drafts ? ARTICLE_COLS : `${ARTICLE_COLS}, daily_issues!inner(status)`;
  let query = supabase.from("daily_items").select(sel).eq("id", id);
  if (!drafts) query = query.eq("daily_issues.status", "published");
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error("daily_items 단건 조회 실패: " + error.message);
  return data ?? null;
}

export type TimelineAxis = "category" | "tag" | "entity";

export function isTimelineAxis(v: string): v is TimelineAxis {
  return v === "category" || v === "tag" || v === "entity";
}

// 횡단 조회: GET /api/timeline/{axis}/{value} — 같은 축의 값을 일자 내림차순으로.
export async function getTimeline(
  axis: TimelineAxis,
  value: string,
): Promise<unknown[]> {
  const supabase = getServiceClient();
  const drafts = includeDrafts();
  const sel = drafts ? ARTICLE_COLS : `${ARTICLE_COLS}, daily_issues!inner(status)`;
  let query = supabase.from("daily_items").select(sel);

  if (axis === "category") {
    query = query.eq("category", value);
  } else if (axis === "tag") {
    // jsonb 컬럼: PG 배열 리터럴이 아니라 JSON 배열 문자열로 containment(@>) 질의.
    query = query.contains("tags", JSON.stringify([value]));
  } else {
    query = query.contains("entities", JSON.stringify([value]));
  }
  if (!drafts) query = query.eq("daily_issues.status", "published");

  const { data, error } = await query
    .order("issue_date", { ascending: false })
    .order("position", { ascending: true });
  if (error) throw new Error("daily_items 타임라인 조회 실패: " + error.message);
  return data ?? [];
}

// 호 목록: GET /api/issues — 게시된 호를 일자 내림차순으로.
export async function getIssuesList(): Promise<unknown[]> {
  const supabase = getServiceClient();
  let query = supabase.from("daily_issues").select("issue_date, issue_no, intro");
  if (!includeDrafts()) query = query.eq("status", "published");
  const { data, error } = await query.order("issue_date", { ascending: false });
  if (error) throw new Error("daily_issues 목록 조회 실패: " + error.message);
  return data ?? [];
}

// 사이트맵용: 게시된 아티클 id/일자 (최신순).
export async function listRecentArticles(
  limit = 500,
): Promise<Array<{ id: string; issue_date: string }>> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("daily_items")
    .select("id, issue_date, daily_issues!inner(status)")
    .eq("daily_issues.status", "published")
    .order("issue_date", { ascending: false })
    .limit(limit);
  if (error) throw new Error("아티클 목록 조회 실패: " + error.message);
  return (data ?? []) as unknown as Array<{ id: string; issue_date: string }>;
}

// ── 어드민(인증 필요) ─────────────────────────────────────────
// 어드민은 status 무관하게 전체를 본다(draft 포함).
const ADMIN_ITEM_COLS =
  "id, category, position, title, summary, blocks, key_points, what_you_get, action, why_now, source_url, source_name, score, story_slug, tldr, tags, entities, related, follow_up_of, source_published_at";

export async function getIssueAdmin(issueDate: string): Promise<unknown | null> {
  const supabase = getServiceClient();
  const { data: issue, error: issueError } = await supabase
    .from("daily_issues")
    .select("issue_date, issue_no, intro, outro, status")
    .eq("issue_date", issueDate)
    .maybeSingle();
  if (issueError) throw new Error("daily_issues(admin) 조회 실패: " + issueError.message);
  if (!issue) return null;
  const { data: items, error: itemsError } = await supabase
    .from("daily_items")
    .select(ADMIN_ITEM_COLS)
    .eq("issue_date", issueDate)
    .order("category", { ascending: true })
    .order("position", { ascending: true });
  if (itemsError) throw new Error("daily_items(admin) 조회 실패: " + itemsError.message);
  return { issue, items: items ?? [] };
}

export async function updateItem(id: string, patch: Record<string, unknown>): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("daily_items").update(patch).eq("id", id);
  if (error) throw new Error("daily_items 수정 실패: " + error.message);
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("daily_items").delete().eq("id", id);
  if (error) throw new Error("daily_items 삭제 실패: " + error.message);
}

export async function reorderItems(orders: ReadonlyArray<{ id: string; position: number }>): Promise<void> {
  const supabase = getServiceClient();
  for (const o of orders) {
    const { error } = await supabase
      .from("daily_items")
      .update({ position: o.position })
      .eq("id", o.id);
    if (error) throw new Error("재정렬 실패: " + error.message);
  }
}

export async function updateIssueMeta(
  issueDate: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("daily_issues")
    .update(patch)
    .eq("issue_date", issueDate);
  if (error) throw new Error("daily_issues 수정 실패: " + error.message);
}

// 스토리 스레드: GET /api/story/{slug} — story_slug 또는 follow_up_of 가 slug 인 항목(일자 오름차순).
export async function getStoryThread(slug: string): Promise<unknown[]> {
  const supabase = getServiceClient();
  const drafts = includeDrafts();
  const sel = drafts ? ARTICLE_COLS : `${ARTICLE_COLS}, daily_issues!inner(status)`;
  let query = supabase
    .from("daily_items")
    .select(sel)
    .or(`story_slug.eq.${slug},follow_up_of.eq.${slug}`);
  if (!drafts) query = query.eq("daily_issues.status", "published");
  const { data, error } = await query
    .order("issue_date", { ascending: true })
    .order("position", { ascending: true });
  if (error) throw new Error("스토리 스레드 조회 실패: " + error.message);
  return data ?? [];
}

export type FacetKind = "tag" | "entity";

export function isFacetKind(v: string): v is FacetKind {
  return v === "tag" || v === "entity";
}

export type Facet = { value: string; count: number };

// distinct tags/entities + 개수: GET /api/facets/{kind}
// jsonb 배열을 Node 에서 집계(소규모 데이터셋이라 충분).
export async function getFacets(kind: FacetKind): Promise<Facet[]> {
  const supabase = getServiceClient();
  const drafts = includeDrafts();
  const col = kind === "tag" ? "tags" : "entities";
  const sel = drafts ? col : `${col}, daily_issues!inner(status)`;
  let query = supabase.from("daily_items").select(sel);
  if (!drafts) query = query.eq("daily_issues.status", "published");

  const { data, error } = await query;
  if (error) throw new Error("facets 조회 실패: " + error.message);

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as unknown as Array<Record<string, unknown>>) {
    const arr = row[col];
    if (Array.isArray(arr)) {
      for (const v of arr) {
        if (typeof v === "string" && v.trim().length > 0) {
          counts.set(v, (counts.get(v) ?? 0) + 1);
        }
      }
    }
  }
  return Array.from(counts, ([value, count]) => ({ value, count })).sort(
    (a, b) => b.count - a.count || a.value.localeCompare(b.value),
  );
}
