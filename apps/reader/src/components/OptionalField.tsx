import type { ReactElement } from "react";
import { View } from "react-native";
import { useColors, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

type Props = {
  label: string;
  value: string | null | undefined;
  tone?: "default" | "action";
};

/** 값이 있을 때만 렌더. 빈 값/널이면 아무것도 그리지 않는다(선택필드 규칙). */
export function OptionalField({ label, value, tone = "default" }: Props): ReactElement | null {
  const c = useColors();
  if (value === null || value === undefined || value.trim().length === 0) return null;

  if (tone === "action") {
    return (
      <View style={{ marginTop: space.xl, borderLeftWidth: 2, borderLeftColor: c.accent, paddingLeft: space.lg }}>
        <Type variant="label" tone="accent">
          {label}
        </Type>
        <Type variant="body" tone="ink" style={{ marginTop: space.xs }}>
          {value}
        </Type>
      </View>
    );
  }

  return (
    <View style={{ marginTop: space.lg }}>
      <Type variant="label" tone="inkMuted">
        {label}
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: 2 }}>
        {value}
      </Type>
    </View>
  );
}
