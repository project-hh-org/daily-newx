import type { ReactElement } from "react";
import { View, Text, Image, Pressable, Linking, StyleSheet } from "react-native";
import type { Block } from "@/types/news.types";
import { colors, fonts } from "@/lib/theme";

type Props = {
  blocks: readonly Block[];
};

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
function openUrl(url: string): void {
  void Linking.openURL(url);
}
function clean(arr: readonly string[]): string[] {
  return arr.filter((s) => s.trim().length > 0);
}

function BlockView({ block }: { block: Block }): ReactElement | null {
  switch (block.type) {
    case "heading":
      return <Text style={styles.heading}>{block.text}</Text>;
    case "paragraph":
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case "bullets": {
      const items = clean(block.items);
      if (items.length === 0) return null;
      return (
        <View style={styles.listWrap}>
          {!!block.label && <Text style={styles.label}>{block.label}</Text>}
          <View style={styles.list}>
            {items.map((it, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.dash}>—</Text>
                <Text style={styles.rowText}>{it}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    case "numbered": {
      const items = clean(block.items);
      if (items.length === 0) return null;
      return (
        <View style={styles.listWrap}>
          {!!block.label && <Text style={styles.label}>{block.label}</Text>}
          <View style={styles.list}>
            {items.map((it, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.num}>{i + 1}</Text>
                <Text style={styles.rowText}>{it}</Text>
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
          {!!block.cite && <Text style={styles.quoteCite}>— {block.cite}</Text>}
        </View>
      );
    case "stat":
      return (
        <View style={styles.stat}>
          <Text style={styles.statValue}>{block.value}</Text>
          {!!block.label && <Text style={styles.statLabel}>{block.label}</Text>}
        </View>
      );
    case "callout":
      return (
        <View style={styles.callout}>
          {!!block.label && <Text style={styles.calloutLabel}>{block.label}</Text>}
          <Text style={styles.calloutText}>{block.text}</Text>
        </View>
      );
    case "definition":
      return (
        <View style={styles.def}>
          <Text style={styles.defTerm}>{block.term}</Text>
          <Text style={styles.defText}>{block.text}</Text>
        </View>
      );
    case "divider":
      return <Text style={styles.divider}>· · ·</Text>;
    case "code":
      return (
        <View style={styles.code}>
          <Text style={styles.codeText}>{block.code}</Text>
        </View>
      );
    case "embed":
      return (
        <Pressable onPress={() => openUrl(block.url)} accessibilityRole="link" style={styles.embed}>
          <Text style={styles.embedTitle} numberOfLines={2}>
            {block.title ?? block.url}
          </Text>
          <Text style={styles.embedMeta}>{block.provider ?? hostOf(block.url)}  ›</Text>
        </Pressable>
      );
    case "table": {
      if (block.rows.length === 0) return null;
      return (
        <View style={styles.table}>
          {block.headers.length > 0 && (
            <View style={[styles.tr, styles.trHead]}>
              {block.headers.map((h, i) => (
                <Text key={i} style={[styles.cell, styles.cellHead]}>
                  {h}
                </Text>
              ))}
            </View>
          )}
          {block.rows.map((row, ri) => (
            <View key={ri} style={styles.tr}>
              {row.map((c, ci) => (
                <Text key={ci} style={styles.cell}>
                  {c}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    }
    case "prosCons": {
      const pros = clean(block.pros);
      const cons = clean(block.cons);
      if (pros.length === 0 && cons.length === 0) return null;
      return (
        <View style={styles.pcWrap}>
          {pros.length > 0 && (
            <View>
              <Text style={styles.pcPro}>장점</Text>
              {pros.map((p, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.pcMarkPro}>+</Text>
                  <Text style={styles.rowText}>{p}</Text>
                </View>
              ))}
            </View>
          )}
          {cons.length > 0 && (
            <View style={pros.length > 0 ? styles.pcConsGap : undefined}>
              <Text style={styles.pcCon}>단점</Text>
              {cons.map((c, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.pcMarkCon}>−</Text>
                  <Text style={styles.rowText}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }
    case "timeline": {
      if (block.events.length === 0) return null;
      return (
        <View style={styles.tl}>
          {block.events.map((e, i) => (
            <View key={i} style={styles.tlRow}>
              {!!e.date && <Text style={styles.tlDate}>{e.date}</Text>}
              <Text style={styles.tlText}>{e.text}</Text>
            </View>
          ))}
        </View>
      );
    }
    case "image":
      return (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: block.url }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={block.alt ?? undefined}
          />
          {(!!block.caption || !!block.credit) && (
            <Text style={styles.caption}>
              {block.caption ?? ""}
              {block.credit ? `${block.caption ? "  ·  " : ""}${block.credit}` : ""}
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
  listWrap: { gap: 6 },
  list: { gap: 8 },
  row: { flexDirection: "row", gap: 12 },
  dash: { fontFamily: fonts.serif, color: colors.accent },
  num: { fontFamily: fonts.serif, color: colors.accent, minWidth: 16 },
  rowText: { flex: 1, fontFamily: fonts.sans, fontSize: 16, lineHeight: 26, color: colors.inkSoft },
  quote: { borderLeftWidth: 2, borderLeftColor: colors.rule, paddingLeft: 16 },
  quoteText: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 30, color: colors.ink },
  quoteCite: { marginTop: 6, fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
  stat: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.rule, paddingVertical: 14 },
  statValue: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 42, color: colors.accent },
  statLabel: { marginTop: 4, fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted },
  callout: { borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 16 },
  calloutLabel: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "600", color: colors.accent },
  calloutText: { marginTop: 4, fontFamily: fonts.sans, fontSize: 16, lineHeight: 26, color: colors.ink },
  def: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.rule, borderRadius: 10, padding: 14 },
  defTerm: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
  defText: { marginTop: 4, fontFamily: fonts.sans, fontSize: 15, lineHeight: 24, color: colors.inkSoft },
  divider: { textAlign: "center", fontFamily: fonts.serif, fontSize: 16, color: colors.inkMuted },
  code: { backgroundColor: "#26221E", borderRadius: 10, padding: 14 },
  codeText: { fontFamily: "monospace", fontSize: 13, lineHeight: 20, color: "#ECE6DA" },
  embed: { borderWidth: 1, borderColor: colors.rule, borderRadius: 10, padding: 14, backgroundColor: colors.card },
  embedTitle: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 22, color: colors.ink },
  embedMeta: { marginTop: 6, fontFamily: fonts.sans, fontSize: 12, color: colors.accent },
  table: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, overflow: "hidden" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.rule },
  trHead: { borderTopWidth: 0, backgroundColor: colors.card },
  cell: { flex: 1, paddingHorizontal: 10, paddingVertical: 8, fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  cellHead: { fontWeight: "600", color: colors.ink },
  pcWrap: { borderWidth: 1, borderColor: colors.rule, borderRadius: 10, padding: 14 },
  pcConsGap: { marginTop: 12 },
  pcPro: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "600", color: "#2E7D5B", marginBottom: 6 },
  pcCon: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "600", color: colors.accent, marginBottom: 6 },
  pcMarkPro: { fontFamily: fonts.serif, color: "#2E7D5B", minWidth: 14 },
  pcMarkCon: { fontFamily: fonts.serif, color: colors.accent, minWidth: 14 },
  tl: { borderLeftWidth: 2, borderLeftColor: colors.rule, paddingLeft: 14, gap: 10 },
  tlRow: { gap: 2 },
  tlDate: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: colors.inkMuted },
  tlText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.inkSoft },
  imageWrap: { gap: 6 },
  image: { width: "100%", aspectRatio: 1.6, borderRadius: 10, backgroundColor: colors.rule },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.inkMuted },
});
