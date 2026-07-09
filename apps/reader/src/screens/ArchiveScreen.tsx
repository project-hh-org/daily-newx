import type { ReactElement } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { isoToLabel, isoToCompact } from "@/lib/date";
import { space } from "@/lib/theme";
import { useIssues } from "@/hooks/useDailyIssue";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";
import { LoadingView, ErrorView } from "@/components/StateViews";
import { useBackOr } from "@/hooks/useBackOr";

export function ArchiveScreen(): ReactElement {
  const router = useRouter();
  const backOr = useBackOr();
  const query = useIssues();

  if (query.isPending) return <LoadingView />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const issues = query.data ?? [];

  return (
    <Screen>
      <ScreenHeader
        kicker="아카이브"
        title="지난 브리핑"
        subtitle={`${issues.length}개 브리핑`}
        crumb={{ label: "오늘", onPress: () => backOr("/") }}
      />
      {issues.length === 0 ? (
        <Type variant="body" tone="inkMuted" style={{ marginTop: 40, textAlign: "center" }}>
          게시된 브리핑이 아직 없습니다.
        </Type>
      ) : (
        <View style={{ marginTop: space.xl }}>
          {issues.map((issue, i) => {
            const compact = isoToCompact(issue.issue_date);
            return (
              <ListRow
                key={issue.issue_date}
                first={i === 0}
                title={isoToLabel(issue.issue_date)}
                subtitle={issue.intro ?? undefined}
                meta={issue.issue_no !== null ? `${issue.issue_no}번째 브리핑` : undefined}
                onPress={() => router.push(compact !== undefined ? `/daily/${compact}` : "/")}
              />
            );
          })}
        </View>
      )}
    </Screen>
  );
}
