import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { isoToLabel } from "@/lib/date";
import { useColors, space } from "@/lib/theme";
import { Type } from "@/ui/Type";
import { useStory } from "@/hooks/useDailyIssue";

type Props = {
  slug: string | null; // story_slug ?? follow_up_of
  currentId: string;
};

/** 같은 이야기의 과거~현재 흐름. 스레드가 2건 이상일 때만 표시. */
export function StoryThread({ slug, currentId }: Props): ReactElement | null {
  const router = useRouter();
  const c = useColors();
  const query = useStory(slug);

  if (slug === null) return null;
  if (query.isPending || query.error) return null;
  const items = query.data?.items ?? [];
  if (items.length <= 1) return null;

  return (
    <View style={{ marginTop: space.xl, borderTopWidth: 1, borderTopColor: c.rule, paddingTop: space.lg }}>
      <Type variant="label" tone="inkMuted">
        이 이야기의 흐름
      </Type>
      <View style={{ marginTop: 10, borderLeftWidth: 2, borderLeftColor: c.rule, paddingLeft: 14, gap: space.md }}>
        {items.map((it) => {
          const isCurrent = it.id === currentId;
          return (
            <Pressable
              key={it.id}
              disabled={isCurrent}
              onPress={() => router.push(`/article/${it.id}`)}
              accessibilityRole="link"
              style={{ gap: 2, cursor: "pointer" }}
            >
              <Type variant="caption" tone="inkMuted">
                {isoToLabel(it.issue_date)}
              </Type>
              <Type variant="h2" tone={isCurrent ? "ink" : "accent"}>
                {it.title}
              </Type>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
