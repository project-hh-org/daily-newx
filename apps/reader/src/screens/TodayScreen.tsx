import type { ReactElement } from "react";
import { todayCompact, isoToCompact, isBeforePublishTime, PUBLISH_HOUR } from "@/lib/date";
import { useDailyIssue, useIssues } from "@/hooks/useDailyIssue";
import { NotFoundError } from "@/services/dailyNewsApi";
import { DailyScreen } from "@/screens/DailyScreen";
import { LoadingView, ErrorView, EmptyView } from "@/components/StateViews";

/**
 * 첫 페이지 = 오늘 호.
 * - 오늘 호가 발행됐으면 그대로.
 * - 없으면: 정식 발행 시각 전이면 "발행 예정", 지났으면 "발행된 호 없음" 안내 + 가장 최신 호 노출.
 */
export function TodayScreen(): ReactElement {
  const today = todayCompact();
  const todayQuery = useDailyIssue(today);
  const issuesQuery = useIssues();

  // 1) 오늘 호 정상 → 그대로
  if (todayQuery.data !== undefined) return <DailyScreen compactDate={today} />;

  const todayMissing = todayQuery.error instanceof NotFoundError;

  // 2) 오늘 호 로딩 중
  if (todayQuery.isPending) return <LoadingView />;

  // 3) 404 외 다른 에러
  if (todayQuery.error !== null && !todayMissing) {
    return <ErrorView message={todayQuery.error.message} onRetry={() => void todayQuery.refetch()} />;
  }

  // 4) 오늘 호 없음 → 최신 호 폴백
  if (issuesQuery.isPending) return <LoadingView />;
  if (issuesQuery.error !== null) {
    return <ErrorView message={issuesQuery.error.message} onRetry={() => void issuesQuery.refetch()} />;
  }

  const issues = issuesQuery.data ?? [];
  const latest = [...issues].sort((a, b) => b.issue_date.localeCompare(a.issue_date))[0];
  if (latest === undefined) return <EmptyView />;

  const notice = isBeforePublishTime()
    ? `오늘 브리핑은 오전 ${PUBLISH_HOUR}시에 발행 예정이에요. 우선 최신 브리핑을 보여드릴게요.`
    : "오늘 발행된 브리핑이 아직 없어요. 우선 최신 브리핑을 보여드릴게요.";

  const latestCompact = isoToCompact(latest.issue_date) ?? today;
  return <DailyScreen compactDate={latestCompact} notice={notice} />;
}
