// daily-llm-news 루틴 — Vercel Function 버전.
//
// Supabase Cron(pg_cron+pg_net, supabase/migrations/*_schedule_daily_llm_news.sql)이
// 매일 09:02 KST에 이 라우트를 POST로 호출한다.
//
// 원래 Supabase Edge Function으로 만들었으나, Supabase Edge Function은
// request idle timeout이 150초로 고정(플랜 무관)이라 다회 웹서치+대량 생성이 걸리는
// 이 작업을 완주하지 못해(504 IDLE_TIMEOUT) 이 라우트로 옮겼다. Vercel Function은
// maxDuration을 최대 300~800초까지 늘릴 수 있다. 스케줄러는 여전히 Supabase Cron —
// pg_net이 호출하는 URL만 Edge Function에서 이 라우트로 바뀐 것.
//
// 하는 일:
//   1) 최근 이슈(다음 issue_no, 최근 3일 항목 — 후속 확인용)를 기존 서비스 레이어로 직접 조회.
//   2) Anthropic Messages API를 web_search 툴과 함께 호출해 브리핑 JSON을 생성시킨다.
//      (agentic 웹서치라 한 번의 요청 안에서 여러 번 검색; 너무 오래 걸리면
//       stop_reason "pause_turn" 이 오는데, Claude가 만든 assistant 메시지를 그대로
//       돌려보내 이어서 진행한다.)
//   3) 결과 JSON을 파싱해 기존 인제스트 라우트(POST /api/daily-news, /api/tool-updates)를
//      그대로 호출한다 — 자체 zod 검증·푸시 발송 로직을 중복 구현하지 않기 위해.
//
// 필요 환경변수(Vercel 프로젝트 설정 > Environment Variables):
//   ANTHROPIC_API_KEY   Anthropic 콘솔에서 발급
//   INGEST_TOKEN         기존과 동일(이 라우트 자체의 호출 인증 + 인제스트 인증 겸용)
//   ANTHROPIC_MODEL      (선택) 기본 claude-sonnet-5
//
// 비용 안전장치(2026-07-14 추가) — 07-13·07-14 실행분이 캐싱 없이 회당 $11.78/$14.41이
// 나온 것을 확인(웹서치 결과 누적으로 대화가 20만 토큰 초과, input_no_cache로 전액 정가 청구).
// 그래서: ① 시스템 프롬프트+누적 대화에 prompt caching 브레이크포인트 ② web_search를
// dynamic filtering 버전(20260209)으로 교체 ③ max_uses 30→20 ④ 누적 토큰 하드 컷오프
// (MAX_CUMULATIVE_TOKENS)를 추가했다.

import { NextResponse } from "next/server";
import { verifyBearer } from "@/lib/auth";
import { buildDailyLlmNewsPrompt, type RecentIssueContext } from "@/lib/dailyLlmNewsPrompt";
import { getIssuesList, getIssue } from "@/services/newsRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // Vercel Function 최대 실행시간(초). Pro/Enterprise는 최대 800까지 올릴 수 있음.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_PAUSE_TURNS = 6; // pause_turn 반복 상한 (무한루프 방지)

// 비용 안전장치 — 2026-07-13·07-14 실제 실행에서 회당 $11.78 / $14.41이 나왔다(캐싱 없이
// 웹서치 결과가 누적되며 대화가 20만 토큰을 넘어감). 아래 값들로 토큰 사용을 줄이고,
// 그래도 폭주하면 하드 컷오프로 중단한다.
const WEB_SEARCH_MAX_USES = 20; // 30→20. 8개 스윕 평균 2.5회/스윕이면 충분.
// 누적 토큰(입력+출력+캐시 전부 합산) 하드 한도 — 정상 실행 실측치의 2배 이상 여유.
// 이 값을 넘으면 즉시 중단해 무한정 비용이 불어나는 것을 막는다.
const MAX_CUMULATIVE_TOKENS = 700_000;

function cacheControlLast<T extends { content: unknown }>(msg: T): T {
  const content = msg.content;
  if (!Array.isArray(content) || content.length === 0) return msg;
  const copy = content.slice();
  const lastIdx = copy.length - 1;
  copy[lastIdx] = { ...(copy[lastIdx] as object), cache_control: { type: "ephemeral" } };
  return { ...msg, content: copy };
}

function todayKst(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // en-CA => YYYY-MM-DD
}

function nowKstDisplay(): string {
  const fmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "long",
    timeStyle: "short",
  });
  return fmt.format(new Date());
}

// ── Anthropic Messages API ──────────────────────────────────────────────

type AnthropicMessage = { role: "user" | "assistant"; content: unknown };

