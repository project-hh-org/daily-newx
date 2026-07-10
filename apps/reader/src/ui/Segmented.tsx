import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "./Type";

type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = {
  value: T;
  options: readonly Option<T>[];
  onChange: (v: T) => void;
};

/** 세그먼트 컨트롤 — 상호배타 옵션 선택(예: 테마 라이트/다크/시스템). */
export function Segmented<T extends string>({ value, options, onChange }: Props<T>): ReactElement {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: c.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: c.rule,
        padding: 2,
      }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              paddingVertical: 6,
              paddingHorizontal: space.md,
              borderRadius: radius.sm,
              backgroundColor: on ? c.accent : "transparent",
              cursor: "pointer",
            }}
          >
            <Type variant="label" tone={on ? "paper" : "inkMuted"}>
              {o.label}
            </Type>
          </Pressable>
        );
      })}
    </View>
  );
}
