-- daily-llm-news 2단계(Haiku 검색 → Sonnet 작성) 파이프라인용 중간 캐시 테이블.
-- Haiku 리서처 에이전트가 스윕 A~H 원본 검색 결과를 여기 저장하면,
-- Sonnet 작성 에이전트가 이걸 읽어서 브리핑을 쓰고 게시한다.
-- service_role 클라이언트로만 접근(RLS 우회) — 다른 daily_* 테이블과 동일한 접근 패턴.

create table if not exists public.daily_llm_news_research (
  issue_date date primary key,
  research jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.daily_llm_news_research enable row level security;
-- 공개 정책 없음 — service_role만 접근(RLS 우회). anon/authenticated 는 기본 거부.
