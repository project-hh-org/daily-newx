import type { ReactElement } from "react";
import type { Block } from "@/types/news.types";
import { ArticleBlocks } from "@/components/ArticleBlocks";
import { CardFrame } from "@/ui/CardFrame";

type Props = {
  blocks: readonly Block[];
};

/** 기사 본문 카드 1장 — chunkBlocks 로 나눈 블록 묶음 하나를 기존 ArticleBlocks 렌더러로 그린다. */
export function BlockCard({ blocks }: Props): ReactElement {
  return (
    <CardFrame>
      <ArticleBlocks blocks={blocks} />
    </CardFrame>
  );
}
