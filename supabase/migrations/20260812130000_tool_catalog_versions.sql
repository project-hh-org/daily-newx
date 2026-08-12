-- 도구 버전 이력 테이블 신설(2026-08-12).
--
-- 배경: tool_key를 브랜드 단위 canonical key로 통일하는 규칙을 도입하면서
-- (예: "gpt-5.6"/"gpt-5-6"/"gpt-live" 전부 → key: "gpt"), 버전 정보가 key에서
-- 사라지는 문제가 생겼다. 처음엔 tool_catalog에 단일 full_name 컬럼을 추가하려
-- 했으나, 한 브랜드가 여러 버전을 동시에 낼 수 있어서(예: Claude Opus 5 ·
-- Claude Sonnet 5가 같은 날 둘 다 유효) 단일 필드로는 표현이 안 된다. 이 프로젝트가
-- 이미 daily_items(issue_date별)·tool_updates(tool_key+date별)처럼 "시간에 따라
-- 쌓이는 데이터"를 전부 별도 테이블로 정규화하는 패턴을 쓰므로, 버전 이력도 같은
-- 패턴을 따라 별도 테이블로 관리한다(jsonb 배열 컬럼에 애플리케이션 코드로
-- 읽고-합치고-쓰는 방식보다 단순하고, 정합성도 DB 제약으로 보장된다).
--
-- tool_key는 tool_catalog(key)를 참조(FK)한다 — 카탈로그에 없는 key로는 버전을
-- 추가할 수 없다(insertPendingToolCatalog로 먼저 등록해야 함). unique(tool_key,
-- full_name)로 같은 조합의 중복 삽입을 막고, upsert 시 first_seen은 보존하고
-- last_seen만 갱신한다(apps/api/src/services/toolCatalogRepository.ts 참조).

create table if not exists public.tool_catalog_versions (
  id uuid primary key default gen_random_uuid(),
  tool_key text not null references public.tool_catalog(key) on delete cascade,
  full_name text not null,
  first_seen date not null,
  last_seen date not null,
  unique (tool_key, full_name)
);

alter table public.tool_catalog_versions enable row level security;
-- 공개 정책 없음 — service_role만 접근(RLS 우회). anon/authenticated는 기본 거부.
-- (다른 daily_* / tool_catalog 테이블과 동일한 패턴.)

-- 백필: 68개 미등록 tool_key를 브랜드별로 정리하는 과정에서 확보된, 이미
-- tool_catalog에 있는 8개 시드 브랜드의 최신 버전 표기. 전부 에이전트가 실제로
-- 남긴 tool_key 문자열을 사람이 읽기 좋게 정리한 것이며 새로 지어낸 정보는 없다.
insert into public.tool_catalog_versions (tool_key, full_name, first_seen, last_seen) values
  ('gpt', 'GPT-5.6', '2026-07-28', '2026-08-10'),
  ('gemini', 'Gemini 3.6 Flash', '2026-07-28', '2026-08-10'),
  ('grok', 'Grok 4.5', '2026-07-29', '2026-08-10'),
  ('qwen', 'Qwen 3.8 Max', '2026-08-06', '2026-08-09'),
  ('deepseek', 'DeepSeek V4 Flash', '2026-08-02', '2026-08-09'),
  ('llama', 'Llama 4', '2026-08-06', '2026-08-09'),
  ('mistral', 'Mistral Large 3', '2026-07-29', '2026-07-29'),
  ('claude', 'Claude Opus 5', '2026-07-29', '2026-08-10')
on conflict (tool_key, full_name) do nothing;
