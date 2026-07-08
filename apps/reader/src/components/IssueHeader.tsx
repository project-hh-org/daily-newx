import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useRouter, type Href } from "expo-router";
import type { DailyIssue } from "@/types/news.types";
import { isoToLabel } from "@/lib/date";
import { useColors, fonts, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

type Props = {
  issue: DailyIssue;
};

const SECTIONS: ReadonlyArray<{ label: string; href: Href }> = [
  { label: "내 도구", href: "/tools" },
  { label: "카테고리", href: "/categories" },
  { label: "키워드", href: "/topics" },
  { label: "대상", href: "/entities" },
  { label: "지난 브리핑", href: "/archive" },
  { label: "설정", href: "/settings" },
];

/** 발행물 마스트헤드 — CLI 프롬프트 + 표제 + 발행 메타 + 섹션 메뉴. */
export function IssueHeader({ issue }: Props): ReactElement {
  const router = useRouter();
  const c = useColors();
  const hasIntro = issue.intro !== null && issue.intro.trim().length > 0;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Type variant="meta" tone="inkMuted">
          {isoToLabel(issue.issue_date)}
        </Type>
        {issue.issue_no !== null && (
          <Type variant="label" tone="accentDim">{`No.${issue.issue_no}`}</Type>
        )}
      </View>

      <Type variant="label" tone="accentDim" style={{ marginTop: space.lg, fontFamily: fonts.display }}>
        {"$ today --llm"}
      </Type>
      <Type variant="display" style={{ marginTop: 6 }}>
        오늘의 LLM 소식
      </Type>

      {hasIntro && (
        <Type variant="body" tone="inkSoft" style={{ marginTop: space.md }}>
          {issue.intro}
        </Type>
      )}

      <View style={{ marginTop: space.lg, height: 2, backgroundColor: c.accent }} />

      <View
        style={{
          marginTop: space.md,
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 18,
          rowGap: space.sm,
        }}
      >
        {SECTIONS.map((s) => (
          <Pressable
            key={s.label}
            onPress={() => router.push(s.href)}
            accessibilityRole="link"
            accessibilityLabel={`${s.label} 보기`}
            hitSlop={8}
          >
            <Type variant="meta" tone="inkSoft" style={{ cursor: "pointer" }}>
              {s.label}
            </Type>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
