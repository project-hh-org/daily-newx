import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  fetchDailyIssue,
  fetchArticle,
  fetchTimeline,
  fetchIssues,
  fetchFacets,
  fetchStory,
  fetchToolUpdates,
  fetchToolCatalog,
  NotFoundError,
} from "@/services/dailyNewsApi";
import type {
  DailyPayload,
  Article,
  TimelineResponse,
  TimelineAxis,
  IssueSummary,
  Facet,
  FacetKind,
  StoryResponse,
  ToolUpdate,
  ToolCatalogEntry,
} from "@/types/news.types";

const retryNon404 = (failureCount: number, error: Error): boolean => {
  if (error instanceof NotFoundError) return false;
  return failureCount < 2;
};

export const dailyIssueKey = (compactDate: string): readonly [string, string] =>
  ["daily-issue", compactDate] as const;

export function useDailyIssue(compactDate: string): UseQueryResult<DailyPayload, Error> {
  return useQuery<DailyPayload, Error>({
    queryKey: dailyIssueKey(compactDate),
    queryFn: () => fetchDailyIssue(compactDate),
    enabled: /^\d{8}$/.test(compactDate),
    staleTime: 5 * 60 * 1000,
    retry: retryNon404,
  });
}

export function useArticle(id: string): UseQueryResult<Article, Error> {
  return useQuery<Article, Error>({
    queryKey: ["article", id] as const,
    queryFn: () => fetchArticle(id),
    enabled: id.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: retryNon404,
  });
}

export function useTimeline(
  axis: TimelineAxis,
  value: string,
): UseQueryResult<TimelineResponse, Error> {
  return useQuery<TimelineResponse, Error>({
    queryKey: ["timeline", axis, value] as const,
    queryFn: () => fetchTimeline(axis, value),
    enabled: value.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: retryNon404,
  });
}

export function useIssues(): UseQueryResult<IssueSummary[], Error> {
  return useQuery<IssueSummary[], Error>({
    queryKey: ["issues"] as const,
    queryFn: () => fetchIssues(),
    staleTime: 5 * 60 * 1000,
    retry: retryNon404,
  });
}

export function useFacets(kind: FacetKind): UseQueryResult<Facet[], Error> {
  return useQuery<Facet[], Error>({
    queryKey: ["facets", kind] as const,
    queryFn: () => fetchFacets(kind),
    staleTime: 5 * 60 * 1000,
    retry: retryNon404,
  });
}

export function useToolUpdates(
  toolKeys: readonly string[],
): UseQueryResult<ToolUpdate[], Error> {
  const sorted = [...toolKeys].sort();
  return useQuery<ToolUpdate[], Error>({
    queryKey: ["tool-updates", sorted.join(",")] as const,
    queryFn: () => fetchToolUpdates(sorted),
    enabled: sorted.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: retryNon404,
  });
}

/**
 * 도구 카탈로그(활성분) — "내 도구" 설정/피드 화면의 선택 대상 목록.
 * 자주 안 바뀌는 데이터라 staleTime을 길게(1시간) 잡는다.
 */
export function useToolCatalog(): UseQueryResult<ToolCatalogEntry[], Error> {
  return useQuery<ToolCatalogEntry[], Error>({
    queryKey: ["tool-catalog"] as const,
    queryFn: () => fetchToolCatalog(),
    staleTime: 60 * 60 * 1000,
    retry: retryNon404,
  });
}

export function useStory(slug: string | null): UseQueryResult<StoryResponse, Error> {
  return useQuery<StoryResponse, Error>({
    queryKey: ["story", slug ?? ""] as const,
    queryFn: () => fetchStory(slug ?? ""),
    enabled: slug !== null && slug.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: retryNon404,
  });
}
