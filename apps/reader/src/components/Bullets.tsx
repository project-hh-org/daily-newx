import type { ReactElement } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

type Props = {
  label?: string;
  points: readonly string[];
};

/** key_points — 행잉 인덴트 + 액센트 대시. 비어 있으면 렌더하지 않는다. */
export function Bullets({ label, points }: Props): ReactElement | null {
  const items = points.filter((p) => p.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {label !== undefined && <Text style={styles.label}>{label}</Text>}
      <View style={styles.list}>
        {items.map((p, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.dash}>—</Text>
            <Text style={styles.text}>{p}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  label: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "600", color: colors.inkMuted },
  list: { marginTop: 6, gap: 8 },
  row: { flexDirection: "row", gap: 12 },
  dash: { fontFamily: fonts.serif, color: colors.accent },
  text: { flex: 1, fontFamily: fonts.sans, fontSize: 16, lineHeight: 26, color: colors.inkSoft },
});
