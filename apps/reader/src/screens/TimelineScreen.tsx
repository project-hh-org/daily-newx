import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { newsCategorySchema, type Article, type TimelineAxis } from "@/types/news.types";
import { isoToLabel } from "@/lib/date";
import { categoryLabel } from "@/lib/categories";
import { useColors, space } from "@/lib/theme";
import { useTimeline } from "@/hooks/useDailyIssue";
import { useBackOr } from "@/hooks/useBackOr";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingView, ErrorView, NotFoundView } from "@/components/StateViews";
import { NotFoundError } from "@/services/dailyNewsApi";

type Props = {
  axis: TimelineAxis;
  value: string;
};

const AXIS_LABEL: Record<TimelineAxis, string> = {
  category: "카테고리",
  tag: "키워드",
  entity: "대상",
};

function displayValue(axis: TimelineAxis, value: string): string {
  if (axis === "category") {
    const parsed = newsCategorySchema.safeParse(value);
    if (parsed.success) return categoryLabel(parsed.data);
  }
  return value;
}

function TimelineEntry({
  item,
  showDate,
  first,
}: {
  item: Article;
  showDate: boolean;
  first: boolean;
}): ReactElement {
  const router = useRouter();
  const c = useColors();
  return (
    <View>
      {showDate && (
        <Type variant="label" tone="inkMuted" style={{ marginTop: space.xxl, marginBottom: space.md }}>
          {isoToLabel(item.issue_date)}
        </Type>
      )}
      <Pressable
        onPress={() => router.push(`/article/${item.id}`)}
        accessibilityRole="link"
        style={{
          borderTopWidth: first ? 0 : 1,
          borderTopColor: c.rule,
          paddingTop: space.lg,
          cursor: "pointer",
        }}
      >
        <Type variant="h2">{item.title}</Type>
        {item.tldr !== null && item.tldr.trim().length > 0 && (
          <Type variant="body" tone="inkMuted" style={{ marginTop: space.xs }}>
            {item.tldr}
          </Type>
        )}
      </Pressable>
    </View>
  );
}

export function TimelineScreen({ axis, value }: Props): ReactElement {
  const backOr = useBackOr();
  const query = useTimeline(axis, value);

  if (query.isPending) return <LoadingView />;
  if (query.error instanceof NotFoundError) return <NotFoundView label="타임라인" />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const data = query.data;
  if (data === undefined) return <LoadingView />;

  const items = data.items;
  let lastDate = "";

  return (
    <Screen>
      <ScreenHeader
        kicker={`타임라인 · ${AXIS_LABEL[axis]}`}
        title={displayValue(axis, value)}
        subtitle={`${items.length}건 · 최신순`}
        crumb={{ label: "오늘 브리핑", onPress: () => backOr("/") }}
      />

      {items.length === 0 ? (
        <Type variant="body" tone="inkMuted" style={{ marginTop: 40, textAlign: "center" }}>
          아직 모인 항목이 없습니다.
        </Type>
      ) : (
        items.map((item, i) => {
          const showDate = item.issue_date !== lastDate;
          lastDate = item.issue_date;
          return <TimelineEntry key={item.id} item={item} showDate={showDate} first={i === 0} />;
        })
      )}
    </Screen>
  );
}
