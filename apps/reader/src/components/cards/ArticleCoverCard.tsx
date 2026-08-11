import type { ReactElement } from "react";
import { Pressable, Share, Platform } from "react-native";
import type { Article } from "@/types/news.types";
import { useBackOr } from "@/hooks/useBackOr";
import { PUBLIC_WEB_BASE } from "@/services/config";
import { isoToLabel } from "@/lib/date";
import { categoryLabel } from "@/lib/categories";
import { space } from "@/lib/theme";
import { Type } from "@/ui/Type";
import { CardFrame } from "@/ui/CardFrame";

type Props = {
  article: Article;
  compact: string | undefined; // issue_date 를 compact(YYYYMMDD)로 변환한 값 — 뒤로가기 폴백 경로 계산용
};

/** 기사 덱의 첫 장 — 뒤로가기 크럼 · 제목 · tldr · 공유. */
export function ArticleCoverCard({ article: a, compact }: Props): ReactElement {
  const backOr = useBackOr();

  const onShare = (): void => {
    const url = `${PUBLIC_WEB_BASE}/share/${a.id}`;
    // iOS: url 만 → OG 카드 하나. Android: url 미지원이라 message 로.
    void Share.share(Platform.OS === "ios" ? { url } : { message: `${a.title}\n${url}` });
  };

  return (
    <CardFrame>
      <Pressable
        onPress={() => backOr(compact !== undefined ? `/daily/${compact}` : "/")}
        accessibilityRole="link"
        accessibilityLabel="돌아가기"
        hitSlop={8}
      >
        <Type variant="meta" tone="accentDim" style={{ cursor: "pointer" }}>
          {`‹ ${isoToLabel(a.issue_date)} · ${categoryLabel(a.category)}`}
        </Type>
      </Pressable>

      <Type variant="display" style={{ marginTop: space.lg }}>
        {a.title}
      </Type>

      {a.tldr !== null && a.tldr.trim().length > 0 && (
        <Type variant="h2" style={{ marginTop: space.md }}>
          {a.tldr}
        </Type>
      )}

      <Pressable
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel="공유하기"
        hitSlop={8}
        style={{ marginTop: space.xl, alignSelf: "flex-start", cursor: "pointer" }}
      >
        <Type variant="label" tone="accent">
          공유하기 ↗
        </Type>
      </Pressable>
    </CardFrame>
  );
}
