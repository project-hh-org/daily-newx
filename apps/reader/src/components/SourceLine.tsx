import type { ReactElement } from "react";
import { View, Pressable, Linking } from "react-native";
import { formatSourceDate } from "@/lib/date";
import { useColors, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

type Props = {
  sourceName: string;
  sourceUrl: string;
  publishedAt: string | null | undefined;
  related: readonly string[];
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

/** 출처(필수) + 원문 발행일(선택) + 관련 링크(선택). 헤어라인으로 본문과 분리. */
export function SourceLine({
  sourceName,
  sourceUrl,
  publishedAt,
  related,
}: Props): ReactElement {
  const c = useColors();
  const relatedItems = related.filter((r) => r.trim().length > 0);
  const hasPublished =
    publishedAt !== null && publishedAt !== undefined && publishedAt.length > 0;

  const rowStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: space.sm,
    rowGap: space.xs,
  } as const;

  return (
    <View style={{ marginTop: space.xl, borderTopWidth: 1, borderTopColor: c.rule, paddingTop: space.md }}>
      <View style={rowStyle}>
        <Type variant="meta" tone="inkMuted">
          출처
        </Type>
        <Pressable onPress={() => openUrl(sourceUrl)} accessibilityRole="link" style={{ cursor: "pointer" }}>
          <Type variant="meta" tone="accent" style={{ textDecorationLine: "underline" }}>
            {`${sourceName} · ${hostOf(sourceUrl)}`}
          </Type>
        </Pressable>
        {hasPublished && (
          <Type variant="meta" tone="inkMuted">{`· 원문 ${formatSourceDate(publishedAt)}`}</Type>
        )}
      </View>

      {relatedItems.length > 0 && (
        <View style={[rowStyle, { marginTop: space.xs }]}>
          <Type variant="meta" tone="inkMuted">
            관련
          </Type>
          {relatedItems.map((r, i) => (
            <Pressable key={i} onPress={() => openUrl(r)} accessibilityRole="link" style={{ cursor: "pointer" }}>
              <Type variant="meta" tone="accent" style={{ textDecorationLine: "underline" }}>
                {hostOf(r)}
              </Type>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
