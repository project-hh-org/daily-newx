import type { ReactElement } from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useColors, radius, space } from "@/lib/theme";
import { useToolsStore } from "@/store/toolsStore";
import { useToolUpdates } from "@/hooks/useDailyIssue";
import { Type } from "@/ui/Type";

/** 데일리 호 상단의 "내 도구" 요약 배너 → 전용 화면(또는 미설정 시 선택)으로 이동. */
export function ToolsBanner(): ReactElement | null {
  const c = useColors();
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
      onPress={() => router.push(empty ? "/settings/tools" : "/tools")}
      accessibilityRole="link"
      accessibilityLabel="내 도구 업데이트 보기"
      style={{
        marginTop: space.lg,
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        backgroundColor: c.accentTint,
        borderRadius: radius.md,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        cursor: "pointer",
      }}
    >
      <Type variant="label" tone="accentDim">내 도구</Type>
      <Type variant="meta" tone="ink" numberOfLines={1} style={{ flex: 1 }}>
        {text}
      </Type>
      <Type variant="body" tone="accentDim">→</Type>
    </Pressable>
  );
}
