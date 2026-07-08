import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useColors, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

type Props = {
  kicker: string;
  title: string;
  subtitle?: string;
  crumb?: { label: string; onPress: () => void };
};

/** 리스트/탐색 화면 공용 마스트헤드 (선택적 뒤로가기 크럼). */
export function ScreenHeader({ kicker, title, subtitle, crumb }: Props): ReactElement {
  const c = useColors();
  return (
    <View>
      {crumb !== undefined && (
        <Pressable
          onPress={crumb.onPress}
          accessibilityRole="link"
          accessibilityLabel={`${crumb.label}(으)로 돌아가기`}
          hitSlop={8}
        >
          <Type variant="meta" tone="accentDim" style={{ cursor: "pointer" }}>{`‹ ${crumb.label}`}</Type>
        </Pressable>
      )}
      <View style={{ marginTop: space.lg, borderBottomWidth: 2, borderBottomColor: c.accent, paddingBottom: space.lg }}>
        <Type variant="label" tone="accentDim">{kicker}</Type>
        <Type variant="display" style={{ marginTop: space.sm }}>{title}</Type>
        {subtitle !== undefined && (
          <Type variant="meta" tone="inkMuted" style={{ marginTop: space.sm }}>{subtitle}</Type>
        )}
      </View>
    </View>
  );
}
