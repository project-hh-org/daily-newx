import type { ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

export default function NotFound(): ReactElement {
  const router = useRouter();
  const c = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.paper,
        alignItems: "center",
        justifyContent: "center",
        padding: space.xl,
      }}
    >
      <Type variant="display" tone="accent" style={{ fontSize: 64, lineHeight: 72 }}>
        404
      </Type>
      <Type variant="h1" style={{ marginTop: space.sm }}>
        페이지를 찾을 수 없어요
      </Type>
      <Type variant="body" tone="inkMuted" style={{ marginTop: space.sm, textAlign: "center" }}>
        주소가 바뀌었거나 삭제된 페이지일 수 있어요.
      </Type>
      <Pressable
        onPress={() => router.replace("/")}
        accessibilityRole="button"
        style={{
          marginTop: space.xl,
          backgroundColor: c.accent,
          borderRadius: radius.md,
          paddingHorizontal: 20,
          paddingVertical: space.md,
          cursor: "pointer",
        }}
      >
        <Type variant="label" tone="paper">
          오늘 브리핑으로 →
        </Type>
      </Pressable>
    </View>
  );
}
