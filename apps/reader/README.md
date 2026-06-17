# reader — 공개 리더 (Expo RN 웹앱)

`GET {API_BASE}/api/daily-news/{YYYYMMDD}` 를 소비해 하루치 호를 렌더한다.
화면 라벨은 `2026.06.16`, URL 은 `/daily/20260616`.

스택: Expo (expo-router) + React Native Web · TanStack Query · Zustand · Zod · NativeWind.

## 레이어 (단방향 import)

```
app/(라우트)  →  screens/  →  components/  →  hooks/ · store/  →  services/  →  lib/ · types/
```

- `app/` — expo-router 라우트(얇게 유지).
  - `index` → 오늘 호로 리다이렉트
  - `daily/[date]` → `DailyScreen` (당일 한 흐름. 카테고리 섹션 없이 카드 나열, 하단 메타 태그)
  - `article/[id]` → `ArticleScreen` (아티클 단건, uuid)
  - `timeline/[axis]/[value]` → `TimelineScreen` (axis: category|tag|entity 횡단, 일자 내림차순)
  - `+html.tsx` → 웹 폰트 주입(제목 나눔명조 / 본문 Pretendard)
- `screens/` — `DailyScreen`, `ArticleScreen`, `TimelineScreen`.
- `components/` — `IssueHeader`, `NewsItemCard`(종이 카드), `MetaFooter`(카테고리/주제/주체 → 타임라인 링크), `OptionalField`(값 있을 때만), `Bullets`, `SourceLine`, `StateViews`.
- `services/dailyNewsApi` — fetch + Zod 검증. `fetchDailyIssue`는 `EXPO_PUBLIC_USE_FIXTURE=1` 시 번들 fixture로 오프라인 렌더. `fetchArticle`/`fetchTimeline`은 DB 기반이라 항상 실제 API 사용.
- `store/uiStore` — 카테고리 필터(Zustand).

소비 API: `GET /api/daily-news/{YYYYMMDD}`, `GET /api/article/{uuid}`, `GET /api/timeline/{axis}/{value}` (모두 공개 읽기 + CORS).

## 환경변수 (`.env.local`)

`.env.example` 복사. 공개값만(EXPO_PUBLIC_*), 비밀키 금지.

| 키 | 의미 |
|---|---|
| `EXPO_PUBLIC_API_BASE` | 조회 API 베이스 (로컬: `http://localhost:4000`) |
| `EXPO_PUBLIC_USE_FIXTURE` | `1` = 번들 fixture, `0` = 실제 API |

## 실행

```bash
# 레포 루트에서 (yarn workspaces)
yarn workspace reader typecheck     # tsc --noEmit
yarn workspace reader web           # 웹 미리보기 (localhost:4040)
```

오프라인 빠른 확인: `apps/reader/.env.local` 에 `EXPO_PUBLIC_USE_FIXTURE=1` → `/daily/20260616` 가 번들 데이터로 렌더된다.

실데이터: API 를 띄우고(`yarn workspace daily-news-api dev`), `EXPO_PUBLIC_USE_FIXTURE=0` + `EXPO_PUBLIC_API_BASE=http://localhost:4000`.

> 웹에서 다른 origin API 호출은 CORS 필요 — API 의 GET 라우트에 허용 헤더를 추가해 둠.
> 읽기측 Zod 스키마는 `apps/api` 의 계약을 미러링하므로, 필드 변경 시 양쪽을 동기화할 것.
