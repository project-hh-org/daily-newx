import { getServiceClient } from "@/services/supabase";

/** 기기 Expo 푸시 토큰 upsert(멱등, token 기준). */
export async function savePushToken(token: string, platform: string | null): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("push_tokens")
    .upsert({ token, platform, updated_at: new Date().toISOString() }, { onConflict: "token" });
  if (error) throw new Error("push_tokens upsert 실패: " + error.message);
}

/** 등록된 모든 토큰. */
export async function listPushTokens(): Promise<string[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("push_tokens").select("token");
  if (error) throw new Error("push_tokens 조회 실패: " + error.message);
  return (data ?? []).map((r) => (r as { token: string }).token);
}

/** 무효(DeviceNotRegistered) 토큰 정리. */
export async function deletePushTokens(tokens: readonly string[]): Promise<void> {
  if (tokens.length === 0) return;
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("push_tokens")
    .delete()
    .in("token", tokens as string[]);
  if (error) throw new Error("push_tokens 삭제 실패: " + error.message);
}
