import type { ReactElement } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

type Props = {
  label: string;
  value: string | null | undefined;
  tone?: "default" | "action";
};

/** 값이 있을 때만 렌더. 빈 값/널이면 아무것도 그리지 않는다(선택필드 규칙). */
export function OptionalField({ label, value, tone = "default" }: Props): ReactElement | null {
  if (value === null || value === undefined || value.trim().length === 0) return null;

  if (tone === "action") {
    return (
      <View style={styles.actionBox}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionValue}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  label: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "600", color: colors.inkMuted },
  value: { marginTop: 2, fontFamily: fonts.sans, fontSize: 16, lineHeight: 26, color: colors.inkSoft },
  actionBox: { marginTop: 20, borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 16 },
  actionLabel: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "600", color: colors.accent },
  actionValue: { marginTop: 4, fontFamily: fonts.sans, fontSize: 16, lineHeight: 26, color: colors.ink },
});
