import type { ReactElement } from "react";
import type { ArticleCard } from "@/lib/cards";
import { paginateArticle } from "@/lib/cards";
import { useArticle } from "@/hooks/useDailyIssue";
import { isoToCompact } from "@/lib/date";
import { DeckShell } from "@/ui/DeckShell";
import { ArticleCoverCard } from "@/components/cards/ArticleCoverCard";
import { ArticleSummaryCard } from "@/components/cards/ArticleSummaryCard";
import { BlockCard } from "@/components/cards/BlockCard";
import { ArticleLegacyCard } from "@/components/cards/ArticleLegacyCard";
import { ArticleSourceCard } from "@/components/cards/ArticleSourceCard";
import { LoadingView, ErrorView, NotFoundView } from "@/components/StateViews";
import { NotFoundError } from "@/services/dailyNewsApi";

type Props = {
  id: string;
};

/** 기사 기본 화면 — 카드 좌우 스와이프 덱. 기존 세로 스크롤 뷰는 /article/[id]/text 에 보존. */
export function ArticleDeckScreen({ id }: Props): ReactElement {
  const query = useArticle(id);

  if (query.isPending) return <LoadingView />;
  if (query.error instanceof NotFoundError) return <NotFoundView label="아티클" />;
  if (query.error) return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const a = query.data;
  if (a === undefined) return <LoadingView />;

  const compact = isoToCompact(a.issue_date);
  const deck = paginateArticle(a);

  return (
    <DeckShell<ArticleCard>
      data={deck}
      keyExtractor={(card, i) => `${card.kind}-${i}`}
      renderItem={(card) => {
        switch (card.kind) {
          case "cover":
            return <ArticleCoverCard article={a} compact={compact} />;
          case "summary":
            return <ArticleSummaryCard summary={a.summary} />;
          case "blocks":
            return <BlockCard blocks={card.blocks} />;
          case "legacy":
            return <ArticleLegacyCard article={a} />;
          case "source":
            return <ArticleSourceCard article={a} />;
          default:
            return null;
        }
      }}
    />
  );
}
