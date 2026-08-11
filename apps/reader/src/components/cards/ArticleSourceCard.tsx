import type { ReactElement } from "react";
import type { Article } from "@/types/news.types";
import { SourceLine } from "@/components/SourceLine";
import { MetaFooter } from "@/components/MetaFooter";
import { StoryThread } from "@/components/StoryThread";
import { CardFrame } from "@/ui/CardFrame";

type Props = {
  article: Article;
};

/** 기사 덱의 마지막 장 — 출처 · 메타(카테고리/키워드/대상) · 스토리 흐름. */
export function ArticleSourceCard({ article: a }: Props): ReactElement {
  return (
    <CardFrame>
      <SourceLine
        sourceName={a.source_name}
        sourceUrl={a.source_url}
        publishedAt={a.source_published_at}
        related={a.related}
      />
      <MetaFooter category={a.category} tags={a.tags} entities={a.entities} />
      <StoryThread slug={a.story_slug ?? a.follow_up_of} currentId={a.id} />
    </CardFrame>
  );
}
