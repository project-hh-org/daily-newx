import type { ReactElement } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, fonts } from "@/lib/theme";
import { useToolsStore } from "@/store/toolsStore";
import { useToolUpdates } from "@/hooks/useDailyIssue";

/** 데일리 호 상단의 "내 도구" 요약 배너 → 전용 화면 이동. */
export function ToolsBanner(): ReactElement | null {
  const router = useRouter();
  const selected = useToolsStore((s) => s.selected);
  const hasHydrated = useToolsStore((s) => s.hasHydrated);
  const query = useToolUpdates(selected);

  if (!hasHydrated) return null;

  const empty = selected.length === 0;
  const count = query.data?.length ?? 0;
  const latest = query.data?.[0];

  const text = empty
    ? "쓰는 도구를 골라 최신 업데이트 받기"
    : count === 0
      ? "선택한 도구의 업데이트 보기"
      : `업데이트 ${count}건${latest ? ` · ${latest.title}` : ""}`;

  return (
    <Pressable
      onPress={() => router.push("/tools")}
      accessibilityRole="link"
      accessibilityLabel="내 도구 업데이트 보기"
      style={styles.wrap}
    >
      <Text style={styles.kicker}>내 도구</Text>
      <Text style={styles.text} numberOfLines={1}>
        {text}
      </Text>
      <Text style={styles.go}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.spotTint,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  kicker: { fontFamily: fonts.sans, fontSize: 10, fontWeight: "700", letterSpacing: 1, color: colors.spot },
  text: { flex: 1, fontFamily: fonts.sans, fontSize: 13, color: colors.ink },
  go: { fontFamily: fonts.sans, fontSize: 16, color: colors.spot },
});
