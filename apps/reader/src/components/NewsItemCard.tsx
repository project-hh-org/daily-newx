import { useState, type ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { DailyItem } from "@/types/news.types";
import { categoryLabel } from "@/lib/categories";
import { colors, fonts } from "@/lib/theme";

type Props = {
  item: DailyItem;
  index: number; // 흐름 내 1-기반 순번
};

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 목차 행 — 번호 + 카테고리 키커 + 표제 + 한 줄 dek + 출처. 하단 헤어라인. 본문(blocks)은 상세에서. */
export function NewsItemCard({ item, index }: Props): ReactElement {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const ordinal = String(index).padStart(2, "0");
  const articleId = item.id;
  const dek = item.tldr !== null && item.tldr.trim().length > 0 ? item.tldr : item.summary;

  const openArticle = (): void => {
    if (articleId !== null) router.push(`/article/${articleId}`);
  };

  return (
    <Pressable
      onPress={openArticle}
      disabled={articleId === null}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={`${categoryLabel(item.category)}, ${item.title}`}
      accessibilityHint={articleId !== null ? "아티클 열기" : undefined}
      style={[styles.row, hovered && styles.rowHover]}
    >
      <View style={styles.inner}>
        <Text style={styles.num}>{ordinal}</Text>
        <View style={styles.body}>
          <Text style={styles.kicker}>{categoryLabel(item.category)}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.dek} numberOfLines={2}>
            {dek}
          </Text>
          <Text style={styles.source} numberOfLines={1}>
            {item.source_name} · {hostOf(item.source_url)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { borderBottomWidth: 1, borderBottomColor: colors.rule, paddingVertical: 20, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: 8, cursor: "pointer" },
  rowHover: { backgroundColor: colors.surface },
  inner: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  num: { width: 26, fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, color: colors.inkMuted },
  body: { flex: 1 },
  kicker: { fontFamily: fonts.sans, fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: colors.spot },
  title: { marginTop: 6, fontFamily: fonts.serif, fontSize: 19, lineHeight: 26, color: colors.ink },
  dek: { marginTop: 7, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkSoft },
  source: { marginTop: 7, fontFamily: fonts.sans, fontSize: 12, color: colors.inkMuted },
});
