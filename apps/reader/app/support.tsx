import type { ReactElement } from "react";
import { ScrollView, View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, fonts, MAX_READING } from "@/lib/theme";

const CONTACT = "dahee@project-hh.com";

export default function Support(): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 64 }}
    >
      <View style={styles.col}>
        <Text style={styles.kicker}>브리핑 LLM</Text>
        <Text style={styles.h1}>지원</Text>
        <Text style={styles.meta}>매일 오전 9시, 오늘의 LLM 소식</Text>

        <Text style={styles.h2}>문의</Text>
        <Pressable onPress={() => void Linking.openURL(`mailto:${CONTACT}`)} accessibilityRole="link">
          <Text style={styles.link}>{CONTACT}</Text>
        </Pressable>

        <Text style={styles.h2}>자주 묻는 질문</Text>
        <Text style={styles.p}>
          알림이 오지 않아요 — 기기 설정 → 알림에서 브리핑 LLM 알림이 켜져 있는지 확인해 주세요. 새 소식은
          매일 오전 9시경 발행됩니다.
        </Text>
        <Text style={styles.p}>
          “내 도구” 업데이트가 비어 있어요 — 화면에서 사용하는 도구를 선택하면 매일 최신 업데이트가
          채워집니다.
        </Text>
        <Text style={styles.p}>내 정보를 삭제하고 싶어요 — 위 이메일로 요청하시면 처리해 드립니다.</Text>

        <Text style={styles.h2}>개인정보</Text>
        <Pressable onPress={() => router.push("/privacy")} accessibilityRole="link">
          <Text style={styles.link}>개인정보 처리방침</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  col: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 24 },
  kicker: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1, fontWeight: "700", color: colors.spot },
  h1: { marginTop: 8, fontFamily: fonts.serif, fontSize: 30, lineHeight: 40, color: colors.ink },
  meta: { marginTop: 6, fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
  h2: { marginTop: 28, fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  p: { marginTop: 8, fontFamily: fonts.sans, fontSize: 15, lineHeight: 25, color: colors.inkSoft },
  link: { marginTop: 8, fontFamily: fonts.sans, fontSize: 15, fontWeight: "600", color: colors.spot, cursor: "pointer" },
});
