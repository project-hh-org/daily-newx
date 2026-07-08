import type { ReactElement } from "react";
import { View, Image, Pressable, Linking, ScrollView } from "react-native";
import type { Block } from "@/types/news.types";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

type Props = {
  blocks: readonly Block[];
};

const PRO_GREEN = "#2E7D5B";

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
  const c = useColors();
  switch (block.type) {
    case "heading":
      return (
        <Type variant="h1" style={{ marginTop: space.sm }}>
          {block.text}
        </Type>
      );
    case "paragraph":
      return (
        <Type variant="body" tone="inkSoft">
          {block.text}
        </Type>
      );
    case "bullets": {
      const items = clean(block.items);
      if (items.length === 0) return null;
      return (
        <View style={{ gap: space.xs }}>
          {!!block.label && (
            <Type variant="label" tone="inkMuted">
              {block.label}
            </Type>
          )}
          <View style={{ gap: space.sm }}>
            {items.map((it, i) => (
              <View key={i} style={{ flexDirection: "row", gap: space.md }}>
                <Type variant="body" tone="inkMuted">
                  —
                </Type>
                <Type variant="body" tone="inkSoft" style={{ flex: 1 }}>
                  {it}
                </Type>
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
        <View style={{ gap: space.xs }}>
          {!!block.label && (
            <Type variant="label" tone="inkMuted">
              {block.label}
            </Type>
          )}
          <View style={{ gap: space.sm }}>
            {items.map((it, i) => (
              <View key={i} style={{ flexDirection: "row", gap: space.md }}>
                <Type variant="body" tone="accent" style={{ minWidth: space.lg }}>
                  {i + 1}
                </Type>
                <Type variant="body" tone="inkSoft" style={{ flex: 1 }}>
                  {it}
                </Type>
              </View>
            ))}
          </View>
        </View>
      );
    }
    case "quote":
      return (
        <View>
          <Type variant="display" tone="accent" style={{ fontSize: 44, lineHeight: 40 }}>
            “
          </Type>
          <Type variant="h1">{block.text}</Type>
          {!!block.cite && (
            <Type variant="meta" tone="inkMuted" style={{ marginTop: space.sm }}>
              {`— ${block.cite}`}
            </Type>
          )}
        </View>
      );
    case "stat":
      return (
        <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.rule, paddingVertical: 18 }}>
          <Type variant="display" style={{ fontSize: 40, lineHeight: 46 }}>
            {block.value}
          </Type>
          {!!block.label && (
            <Type variant="meta" tone="inkSoft" style={{ marginTop: space.xs }}>
              {block.label}
            </Type>
          )}
        </View>
      );
    case "callout":
      return (
        <View style={{ borderLeftWidth: 2, borderLeftColor: c.accent, paddingLeft: space.lg }}>
          {!!block.label && (
            <Type variant="label" tone="accent">
              {block.label}
            </Type>
          )}
          <Type variant="body" tone="ink" style={{ marginTop: space.xs }}>
            {block.text}
          </Type>
        </View>
      );
    case "definition":
      return (
        <View style={{ flexDirection: "row", gap: space.md }}>
          <View style={{ width: 3, borderRadius: 2, backgroundColor: c.accent }} />
          <View style={{ flex: 1 }}>
            <Type variant="label" tone="inkMuted" style={{ marginBottom: space.xs }}>
              용어
            </Type>
            <Type variant="h2">{block.term}</Type>
            <Type variant="body" tone="inkSoft" style={{ marginTop: space.xs }}>
              {block.text}
            </Type>
          </View>
        </View>
      );
    case "divider":
      return (
        <Type variant="body" tone="inkMuted" style={{ textAlign: "center" }}>
          · · ·
        </Type>
      );
    case "code":
      return (
        <View style={{ backgroundColor: "#26221E", borderRadius: 10, padding: 14 }}>
          <Type variant="meta" style={{ fontFamily: "monospace", color: "#ECE6DA", lineHeight: 20 }}>
            {block.code}
          </Type>
        </View>
      );
    case "embed":
      return (
        <Pressable
          onPress={() => openUrl(block.url)}
          accessibilityRole="link"
          style={{ borderWidth: 1, borderColor: c.rule, borderRadius: 10, padding: 14, backgroundColor: c.surface, cursor: "pointer" }}
        >
          <Type variant="h2" numberOfLines={2}>
            {block.title ?? block.url}
          </Type>
          <Type variant="label" tone="accent" style={{ marginTop: space.xs }}>
            {`${block.provider ?? hostOf(block.url)}  ›`}
          </Type>
        </Pressable>
      );
    case "table": {
      if (block.rows.length === 0) return null;
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ borderWidth: 1, borderColor: c.rule, borderRadius: radius.md, overflow: "hidden" }}>
            {block.headers.length > 0 && (
              <View style={{ flexDirection: "row", backgroundColor: c.surface }}>
                {block.headers.map((h, i) => (
                  <Type
                    key={i}
                    variant="meta"
                    tone="ink"
                    style={{ width: 130, paddingHorizontal: 10, paddingVertical: space.sm, fontWeight: "600" }}
                  >
                    {h}
                  </Type>
                ))}
              </View>
            )}
            {block.rows.map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: c.rule }}>
                {row.map((cell, ci) => (
                  <Type
                    key={ci}
                    variant="meta"
                    tone="inkSoft"
                    style={{ width: 130, paddingHorizontal: 10, paddingVertical: space.sm }}
                  >
                    {cell}
                  </Type>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }
    case "prosCons": {
      const pros = clean(block.pros);
      const cons = clean(block.cons);
      if (pros.length === 0 && cons.length === 0) return null;
      return (
        <View style={{ borderWidth: 1, borderColor: c.rule, borderRadius: 10, padding: 14 }}>
          {pros.length > 0 && (
            <View>
              <Type variant="label" style={{ color: PRO_GREEN, marginBottom: space.xs }}>
                장점
              </Type>
              {pros.map((p, i) => (
                <View key={i} style={{ flexDirection: "row", gap: space.md }}>
                  <Type variant="body" style={{ color: PRO_GREEN, minWidth: 14 }}>
                    +
                  </Type>
                  <Type variant="body" tone="inkSoft" style={{ flex: 1 }}>
                    {p}
                  </Type>
                </View>
              ))}
            </View>
          )}
          {cons.length > 0 && (
            <View style={pros.length > 0 ? { marginTop: space.md } : undefined}>
              <Type variant="label" tone="accent" style={{ marginBottom: space.xs }}>
                단점
              </Type>
              {cons.map((con, i) => (
                <View key={i} style={{ flexDirection: "row", gap: space.md }}>
                  <Type variant="body" tone="accent" style={{ minWidth: 14 }}>
                    −
                  </Type>
                  <Type variant="body" tone="inkSoft" style={{ flex: 1 }}>
                    {con}
                  </Type>
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
        <View style={{ borderLeftWidth: 2, borderLeftColor: c.rule, paddingLeft: 14, gap: 10 }}>
          {block.events.map((e, i) => (
            <View key={i} style={{ gap: 2 }}>
              {!!e.date && (
                <Type variant="caption" tone="inkMuted">
                  {e.date}
                </Type>
              )}
              <Type variant="body" tone="inkSoft">
                {e.text}
              </Type>
            </View>
          ))}
        </View>
      );
    }
    case "image":
      return (
        <View style={{ gap: space.xs }}>
          <Image
            source={{ uri: block.url }}
            style={{ width: "100%", aspectRatio: 1.6, borderRadius: 10, backgroundColor: c.rule }}
            resizeMode="cover"
            accessibilityLabel={block.alt ?? undefined}
          />
          {(!!block.caption || !!block.credit) && (
            <Type variant="caption" tone="inkMuted">
              {`${block.caption ?? ""}${block.credit ? `${block.caption ? "  ·  " : ""}${block.credit}` : ""}`}
            </Type>
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
    <View style={{ marginTop: 14, gap: space.lg }}>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </View>
  );
}