async function callAnthropic(
  apiKey: string,
  model: string,
  systemBlocks: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }>,
  messages: AnthropicMessage[],
): Promise<any> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: 16000,
      system: systemBlocks,
      messages,
      // web_search_20260209: dynamic filtering — 검색 결과를 컨텍스트에 그대로 다 넣지 않고
      // 코드로 걸러서 넣어 토큰 사용을 줄인다(Sonnet 5 지원). max_uses도 30→20으로 축소.
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: WEB_SEARCH_MAX_USES }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API 오류 ${res.status}: ${text}`);
  }
  return await res.json();
}

function usageTokenTotal(usage: Record<string, unknown> | undefined): number {
  if (!usage) return 0;
  const n = (v: unknown) => (typeof v === "number" ? v : 0);
  return (
    n(usage.input_tokens) +
    n(usage.output_tokens) +
    n(usage.cache_creation_input_tokens) +
    n(usage.cache_read_input_tokens)
  );
}

// pause_turn 이면 assistant 메시지를 그대로 돌려보내며 이어간다.
// 시스템 프롬프트와 누적 대화 모두에 캐시 브레이크포인트를 걸어, 매 턴 반복 전송되는
// 이전 내용은 정가가 아니라 캐시 읽기 단가(1/10)로 청구되게 한다.
async function runUntilDone(
  apiKey: string,
  model: string,
  system: string,
  initialMessages: AnthropicMessage[],
): Promise<{ text: string; turns: number; cumulativeTokens: number; searchRequests: number }> {
  const systemBlocks = [
    { type: "text" as const, text: system, cache_control: { type: "ephemeral" as const } },
  ];
  const messages = [...initialMessages];
  let turns = 0;
  let cumulativeTokens = 0;
  let searchRequests = 0;
  let last: any;
  do {
    last = await callAnthropic(apiKey, model, systemBlocks, messages);
    turns += 1;
    cumulativeTokens += usageTokenTotal(last.usage);
    searchRequests += Number(last.usage?.server_tool_use?.web_search_requests ?? 0);

    if (cumulativeTokens > MAX_CUMULATIVE_TOKENS) {
      throw new Error(
        `누적 토큰 하드 한도(${MAX_CUMULATIVE_TOKENS.toLocaleString()}) 초과(현재 ${cumulativeTokens.toLocaleString()}) — 비용 폭주 방지를 위해 중단. 프롬프트나 max_uses를 재검토하세요.`,
      );
    }

    if (last.stop_reason === "pause_turn") {
      messages.push(cacheControlLast({ role: "assistant", content: last.content }));
    }
  } while (last.stop_reason === "pause_turn" && turns < MAX_PAUSE_TURNS);

  if (last.stop_reason === "pause_turn") {
    throw new Error(
      `pause_turn 반복 한도(${MAX_PAUSE_TURNS}) 초과 — 검색 범위를 줄이거나 max_uses를 낮추세요.`,
    );
  }
  if (last.stop_reason === "max_tokens") {
    throw new Error("max_tokens 도달 — 출력이 잘렸습니다. max_tokens를 늘리세요.");
  }

  const textBlocks = (last.content as any[])
    .filter((b) => b.type === "text")
    .map((b) => b.text);
  return { text: textBlocks.join("\n"), turns, cumulativeTokens, searchRequests };
}

// 최종 답변에서 JSON 객체만 뽑아 파싱 (설명 문구가 섞여도 방어적으로 처리).
function extractJson(text: string): any {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("응답에서 JSON 객체를 찾지 못함");
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function postJson(
  url: string,
  token: string,
  body: unknown,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // 본문이 JSON이 아닐 수 있음 — 무시.
  }
  return { status: res.status, body: json };
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!verifyBearer(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("missing env: ANTHROPIC_API_KEY");
    const ingestToken = process.env.INGEST_TOKEN;
    if (!ingestToken) throw new Error("missing env: INGEST_TOKEN");
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

    const siteBase = new URL(req.url).origin;
    const today = todayKst();

    // 최근 이슈 목록 → 다음 issue_no, 후속 확인용 최근 3일 컨텍스트
    const issuesList = (await getIssuesList()) as Array<{
      issue_date: string;
      issue_no: number | null;
    }>;
    const maxIssueNo = issuesList.reduce(
      (max, i) => (typeof i.issue_no === "number" && i.issue_no > max ? i.issue_no : max),
      0,
    );
    const nextIssueNo = maxIssueNo + 1;

    const recentDates = issuesList
      .map((i) => i.issue_date)
      .filter((d) => d !== today)
      .slice(0, 3);
    const recentIssuesRaw = await Promise.all(recentDates.map((d) => getIssue(d)));
    const recentIssues: RecentIssueContext[] = recentIssuesRaw
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .map((v) => ({
        issue_date: v.issue.issue_date,
        issue_no: v.issue.issue_no,
        items: v.items.map((it) => ({
          story_slug: it.story_slug ?? null,
          title: it.title,
          tags: it.tags ?? [],
          entities: it.entities ?? [],
          summary: it.summary,
          follow_up_of: it.follow_up_of ?? null,
        })),
      }));

    const system = buildDailyLlmNewsPrompt({
      todayKst: today,
      nowKstIso: nowKstDisplay(),
      nextIssueNo,
      recentIssues,
    });

    const { text, turns, cumulativeTokens, searchRequests } = await runUntilDone(apiKey, model, system, [
      {
        role: "user",
        content: "오늘자 브리핑을 만들어라. 지시된 출력 형식(JSON 객체 하나)만 답하라.",
      },
    ]);

    const parsed = extractJson(text) as {
      issue?: unknown;
      items?: unknown[];
      tool_updates?: unknown[];
    };
    if (!parsed.issue || !Array.isArray(parsed.items)) {
      throw new Error("파싱된 JSON에 issue/items가 없음");
    }

    const newsResult = await postJson(`${siteBase}/api/daily-news`, ingestToken, {
      issue: parsed.issue,
      items: parsed.items,
    });

    let toolUpdatesResult: { status: number; body: unknown } | null = null;
    if (Array.isArray(parsed.tool_updates) && parsed.tool_updates.length > 0) {
      toolUpdatesResult = await postJson(`${siteBase}/api/tool-updates`, ingestToken, {
        updates: parsed.tool_updates,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        issue_date: today,
        issue_no: nextIssueNo,
        items_count: parsed.items.length,
        tool_updates_count: parsed.tool_updates?.length ?? 0,
        anthropic_turns: turns,
        anthropic_cumulative_tokens: cumulativeTokens,
        anthropic_web_search_requests: searchRequests,
        daily_news: newsResult,
        tool_updates: toolUpdatesResult,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("daily-llm-news 실패:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
