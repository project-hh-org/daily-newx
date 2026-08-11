import type { ReactElement } from "react";
import { space } from "@/lib/theme";
import { Type } from "@/ui/Type";
import { CardFrame } from "@/ui/CardFrame";

type Props = {
  summary: string;
};

/** 기사 덱 둘째 장 — 요약. */
export function ArticleSummaryCard({ summary }: Props): ReactElement {
  return (
    <CardFrame>
      <Type variant="label" tone="inkMuted">
        요약
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.md }}>
        {summary}
      </Type>
    </CardFrame>
  );
}
