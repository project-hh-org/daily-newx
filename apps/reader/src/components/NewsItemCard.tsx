import type { ReactElement } from "react";
import { useRouter } from "expo-router";
import type { DailyItem } from "@/types/news.types";
import { categoryLabel } from "@/lib/categories";
import { TocRow } from "@/ui/TocRow";

type Props = {
  item: DailyItem;
  index: number; // 흐름 내 1-기반 순번
  first?: boolean;
};

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 목차 항목 — 도메인(DailyItem)을 UI 프리미티브 TocRow 로 매핑. */
export function NewsItemCard({ item, index, first = false }: Props): ReactElement {
  const router = useRouter();
  const articleId = item.id;
  const dek = item.tldr !== null && item.tldr.trim().length > 0 ? item.tldr : item.summary;

  return (
    <TocRow
      index={index}
      first={first}
      kicker={categoryLabel(item.category)}
      title={item.title}
      dek={dek}
      source={`${item.source_name} · ${hostOf(item.source_url)}`}
      onPress={() => {
        if (articleId !== null) router.push(`/article/${articleId}`);
      }}
      disabled={articleId === null}
      accessibilityLabel={`${categoryLabel(item.category)}, ${item.title}`}
    />
  );
}
