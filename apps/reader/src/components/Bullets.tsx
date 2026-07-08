import type { ReactElement } from "react";
import { View } from "react-native";
import { space } from "@/lib/theme";
import { Type } from "@/ui/Type";

type Props = {
  label?: string;
  points: readonly string[];
};

/** key_points — 행잉 인덴트 + 액센트 대시. 비어 있으면 렌더하지 않는다. */
export function Bullets({ label, points }: Props): ReactElement | null {
  const items = points.filter((p) => p.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <View style={{ marginTop: space.lg }}>
      {label !== undefined && (
        <Type variant="label" tone="inkMuted">
          {label}
        </Type>
      )}
      <View style={{ marginTop: space.xs, gap: space.sm }}>
        {items.map((p, i) => (
          <View key={i} style={{ flexDirection: "row", gap: space.md }}>
            <Type variant="body" tone="accent">
              —
            </Type>
            <Type variant="body" tone="inkSoft" style={{ flex: 1 }}>
              {p}
            </Type>
          </View>
        ))}
      </View>
    </View>
  );
}
