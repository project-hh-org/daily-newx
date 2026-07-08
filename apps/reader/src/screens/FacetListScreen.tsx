import type { ReactElement } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import type { FacetKind } from "@/types/news.types";
import { space } from "@/lib/theme";
import { useFacets } from "@/hooks/useDailyIssue";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";
import { LoadingView, ErrorView } from "@/components/StateViews";
import { useBackOr } from "@/hooks/useBackOr";

type Props = {
  kind: FacetKind; // tag | entity
};

const KIND_LABEL: Record<FacetKind, string> = { tag: "키워드", entity: "대상" };

export function FacetListScreen({ kind }: Props): ReactElement {
  const router = useRouter();
  const backOr = useBackOr();
  const query = useFacets(kind);

  if (query.isPending) return <LoadingView />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const facets = query.data ?? [];

  return (
    <Screen>
      <ScreenHeader
        kicker="둘러보기"
        title={KIND_LABEL[kind]}
        subtitle={`${facets.length}개`}
        crumb={{ label: "오늘", onPress: () => backOr("/") }}
      />
      {facets.length === 0 ? (
        <Type variant="body" tone="inkMuted" style={{ marginTop: 40, textAlign: "center" }}>
          아직 모인 항목이 없습니다.
        </Type>
      ) : (
        <View style={{ marginTop: space.xl }}>
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
    </Screen>
  );
}
