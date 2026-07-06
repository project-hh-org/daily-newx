import type { ReactElement } from "react";
import { ScrollView, View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isoToLabel } from "@/lib/date";
import { colors, fonts, MAX_READING } from "@/lib/theme";
import { TOOL_CATALOG, toolByKey, type ToolCategory } from "@/lib/toolCatalog";
import { useToolsStore } from "@/store/toolsStore";
import { useToolUpdates } from "@/hooks/useDailyIssue";
import { useBackOr } from "@/hooks/useBackOr";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingView, ErrorView } from "@/components/StateViews";

const CATEGORY_LABEL: Record<ToolCategory, string> = { model: "모델", coding: "코딩 도구" };
const CATEGORIES: ToolCategory[] = ["model", "coding"];

function openUrl(url: string): void {
  void Linking.openURL(url);
}

export function MyToolsScreen(): ReactElement {
  const insets = useSafeAreaInsets();
  const backOr = useBackOr();
  const selected = useToolsStore((s) => s.selected);
  const toggle = useToolsStore((s) => s.toggle);
  const hasHydrated = useToolsStore((s) => s.hasHydrated);
  const query = useToolUpdates(selected);

  if (!hasHydrated) return <LoadingView />;

  const updates = query.data ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 56 }}
    >
      <View style={styles.column}>
        <ScreenHeader
          kicker="개인화"
          title="내 도구"
          subtitle="쓰는 도구를 고르면 매일 최신 업데이트를 모아줘요"
          crumb={{ label: "오늘", onPress: () => backOr("/") }}
        />

        {/* 도구 선택 */}
        {CATEGORIES.map((cat) => (
          <View key={cat} style={styles.pickBlock}>
            <Text style={styles.sectionLabel}>{CATEGORY_LABEL[cat]}</Text>
            <View style={styles.chips}>
              {TOOL_CATALOG.filter((t) => t.category === cat).map((t) => {
                const on = selected.includes(t.key);
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => toggle(t.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={t.name}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={on ? styles.chipTextOn : styles.chipTextOff}>{t.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* 최신 업데이트 */}
        <View style={styles.feedHead}>
          <Text style={styles.sectionLabel}>최신 업데이트</Text>
          {selected.length > 0 && <Text style={styles.count}>{updates.length}건</Text>}
        </View>

        {selected.length === 0 ? (
          <Text style={styles.empty}>위에서 쓰는 도구를 선택하면 업데이트가 여기 모여요.</Text>
        ) : query.isPending ? (
          <LoadingView />
        ) : query.error ? (
          <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />
        ) : updates.length === 0 ? (
          <Text style={styles.empty}>아직 모인 업데이트가 없어요. 곧 채워집니다.</Text>
        ) : (
          <View style={styles.feed}>
            {updates.map((u, i) => (
              <Pressable
                key={u.id ?? `${u.tool_key}-${i}`}
                onPress={() => openUrl(u.url)}
                accessibilityRole="link"
                accessibilityLabel={u.title}
                style={styles.update}
              >
                <Text style={styles.updateKicker}>
                  {toolByKey(u.tool_key)?.name ?? u.tool_key} · {isoToLabel(u.update_date)}
                </Text>
                <Text style={styles.updateTitle}>{u.title}</Text>
                <Text style={styles.updateSummary} numberOfLines={3}>
                  {u.summary}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* 선택 도구 리소스 */}
        {selected.length > 0 && (
          <View style={styles.resBlock}>
            <Text style={styles.sectionLabel}>리소스</Text>
            {selected
              .map((k) => toolByKey(k))
              .filter((t): t is NonNullable<typeof t> => t !== undefined)
              .map((t) => (
                <View key={t.key} style={styles.resRow}>
                  <Text style={styles.resName}>{t.name}</Text>
                  <View style={styles.resLinks}>
                    {t.links.map((l) => (
                      <Pressable key={l.url} onPress={() => openUrl(l.url)} accessibilityRole="link" hitSlop={6}>
                        <Text style={styles.resLink}>{l.label} ↗</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  column: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 20 },
  sectionLabel: { fontFamily: fonts.sans, fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: colors.inkMuted },
  pickBlock: { marginTop: 24 },
  chips: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  chipOn: { backgroundColor: colors.spot, borderColor: colors.spot },
  chipOff: { backgroundColor: colors.surface, borderColor: colors.rule },
  chipTextOn: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "600", color: colors.paper },
  chipTextOff: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft },
  feedHead: { marginTop: 36, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  count: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkMuted },
  empty: { marginTop: 16, fontFamily: fonts.serif, fontSize: 15, lineHeight: 24, color: colors.inkMuted },
  feed: { marginTop: 4 },
  update: { borderBottomWidth: 1, borderBottomColor: colors.rule, paddingVertical: 18 },
  updateKicker: { fontFamily: fonts.sans, fontSize: 11, fontWeight: "700", letterSpacing: 0.5, color: colors.spot },
  updateTitle: { marginTop: 6, fontFamily: fonts.serif, fontSize: 18, lineHeight: 25, color: colors.ink },
  updateSummary: { marginTop: 6, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkSoft },
  resBlock: { marginTop: 36 },
  resRow: { marginTop: 16 },
  resName: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
  resLinks: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 6 },
  resLink: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "600", color: colors.spot },
});
