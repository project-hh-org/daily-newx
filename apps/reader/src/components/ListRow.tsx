import { useState, type ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress: () => void;
  first?: boolean; // 첫 행은 상단 헤어라인 제거(헤더 라인과 이중선 방지)
};

/** 인덱스/리스트 공용 행 — 제목(+부제) 좌측, 메타(개수 등) 우측, 상단 헤어라인. */
export function ListRow({ title, subtitle, meta, onPress, first = false }: Props): ReactElement {
  const c = useColors();
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={meta !== undefined ? `${title}, ${meta}` : title}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: c.rule,
        paddingVertical: space.lg,
        paddingHorizontal: space.sm,
        marginHorizontal: -space.sm,
        borderRadius: radius.md,
        backgroundColor: hovered ? c.surface : "transparent",
        cursor: "pointer",
      }}
    >
      <View style={{ flex: 1 }}>
        <Type variant="h2">{title}</Type>
        {subtitle !== undefined && subtitle.length > 0 && (
          <Type variant="body" tone="inkMuted" numberOfLines={2} style={{ marginTop: 4 }}>
            {subtitle}
          </Type>
        )}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
        {meta !== undefined && (
          <Type variant="meta" tone="inkMuted">
            {meta}
          </Type>
        )}
        <Type variant="body" tone="inkMuted">
          {"›"}
        </Type>
      </View>
    </Pressable>
  );
}
