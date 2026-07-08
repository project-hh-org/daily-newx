import { useState, type ReactElement } from "react";
import { Platform, View, Pressable, Linking } from "react-native";
import { useColors, radius, space } from "@/lib/theme";
import { Type } from "@/ui/Type";
import { APP_INSTALL_URL } from "@/services/config";

/** 웹 진입 시 앱 설치 유도 배너(웹 전용, 닫기 가능). 설치 URL 미설정이면 렌더 안 함. */
export function AppInstallBanner(): ReactElement | null {
  const c = useColors();
  const [dismissed, setDismissed] = useState(false);
  if (Platform.OS !== "web" || APP_INSTALL_URL === null || dismissed) return null;
  const installUrl: string = APP_INSTALL_URL;

  return (
    <View
      style={{
        marginTop: space.md,
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        backgroundColor: c.accent,
        borderRadius: radius.md,
        paddingHorizontal: space.lg,
        paddingVertical: space.sm,
      }}
    >
      <Type variant="meta" tone="paper" numberOfLines={1} style={{ flex: 1 }}>
        앱으로 더 편하게 — 알림·빠른 로딩
      </Type>
      <Pressable
        onPress={() => void Linking.openURL(installUrl)}
        accessibilityRole="link"
        style={{ backgroundColor: c.paper, borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: 6, cursor: "pointer" }}
      >
        <Type variant="label" tone="ink">앱 설치</Type>
      </Pressable>
      <Pressable onPress={() => setDismissed(true)} accessibilityRole="button" hitSlop={8}>
        <Type variant="meta" tone="paper" style={{ cursor: "pointer" }}>✕</Type>
      </Pressable>
    </View>
  );
}
