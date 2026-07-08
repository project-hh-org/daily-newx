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

// EAS 프로젝트 ID(공개값, app.json extra.eas.projectId 와 동일) — Expo 푸시 토큰 발급용.
export const EAS_PROJECT_ID = "aaffaa07-2378-4eee-b242-93d98a19d8fc";

// 공개 웹 도메인(공유 링크·SSR 공유 페이지). API 호스트와 다를 수 있음(Amplify가 /a/* 를 Vercel로 프록시).
const publicWeb = process.env.EXPO_PUBLIC_WEB_BASE;
export const PUBLIC_WEB_BASE: string =
  typeof publicWeb === "string" && publicWeb.length > 0
    ? publicWeb
    : "https://daily-newx.project-hh.com";

// 앱 설치 URL(App Store 또는 TestFlight 공개 링크). 미설정이면 설치 배너 숨김.
const appInstall = process.env.EXPO_PUBLIC_APP_INSTALL_URL;
export const APP_INSTALL_URL: string | null =
  typeof appInstall === "string" && appInstall.length > 0 ? appInstall : null;
