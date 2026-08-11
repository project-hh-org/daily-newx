import type { ReactElement } from "react";
import { View } from "react-native";
import { space } from "@/lib/theme";
import { Type } from "./Type";

type Props = {
  index: number; // 0-기반 현재 인덱스
  total: number;
};

/** `[03 / 12]` CLI 톤 페이지 인디케이터. 카드가 1장뿐이면 렌더 안 함. */
export function PageIndicator({ index, total }: Props): ReactElement | null {
  if (total <= 1) return null;
  const cur = String(Math.min(index + 1, total)).padStart(2, "0");
  const last = String(total).padStart(2, "0");

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${index + 1} / ${total} 페이지`}
      accessibilityLiveRegion="polite"
      style={{ alignItems: "center", paddingVertical: space.sm }}
    >
      <Type variant="label" tone="accentDim" style={{ fontFamily: "monospace" }}>
        {`[${cur} / ${last}]`}
      </Type>
    </View>
  );
}
