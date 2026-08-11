import type { ReactElement } from "react";
import type { Article } from "@/types/news.types";
import { Bullets } from "@/components/Bullets";
import { OptionalField } from "@/components/OptionalField";
import { CardFrame } from "@/ui/CardFrame";

type Props = {
  article: Pick<Article, "key_points" | "what_you_get" | "why_now" | "action">;
};

/** blocks 없는 옛 기사용 본문 카드 — key_points/what_you_get/why_now/action. */
export function ArticleLegacyCard({ article: a }: Props): ReactElement {
  return (
    <CardFrame>
      <Bullets label="핵심 포인트" points={a.key_points} />
      <OptionalField label="얻는 것" value={a.what_you_get} />
      <OptionalField label="왜 지금" value={a.why_now} />
      <OptionalField label="지금 할 일" value={a.action} tone="action" />
    </CardFrame>
  );
}
