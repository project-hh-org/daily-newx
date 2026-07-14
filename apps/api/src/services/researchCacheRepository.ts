import { getServiceClient } from "@/services/supabase";

// daily-llm-news 2단계 파이프라인(Haiku 검색 → Sonnet 작성) 중간 캐시.
// Haiku 리서처 에이전트가 스윕 A~H 원본 검색 결과를 저장하고,
// Sonnet 작성 에이전트가 이걸 읽어서 브리핑을 쓴다.

export async function upsertResearch(issueDate: string, research: unknown): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("daily_llm_news_research")
    .upsert({ issue_date: issueDate, research }, { onConflict: "issue_date" });
  if (error) throw new Error("daily_llm_news_research upsert 실패: " + error.message);
}

export async function getResearch(issueDate: string): Promise<unknown | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("daily_llm_news_research")
    .select("research, created_at")
    .eq("issue_date", issueDate)
    .maybeSingle();
  if (error) throw new Error("daily_llm_news_research 조회 실패: " + error.message);
  return data ?? null;
}
