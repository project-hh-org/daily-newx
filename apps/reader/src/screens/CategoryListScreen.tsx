import type { ReactElement } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { CATEGORY_ORDER } from "@/lib/categories";
import { space } from "@/lib/theme";
import { Screen } from "@/ui/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";
import { useBackOr } from "@/hooks/useBackOr";

export function CategoryListScreen(): ReactElement {
  const router = useRouter();
  const backOr = useBackOr();

  return (
    <Screen>
      <ScreenHeader
        kicker="둘러보기"
        title="카테고리"
        subtitle={`${CATEGORY_ORDER.length}개 분류`}
        crumb={{ label: "오늘", onPress: () => backOr("/") }}
      />
      <View style={{ marginTop: space.xl }}>
        {CATEGORY_ORDER.map((cat) => (
          <ListRow
            key={cat.key}
            title={cat.label}
            subtitle={cat.blurb}
            onPress={() => router.push(`/timeline/category/${cat.key}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
