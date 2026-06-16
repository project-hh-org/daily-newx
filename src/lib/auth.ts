import { getServerEnv } from "@/services/config";

// Bearer 토큰 검증 (lib→services 단방향 import: 허용)
export function verifyBearer(req: Request): boolean {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];
  if (token === undefined) return false;
  const expected = getServerEnv().INGEST_TOKEN;
  // 길이 다르면 즉시 false (타이밍 노출 최소화)
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
