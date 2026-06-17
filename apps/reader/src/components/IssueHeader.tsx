import type { ReactElement } from "react";
import { View, Text, Pressable } from "react-native";
import type { DailyIssue, NewsCategory } from "@/types/news.types";
import type { CategoryMeta } from "@/lib/categories";
import { isoToLabel } from "@/lib/date";
import { useUiStore } from "@/store/uiStore";

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
      {/* 마스트헤드 */}
      <View className="border-b-2 border-ink pb-4 dark:border-[#ECE6DA]">
        <Text className="font-sans text-[11px] uppercase tracking-kicker text-ink-muted dark:text-[#8C8475]">
          매일의 LLM 뉴스{issue.issue_no !== null ? `   ·   제 ${issue.issue_no} 호` : ""}
        </Text>
        <Text className="mt-2 font-serif text-[40px] leading-[44px] text-ink dark:text-[#ECE6DA]">
          {isoToLabel(issue.issue_date)}
        </Text>
      </View>

      {issue.intro !== null && issue.intro.trim().length > 0 && (
        <Text className="mt-5 font-serif text-lead text-ink-soft dark:text-[#C9C1B2]">
          {issue.intro}
        </Text>
      )}

      {availableCategories.length > 1 && (
        <View className="mt-6 flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
          <Pressable onPress={() => setActiveCategory(null)} accessibilityRole="button">
            <Text
              className={
                activeCategory === null
                  ? "font-sans text-[13px] text-accent underline"
                  : "font-sans text-[13px] text-ink-muted dark:text-[#8C8475]"
              }
            >
              전체
            </Text>
          </Pressable>
          {availableCategories.map((c) => {
            const active = activeCategory === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => toggleCategory(c.key as NewsCategory)}
                accessibilityRole="button"
              >
                <Text
                  className={
                    active
                      ? "font-sans text-[13px] text-accent underline"
                      : "font-sans text-[13px] text-ink-muted dark:text-[#8C8475]"
                  }
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
