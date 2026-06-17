import type { ReactElement } from "react";
import { View, Text } from "react-native";

type Props = {
  label: string;
  value: string | null | undefined;
  tone?: "default" | "action";
};

/** 값이 있을 때만 렌더. 빈 값/널이면 아무것도 그리지 않는다(선택필드 규칙). */
export function OptionalField({ label, value, tone = "default" }: Props): ReactElement | null {
  if (value === null || value === undefined || value.trim().length === 0) return null;

  // "지금 할 일" 등 행동 강조 — 왼쪽 罫선 풀쿼트.
  if (tone === "action") {
    return (
      <View className="mt-5 border-l-2 border-accent pl-4">
        <Text className="font-sans text-[12px] font-semibold text-accent">{label}</Text>
        <Text className="mt-1 font-sans text-body text-ink dark:text-[#ECE6DA]">{value}</Text>
      </View>
    );
  }

  return (
    <View className="mt-4">
      <Text className="font-sans text-[12px] font-semibold text-ink-muted dark:text-[#8C8475]">
        {label}
      </Text>
      <Text className="mt-0.5 font-sans text-body text-ink-soft dark:text-[#C9C1B2]">{value}</Text>
    </View>
  );
}
