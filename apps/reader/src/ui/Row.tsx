import { useState, type ReactElement, type ReactNode } from "react";
import { View, Pressable } from "react-native";
import { useColors, space } from "@/lib/theme";
import { Type } from "./Type";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  first?: boolean; // 첫 행 상단 헤어라인 제거
  accessibilityLabel?: string;
};

/** 설정/목록 행 — 제목·부제 + 우측 액세서리 + (탭 가능시) 셰브론. 상단 헤어라인. */
export function Row({ title, subtitle, right, onPress, first = false, accessibilityLabel }: Props): ReactElement {
  const c = useColors();
  const [hover, setHover] = useState(false);
  const interactive = onPress !== undefined;
  return (
    <Pressable
      onPress={onPress}
      disabled={!interactive}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityRole={interactive ? "button" : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        paddingVertical: space.md,
        paddingHorizontal: space.sm,
        marginHorizontal: -space.sm,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: c.rule,
        backgroundColor: interactive && hover ? c.surface : "transparent",
        cursor: interactive ? "pointer" : undefined,
      }}
    >
      <View style={{ flex: 1 }}>
        <Type variant="body">{title}</Type>
        {subtitle !== undefined && (
          <Type variant="meta" tone="inkMuted" style={{ marginTop: 2 }}>
            {subtitle}
          </Type>
        )}
      </View>
      {right}
      {interactive && (
        <Type variant="body" tone="inkMuted">
          {"›"}
        </Type>
      )}
    </Pressable>
  );
}
