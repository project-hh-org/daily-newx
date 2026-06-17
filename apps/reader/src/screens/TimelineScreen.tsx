import type { ReactElement } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  newsCategorySchema,
  type Article,
  type TimelineAxis,
} from "@/types/news.types";
import { isoToLabel } from "@/lib/date";
import { categoryLabel } from "@/lib/categories";
import { useTimeline } from "@/hooks/useDailyIssue";
import { LoadingView, ErrorView, NotFoundView } from "@/components/StateViews";
import { NotFoundError } from "@/services/dailyNewsApi";

type Props = {
  axis: TimelineAxis;
  value: string;
};

const AXIS_LABEL: Record<TimelineAxis, string> = {
  category: "카테고리",
  tag: "주제",
  entity: "주체",
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
}: {
  item: Article;
  showDate: boolean;
}): ReactElement {
  const router = useRouter();
  return (
    <View>
      {showDate && (
        <Text className="mb-3 mt-8 font-sans text-[11px] uppercase tracking-kicker text-ink-muted dark:text-[#8C8475]">
          {isoToLabel(item.issue_date)}
        </Text>
      )}
      <Pressable
        onPress={() => router.push(`/article/${item.id}`)}
        accessibilityRole="link"
        className="border-t border-rule pt-4 dark:border-[#2A251F]"
      >
        <Text className="font-serif text-xl leading-7 text-ink dark:text-[#ECE6DA]">
          {item.title}
        </Text>
        {item.tldr !== null && item.tldr.trim().length > 0 && (
          <Text className="mt-1.5 font-sans text-[15px] leading-6 text-ink-muted dark:text-[#8C8475]">
            {item.tldr}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export function TimelineScreen({ axis, value }: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
    <ScrollView
      className="flex-1 bg-paper dark:bg-[#14110E]"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 56 }}
    >
      <View className="mx-auto w-full max-w-reading px-5">
        <Pressable onPress={() => router.push("/")} accessibilityRole="link">
          <Text className="font-sans text-[12px] uppercase tracking-kicker text-accent">
            ‹ 오늘의 호
          </Text>
        </Pressable>

        <View className="mt-4 border-b-2 border-ink pb-4 dark:border-[#ECE6DA]">
          <Text className="font-sans text-[11px] uppercase tracking-kicker text-ink-muted dark:text-[#8C8475]">
            타임라인 · {AXIS_LABEL[axis]}
          </Text>
          <Text className="mt-2 font-serif text-[34px] leading-[40px] text-ink dark:text-[#ECE6DA]">
            {displayValue(axis, value)}
          </Text>
          <Text className="mt-2 font-sans text-sm text-ink-muted dark:text-[#8C8475]">
            {items.length}건 · 최신순
          </Text>
        </View>

        {items.length === 0 ? (
          <Text className="mt-10 text-center font-serif text-base text-ink-muted dark:text-[#8C8475]">
            아직 모인 항목이 없습니다.
          </Text>
        ) : (
          items.map((item) => {
            const showDate = item.issue_date !== lastDate;
            lastDate = item.issue_date;
            return <TimelineEntry key={item.id} item={item} showDate={showDate} />;
          })
        )}
      </View>
    </ScrollView>
  );
}
