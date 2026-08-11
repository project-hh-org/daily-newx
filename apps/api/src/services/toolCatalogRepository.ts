import { getServiceClient } from "@/services/supabase";
import type { ToolCatalogEntry } from "@/types/news.types";

// 공개 읽기: "내 도구" 설정/피드 화면이 이 결과로 도구 목록을 렌더링한다(status=active만).
export async function getActiveToolCatalog(): Promise<unknown[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tool_catalog")
    .select("key, name, vendor, category, blurb, links")
    .eq("status", "active")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error("tool_catalog 조회 실패: " + error.message);
  return data ?? [];
}

// 루틴 전용 삽입 — 이미 있는 key는 절대 덮어쓰지 않는다(ignoreDuplicates: true = ON CONFLICT DO NOTHING).
// 사람이 curate한 active 항목을, 에이전트가 실수로 얇은 pending 내용으로 갈아치우는 사고를 원천 차단한다.
// 그래서 이 함수로는 "새 key 추가"만 가능하고 "기존 key 수정"은 절대 불가능하다.
export async function insertPendingToolCatalog(
  entries: readonly ToolCatalogEntry[],
): Promise<number> {
  if (entries.length === 0) return 0;
  const supabase = getServiceClient();
  const rows = entries.map((e) => ({
    key: e.key,
    name: e.name,
    vendor: e.vendor,
    category: e.category,
    blurb: e.blurb,
    links: e.links,
    status: "pending_review" as const,
  }));
  const { error, count } = await supabase
    .from("tool_catalog")
    .upsert(rows, { onConflict: "key", ignoreDuplicates: true, count: "exact" });
  if (error) throw new Error("tool_catalog 삽입 실패: " + error.message);
  return count ?? 0;
}
