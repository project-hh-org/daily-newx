import type { ReactElement } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useArticle } from "@/hooks/useDailyIssue";
import { isoToLabel, isoToCompact } from "@/lib/date";
import { categoryLabel } from "@/lib/categories";
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
      className="flex-1 bg-paper dark:bg-[#14110E]"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 56 }}
    >
      <View className="mx-auto w-full max-w-reading px-5">
        {/* 브레드크럼: 이 호로 */}
        <Pressable
          onPress={() => router.push(compact !== undefined ? `/daily/${compact}` : "/")}
          accessibilityRole="link"
        >
          <Text className="font-sans text-[12px] uppercase tracking-kicker text-accent">
            ‹ {isoToLabel(a.issue_date)} · {categoryLabel(a.category)}
          </Text>
        </Pressable>

        <Text className="mt-4 font-serif text-[30px] leading-[40px] text-ink dark:text-[#ECE6DA]">
          {a.title}
        </Text>

        {a.tldr !== null && a.tldr.trim().length > 0 && (
          <Text className="mt-3 font-serif text-lead text-ink dark:text-[#ECE6DA]">
            {a.tldr}
          </Text>
        )}

        <Text className="mt-4 font-sans text-body text-ink-soft dark:text-[#C9C1B2]">
          {a.summary}
        </Text>

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
