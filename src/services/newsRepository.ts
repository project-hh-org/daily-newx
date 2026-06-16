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

export async function getIssue(issueDate: string): Promise<IngestPayload | null> {
  const supabase = getServiceClient();
  const { data: issue, error: issueError } = await supabase
    .from("daily_issues")
    .select("issue_date, issue_no, intro, outro, status")
    .eq("issue_date", issueDate)
    .maybeSingle();
  if (issueError) throw new Error("daily_issues 조회 실패: " + issueError.message);
  if (!issue) return null;

  const { data: items, error: itemsError } = await supabase
    .from("daily_items")
    .select(
      "category, position, title, summary, key_points, what_you_get, action, why_now, source_url, source_name, score, story_slug, tldr, tags, entities, related, follow_up_of, source_published_at",
    )
    .eq("issue_date", issueDate)
    .order("category", { ascending: true })
    .order("position", { ascending: true });
  if (itemsError) throw new Error("daily_items 조회 실패: " + itemsError.message);

  return { issue, items: items ?? [] } as IngestPayload;
}
