import type { ReactElement } from "react";
import { Text } from "react-native";

type Props = {
  tags: readonly string[];
};

/** 토픽 태그 — 알약 칩 대신 쉼표(·) 나열의 절제된 메타 라인. */
export function Tags({ tags }: Props): ReactElement | null {
  const items = tags.filter((t) => t.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <Text className="mt-4 font-sans text-[13px] leading-5 text-ink-muted dark:text-[#8C8475]">
      <Text className="font-semibold">주제  </Text>
      {items.join("   ·   ")}
    </Text>
  );
}
