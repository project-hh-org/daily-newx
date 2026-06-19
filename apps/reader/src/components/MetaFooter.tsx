import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { NewsCategory } from "@/types/news.types";
import { categoryLabel } from "@/lib/categories";
import { colors, fonts } from "@/lib/theme";

type Props = {
  category: NewsCategory;
  tags: readonly string[];
  entities: readonly string[];
};

type Axis = "category" | "tag" | "entity";

function MetaLinks({
  label,
  axis,
  values,
  onGo,
}: {
  label: string;
  axis: Axis;
  values: readonly string[];
  onGo: (axis: Axis, value: string) => void;
}): ReactElement {
  return (
    <View style={styles.linkRow}>
      <Text style={styles.linkLabel}>{label}</Text>
      {values.map((v, i) => (
        <Pressable key={i} onPress={() => onGo(axis, v)} accessibilityRole="link">
          <Text style={styles.link}>{v}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** 아티클 하단 메타 — 카테고리/주제/주체를 타임라인 링크로. */
export function MetaFooter({ category, tags, entities }: Props): ReactElement {
  const router = useRouter();
  const onGo = (axis: Axis, value: string): void => {
    router.push(`/timeline/${axis}/${encodeURIComponent(value)}`);
  };
  const ts = tags.filter((t) => t.trim().length > 0);
  const es = entities.filter((e) => e.trim().length > 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.catRow}>
        <Pressable
          onPress={() => onGo("category", category)}
          accessibilityRole="link"
          style={styles.catTag}
        >
          <Text style={styles.catText}>{categoryLabel(category)}</Text>
        </Pressable>
      </View>
      {ts.length > 0 && <MetaLinks label="주제" axis="tag" values={ts} onGo={onGo} />}
      {es.length > 0 && <MetaLinks label="주체" axis="entity" values={es} onGo={onGo} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: 16, gap: 8 },
  catRow: { flexDirection: "row", flexWrap: "wrap" },
  catTag: { borderWidth: 1, borderColor: colors.ink, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 4 },
  catText: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1, color: colors.ink },
  linkRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 10, rowGap: 4 },
  linkLabel: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "600", color: colors.inkMuted },
  link: { fontFamily: fonts.sans, fontSize: 13, color: colors.accent, textDecorationLine: "underline" },
});
