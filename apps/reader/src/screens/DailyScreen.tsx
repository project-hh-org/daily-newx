import { useMemo, type ReactElement } from "react";
import { ScrollView, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DailyItem, NewsCategory } from "@/types/news.types";
import { CATEGORY_ORDER, type CategoryMeta } from "@/lib/categories";
import { compactToIso, isoToLabel } from "@/lib/date";
import { useDailyIssue } from "@/hooks/useDailyIssue";
import { useUiStore } from "@/store/uiStore";
import { IssueHeader } from "@/components/IssueHeader";
import { NewsItemCard } from "@/components/NewsItemCard";
import {
  LoadingView,
  ErrorView,
  EmptyView,
  NotFoundView,
} from "@/components/StateViews";
import { NotFoundError } from "@/services/dailyNewsApi";

type Props = {
  compactDate: string;
};

function groupByCategory(
  items: readonly DailyItem[],
): Record<NewsCategory, DailyItem[]> {
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

export function DailyScreen({ compactDate }: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const activeCategory = useUiStore((s) => s.activeCategory);
  const query = useDailyIssue(compactDate);

  const grouped = useMemo(
    () => groupByCategory(query.data?.items ?? []),
    [query.data],
  );

  const availableCategories: CategoryMeta[] = useMemo(
    () => CATEGORY_ORDER.filter((c) => grouped[c.key].length > 0),
    [grouped],
  );

  // 단일 흐름: 카테고리 우선순위 → position 순으로 평탄화. (필터 적용)
  const flatItems: DailyItem[] = useMemo(() => {
    const cats =
      activeCategory === null
        ? CATEGORY_ORDER.map((c) => c.key)
        : [activeCategory];
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
    <ScrollView
      className="flex-1 bg-paper dark:bg-[#14110E]"
      contentContainerStyle={{ paddingTop: insets.top + 28, paddingBottom: insets.bottom + 56 }}
    >
      <View className="mx-auto w-full max-w-reading px-5">
        <IssueHeader issue={issue} availableCategories={availableCategories} />

        {flatItems.length === 0 ? (
          <EmptyView />
        ) : (
          <View className="mt-10 gap-5">
            {flatItems.map((item, i) => (
              <NewsItemCard key={item.id ?? `${item.source_url}-${i}`} item={item} index={i + 1} />
            ))}
          </View>
        )}

        {issue.outro !== null && issue.outro.trim().length > 0 && (
          <View className="mt-14">
            <Text className="mb-4 text-center font-serif text-base text-ink-muted dark:text-[#8C8475]">
              · · ·
            </Text>
            <Text className="font-serif text-lead text-ink-soft dark:text-[#C9C1B2]">
              {issue.outro}
            </Text>
          </View>
        )}

        <View className="mt-14 border-t border-rule pt-5 dark:border-[#2A251F]">
          <Text className="text-center font-sans text-[11px] uppercase tracking-kicker text-ink-muted dark:text-[#8C8475]">
            매일의 LLM 뉴스   ·   {label}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
