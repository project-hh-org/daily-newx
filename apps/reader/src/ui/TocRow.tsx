import { useState, type ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useColors, space, fonts } from "@/lib/theme";
import { Type } from "./Type";

type Props = {
  index: number;
  title: string;
  kicker?: string;
  dek?: string;
  source?: string;
  first?: boolean; // 첫 행은 상단 헤어라인 제거(이중선 방지)
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** 목차 행(CLI 룩) — [01] 인덱스 · 키커 · 표제 · dek · › 출처. 상단 헤어라인(첫 행 제외). */
export function TocRow({
  index,
  title,
  kicker,
  dek,
  source,
  first = false,
  onPress,
  disabled = false,
  accessibilityLabel,
}: Props): ReactElement {
  const c = useColors();
  const [hover, setHover] = useState(false);
  const ord = String(index).padStart(2, "0");

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? title}
      style={{
        flexDirection: "row",
        gap: space.md,
        alignItems: "flex-start",
        paddingVertical: space.lg,
        paddingHorizontal: space.sm,
        marginHorizontal: -space.sm,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: c.rule,
        backgroundColor: hover ? c.surface : "transparent",
        cursor: "pointer",
      }}
    >
      <Type variant="meta" tone="accentDim" style={{ fontFamily: fonts.display, marginTop: 2 }}>
        {`[${ord}]`}
      </Type>
      <View style={{ flex: 1 }}>
        {kicker !== undefined && (
          <Type variant="label" tone="accentDim">
            {kicker}
          </Type>
        )}
        <Type variant="h2" style={{ marginTop: 2 }}>
          {title}
        </Type>
        {dek !== undefined && (
          <Type variant="body" tone="inkSoft" numberOfLines={2} style={{ marginTop: 4 }}>
            {dek}
          </Type>
        )}
        {source !== undefined && (
          <Type variant="meta" tone="inkMuted" numberOfLines={1} style={{ marginTop: 6 }}>
            {`› ${source}`}
          </Type>
        )}
      </View>
    </Pressable>
  );
}
