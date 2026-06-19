import type { ReactElement } from "react";
import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { formatSourceDate } from "@/lib/date";
import { colors, fonts } from "@/lib/theme";

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
  const relatedItems = related.filter((r) => r.trim().length > 0);
  const hasPublished =
    publishedAt !== null && publishedAt !== undefined && publishedAt.length > 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>출처</Text>
        <Pressable onPress={() => openUrl(sourceUrl)} accessibilityRole="link">
          <Text style={styles.link}>
            {sourceName} · {hostOf(sourceUrl)}
          </Text>
        </Pressable>
        {hasPublished && <Text style={styles.meta}>· 원문 {formatSourceDate(publishedAt)}</Text>}
      </View>

      {relatedItems.length > 0 && (
        <View style={[styles.row, styles.relatedRow]}>
          <Text style={styles.label}>관련</Text>
          {relatedItems.map((r, i) => (
            <Pressable key={i} onPress={() => openUrl(r)} accessibilityRole="link">
              <Text style={styles.link}>{hostOf(r)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: 12 },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 8, rowGap: 4 },
  relatedRow: { marginTop: 6 },
  label: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
  link: { fontFamily: fonts.sans, fontSize: 13, color: colors.accent, textDecorationLine: "underline" },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
});
