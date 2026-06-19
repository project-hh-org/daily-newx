import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress: () => void;
};

/** 인덱스/리스트 공용 행 — 제목(+부제) 좌측, 메타(개수 등) 우측, 상단 헤어라인. */
export function ListRow({ title, subtitle, meta, onPress }: Props): ReactElement {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.title}>{title}</Text>
        {subtitle !== undefined && subtitle.length > 0 && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {meta !== undefined && <Text style={styles.meta}>{meta}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingVertical: 16,
  },
  main: { flex: 1 },
  title: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 27, color: colors.ink },
  subtitle: { marginTop: 4, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkMuted },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
});
