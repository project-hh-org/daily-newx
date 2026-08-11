import { API_BASE, USE_FIXTURE } from "@/services/config";
import { getFixture } from "@/services/fixture";
import {
  dailyPayloadSchema,
  articleSchema,
  timelineResponseSchema,
  issuesResponseSchema,
  facetsResponseSchema,
  storyResponseSchema,
  toolUpdatesResponseSchema,
  toolCatalogResponseSchema,
  type DailyPayload,
  type Article,
  type TimelineResponse,
  type TimelineAxis,
  type IssueSummary,
  type Facet,
  type FacetKind,
  type StoryResponse,
  type ToolUpdate,
  type ToolCatalogEntry,
} from "@/types/news.types";

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`찾을 수 없습니다: ${what}`);
    this.name = "NotFoundError";
  }
}

async function getJson(url: string, notFoundLabel: string): Promise<unknown> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (res.status === 404) throw new NotFoundError(notFoundLabel);
  if (!res.ok) throw new Error(`조회 실패 (HTTP ${res.status})`);
  return (await res.json()) as unknown;
}

/**
 * 하루치 호 조회. USE_FIXTURE=1 이면 번들 fixture(오프라인).
 */
export async function fetchDailyIssue(compactDate: string): Promise<DailyPayload> {
  if (USE_FIXTURE) {
    const fx = getFixture(compactDate);
    if (fx === undefined) throw new NotFoundError(compactDate);
    return dailyPayloadSchema.parse(fx);
  }
  const json = await getJson(`${API_BASE}/api/daily-news/${compactDate}`, compactDate);
  return dailyPayloadSchema.parse(json);
}

/**
 * 아티클 단건. 횡단/단건 기능은 DB 기반이라 항상 실제 API 사용(fixture 미지원).
 */
export async function fetchArticle(id: string): Promise<Article> {
  const json = await getJson(`${API_BASE}/api/article/${id}`, id);
  return articleSchema.parse(json);
}

/**
 * 타임라인 — 같은 축(category|tag|entity)의 값을 일자 내림차순으로.
 */
export async function fetchTimeline(
  axis: TimelineAxis,
  value: string,
): Promise<TimelineResponse> {
  const url = `${API_BASE}/api/timeline/${axis}/${encodeURIComponent(value)}`;
  const json = await getJson(url, `${axis}:${value}`);
  return timelineResponseSchema.parse(json);
}

/** 게시된 호 목록 (아카이브). */
export async function fetchIssues(): Promise<IssueSummary[]> {
  const json = await getJson(`${API_BASE}/api/issues`, "issues");
  return issuesResponseSchema.parse(json).issues;
}

/** distinct tags/entities + 개수 (주제/주체 리스트). */
export async function fetchFacets(kind: FacetKind): Promise<Facet[]> {
  const json = await getJson(`${API_BASE}/api/facets/${kind}`, `facets:${kind}`);
  return facetsResponseSchema.parse(json).facets;
}

/** 스토리 스레드 — 같은 이야기 흐름. */
export async function fetchStory(slug: string): Promise<StoryResponse> {
  const json = await getJson(`${API_BASE}/api/story/${encodeURIComponent(slug)}`, `story:${slug}`);
  return storyResponseSchema.parse(json);
}

/** 선택 도구들의 최신 업데이트(최근 N일). 선택 없으면 빈 배열. */
export async function fetchToolUpdates(toolKeys: readonly string[]): Promise<ToolUpdate[]> {
  if (toolKeys.length === 0) return [];
  const qs = encodeURIComponent(toolKeys.join(","));
  const json = await getJson(`${API_BASE}/api/tool-updates?tools=${qs}`, "tool-updates");
  return toolUpdatesResponseSchema.parse(json).updates;
}

/**
 * 도구 카탈로그(활성분만) — "내 도구" 설정/피드 화면의 선택 대상 목록.
 * 2026-07-27부터 DB 조회로 전환(이전엔 lib/toolCatalog.ts 하드코딩 배열).
 */
export async function fetchToolCatalog(): Promise<ToolCatalogEntry[]> {
  const json = await getJson(`${API_BASE}/api/tool-catalog`, "tool-catalog");
  return toolCatalogResponseSchema.parse(json).catalog;
}
