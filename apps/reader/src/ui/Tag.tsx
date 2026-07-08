import type { ReactElement } from "react";
import { View } from "react-native";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "./Type";

type Props = { label: string; tone?: "solid" | "outline" };

/** 라벨/태그 pill. solid = accent 채움, outline = rule 보더. */
export function Tag({ label, tone = "outline" }: Props): ReactElement {
  const c = useColors();
  const solid = tone === "solid";
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: solid ? c.accent : "transparent",
        borderWidth: solid ? 0 : 1,
        borderColor: c.rule,
        borderRadius: radius.sm,
        paddingHorizontal: space.sm,
        paddingVertical: 3,
      }}
    >
      <Type variant="label" tone={solid ? "paper" : "inkMuted"}>
        {label}
      </Type>
    </View>
  );
}
