import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { DailyItem } from "@/types/news.types";
import { colors, fonts } from "@/lib/theme";
import { OptionalField } from "@/components/OptionalField";
import { Bullets } from "@/components/Bullets";
import { ArticleBlocks } from "@/components/ArticleBlocks";
import { SourceLine } from "@/components/SourceLine";
import { MetaFooter } from "@/components/MetaFooter";

type Props = {
  item: DailyItem;
  index: number; // 흐름 내 1-기반 순번
};

/** 항목 카드 — 종이 surface 박스로 아티클을 구분. 값 있는 선택필드만. */
export function NewsItemCard({ item, index }: Props): ReactElement {
  const router = useRouter();
  const ordinal = String(index).padStart(2, "0");
  const articleId = item.id;

  const openArticle = (): void => {
    if (articleId !== null) router.push(`/article/${articleId}`);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.ordinal}>{ordinal}</Text>

      <Pressable onPress={openArticle} disabled={articleId === null} accessibilityRole="link">
        <Text style={styles.title}>{item.title}</Text>
      </Pressable>

      {item.tldr !== null && item.tldr.trim().length > 0 && (
        <Text style={styles.tldr}>{item.tldr}</Text>
      )}

      <Text style={styles.summary}>{item.summary}</Text>

      {item.blocks.length > 0 ? (
        <ArticleBlocks blocks={item.blocks} />
      ) : (
        <>
          <Bullets label="핵심 포인트" points={item.key_points} />
          <OptionalField label="얻는 것" value={item.what_you_get} />
          <OptionalField label="왜 지금" value={item.why_now} />
          <OptionalField label="지금 할 일" value={item.action} tone="action" />
        </>
      )}

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

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  ordinal: { fontFamily: fonts.serif, fontSize: 14, color: colors.accent },
  title: { marginTop: 4, fontFamily: fonts.serif, fontSize: 24, lineHeight: 32, color: colors.ink },
  tldr: { marginTop: 10, fontFamily: fonts.serif, fontSize: 19, lineHeight: 30, color: colors.ink },
  summary: { marginTop: 10, fontFamily: fonts.sans, fontSize: 16, lineHeight: 27, color: colors.inkSoft },
});
