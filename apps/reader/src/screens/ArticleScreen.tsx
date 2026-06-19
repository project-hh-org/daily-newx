import type { ReactElement } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useArticle } from "@/hooks/useDailyIssue";
import { isoToLabel, isoToCompact } from "@/lib/date";
import { categoryLabel } from "@/lib/categories";
import { colors, fonts, MAX_READING } from "@/lib/theme";
import { OptionalField } from "@/components/OptionalField";
import { Bullets } from "@/components/Bullets";
import { SourceLine } from "@/components/SourceLine";
import { MetaFooter } from "@/components/MetaFooter";
import { LoadingView, ErrorView, NotFoundView } from "@/components/StateViews";
import { NotFoundError } from "@/services/dailyNewsApi";

type Props = {
  id: string;
};

export function ArticleScreen({ id }: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const query = useArticle(id);

  if (query.isPending) return <LoadingView />;
  if (query.error instanceof NotFoundError) return <NotFoundView label="아티클" />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const a = query.data;
  if (a === undefined) return <LoadingView />;

  const compact = isoToCompact(a.issue_date);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 56 }}
    >
      <View style={styles.column}>
        <Pressable
          onPress={() => router.push(compact !== undefined ? `/daily/${compact}` : "/")}
          accessibilityRole="link"
        >
          <Text style={styles.crumb}>
            ‹ {isoToLabel(a.issue_date)} · {categoryLabel(a.category)}
          </Text>
        </Pressable>

        <Text style={styles.title}>{a.title}</Text>

        {a.tldr !== null && a.tldr.trim().length > 0 && <Text style={styles.tldr}>{a.tldr}</Text>}

        <Text style={styles.summary}>{a.summary}</Text>

        <Bullets label="핵심 포인트" points={a.key_points} />
        <OptionalField label="얻는 것" value={a.what_you_get} />
        <OptionalField label="왜 지금" value={a.why_now} />
        <OptionalField label="지금 할 일" value={a.action} tone="action" />

        <SourceLine
          sourceName={a.source_name}
          sourceUrl={a.source_url}
          publishedAt={a.source_published_at}
          related={a.related}
        />

        <MetaFooter category={a.category} tags={a.tags} entities={a.entities} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  column: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 20 },
  crumb: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: colors.accent },
  title: { marginTop: 16, fontFamily: fonts.serif, fontSize: 30, lineHeight: 40, color: colors.ink },
  tldr: { marginTop: 12, fontFamily: fonts.serif, fontSize: 19, lineHeight: 31, color: colors.ink },
  summary: { marginTop: 16, fontFamily: fonts.sans, fontSize: 16, lineHeight: 27, color: colors.inkSoft },
});
