import type { ReactElement } from "react";
import { View, Pressable, Share, Linking, Platform } from "react-native";
import { useRouter } from "expo-router";
import type { DailyItem } from "@/types/news.types";
import { categoryLabel } from "@/lib/categories";
import { API_BASE } from "@/services/config";
import { space, fonts } from "@/lib/theme";
import { Type } from "@/ui/Type";
import { CardFrame } from "@/ui/CardFrame";

type Props = {
  item: DailyItem;
  index: number; // 1-기반 순번(전체 흐름 기준)
};

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 일간 호 덱의 항목 카드 — 탭하면 해당 기사의 카드 덱(/article/[id])으로 이동. */
export function ItemCard({ item, index }: Props): ReactElement {
  const router = useRouter();
  const dek = item.tldr !== null && item.tldr.trim().length > 0 ? item.tldr : item.summary;
  const articleId = item.id;
  const ord = String(index).padStart(2, "0");

  const openArticle = (): void => {
    if (articleId !== null) router.push(`/article/${articleId}`);
  };

  // 카드 이미지 내보내기(1차 범위: 항목 요약 카드만) — 새 네이티브 의존 없이
  // 웹은 이미지 URL을 새 탭으로(길게 눌러/우클릭 저장), 앱은 기존과 동일한 Share 패턴 재사용.
  const onShareImage = (): void => {
    if (articleId === null) return;
    const cardImageUrl = `${API_BASE}/api/card-image/${articleId}`;
    if (Platform.OS === "web") {
      void Linking.openURL(cardImageUrl);
    } else {
      void Share.share(Platform.OS === "ios" ? { url: cardImageUrl } : { message: cardImageUrl });
    }
  };

  return (
    <CardFrame
      footer={
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable
            onPress={onShareImage}
            disabled={articleId === null}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} 카드 이미지로 공유`}
            style={{ opacity: articleId === null ? 0.4 : 1 }}
          >
            <Type variant="label" tone="accentDim" style={{ cursor: articleId === null ? undefined : "pointer" }}>
              이미지로 공유 ⇪
            </Type>
          </Pressable>
          <Pressable
            onPress={openArticle}
            disabled={articleId === null}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} 자세히 보기`}
            style={{ opacity: articleId === null ? 0.4 : 1 }}
          >
            <Type variant="label" tone="accent" style={{ cursor: articleId === null ? undefined : "pointer" }}>
              자세히 보기 ›
            </Type>
          </Pressable>
        </View>
      }
    >
      <Pressable onPress={openArticle} disabled={articleId === null} accessibilityRole="link" style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.md }}>
          <Type variant="meta" tone="accentDim" style={{ fontFamily: fonts.display }}>
            {`[${ord}]`}
          </Type>
          <Type variant="label" tone="accentDim">
            {categoryLabel(item.category)}
          </Type>
        </View>

        <Type variant="display" style={{ marginTop: space.md }}>
          {item.title}
        </Type>

        <Type variant="body" tone="inkSoft" style={{ marginTop: space.lg }}>
          {dek}
        </Type>

        <Type variant="meta" tone="inkMuted" style={{ marginTop: space.xl }}>
          {`› ${item.source_name} · ${hostOf(item.source_url)}`}
        </Type>
      </Pressable>
    </CardFrame>
  );
}
