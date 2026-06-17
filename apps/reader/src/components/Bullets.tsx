import type { ReactElement } from "react";
import { View, Text } from "react-native";

type Props = {
  label?: string;
  points: readonly string[];
};

/** key_points — 행잉 인덴트 + 액센트 대시. 비어 있으면 렌더하지 않는다. */
export function Bullets({ label, points }: Props): ReactElement | null {
  const items = points.filter((p) => p.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <View className="mt-4">
      {label !== undefined && (
        <Text className="font-sans text-[12px] font-semibold text-ink-muted dark:text-[#8C8475]">
          {label}
        </Text>
      )}
      <View className="mt-1.5 gap-2">
        {items.map((p, i) => (
          <View key={i} className="flex-row gap-3">
            <Text className="font-serif text-accent">—</Text>
            <Text className="flex-1 font-sans text-body text-ink-soft dark:text-[#C9C1B2]">
              {p}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
