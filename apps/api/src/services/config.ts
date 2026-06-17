import { z } from "zod";

// 서버 전용 환경변수 — 런타임 검증 (services 레이어에 둠: lib→services 단방향 준수)
const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  INGEST_TOKEN: z.string().min(16, "INGEST_TOKEN 은 16자 이상"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    INGEST_TOKEN: process.env.INGEST_TOKEN,
  });
  if (!parsed.success) {
    throw new Error(
      "환경변수 설정 오류: " + parsed.error.issues.map((i) => i.path.join(".")).join(", "),
    );
  }
  cached = parsed.data;
  return cached;
}
