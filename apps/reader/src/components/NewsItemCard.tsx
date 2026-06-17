import type { ReactElement } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { DailyItem } from "@/types/news.types";
import { OptionalField } from "@/components/OptionalField";
import { Bullets } from "@/components/Bullets";
import { SourceLine } from "@/components/SourceLine";
import { MetaFooter } from "@/components/MetaFooter";

type Props = {
  item: DailyItem;
  index: number; // 흐름 내 1-기반 순번
};

/** 항목 카드 — 종이 surface 박스로 아티클을 명확히 구분. 값 있는 선택필드만. */
export function NewsItemCard({ item, index }: Props): ReactElement {
  const router = useRouter();
  const ordinal = String(index).padStart(2, "0");
  const articleId = item.id;

  const openArticle = (): void => {
    if (articleId !== null) router.push(`/article/${articleId}`);
  };

  return (
    <View className="rounded-xl border border-rule bg-[#FFFDF8] px-5 py-5 dark:border-[#2A251F] dark:bg-[#1B1714]">
      <Text className="font-serif text-sm text-accent">{ordinal}</Text>

      <Pressable onPress={openArticle} disabled={articleId === null} accessibilityRole="link">
        <Text className="mt-1 font-serif text-2xl leading-8 text-ink dark:text-[#ECE6DA]">
          {item.title}
        </Text>
      </Pressable>

      {item.tldr !== null && item.tldr.trim().length > 0 && (
        <Text className="mt-2.5 font-serif text-lead text-ink dark:text-[#ECE6DA]">
          {item.tldr}
        </Text>
      )}

      <Text className="mt-2.5 font-sans text-body text-ink-soft dark:text-[#C9C1B2]">
        {item.summary}
      </Text>

      <Bullets label="핵심 포인트" points={item.key_points} />
      <OptionalField label="얻는 것" value={item.what_you_get} />
      <OptionalField label="왜 지금" value={item.why_now} />
      <OptionalField label="지금 할 일" value={item.action} tone="action" />

      <SourceLine
        sourceName={item.source_name}
        sourceUrl={item.source_url}
        publishedAt={item.source_published_at}
        related={item.related}
      />

      <MetaFooter category={item.category} tags={item.tags} entities={item.entities} />
    </View>
  );
}
