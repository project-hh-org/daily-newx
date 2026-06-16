import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/services/config";

// service_role 클라이언트 — RLS 우회. 서버(API)에서만 import 할 것.
let client: SupabaseClient | undefined;

export function getServiceClient(): SupabaseClient {
  if (client) return client;
  const env = getServerEnv();
  client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
