-- 도구 카탈로그를 코드 하드코딩(apps/reader/src/lib/toolCatalog.ts의 TOOL_CATALOG 배열)에서
-- DB로 이관. "내 도구" 화면(설정+피드)이 이제 이 테이블 조회 결과로 도구 목록을 렌더링한다.
--
-- 목적: daily-llm-news 루틴(리서처/작성 에이전트)이 목록에 없는 새 도구·모델(예: 2026-07-26에
-- 등장한 Moonshot AI의 Kimi K3)을 발견했을 때, 코드 배포 없이 스스로 후보로 등록할 수 있게
-- 하기 위함. 종전에는 TOOL_CATALOG 배열을 사람이 직접 고쳐야만 "내 도구" 화면에 반영됐다.
--
-- 접근 패턴은 다른 daily_* 테이블과 동일: service_role 클라이언트로만 접근(RLS 우회),
-- 공개 노출 여부는 API 코드(getActiveToolCatalog)가 status='active' 필터로 직접 통제한다
-- (별도 anon 정책 없음 — daily_llm_news_research 테이블과 동일 패턴).

create table if not exists public.tool_catalog (
  key text primary key check (key ~ '^[a-z0-9-]+$'),
  name text not null,
  vendor text not null,
  category text not null check (category in ('model', 'coding')),
  blurb text not null default '',
  links jsonb not null default '[]'::jsonb,
  -- active: 사람이 검수해 "내 도구" 화면에 노출 확정. pending_review: 루틴이 자동 등록한
  -- 후보로, blurb/links가 비어 있거나 검증 안 됐을 수 있어 화면에는 아직 노출하지 않는다.
  status text not null default 'pending_review' check (status in ('active', 'pending_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tool_catalog enable row level security;
-- 공개 정책 없음 — service_role만 접근(RLS 우회). anon/authenticated는 기본 거부.

create or replace function public.set_tool_catalog_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tool_catalog_updated_at on public.tool_catalog;
create trigger trg_tool_catalog_updated_at
  before update on public.tool_catalog
  for each row execute function public.set_tool_catalog_updated_at();

-- 시드: 기존 TOOL_CATALOG 하드코딩 17개(모델 8 + 코딩 도구 9)를 status=active로 그대로 이전.
insert into public.tool_catalog (key, name, vendor, category, blurb, links, status) values
  ('claude', 'Claude', 'Anthropic', 'model', '도구 사용·MCP·스킬·훅 생태계.',
    '[{"label":"문서","url":"https://docs.claude.com"},{"label":"GitHub","url":"https://github.com/anthropics"},{"label":"최신","url":"https://www.anthropic.com/news"}]'::jsonb, 'active'),
  ('gpt', 'GPT · ChatGPT', 'OpenAI', 'model', 'Responses/Assistants API·함수호출.',
    '[{"label":"문서","url":"https://platform.openai.com/docs"},{"label":"GitHub","url":"https://github.com/openai"},{"label":"최신","url":"https://openai.com/news"}]'::jsonb, 'active'),
  ('gemini', 'Gemini', 'Google', 'model', '긴 컨텍스트·멀티모달.',
    '[{"label":"문서","url":"https://ai.google.dev/gemini-api/docs"},{"label":"GitHub","url":"https://github.com/google-gemini"}]'::jsonb, 'active'),
  ('llama', 'Llama', 'Meta', 'model', '오픈 가중치 대표 모델군.',
    '[{"label":"사이트","url":"https://www.llama.com"},{"label":"GitHub","url":"https://github.com/meta-llama"},{"label":"HF","url":"https://huggingface.co/meta-llama"}]'::jsonb, 'active'),
  ('mistral', 'Mistral', 'Mistral AI', 'model', '효율 중심 오픈/상용 모델.',
    '[{"label":"문서","url":"https://docs.mistral.ai"},{"label":"GitHub","url":"https://github.com/mistralai"}]'::jsonb, 'active'),
  ('qwen', 'Qwen', 'Alibaba', 'model', '다국어·코딩 강한 오픈 모델.',
    '[{"label":"GitHub","url":"https://github.com/QwenLM"},{"label":"HF","url":"https://huggingface.co/Qwen"}]'::jsonb, 'active'),
  ('deepseek', 'DeepSeek', 'DeepSeek', 'model', '추론·코딩 강세 오픈 모델.',
    '[{"label":"문서","url":"https://api-docs.deepseek.com"},{"label":"GitHub","url":"https://github.com/deepseek-ai"}]'::jsonb, 'active'),
  ('grok', 'Grok', 'xAI', 'model', '실시간 정보 연동 강조.',
    '[{"label":"문서","url":"https://docs.x.ai"},{"label":"사이트","url":"https://x.ai"}]'::jsonb, 'active'),
  ('claude-code', 'Claude Code', 'Anthropic', 'coding', '터미널 코딩 에이전트 — 스킬·훅·서브에이전트·MCP.',
    '[{"label":"GitHub","url":"https://github.com/anthropics/claude-code"},{"label":"문서","url":"https://docs.claude.com"}]'::jsonb, 'active'),
  ('codex', 'Codex', 'OpenAI', 'coding', 'OpenAI 코딩 에이전트/CLI.',
    '[{"label":"GitHub","url":"https://github.com/openai/codex"},{"label":"문서","url":"https://platform.openai.com/docs"}]'::jsonb, 'active'),
  ('cursor', 'Cursor', 'Anysphere', 'coding', 'AI 코드 에디터.',
    '[{"label":"사이트","url":"https://cursor.com"},{"label":"문서","url":"https://docs.cursor.com"}]'::jsonb, 'active'),
  ('copilot', 'GitHub Copilot', 'GitHub', 'coding', '에디터/CLI 코딩 어시스턴트·에이전트.',
    '[{"label":"소개","url":"https://github.com/features/copilot"},{"label":"문서","url":"https://docs.github.com/copilot"}]'::jsonb, 'active'),
  ('gemini-cli', 'Gemini CLI', 'Google', 'coding', '터미널 기반 Gemini 에이전트.',
    '[{"label":"GitHub","url":"https://github.com/google-gemini/gemini-cli"}]'::jsonb, 'active'),
  ('cline', 'Cline', 'Cline', 'coding', '오픈소스 자율 코딩 에이전트(VS Code).',
    '[{"label":"GitHub","url":"https://github.com/cline/cline"}]'::jsonb, 'active'),
  ('aider', 'Aider', 'Aider', 'coding', '터미널 페어프로그래밍(Git 연동).',
    '[{"label":"사이트","url":"https://aider.chat"},{"label":"GitHub","url":"https://github.com/Aider-AI/aider"}]'::jsonb, 'active'),
  ('windsurf', 'Windsurf', 'Windsurf', 'coding', '에이전트형 AI IDE.',
    '[{"label":"사이트","url":"https://windsurf.com"}]'::jsonb, 'active'),
  ('continue', 'Continue', 'Continue', 'coding', '오픈소스 IDE 어시스턴트.',
    '[{"label":"사이트","url":"https://continue.dev"},{"label":"GitHub","url":"https://github.com/continuedev/continue"}]'::jsonb, 'active')
on conflict (key) do nothing;

-- 조회: select key, name, vendor, category, status from public.tool_catalog order by status, category, name;
-- 후보 승인(예): update public.tool_catalog set status='active', blurb='...', links='[...]'::jsonb where key='kimi';
