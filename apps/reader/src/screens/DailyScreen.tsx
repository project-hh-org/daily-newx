import { useMemo, type ReactElement } from "react";
import { View } from "react-native";
import type { DailyItem, NewsCategory } from "@/types/news.types";
import { CATEGORY_ORDER } from "@/lib/categories";
import { compactToIso, isoToLabel, PUBLISH_HOUR } from "@/lib/date";
import { useColors, radius, space } from "@/lib/theme";
import { useDailyIssue } from "@/hooks/useDailyIssue";
import { useUiStore } from "@/store/uiStore";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { IssueHeader } from "@/components/IssueHeader";
import { ToolsBanner } from "@/components/ToolsBanner";
import { AppInstallBanner } from "@/components/AppInstallBanner";
import { NewsItemCard } from "@/components/NewsItemCard";
import { LoadingView, ErrorView, EmptyView, NotFoundView } from "@/components/StateViews";
import { NotFoundError } from "@/services/dailyNewsApi";

type Props = {
  compactDate: string;
  notice?: string; // 발행 전/없음 등 상단 안내 배너
};

function groupByCategory(items: readonly DailyItem[]): Record<NewsCategory, DailyItem[]> {
  const groups: Record<NewsCategory, DailyItem[]> = {
    headline: [],
    release: [],
    paper: [],
    community: [],
    business: [],
  };
  for (const it of items) {
    groups[it.category].push(it);
  }
  for (const key of Object.keys(groups) as NewsCategory[]) {
    groups[key].sort((a, b) => a.position - b.position);
  }
  return groups;
}

export function DailyScreen({ compactDate, notice }: Props): ReactElement {
  const c = useColors();
  const activeCategory = useUiStore((s) => s.activeCategory);
  const query = useDailyIssue(compactDate);

  const grouped = useMemo(() => groupByCategory(query.data?.items ?? []), [query.data]);

  const flatItems: DailyItem[] = useMemo(() => {
    const cats = activeCategory === null ? CATEGORY_ORDER.map((cat) => cat.key) : [activeCategory];
    return cats.flatMap((key) => grouped[key]);
  }, [grouped, activeCategory]);

  const iso = compactToIso(compactDate);
  const label = iso !== undefined ? isoToLabel(iso) : compactDate;

  if (query.isPending) return <LoadingView />;
  if (query.error instanceof NotFoundError) return <NotFoundView label={label} />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const data = query.data;
  if (data === undefined) return <LoadingView />;
  const { issue } = data;

  return (
    <Screen>
      <AppInstallBanner />

      {notice !== undefined && (
        <View
          style={{
            marginBottom: space.xl,
            backgroundColor: c.accentTint,
            borderRadius: radius.md,
            paddingHorizontal: space.lg,
            paddingVertical: space.md,
          }}
        >
          <Type variant="meta" tone="inkSoft">
            {notice}
          </Type>
        </View>
      )}

      <IssueHeader issue={issue} />

      <ToolsBanner />

      {flatItems.length === 0 ? (
        <EmptyView />
      ) : (
        <>
          <View
            style={{
              marginTop: space.xxl,
              marginBottom: space.sm,
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Type variant="label" tone="inkMuted">
              목차
            </Type>
            <Type variant="meta" tone="inkMuted">{`${flatItems.length}건`}</Type>
          </View>
          <View>
            {flatItems.map((item, i) => (
              <NewsItemCard
                key={item.id ?? `${item.source_url}-${i}`}
                item={item}
                index={i + 1}
                first={i === 0}
              />
            ))}
          </View>
        </>
      )}

      {issue.outro !== null && issue.outro.trim().length > 0 && (
        <View style={{ marginTop: space.xxxl }}>
          <Type variant="meta" tone="inkMuted" style={{ textAlign: "center", marginBottom: space.lg }}>
            · · ·
          </Type>
          <Type variant="body" tone="inkSoft">
            {issue.outro}
          </Type>
        </View>
      )}

      <View style={{ marginTop: space.xxxl, borderTopWidth: 1, borderTopColor: c.rule, paddingTop: space.lg }}>
        <Type variant="caption" tone="inkMuted" style={{ textAlign: "center" }}>
          {`브리핑 LLM · 매일 오전 ${PUBLISH_HOUR}시 발행 · 원문 출처 표기`}
        </Type>
      </View>
    </Screen>
  );
}
