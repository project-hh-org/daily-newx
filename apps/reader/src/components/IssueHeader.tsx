import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import type { DailyIssue } from "@/types/news.types";
import { isoToLabel } from "@/lib/date";
import { colors, fonts } from "@/lib/theme";

type Props = {
  issue: DailyIssue;
};

const SECTIONS: ReadonlyArray<{ label: string; href: Href }> = [
  { label: "내 도구", href: "/tools" },
  { label: "카테고리", href: "/categories" },
  { label: "주제", href: "/topics" },
  { label: "주체", href: "/entities" },
  { label: "지난 호", href: "/archive" },
];

/** 발행물 마스트헤드 — 워드마크 + 발행 메타 + 섹션 메뉴. */
export function IssueHeader({ issue }: Props): ReactElement {
  const router = useRouter();
  const hasIntro = issue.intro !== null && issue.intro.trim().length > 0;

  return (
    <View>
      <View style={styles.util}>
        <Text style={styles.date}>{isoToLabel(issue.issue_date)}</Text>
        {issue.issue_no !== null && <Text style={styles.issueNo}>제 {issue.issue_no} 호</Text>}
      </View>

      <Text style={styles.wordmark}>데일리 LLM 뉴스</Text>
      <Text style={styles.subtitle}>오늘의 LLM 소식</Text>

      {hasIntro && <Text style={styles.intro}>{issue.intro}</Text>}

      <View style={styles.rule} />

      <View style={styles.nav}>
        {SECTIONS.map((s) => (
          <Pressable
            key={s.label}
            onPress={() => router.push(s.href)}
            accessibilityRole="link"
            accessibilityLabel={`${s.label} 보기`}
            hitSlop={8}
          >
            <Text style={styles.navItem}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  util: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  date: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 0.3, color: colors.inkMuted },
  issueNo: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, color: colors.spot },
  wordmark: { marginTop: 12, fontFamily: fonts.serif, fontSize: 31, lineHeight: 38, color: colors.ink },
  subtitle: { marginTop: 6, fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
  intro: { marginTop: 14, fontFamily: fonts.serif, fontSize: 17, lineHeight: 27, color: colors.inkSoft },
  rule: { marginTop: 16, height: 2, backgroundColor: colors.ink },
  nav: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 18, rowGap: 8 },
  navItem: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "600", color: colors.inkSoft },
});
