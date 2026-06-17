// 공개 환경변수만 사용(EXPO_PUBLIC_*). 비밀키는 절대 클라이언트에 두지 않는다.
// Expo 는 빌드 시 EXPO_PUBLIC_* 를 process.env 에 인라인한다.
// `process` 전역 타입에 의존하지 않도록 globalThis 로 안전하게 접근한다.
// - EXPO_PUBLIC_API_BASE: 조회 API 베이스. 예: http://localhost:4000
// - EXPO_PUBLIC_USE_FIXTURE: "1" 이면 네트워크 대신 번들 fixture 사용(오프라인 개발/미리보기).

type EnvBag = { env?: Record<string, string | undefined> };

function readEnv(key: string): string | undefined {
  const proc = (globalThis as { process?: EnvBag }).process;
  const v = proc?.env?.[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export const API_BASE: string =
  readEnv("EXPO_PUBLIC_API_BASE") ?? "http://localhost:4000";

export const USE_FIXTURE: boolean = readEnv("EXPO_PUBLIC_USE_FIXTURE") === "1";
