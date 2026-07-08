import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { DailyItem } from "@/types/news.types";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

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
  const c = useColors();
  const keywords = topKeywords(items, max);
  if (keywords.length === 0) return null;

  return (
    <View style={{ marginTop: space.xl }}>
      <Type variant="label" tone="inkMuted">
        오늘의 키워드
      </Type>
      <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {keywords.map((k) => (
          <Pressable
            key={`${k.axis}:${k.value}`}
            onPress={() => router.push(`/timeline/${k.axis}/${encodeURIComponent(k.value)}`)}
            accessibilityRole="link"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderWidth: 1,
              borderColor: c.rule,
              backgroundColor: c.surface,
              borderRadius: radius.pill,
              paddingHorizontal: space.md,
              paddingVertical: 6,
              cursor: "pointer",
            }}
          >
            <Type variant="body" tone="ink">
              {k.value}
            </Type>
            {k.count > 1 && (
              <Type variant="meta" tone="accent">
                {k.count}
              </Type>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
