import type { ReactElement } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { Block } from "@/types/news.types";
import { colors, fonts } from "@/lib/theme";

type Props = {
  blocks: readonly Block[];
};

function BlockView({ block }: { block: Block }): ReactElement | null {
  switch (block.type) {
    case "heading":
      return <Text style={styles.heading}>{block.text}</Text>;
    case "paragraph":
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case "bullets": {
      const items = block.items.filter((i) => i.trim().length > 0);
      if (items.length === 0) return null;
      return (
        <View style={styles.bulletsWrap}>
          {block.label !== null && block.label !== undefined && block.label.length > 0 && (
            <Text style={styles.label}>{block.label}</Text>
          )}
          <View style={styles.bulletsList}>
            {items.map((it, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.dash}>—</Text>
                <Text style={styles.bulletText}>{it}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    case "quote":
      return (
        <View style={styles.quote}>
          <Text style={styles.quoteText}>“{block.text}”</Text>
          {block.cite !== null && block.cite !== undefined && block.cite.length > 0 && (
            <Text style={styles.quoteCite}>— {block.cite}</Text>
          )}
        </View>
      );
    case "stat":
      return (
        <View style={styles.stat}>
          <Text style={styles.statValue}>{block.value}</Text>
          {block.label !== null && block.label !== undefined && block.label.length > 0 && (
            <Text style={styles.statLabel}>{block.label}</Text>
          )}
        </View>
      );
    case "callout":
      return (
        <View style={styles.callout}>
          {block.label !== null && block.label !== undefined && block.label.length > 0 && (
            <Text style={styles.calloutLabel}>{block.label}</Text>
          )}
          <Text style={styles.calloutText}>{block.text}</Text>
        </View>
      );
    case "image":
      return (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: block.url }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={block.alt ?? undefined}
          />
          {((block.caption !== null && block.caption !== undefined && block.caption.length > 0) ||
            (block.credit !== null && block.credit !== undefined && block.credit.length > 0)) && (
            <Text style={styles.caption}>
              {block.caption ?? ""}
              {block.credit !== null && block.credit !== undefined && block.credit.length > 0
                ? `${block.caption ? "  ·  " : ""}${block.credit}`
                : ""}
            </Text>
          )}
        </View>
      );
    default:
      return null;
  }
}

/** 자유 본문 블록 렌더러 — 기사마다 다른 구성을 그린다. */
export function ArticleBlocks({ blocks }: Props): ReactElement | null {
  if (blocks.length === 0) return null;
  return (
    <View style={styles.wrap}>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, gap: 12 },
  heading: { marginTop: 6, fontFamily: fonts.serif, fontSize: 20, lineHeight: 28, color: colors.ink },
  paragraph: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 27, color: colors.inkSoft },
  label: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "600", color: colors.inkMuted },
  bulletsWrap: { gap: 6 },
  bulletsList: { gap: 8 },
  bulletRow: { flexDirection: "row", gap: 12 },
  dash: { fontFamily: fonts.serif, color: colors.accent },
  bulletText: { flex: 1, fontFamily: fonts.sans, fontSize: 16, lineHeight: 26, color: colors.inkSoft },
  quote: { borderLeftWidth: 2, borderLeftColor: colors.rule, paddingLeft: 16 },
  quoteText: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 30, color: colors.ink },
  quoteCite: { marginTop: 6, fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
  stat: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.rule, paddingVertical: 14, alignItems: "flex-start" },
  statValue: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 42, color: colors.accent },
  statLabel: { marginTop: 4, fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted },
  callout: { borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 16 },
  calloutLabel: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "600", color: colors.accent },
  calloutText: { marginTop: 4, fontFamily: fonts.sans, fontSize: 16, lineHeight: 26, color: colors.ink },
  imageWrap: { gap: 6 },
  image: { width: "100%", aspectRatio: 1.6, borderRadius: 10, backgroundColor: colors.rule },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.inkMuted },
});
