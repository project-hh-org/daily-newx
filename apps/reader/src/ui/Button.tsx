import { useState, type ReactElement } from "react";
import { Pressable } from "react-native";
import { useColors, radius, space, sizing } from "@/lib/theme";
import { Type } from "./Type";

type Kind = "primary" | "secondary" | "ghost";

type Props = {
  label: string;
  onPress: () => void;
  kind?: Kind;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** 버튼 — primary(잉크 채움) / secondary(rule 보더) / ghost(투명). */
export function Button({ label, onPress, kind = "secondary", disabled = false, accessibilityLabel }: Props): ReactElement {
  const c = useColors();
  const [hover, setHover] = useState(false);

  const bg =
    kind === "primary"
      ? c.accent
      : hover
        ? kind === "secondary"
          ? c.surfaceAlt
          : c.surface
        : "transparent";
  const fg: "paper" | "ink" = kind === "primary" ? "paper" : "ink";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={{
        minHeight: sizing.control,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: space.lg,
        borderRadius: radius.md,
        backgroundColor: bg,
        borderWidth: kind === "secondary" ? 1 : 0,
        borderColor: c.rule,
        opacity: disabled ? 0.4 : 1,
        cursor: "pointer",
      }}
    >
      <Type variant="label" tone={fg}>
        {label}
      </Type>
    </Pressable>
  );
}
