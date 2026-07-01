import type { ReactElement } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { FacetKind } from "@/types/news.types";
import { colors, fonts, MAX_READING } from "@/lib/theme";
import { useFacets } from "@/hooks/useDailyIssue";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";
import { LoadingView, ErrorView } from "@/components/StateViews";
import { useBackOr } from "@/hooks/useBackOr";

type Props = {
  kind: FacetKind; // tag | entity
};

const KIND_LABEL: Record<FacetKind, string> = { tag: "주제", entity: "주체" };

export function FacetListScreen({ kind }: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backOr = useBackOr();
  const query = useFacets(kind);

  if (query.isPending) return <LoadingView />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const facets = query.data ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 56 }}
    >
      <View style={styles.column}>
        <ScreenHeader
          kicker="둘러보기"
          title={KIND_LABEL[kind]}
          subtitle={`${facets.length}개`}
          crumb={{ label: "오늘", onPress: () => backOr("/") }}
        />
        {facets.length === 0 ? (
          <Text style={styles.empty}>아직 모인 항목이 없습니다.</Text>
        ) : (
          <View style={styles.list}>
            {facets.map((f) => (
              <ListRow
                key={f.value}
                title={f.value}
                meta={`${f.count}건`}
                onPress={() => router.push(`/timeline/${kind}/${encodeURIComponent(f.value)}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  column: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 20 },
  list: { marginTop: 24 },
  empty: { marginTop: 40, textAlign: "center", fontFamily: fonts.serif, fontSize: 16, color: colors.inkMuted },
});
