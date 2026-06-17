import type { ReactElement } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { formatSourceDate } from "@/lib/date";

type Props = {
  sourceName: string;
  sourceUrl: string;
  publishedAt: string | null | undefined;
  related: readonly string[];
};

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function openUrl(url: string): void {
  void Linking.openURL(url);
}

/** 출처(필수) + 원문 발행일(선택) + 관련 링크(선택). 헤어라인으로 본문과 분리. */
export function SourceLine({
  sourceName,
  sourceUrl,
  publishedAt,
  related,
}: Props): ReactElement {
  const relatedItems = related.filter((r) => r.trim().length > 0);
  const hasPublished =
    publishedAt !== null && publishedAt !== undefined && publishedAt.length > 0;

  return (
    <View className="mt-5 border-t border-rule pt-3 dark:border-[#2A251F]">
      <View className="flex-row flex-wrap items-baseline gap-x-2 gap-y-1">
        <Text className="font-sans text-[13px] text-ink-muted dark:text-[#8C8475]">
          출처
        </Text>
        <Pressable onPress={() => openUrl(sourceUrl)} accessibilityRole="link">
          <Text className="font-sans text-[13px] text-accent underline">
            {sourceName} · {hostOf(sourceUrl)}
          </Text>
        </Pressable>
        {hasPublished && (
          <Text className="font-sans text-[13px] text-ink-muted dark:text-[#8C8475]">
            · 원문 {formatSourceDate(publishedAt)}
          </Text>
        )}
      </View>

      {relatedItems.length > 0 && (
        <View className="mt-1.5 flex-row flex-wrap items-baseline gap-x-2 gap-y-1">
          <Text className="font-sans text-[13px] text-ink-muted dark:text-[#8C8475]">
            관련
          </Text>
          {relatedItems.map((r, i) => (
            <Pressable key={i} onPress={() => openUrl(r)} accessibilityRole="link">
              <Text className="font-sans text-[13px] text-accent underline">{hostOf(r)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
