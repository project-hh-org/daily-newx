import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useRouter, type Href } from "expo-router";
import type { DailyIssue } from "@/types/news.types";
import { isoToLabel } from "@/lib/date";
import { useColors, fonts, radius, space } from "@/lib/theme";
import { Type } from "@/ui/Type";
import { CardFrame } from "@/ui/CardFrame";
import { AppInstallBanner } from "@/components/AppInstallBanner";
import { ToolsBanner } from "@/components/ToolsBanner";

type Props = {
  issue: DailyIssue;
  itemCount: number;
  compactDate: string;
  notice?: string;
};

const SECTIONS: readonly { label: string; href: Href }[] = [
  { label: "내 도구", href: "/tools" },
  { label: "카테고리", href: "/categories" },
  { label: "키워드", href: "/topics" },
  { label: "대상", href: "/entities" },
  { label: "지난 브리핑", href: "/archive" },
  { label: "설정", href: "/settings" },
];

/** 일간 호 덱의 첫 장 — 날짜·호수·intro·건수 + 둘러보기 메뉴 + 목록 보기 전환. */
export function CoverCard({ issue, itemCount, compactDate, notice }: Props): ReactElement {
  const router = useRouter();
  const c = useColors();
  const hasIntro = issue.intro !== null && issue.intro.trim().length > 0;

  return (
    <CardFrame>
      <AppInstallBanner />
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

      {notice !== undefined && (
        <View
          style={{
            marginTop: space.lg,
            backgroundColor: c.accentTint,
            borderRadius: radius.md,
            paddingHorizontal: space.lg,
            paddingVertical: space.md,
          }}
        >
          <Type variant="meta" tone="inkSoft">
            {notice}
          </Type>
        </View>
      )}

      {hasIntro && (
        <Type variant="body" tone="inkSoft" style={{ marginTop: space.md }}>
          {issue.intro}
        </Type>
      )}

      <View style={{ marginTop: space.lg, height: 2, backgroundColor: c.accent }} />

      <Type variant="meta" tone="inkMuted" style={{ marginTop: space.md }}>
        {itemCount > 0 ? `${itemCount}건 · 좌우로 넘겨보세요 ›` : "오늘은 소식이 없어요"}
      </Type>

      <ToolsBanner />

      <View
        style={{
          marginTop: space.xl,
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

      <Pressable
        onPress={() => router.push(`/daily/${compactDate}/list`)}
        accessibilityRole="link"
        accessibilityLabel="목록으로 보기"
        hitSlop={8}
        style={{ marginTop: space.lg, alignSelf: "flex-start" }}
      >
        <Type variant="label" tone="accent" style={{ cursor: "pointer" }}>
          목록으로 보기 ↗
        </Type>
      </Pressable>
    </CardFrame>
  );
}
