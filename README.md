# daily-news — 매일의 LLM 뉴스 데이터 파이프라인

매일 **10:00 KST**, 웹 검색으로 LLM 업데이트·개발 트렌드·연구·산업 이슈를 수집해
하루치 "호(issue)"로 묶어 저장하는 루틴. 카테고리별 항목마다 요약·핵심 포인트·
**지금 할 일(액션)**·**출처**, 그리고 연결·타임라인용 메타(태그·주체)를 담는다.

- **독자**: 특정 직군에 한정하지 않는 **일반 대중**. 전문용어는 풀어 쓰고, 쉽게·정확하게.
- **식별자**: 화면 라벨은 날짜(예: `2026.06.16`), 링크는 대시 없는 날짜(`/daily/20260616`).

> 이번 단계 = **데이터 파이프라인**. 화면(Expo RN 웹앱)은 다음 단계.

## 구성

```
검색(웹) ──▶ 구조화 ──▶ 출처 검증 ──▶ data/YYYY-MM-DD.json ──▶ [POST] 내 API ──▶ Supabase
                                                            └─(API 없으면 로컬 JSON까지)
```

- **수집/구조화**: 매일 10시 스케줄 작업(`daily-llm-news`)이 카테고리별로 검색·요약.
- **저장 경로**: 쓰기는 **내 API(service_role)** 경유. 어드민·루틴·타인 추가 모두 같은 API로.
  API 엔드포인트가 아직 없으면 루틴은 `data/YYYY-MM-DD.json`까지만 만들고 멈춘다.
- **DB**: `db/schema.sql` — `daily_issues`(호) + `daily_items`(항목). 읽기 공개, 쓰기 service_role.

## 데이터 모델 (요약)

| 필드 | 의미 |
|---|---|
| `category` | headline / release / paper / community / business |
| `title`, `summary` | 제목, 요약 |
| `tldr` | 한 줄 핵심 (목록·카드용, 선택) |
| `key_points` | 핵심 포인트 불릿 (string[], 선택) |
| `what_you_get` | "얻는 것" (선택) |
| `action` | **"지금 할 일"** — 실제 행동 있을 때만, 없으면 null |
| `why_now` | "왜 지금" (선택) |
| `source_url`, `source_name` | **출처(필수)**, 출처 유형 |
| `score` | 신뢰도·중요도 0~10 |
| `tags` | 토픽 태그 (string[]) — 태그 묶기 |
| `entities` | 등장 주체 (string[]) — **주제별 타임라인의 근간** |
| `related` | 보조 링크 (url[]) |
| `follow_up_of` | 과거 호 후속이면 그 `story_slug` — 이야기 흐름 |
| `source_published_at` | 원문 발행일 (수집일과 구분) |

> 선택 필드는 **억지로 채우지 않는다**. 빈 값은 화면에 표시되지 않는다.
> `effort`·`verdict` 같은 주관 판정 필드는 의도적으로 두지 않는다(사실·출처 기반만).

전체 컬럼·제약은 `db/schema.sql`, 형식 예시는 `data/2026-06-16.sample.json`.

## 출처 검증 규칙 (정확도 우선)

1. **1차 출처만 기록** — 공식 블로그/릴리스 페이지, GitHub Releases, arXiv,
   점수 있는 Hacker News. 애그리게이터·SEO 페이지의 단정은 배제.
2. **출처 URL 없는 항목은 저장 금지** (`source_url` NOT NULL + http(s) 체크).
3. **모델명·버전·수치는 1차 출처에서 직접 확인**된 것만. 미확인이면 "보도" 라고 명시하거나 제외.
4. **억지로 채우지 않음** — 뉴스 적은 날은 항목 수가 적어도 된다.
5. 같은 날 같은 `source_url` 중복은 DB 유니크 제약으로 차단.

## 인제스트 API (Next.js App Router)

이 폴더 자체가 인제스트 API 프로젝트다. 레이어: `app → lib → services → types` (단방향).

```
src/
  app/api/daily-news/route.ts          POST  하루치 호 인제스트 (auth → zod → upsert)
  app/api/daily-news/[date]/route.ts   GET   호 단위 조회
  lib/auth.ts                          Bearer 토큰 검증(상수시간 비교)
  services/config.ts                   환경변수 Zod 검증
  services/supabase.ts                 service_role 클라이언트
  services/newsRepository.ts           멱등 upsert / 조회
  types/news.types.ts                  Zod 스키마 + 추론 타입
```

### 계약

```
POST /api/daily-news
Authorization: Bearer {INGEST_TOKEN}
Content-Type: application/json
Body: { issue, items[] }   # data/YYYY-MM-DD.json 구조와 동일

200 { ok: true, issue_date, items_upserted }
401 인증 실패 · 422 검증 실패 · 500 DB 오류
```

- `issue` 는 `issue_date` 기준, `items` 는 `(issue_date, source_url)` 기준 **멱등 upsert** → 같은 날 재실행해도 중복 안 쌓임.
- `source_url` 없거나 http(s) 아니면 422 로 거부(출처 강제).

조회는 대시 없는 날짜로:

```
GET /api/daily-news/20260616     # 내부에서 2026-06-16 으로 변환 (대시 포함도 허용)
화면 라벨 표기: 2026.06.16
```

### 로컬 실행

```bash
npm install
cp .env.example .env.local      # SUPABASE_URL / SERVICE_ROLE_KEY / INGEST_TOKEN 채우기
# Supabase SQL 에디터에서 db/schema.sql 1회 실행
npm run dev                     # http://localhost:3000

npm run typecheck && npm run lint && npm test   # CI 게이트
```

토큰·URL 값은 채팅·저장소에 두지 말 것. `.env.local` 은 gitignore 됨.

### 루틴 연결

`.env.local` 에 `INGEST_URL=http://localhost:3000/api/daily-news`, `INGEST_TOKEN=...` 을 두면
스케줄 작업 `daily-llm-news` 가 JSON 저장 후 자동 POST 한다.

## 다음 단계

- [ ] Supabase 프로젝트에 `db/schema.sql` 적용 + `.env.local` 채우기
- [ ] `npm install` 후 `typecheck`/`lint`/`test`/`build` 통과 확인 (현재 미실행)
- [ ] 어드민 페이지(수동 추가/수정) — 같은 API 재사용
- [ ] Expo RN 웹앱(`/daily/20260616`, 라벨 `2026.06.16`) — `GET /api/daily-news/20260616` 소비
- [ ] 주제별 타임라인 페이지 — `entities` 로 같은 주체를 일자순 묶기
