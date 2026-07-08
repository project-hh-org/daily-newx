import type { ReactElement, ReactNode } from "react";
import { View } from "react-native";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "./Type";

type Props = { children: ReactNode; action?: ReactNode };

/** 가로 스트립 배너 — CLI 프리픽스(›) + 메시지 + 우측 액션. */
export function Banner({ children, action }: Props): ReactElement {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.rule,
        borderRadius: radius.md,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
      }}
    >
      <Type variant="label" tone="accentDim">
        {"›"}
      </Type>
      <View style={{ flex: 1 }}>
        {typeof children === "string" ? <Type variant="body">{children}</Type> : children}
      </View>
      {action}
    </View>
  );
}
