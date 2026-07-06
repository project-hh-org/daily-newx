// 도구 카탈로그 — 사용자가 "내 도구"에서 선택하는 대상.
// key 는 DB tool_updates.tool_key 와 1:1(루틴이 이 key 로 매일 업데이트를 채운다).
// 링크는 안정적 canonical 만(최신 트렌드/기능은 데일리 업데이트가 담당).

export type ToolCategory = "model" | "coding";
export type ToolLink = { label: string; url: string };
export type ToolEntry = {
  key: string;
  name: string;
  vendor: string;
  category: ToolCategory;
  blurb: string;
  links: readonly ToolLink[];
};

export const TOOL_CATALOG: readonly ToolEntry[] = [
  // ── 모델 ─────────────────────────────────────────────
  {
    key: "claude",
    name: "Claude",
    vendor: "Anthropic",
    category: "model",
    blurb: "도구 사용·MCP·스킬·훅 생태계.",
    links: [
      { label: "문서", url: "https://docs.claude.com" },
      { label: "GitHub", url: "https://github.com/anthropics" },
      { label: "최신", url: "https://www.anthropic.com/news" },
    ],
  },
  {
    key: "gpt",
    name: "GPT · ChatGPT",
    vendor: "OpenAI",
    category: "model",
    blurb: "Responses/Assistants API·함수호출.",
    links: [
      { label: "문서", url: "https://platform.openai.com/docs" },
      { label: "GitHub", url: "https://github.com/openai" },
      { label: "최신", url: "https://openai.com/news" },
    ],
  },
  {
    key: "gemini",
    name: "Gemini",
    vendor: "Google",
    category: "model",
    blurb: "긴 컨텍스트·멀티모달.",
    links: [
      { label: "문서", url: "https://ai.google.dev/gemini-api/docs" },
      { label: "GitHub", url: "https://github.com/google-gemini" },
    ],
  },
  {
    key: "llama",
    name: "Llama",
    vendor: "Meta",
    category: "model",
    blurb: "오픈 가중치 대표 모델군.",
    links: [
      { label: "사이트", url: "https://www.llama.com" },
      { label: "GitHub", url: "https://github.com/meta-llama" },
      { label: "HF", url: "https://huggingface.co/meta-llama" },
    ],
  },
  {
    key: "mistral",
    name: "Mistral",
    vendor: "Mistral AI",
    category: "model",
    blurb: "효율 중심 오픈/상용 모델.",
    links: [
      { label: "문서", url: "https://docs.mistral.ai" },
      { label: "GitHub", url: "https://github.com/mistralai" },
    ],
  },
  {
    key: "qwen",
    name: "Qwen",
    vendor: "Alibaba",
    category: "model",
    blurb: "다국어·코딩 강한 오픈 모델.",
    links: [
      { label: "GitHub", url: "https://github.com/QwenLM" },
      { label: "HF", url: "https://huggingface.co/Qwen" },
    ],
  },
  {
    key: "deepseek",
    name: "DeepSeek",
    vendor: "DeepSeek",
    category: "model",
    blurb: "추론·코딩 강세 오픈 모델.",
    links: [
      { label: "문서", url: "https://api-docs.deepseek.com" },
      { label: "GitHub", url: "https://github.com/deepseek-ai" },
    ],
  },
  {
    key: "grok",
    name: "Grok",
    vendor: "xAI",
    category: "model",
    blurb: "실시간 정보 연동 강조.",
    links: [
      { label: "문서", url: "https://docs.x.ai" },
      { label: "사이트", url: "https://x.ai" },
    ],
  },

  // ── 코딩 에이전트/CLI ────────────────────────────────
  {
    key: "claude-code",
    name: "Claude Code",
    vendor: "Anthropic",
    category: "coding",
    blurb: "터미널 코딩 에이전트 — 스킬·훅·서브에이전트·MCP.",
    links: [
      { label: "GitHub", url: "https://github.com/anthropics/claude-code" },
      { label: "문서", url: "https://docs.claude.com" },
    ],
  },
  {
    key: "codex",
    name: "Codex",
    vendor: "OpenAI",
    category: "coding",
    blurb: "OpenAI 코딩 에이전트/CLI.",
    links: [
      { label: "GitHub", url: "https://github.com/openai/codex" },
      { label: "문서", url: "https://platform.openai.com/docs" },
    ],
  },
  {
    key: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    category: "coding",
    blurb: "AI 코드 에디터.",
    links: [
      { label: "사이트", url: "https://cursor.com" },
      { label: "문서", url: "https://docs.cursor.com" },
    ],
  },
  {
    key: "copilot",
    name: "GitHub Copilot",
    vendor: "GitHub",
    category: "coding",
    blurb: "에디터/CLI 코딩 어시스턴트·에이전트.",
    links: [
      { label: "소개", url: "https://github.com/features/copilot" },
      { label: "문서", url: "https://docs.github.com/copilot" },
    ],
  },
  {
    key: "gemini-cli",
    name: "Gemini CLI",
    vendor: "Google",
    category: "coding",
    blurb: "터미널 기반 Gemini 에이전트.",
    links: [{ label: "GitHub", url: "https://github.com/google-gemini/gemini-cli" }],
  },
  {
    key: "cline",
    name: "Cline",
    vendor: "Cline",
    category: "coding",
    blurb: "오픈소스 자율 코딩 에이전트(VS Code).",
    links: [{ label: "GitHub", url: "https://github.com/cline/cline" }],
  },
  {
    key: "aider",
    name: "Aider",
    vendor: "Aider",
    category: "coding",
    blurb: "터미널 페어프로그래밍(Git 연동).",
    links: [
      { label: "사이트", url: "https://aider.chat" },
      { label: "GitHub", url: "https://github.com/Aider-AI/aider" },
    ],
  },
  {
    key: "windsurf",
    name: "Windsurf",
    vendor: "Windsurf",
    category: "coding",
    blurb: "에이전트형 AI IDE.",
    links: [{ label: "사이트", url: "https://windsurf.com" }],
  },
  {
    key: "continue",
    name: "Continue",
    vendor: "Continue",
    category: "coding",
    blurb: "오픈소스 IDE 어시스턴트.",
    links: [
      { label: "사이트", url: "https://continue.dev" },
      { label: "GitHub", url: "https://github.com/continuedev/continue" },
    ],
  },
];

export const TOOL_KEYS: readonly string[] = TOOL_CATALOG.map((t) => t.key);

export function toolByKey(key: string): ToolEntry | undefined {
  return TOOL_CATALOG.find((t) => t.key === key);
}
