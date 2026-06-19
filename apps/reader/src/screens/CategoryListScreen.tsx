import type { ReactElement } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CATEGORY_ORDER } from "@/lib/categories";
import { colors, MAX_READING } from "@/lib/theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";

export function CategoryListScreen(): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 56 }}
    >
      <View style={styles.column}>
        <ScreenHeader
          kicker="둘러보기"
          title="카테고리"
          subtitle={`${CATEGORY_ORDER.length}개 분류`}
          crumb={{ label: "홈", onPress: () => router.push("/") }}
        />
        <View style={styles.list}>
          {CATEGORY_ORDER.map((c) => (
            <ListRow
              key={c.key}
              title={c.label}
              subtitle={c.blurb}
              onPress={() => router.push(`/timeline/category/${c.key}`)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  column: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 20 },
  list: { marginTop: 24 },
});
