import type { ReactElement } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { newsCategorySchema, type Article, type TimelineAxis } from "@/types/news.types";
import { isoToLabel } from "@/lib/date";
import { categoryLabel } from "@/lib/categories";
import { colors, fonts, MAX_READING } from "@/lib/theme";
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

function TimelineEntry({ item, showDate }: { item: Article; showDate: boolean }): ReactElement {
  const router = useRouter();
  return (
    <View>
      {showDate && <Text style={styles.dateHead}>{isoToLabel(item.issue_date)}</Text>}
      <Pressable
        onPress={() => router.push(`/article/${item.id}`)}
        accessibilityRole="link"
        style={styles.entry}
      >
        <Text style={styles.entryTitle}>{item.title}</Text>
        {item.tldr !== null && item.tldr.trim().length > 0 && (
          <Text style={styles.entryTldr}>{item.tldr}</Text>
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
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 56 }}
    >
      <View style={styles.column}>
        <Pressable onPress={() => router.push("/")} accessibilityRole="link">
          <Text style={styles.crumb}>‹ 오늘의 호</Text>
        </Pressable>

        <View style={styles.masthead}>
          <Text style={styles.kicker}>타임라인 · {AXIS_LABEL[axis]}</Text>
          <Text style={styles.title}>{displayValue(axis, value)}</Text>
          <Text style={styles.count}>{items.length}건 · 최신순</Text>
        </View>

        {items.length === 0 ? (
          <Text style={styles.empty}>아직 모인 항목이 없습니다.</Text>
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

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  column: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 20 },
  crumb: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: colors.accent },
  masthead: { marginTop: 16, borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 16 },
  kicker: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkMuted },
  title: { marginTop: 8, fontFamily: fonts.serif, fontSize: 34, lineHeight: 40, color: colors.ink },
  count: { marginTop: 8, fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted },
  dateHead: { marginTop: 32, marginBottom: 12, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkMuted },
  entry: { borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: 16 },
  entryTitle: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 28, color: colors.ink },
  entryTldr: { marginTop: 6, fontFamily: fonts.sans, fontSize: 15, lineHeight: 24, color: colors.inkMuted },
  empty: { marginTop: 40, textAlign: "center", fontFamily: fonts.serif, fontSize: 16, color: colors.inkMuted },
});
