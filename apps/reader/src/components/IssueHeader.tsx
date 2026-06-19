import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { DailyIssue, NewsCategory } from "@/types/news.types";
import type { CategoryMeta } from "@/lib/categories";
import { isoToLabel } from "@/lib/date";
import { useUiStore } from "@/store/uiStore";
import { colors, fonts } from "@/lib/theme";

type Props = {
  issue: DailyIssue;
  availableCategories: readonly CategoryMeta[];
};

export function IssueHeader({ issue, availableCategories }: Props): ReactElement {
  const activeCategory = useUiStore((s) => s.activeCategory);
  const toggleCategory = useUiStore((s) => s.toggleCategory);
  const setActiveCategory = useUiStore((s) => s.setActiveCategory);

  return (
    <View>
      <View style={styles.masthead}>
        <Text style={styles.kicker}>
          매일의 LLM 뉴스{issue.issue_no !== null ? `   ·   제 ${issue.issue_no} 호` : ""}
        </Text>
        <Text style={styles.date}>{isoToLabel(issue.issue_date)}</Text>
      </View>

      {issue.intro !== null && issue.intro.trim().length > 0 && (
        <Text style={styles.intro}>{issue.intro}</Text>
      )}

      {availableCategories.length > 1 && (
        <View style={styles.filterRow}>
          <Pressable onPress={() => setActiveCategory(null)} accessibilityRole="button">
            <Text style={activeCategory === null ? styles.filterActive : styles.filter}>전체</Text>
          </Pressable>
          {availableCategories.map((c) => {
            const active = activeCategory === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => toggleCategory(c.key as NewsCategory)}
                accessibilityRole="button"
              >
                <Text style={active ? styles.filterActive : styles.filter}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  masthead: { borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 16 },
  kicker: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkMuted },
  date: { marginTop: 8, fontFamily: fonts.serif, fontSize: 40, lineHeight: 44, color: colors.ink },
  intro: { marginTop: 20, fontFamily: fonts.serif, fontSize: 19, lineHeight: 31, color: colors.inkSoft },
  filterRow: { marginTop: 24, flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 16, rowGap: 6 },
  filter: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
  filterActive: { fontFamily: fonts.sans, fontSize: 13, color: colors.accent, textDecorationLine: "underline" },
});
