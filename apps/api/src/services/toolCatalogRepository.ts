import { getServiceClient } from "@/services/supabase";
import type { ToolCatalogEntry, ToolCatalogFullNameUpdate } from "@/types/news.types";

type CatalogRow = {
  key: string;
  name: string;
  vendor: string;
  category: string;
  blurb: string;
  links: unknown;
  tool_catalog_versions: { full_name: string; last_seen: string }[] | null;
};

// 공개 읽기: "내 도구" 설정/피드 화면이 이 결과로 도구 목록을 렌더링한다(status=active만).
// full_names는 tool_catalog_versions을 PostgREST embed로 함께 가져와 last_seen
// 내림차순으로 정렬한 문자열 배열로 변환한다(2026-08-12, 한 브랜드가 여러 버전을
// 동시에 낼 수 있어 단일 필드 대신 이력 테이블+배열로 관리).
export async function getActiveToolCatalog(): Promise<unknown[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tool_catalog")
    .select("key, name, vendor, category, blurb, links, tool_catalog_versions(full_name, last_seen)")
    .eq("status", "active")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error("tool_catalog 조회 실패: " + error.message);

  return ((data ?? []) as unknown as CatalogRow[]).map((row) => {
    const full_names = (row.tool_catalog_versions ?? [])
      .slice()
      .sort((a, b) => b.last_seen.localeCompare(a.last_seen))
      .map((v) => v.full_name);
    return {
      key: row.key,
      name: row.name,
      full_names,
      vendor: row.vendor,
      category: row.category,
      blurb: row.blurb,
      links: row.links,
    };
  });
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

// 루틴 전용 버전 이력 upsert — tool_catalog_versions에 (tool_key, full_name) 단위로 기록한다.
// - 이미 있는 조합이면 last_seen만 오늘로 갱신(first_seen은 보존).
// - 처음 보는 조합이면 first_seen=last_seen=오늘로 새 행 삽입.
// - tool_key가 tool_catalog에 없으면(FK 위반) 조용히 건너뛴다 — 신규 등록은 반드시
//   insertPendingToolCatalog(POST)를 거쳐야 하고, 이 함수는 순수 버전 갱신 전용이다.
// name/vendor/blurb/links 등 tool_catalog 본 행은 절대 건드리지 않는다.
export async function upsertToolVersions(
  updates: readonly ToolCatalogFullNameUpdate[],
): Promise<{ updated: string[]; skipped: string[] }> {
  const updated: string[] = [];
  const skipped: string[] = [];
  if (updates.length === 0) return { updated, skipped };

  const supabase = getServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  for (const u of updates) {
    const { error: insertError } = await supabase.from("tool_catalog_versions").insert({
      tool_key: u.key,
      full_name: u.full_name,
      first_seen: today,
      last_seen: today,
    });

    if (!insertError) {
      updated.push(`${u.key}: ${u.full_name}`);
      continue;
    }

    // 23505 = unique_violation(이미 있는 (tool_key, full_name)) → last_seen만 갱신.
    if (insertError.code === "23505") {
      const { error: updateError } = await supabase
        .from("tool_catalog_versions")
        .update({ last_seen: today })
        .eq("tool_key", u.key)
        .eq("full_name", u.full_name);
      if (updateError) {
        throw new Error(`tool_catalog_versions last_seen 갱신 실패(${u.key}): ` + updateError.message);
      }
      updated.push(`${u.key}: ${u.full_name}`);
      continue;
    }

    // 23503 = foreign_key_violation(tool_catalog에 없는 key) → 조용히 건너뜀.
    if (insertError.code === "23503") {
      skipped.push(u.key);
      continue;
    }

    throw new Error(`tool_catalog_versions 삽입 실패(${u.key}): ` + insertError.message);
  }

  return { updated, skipped };
}
