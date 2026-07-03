import { useMemo, type ReactElement } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DailyItem, NewsCategory } from "@/types/news.types";
import { CATEGORY_ORDER } from "@/lib/categories";
import { compactToIso, isoToLabel, PUBLISH_HOUR } from "@/lib/date";
import { colors, fonts, MAX_READING } from "@/lib/theme";
import { useDailyIssue } from "@/hooks/useDailyIssue";
import { useUiStore } from "@/store/uiStore";
import { IssueHeader } from "@/components/IssueHeader";
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
  const insets = useSafeAreaInsets();
  const activeCategory = useUiStore((s) => s.activeCategory);
  const query = useDailyIssue(compactDate);

  const grouped = useMemo(() => groupByCategory(query.data?.items ?? []), [query.data]);

  const flatItems: DailyItem[] = useMemo(() => {
    const cats = activeCategory === null ? CATEGORY_ORDER.map((c) => c.key) : [activeCategory];
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
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 28, paddingBottom: insets.bottom + 56 }}
    >
      <View style={styles.column}>
        {notice !== undefined && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        )}

        <IssueHeader issue={issue} />

        {flatItems.length === 0 ? (
          <EmptyView />
        ) : (
          <>
            <View style={styles.tocHead}>
              <Text style={styles.tocLabel}>목차</Text>
              <Text style={styles.tocCount}>{flatItems.length}건</Text>
            </View>
            <View style={styles.list}>
              {flatItems.map((item, i) => (
                <NewsItemCard key={item.id ?? `${item.source_url}-${i}`} item={item} index={i + 1} />
              ))}
            </View>
          </>
        )}

        {issue.outro !== null && issue.outro.trim().length > 0 && (
          <View style={styles.outroWrap}>
            <Text style={styles.divider}>· · ·</Text>
            <Text style={styles.outro}>{issue.outro}</Text>
          </View>
        )}

        <View style={styles.colophon}>
          <Text style={styles.colophonText}>
            daily-newx · 매일 오전 {PUBLISH_HOUR}시 발행 · 원문 출처 표기
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  column: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 20 },
  notice: { marginBottom: 20, backgroundColor: colors.spotTint, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12 },
  noticeText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.spot },
  tocHead: { marginTop: 32, marginBottom: 2, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  tocLabel: { fontFamily: fonts.sans, fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.inkMuted },
  tocCount: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 0.5, color: colors.inkMuted },
  list: { marginTop: 0 },
  outroWrap: { marginTop: 48 },
  divider: { marginBottom: 16, textAlign: "center", fontFamily: fonts.serif, fontSize: 16, color: colors.inkMuted },
  outro: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 31, color: colors.inkSoft },
  colophon: { marginTop: 48, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: 20 },
  colophonText: { textAlign: "center", fontFamily: fonts.sans, fontSize: 11, letterSpacing: 0.5, color: colors.inkMuted },
});
