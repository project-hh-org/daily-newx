-- ============================================================
-- daily-news : Supabase / Postgres schema
-- 매일 10:00 KST 루틴이 수집한 "하루치 LLM 뉴스"를 저장.
-- 쓰기는 애플리케이션 API(service_role)로만, 읽기는 anon 허용.
-- ============================================================

-- 카테고리 enum (baeksang.dev 형식 기준)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'news_category') then
    create type news_category as enum (
      'headline',   -- 오늘의 헤드라인
      'release',    -- 릴리스 · 신모델
      'paper',      -- 주목할 페이퍼
      'community',  -- 커뮤니티 반응
      'business'    -- 산업 · 비즈니스 이슈
    );
  end if;
end $$;

-- ------------------------------------------------------------
-- 1) 하루치 이슈 (호 단위)
-- ------------------------------------------------------------
create table if not exists public.daily_issues (
  issue_date   date primary key,                 -- 예: 2026-06-16
  issue_no     integer unique,                   -- 예: 56 (№ 056)
  intro        text,                             -- 상단 도입 문단
  outro        text,                             -- 하단 마무리 문단
  status       text not null default 'draft'     -- draft | published
                 check (status in ('draft', 'published')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) 개별 항목 (기사 1건 = 1행)
-- ------------------------------------------------------------
create table if not exists public.daily_items (
  id            uuid primary key default gen_random_uuid(),
  issue_date    date not null references public.daily_issues(issue_date) on delete cascade,
  category      news_category not null,
  position      integer not null default 0,      -- 카테고리 내 정렬 순서
  title         text not null,
  summary       text not null,                   -- 요약 문단
  -- 자유 본문 블록 (heading|paragraph|bullets|quote|stat|callout|image). 신규 글은 이걸 사용.
  blocks        jsonb not null default '[]',
  -- (레거시, 호환용) 옛 고정 필드 — 신규 글은 비우고 blocks 사용
  key_points    jsonb not null default '[]',     -- 핵심 포인트 불릿 (string[])
  what_you_get  text,                            -- "얻는 것"
  action        text,                            -- "지금 할 일" (적용 액션, 없으면 null)
  why_now       text,                            -- "왜 지금"

  -- 출처 (필수) — 출처 없는 항목은 절대 저장 금지
  source_url    text not null check (source_url ~ '^https?://'),
  source_name   text not null,                   -- hn-algolia | github-releases | arxiv | official-blog ...
  score         smallint check (score between 0 and 10),  -- 신뢰도/중요도 0~10
  story_slug    text,                            -- 상세 스토리 페이지용 slug

  -- 연결·타임라인용 (모두 선택, 없으면 비움)
  tldr          text,                            -- 한 줄 핵심 (카드/목록/OG용)
  tags          jsonb not null default '[]',     -- 토픽 태그 (string[]) — 태그 클러스터
  entities      jsonb not null default '[]',     -- 등장 주체 (string[]) — 주제별 타임라인 근간
  related       jsonb not null default '[]',     -- 보조 링크 (string[] of url)
  follow_up_of  text,                            -- 어제 항목의 후속이면 그 story_slug
  source_published_at date,                      -- 원문 발행일 (수집일과 구분)

  created_at    timestamptz not null default now(),

  -- 같은 날 같은 출처 중복 방지
  unique (issue_date, source_url)
);

create index if not exists idx_daily_items_issue   on public.daily_items (issue_date);
create index if not exists idx_daily_items_category on public.daily_items (issue_date, category, position);
-- 주제·태그 교차 조회(타임라인/클러스터)용 GIN 인덱스
create index if not exists idx_daily_items_entities on public.daily_items using gin (entities);
create index if not exists idx_daily_items_tags     on public.daily_items using gin (tags);

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_daily_issues_touch on public.daily_issues;
create trigger trg_daily_issues_touch
  before update on public.daily_issues
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 3) RLS — 읽기는 공개(anon), 쓰기는 service_role(=API)만
--    어드민/루틴/타인 추가는 모두 API(service_role) 경유.
-- ------------------------------------------------------------
alter table public.daily_issues enable row level security;
alter table public.daily_items  enable row level security;

drop policy if exists "public read issues" on public.daily_issues;
create policy "public read issues" on public.daily_issues
  for select using (status = 'published');

drop policy if exists "public read items" on public.daily_items;
create policy "public read items" on public.daily_items
  for select using (
    exists (
      select 1 from public.daily_issues di
      where di.issue_date = daily_items.issue_date
        and di.status = 'published'
    )
  );
-- service_role 은 RLS 우회 → API 서버에서만 insert/update/delete.
-- anon/authenticated 쓰기 정책은 의도적으로 두지 않음.

-- ------------------------------------------------------------
-- 4) 푸시 토큰 — 발행 시점 브로드캐스트 대상(Expo push token).
--    등록/조회/삭제는 모두 API(service_role) 경유. 공개 접근 없음.
-- ------------------------------------------------------------
create table if not exists public.push_tokens (
  token       text primary key,                 -- ExponentPushToken[...]
  platform    text,                              -- ios | android
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_push_tokens_touch on public.push_tokens;
create trigger trg_push_tokens_touch
  before update on public.push_tokens
  for each row execute function public.touch_updated_at();

alter table public.push_tokens enable row level security;
-- 공개 정책 없음 → anon 접근 불가, service_role(API)만 사용.

-- ------------------------------------------------------------
-- 5) 도구 업데이트 — 루틴이 매일 생성하는 "선택 도구별 최신 소식".
--    읽기는 공개(anon), 쓰기는 service_role(=루틴/API)만.
-- ------------------------------------------------------------
create table if not exists public.tool_updates (
  id           uuid primary key default gen_random_uuid(),
  tool_key     text not null,                    -- toolCatalog key (claude|codex|cursor ...)
  update_date  date not null,                    -- 소식 날짜(최신성 필터용)
  kind         text not null default 'news'      -- news(공식 소식) | resource(커뮤니티 레포/스킬/gist)
                 check (kind in ('news', 'resource')),
  title        text not null,
  summary      text not null,                     -- 카드용 1~2문장
  blocks       jsonb not null default '[]'::jsonb, -- 상세 본문(아티클과 동일한 블록 배열: 사용법·설치·장단점 등)
  url          text not null check (url ~ '^https?://'),
  created_at   timestamptz not null default now(),
  unique (tool_key, url)                          -- 같은 링크 중복 방지(멱등)
);
-- 기존 테이블에도 안전하게 컬럼 추가(멱등)
alter table public.tool_updates add column if not exists kind text not null default 'news';
alter table public.tool_updates add column if not exists blocks jsonb not null default '[]'::jsonb;

create index if not exists idx_tool_updates_key_date
  on public.tool_updates (tool_key, update_date desc);

alter table public.tool_updates enable row level security;
drop policy if exists "public read tool_updates" on public.tool_updates;
create policy "public read tool_updates" on public.tool_updates
  for select using (true);
-- service_role 이 insert/update/delete (루틴/API).
