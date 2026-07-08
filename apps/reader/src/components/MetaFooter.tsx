import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { NewsCategory } from "@/types/news.types";
import { categoryLabel } from "@/lib/categories";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

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
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: space.md, rowGap: space.xs }}>
      <Type variant="meta" tone="inkMuted">
        {label}
      </Type>
      {values.map((v, i) => (
        <Pressable key={i} onPress={() => onGo(axis, v)} accessibilityRole="link" style={{ cursor: "pointer" }}>
          <Type variant="meta" tone="accent" style={{ textDecorationLine: "underline" }}>
            {v}
          </Type>
        </Pressable>
      ))}
    </View>
  );
}

/** 아티클 하단 메타 — 카테고리/주제/주체를 타임라인 링크로. */
export function MetaFooter({ category, tags, entities }: Props): ReactElement {
  const router = useRouter();
  const c = useColors();
  const onGo = (axis: Axis, value: string): void => {
    router.push(`/timeline/${axis}/${encodeURIComponent(value)}`);
  };
  const ts = tags.filter((t) => t.trim().length > 0);
  const es = entities.filter((e) => e.trim().length > 0);

  return (
    <View style={{ marginTop: space.xl, borderTopWidth: 1, borderTopColor: c.rule, paddingTop: space.lg, gap: space.sm }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Pressable
          onPress={() => onGo("category", category)}
          accessibilityRole="link"
          style={{
            borderWidth: 1,
            borderColor: c.ink,
            borderRadius: radius.sm,
            paddingHorizontal: space.sm,
            paddingVertical: space.xs,
            cursor: "pointer",
          }}
        >
          <Type variant="label" tone="ink">
            {categoryLabel(category)}
          </Type>
        </Pressable>
      </View>
      {ts.length > 0 && <MetaLinks label="주제" axis="tag" values={ts} onGo={onGo} />}
      {es.length > 0 && <MetaLinks label="주체" axis="entity" values={es} onGo={onGo} />}
    </View>
  );
}
