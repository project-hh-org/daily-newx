import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { isoToLabel } from "@/lib/date";
import { colors, fonts } from "@/lib/theme";
import { useStory } from "@/hooks/useDailyIssue";

type Props = {
  slug: string | null; // story_slug ?? follow_up_of
  currentId: string;
};

/** 같은 이야기의 과거~현재 흐름. 스레드가 2건 이상일 때만 표시. */
export function StoryThread({ slug, currentId }: Props): ReactElement | null {
  const router = useRouter();
  const query = useStory(slug);

  if (slug === null) return null;
  if (query.isPending || query.error) return null;
  const items = query.data?.items ?? [];
  if (items.length <= 1) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>이 이야기의 흐름</Text>
      <View style={styles.list}>
        {items.map((it) => {
          const isCurrent = it.id === currentId;
          return (
            <Pressable
              key={it.id}
              disabled={isCurrent}
              onPress={() => router.push(`/article/${it.id}`)}
              accessibilityRole="link"
              style={styles.row}
            >
              <Text style={styles.date}>{isoToLabel(it.issue_date)}</Text>
              <Text style={isCurrent ? styles.titleCurrent : styles.title}>{it.title}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: 16 },
  label: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkMuted },
  list: { marginTop: 10, borderLeftWidth: 2, borderLeftColor: colors.rule, paddingLeft: 14, gap: 12 },
  row: { gap: 2 },
  date: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: colors.inkMuted },
  title: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 22, color: colors.accent },
  titleCurrent: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 22, color: colors.ink },
});
