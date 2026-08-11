import { useMemo, type ReactElement } from "react";
import type { IssueCard } from "@/lib/cards";
import { buildIssueDeck, flattenIssueItems } from "@/lib/cards";
import { useDailyIssue } from "@/hooks/useDailyIssue";
import { useUiStore } from "@/store/uiStore";
import { DeckShell } from "@/ui/DeckShell";
import { CoverCard } from "@/components/cards/CoverCard";
import { ItemCard } from "@/components/cards/ItemCard";
import { OutroCard } from "@/components/cards/OutroCard";
import { LoadingView, ErrorView, NotFoundView } from "@/components/StateViews";
import { NotFoundError } from "@/services/dailyNewsApi";

type Props = {
  compactDate: string;
  notice?: string; // 발행 전/없음 등 상단 안내(커버 카드에 표시)
};

/** 일간 호 기본 화면 — 카드 좌우 스와이프 덱. 기존 목록 뷰는 /daily/[date]/list 에 보존. */
export function IssueDeckScreen({ compactDate, notice }: Props): ReactElement {
  const activeCategory = useUiStore((s) => s.activeCategory);
  const lastDeckPosition = useUiStore((s) => s.lastDeckPosition);
  const setLastDeckPosition = useUiStore((s) => s.setLastDeckPosition);
  const query = useDailyIssue(compactDate);

  const flatItems = useMemo(
    () => flattenIssueItems(query.data?.items ?? [], activeCategory),
    [query.data, activeCategory],
  );
  const deck = useMemo(() => {
    if (query.data === undefined) return [];
    return buildIssueDeck(query.data.issue, flatItems);
  }, [query.data, flatItems]);

  if (query.isPending) return <LoadingView />;
  if (query.error instanceof NotFoundError) return <NotFoundView label={compactDate} />;
  if (query.error) return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const data = query.data;
  if (data === undefined) return <LoadingView />;
  const { issue } = data;

  const initialIndex =
    lastDeckPosition !== null && lastDeckPosition.compactDate === compactDate ? lastDeckPosition.index : 0;

  return (
    <DeckShell<IssueCard>
      data={deck}
      initialIndex={initialIndex}
      onIndexChange={(index) => setLastDeckPosition({ compactDate, index })}
      keyExtractor={(card, i) =>
        card.kind === "item" ? (card.item.id ?? `item-${i}`) : `${card.kind}-${i}`
      }
      renderItem={(card) => {
        switch (card.kind) {
          case "cover":
            return (
              <CoverCard issue={issue} itemCount={flatItems.length} compactDate={compactDate} notice={notice} />
            );
          case "item":
            return <ItemCard item={card.item} index={card.index} />;
          case "outro":
            return <OutroCard issue={issue} compactDate={compactDate} />;
          default:
            return null;
        }
      }}
    />
  );
}
