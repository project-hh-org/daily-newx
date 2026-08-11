import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { DailyIssue } from "@/types/news.types";
import { PUBLISH_HOUR } from "@/lib/date";
import { useColors, space } from "@/lib/theme";
import { Type } from "@/ui/Type";
import { CardFrame } from "@/ui/CardFrame";

type Props = {
  issue: DailyIssue;
  compactDate: string;
};

/** 일간 호 덱의 마지막 장 — outro + 아카이브/목록 이동. */
export function OutroCard({ issue, compactDate }: Props): ReactElement {
  const router = useRouter();
  const c = useColors();

  return (
    <CardFrame>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Type variant="meta" tone="inkMuted" style={{ textAlign: "center", marginBottom: space.lg }}>
          · · ·
        </Type>
        {issue.outro !== null && (
          <Type variant="body" tone="inkSoft" style={{ textAlign: "center" }}>
            {issue.outro}
          </Type>
        )}

        <View
          style={{ marginTop: space.xxl, borderTopWidth: 1, borderTopColor: c.rule, paddingTop: space.lg, gap: space.md }}
        >
          <Type variant="caption" tone="inkMuted" style={{ textAlign: "center" }}>
            {`브리핑 LLM · 매일 오전 ${PUBLISH_HOUR}시 발행 · 원문 출처 표기`}
          </Type>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: space.xl }}>
            <Pressable onPress={() => router.push(`/daily/${compactDate}/list`)} accessibilityRole="link">
              <Type variant="label" tone="accent" style={{ cursor: "pointer" }}>
                목록으로 보기
              </Type>
            </Pressable>
            <Pressable onPress={() => router.push("/archive")} accessibilityRole="link">
              <Type variant="label" tone="accent" style={{ cursor: "pointer" }}>
                지난 브리핑
              </Type>
            </Pressable>
          </View>
        </View>
      </View>
    </CardFrame>
  );
}
