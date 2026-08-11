import type { ReactElement } from "react";
import { Pressable, Share, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import { useArticle } from "@/hooks/useDailyIssue";
import { useBackOr } from "@/hooks/useBackOr";
import { PUBLIC_WEB_BASE } from "@/services/config";
import { isoToLabel, isoToCompact } from "@/lib/date";
import { categoryLabel } from "@/lib/categories";
import { space } from "@/lib/theme";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { OptionalField } from "@/components/OptionalField";
import { Bullets } from "@/components/Bullets";
import { ArticleBlocks } from "@/components/ArticleBlocks";
import { SourceLine } from "@/components/SourceLine";
import { MetaFooter } from "@/components/MetaFooter";
import { StoryThread } from "@/components/StoryThread";
import { LoadingView, ErrorView, NotFoundView } from "@/components/StateViews";
import { NotFoundError } from "@/services/dailyNewsApi";

type Props = {
  id: string;
};

// 아카이브(세로 스크롤) 뷰 — 기본 화면은 카드 덱(ArticleDeckScreen)으로 전환됨. 이 화면은
// /article/[id]/text 에서 계속 접근 가능하도록 코드를 유지한다(삭제하지 않기로 결정).
export function ArticleScreen({ id }: Props): ReactElement {
  const backOr = useBackOr();
  const router = useRouter();
  const query = useArticle(id);

  if (query.isPending) return <LoadingView />;
  if (query.error instanceof NotFoundError) return <NotFoundView label="아티클" />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const a = query.data;
  if (a === undefined) return <LoadingView />;

  const compact = isoToCompact(a.issue_date);

  const onShare = (): void => {
    const url = `${PUBLIC_WEB_BASE}/share/${a.id}`;
    // iOS: url 만 → OG 카드 하나. Android: url 미지원이라 message 로.
    void Share.share(Platform.OS === "ios" ? { url } : { message: `${a.title}\n${url}` });
  };

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
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

        <Pressable
          onPress={() => router.push(`/article/${a.id}`)}
          accessibilityRole="link"
          accessibilityLabel="카드로 보기"
          hitSlop={8}
        >
          <Type variant="label" tone="accent" style={{ cursor: "pointer" }}>
            카드로 보기
          </Type>
        </Pressable>
      </View>

      <Type variant="display" style={{ marginTop: space.lg }}>
        {a.title}
      </Type>

      {a.tldr !== null && a.tldr.trim().length > 0 && (
        <Type variant="h2" style={{ marginTop: space.md }}>
          {a.tldr}
        </Type>
      )}

      <Type variant="body" tone="inkSoft" style={{ marginTop: space.lg }}>
        {a.summary}
      </Type>

      <Pressable
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel="공유하기"
        hitSlop={8}
        style={{ marginTop: space.lg, alignSelf: "flex-start", cursor: "pointer" }}
      >
        <Type variant="label" tone="accent">
          공유하기 ↗
        </Type>
      </Pressable>

      {a.blocks.length > 0 ? (
        <ArticleBlocks blocks={a.blocks} />
      ) : (
        <>
          <Bullets label="핵심 포인트" points={a.key_points} />
          <OptionalField label="얻는 것" value={a.what_you_get} />
          <OptionalField label="왜 지금" value={a.why_now} />
          <OptionalField label="지금 할 일" value={a.action} tone="action" />
        </>
      )}

      <SourceLine
        sourceName={a.source_name}
        sourceUrl={a.source_url}
        publishedAt={a.source_published_at}
        related={a.related}
      />

      <MetaFooter category={a.category} tags={a.tags} entities={a.entities} />

      <StoryThread slug={a.story_slug ?? a.follow_up_of} currentId={a.id} />
    </Screen>
  );
}
