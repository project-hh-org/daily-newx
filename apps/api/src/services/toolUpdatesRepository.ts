import { getServiceClient } from "@/services/supabase";
import type { ToolUpdateIngest } from "@/types/news.types";

/** 도구 업데이트 멱등 업서트((tool_key, url) 기준). */
export async function upsertToolUpdates(updates: readonly ToolUpdateIngest[]): Promise<number> {
  if (updates.length === 0) return 0;
  const supabase = getServiceClient();
  const rows = updates.map((u) => ({
    tool_key: u.tool_key,
    update_date: u.update_date,
    kind: u.kind,
    title: u.title,
    summary: u.summary,
    url: u.url,
  }));
  const { error } = await supabase
    .from("tool_updates")
    .upsert(rows, { onConflict: "tool_key,url" });
  if (error) throw new Error("tool_updates upsert 실패: " + error.message);
  return rows.length;
}

/** 선택 도구들의 최근(sinceDate 이후) 업데이트 — 최신순. */
export async function getToolUpdates(
  toolKeys: readonly string[],
  sinceDate: string,
): Promise<unknown[]> {
  if (toolKeys.length === 0) return [];
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tool_updates")
    .select("id, tool_key, update_date, kind, title, summary, url")
    .in("tool_key", toolKeys as string[])
    .gte("update_date", sinceDate)
    .order("update_date", { ascending: false })
    .limit(200);
  if (error) throw new Error("tool_updates 조회 실패: " + error.message);
  return data ?? [];
}
