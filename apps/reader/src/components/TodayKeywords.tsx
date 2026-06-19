import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { DailyItem } from "@/types/news.types";
import { colors, fonts } from "@/lib/theme";

type Props = {
  items: readonly DailyItem[];
  max?: number;
};

type Keyword = { value: string; count: number; axis: "tag" | "entity" };

// 오늘 항목들의 tags/entities 를 합쳐 빈도순 키워드 추출.
// 같은 값이 tag·entity 양쪽에 있으면 합산하고, 링크 축은 entity 우선.
function topKeywords(items: readonly DailyItem[], max: number): Keyword[] {
  const acc = new Map<string, { count: number; isEntity: boolean }>();
  const bump = (raw: string, isEntity: boolean): void => {
    const v = raw.trim();
    if (v.length === 0) return;
    const prev = acc.get(v);
    if (prev) {
      prev.count += 1;
      prev.isEntity = prev.isEntity || isEntity;
    } else {
      acc.set(v, { count: 1, isEntity });
    }
  };
  for (const it of items) {
    for (const t of it.tags) bump(t, false);
    for (const e of it.entities) bump(e, true);
  }
  return Array.from(acc, ([value, { count, isEntity }]) => ({
    value,
    count,
    axis: isEntity ? ("entity" as const) : ("tag" as const),
  }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, max);
}

/** 오늘의 키워드 — 빈도 높은 tags/entities 를 칩으로. 비면 렌더 안 함. */
export function TodayKeywords({ items, max = 8 }: Props): ReactElement | null {
  const router = useRouter();
  const keywords = topKeywords(items, max);
  if (keywords.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>오늘의 키워드</Text>
      <View style={styles.chips}>
        {keywords.map((k) => (
          <Pressable
            key={`${k.axis}:${k.value}`}
            onPress={() => router.push(`/timeline/${k.axis}/${encodeURIComponent(k.value)}`)}
            accessibilityRole="link"
            style={styles.chip}
          >
            <Text style={styles.chipText}>{k.value}</Text>
            {k.count > 1 && <Text style={styles.chipCount}>{k.count}</Text>}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  label: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkMuted },
  chips: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink },
  chipCount: { fontFamily: fonts.sans, fontSize: 12, color: colors.accent },
});
