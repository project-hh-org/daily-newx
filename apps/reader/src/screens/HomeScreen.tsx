import type { ReactElement } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { todayCompact, compactToIso, isoToLabel } from "@/lib/date";
import { space } from "@/lib/theme";
import { Screen } from "@/ui/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";

export function HomeScreen(): ReactElement {
  const router = useRouter();
  const today = todayCompact();
  const iso = compactToIso(today);
  const todayLabel = iso !== undefined ? isoToLabel(iso) : today;

  return (
    <Screen>
      <ScreenHeader kicker="매일의 LLM 뉴스" title="데일리 LLM 뉴스" subtitle="오늘의 LLM 소식" />
      <View style={{ marginTop: space.xxl }}>
        <ListRow title="오늘 브리핑" meta={todayLabel} onPress={() => router.push(`/daily/${today}`)} />
        <ListRow title="카테고리" subtitle="헤드라인·릴리스·연구·커뮤니티·산업" onPress={() => router.push("/categories")} />
        <ListRow title="키워드" subtitle="토픽 태그로 모아보기" onPress={() => router.push("/topics")} />
        <ListRow title="대상" subtitle="기업·모델·인물로 모아보기" onPress={() => router.push("/entities")} />
        <ListRow title="지난 브리핑" subtitle="날짜별 아카이브" onPress={() => router.push("/archive")} />
      </View>
    </Screen>
  );
}
