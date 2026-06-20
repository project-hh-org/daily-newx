import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  fetchDailyIssue,
  fetchArticle,
  fetchTimeline,
  fetchIssues,
  fetchFacets,
  fetchStory,
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

export function useStory(slug: string | null): UseQueryResult<StoryResponse, Error> {
  return useQuery<StoryResponse, Error>({
    queryKey: ["story", slug ?? ""] as const,
    queryFn: () => fetchStory(slug ?? ""),
    enabled: slug !== null && slug.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: retryNon404,
  });
}
