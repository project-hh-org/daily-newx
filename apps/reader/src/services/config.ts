// 공개 환경변수만 사용(EXPO_PUBLIC_*). 비밀키는 절대 클라이언트에 두지 않는다.
// 중요: Expo 는 EXPO_PUBLIC_* 를 "정적 프로퍼티 접근"일 때만 번들에 인라인한다.
//   ✅ process.env.EXPO_PUBLIC_API_BASE  (인라인됨 — 네이티브/웹 모두)
//   ❌ process.env[key]                   (동적 접근 → 네이티브에서 undefined)
// 그래서 아래는 반드시 리터럴 키로 직접 읽는다.
const apiBase = process.env.EXPO_PUBLIC_API_BASE;
const useFixture = process.env.EXPO_PUBLIC_USE_FIXTURE;

export const API_BASE: string =
  typeof apiBase === "string" && apiBase.length > 0 ? apiBase : "http://localhost:4000";

export const USE_FIXTURE: boolean = useFixture === "1";
