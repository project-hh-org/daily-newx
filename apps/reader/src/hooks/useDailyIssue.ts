import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  fetchDailyIssue,
  fetchArticle,
  fetchTimeline,
  NotFoundError,
} from "@/services/dailyNewsApi";
import type {
  DailyPayload,
  Article,
  TimelineResponse,
  TimelineAxis,
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
