import type { ReactElement } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { NewsCategory } from "@/types/news.types";
import { categoryLabel } from "@/lib/categories";

type Props = {
  category: NewsCategory;
  tags: readonly string[];
  entities: readonly string[];
};

/** 아티클 하단 메타 — 카테고리/주제/주체를 타임라인 링크로. */
export function MetaFooter({ category, tags, entities }: Props): ReactElement {
  const router = useRouter();
  const goTimeline = (axis: "category" | "tag" | "entity", value: string): void => {
    router.push(`/timeline/${axis}/${encodeURIComponent(value)}`);
  };
  const ts = tags.filter((t) => t.trim().length > 0);
  const es = entities.filter((e) => e.trim().length > 0);

  return (
    <View className="mt-5 gap-2 border-t border-rule pt-4 dark:border-[#2A251F]">
      {/* 카테고리 — 하단 태그(클릭 시 카테고리 타임라인) */}
      <View className="flex-row flex-wrap">
        <Pressable
          onPress={() => goTimeline("category", category)}
          accessibilityRole="link"
          className="rounded-sm border border-ink px-2 py-1 dark:border-[#ECE6DA]"
        >
          <Text className="font-sans text-[11px] uppercase tracking-kicker text-ink dark:text-[#ECE6DA]">
            {categoryLabel(category)}
          </Text>
        </Pressable>
      </View>

      {ts.length > 0 && (
        <Text className="font-sans text-[13px] leading-6 text-ink-muted dark:text-[#8C8475]">
          <Text className="font-semibold">주제  </Text>
          {ts.map((t, i) => (
            <Text key={i}>
              {i > 0 ? "   ·   " : ""}
              <Text
                className="text-accent underline"
                onPress={() => goTimeline("tag", t)}
              >
                {t}
              </Text>
            </Text>
          ))}
        </Text>
      )}

      {es.length > 0 && (
        <Text className="font-sans text-[13px] leading-6 text-ink-muted dark:text-[#8C8475]">
          <Text className="font-semibold">주체  </Text>
          {es.map((e, i) => (
            <Text key={i}>
              {i > 0 ? "   ·   " : ""}
              <Text
                className="text-accent underline"
                onPress={() => goTimeline("entity", e)}
              >
                {e}
              </Text>
            </Text>
          ))}
        </Text>
      )}
    </View>
  );
}
