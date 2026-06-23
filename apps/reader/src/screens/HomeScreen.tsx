import type { ReactElement } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { todayCompact, compactToIso, isoToLabel } from "@/lib/date";
import { colors, MAX_READING } from "@/lib/theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";

export function HomeScreen(): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = todayCompact();
  const iso = compactToIso(today);
  const todayLabel = iso !== undefined ? isoToLabel(iso) : today;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 28, paddingBottom: insets.bottom + 56 }}
    >
      <View style={styles.column}>
        <ScreenHeader
          kicker="매일의 LLM 뉴스"
          title="데일리 LLM 뉴스"
          subtitle="오늘의 LLM 소식"
        />
        <View style={styles.nav}>
          <ListRow title="오늘 호" meta={todayLabel} onPress={() => router.push(`/daily/${today}`)} />
          <ListRow title="카테고리" subtitle="헤드라인·릴리스·연구·커뮤니티·산업" onPress={() => router.push("/categories")} />
          <ListRow title="주제" subtitle="토픽 태그로 모아보기" onPress={() => router.push("/topics")} />
          <ListRow title="주체" subtitle="등장 주체(기업·모델·인물)로 모아보기" onPress={() => router.push("/entities")} />
          <ListRow title="지난 호" subtitle="날짜별 아카이브" onPress={() => router.push("/archive")} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  column: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 20 },
  nav: { marginTop: 32 },
});
