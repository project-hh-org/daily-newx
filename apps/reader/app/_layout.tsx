import { useEffect, useState, type ReactElement } from "react";
import { View, Pressable, Platform } from "react-native";
import { Stack, router, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { registerPushToken } from "@/services/pushRegistration";
import { useSettingsStore } from "@/store/settingsStore";
import { useColors, useEffectiveScheme, radius, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

// 렌더 중 예외 시 표시(500 성격). expo-router 가 자동으로 사용.
export function ErrorBoundary({ retry }: ErrorBoundaryProps): ReactElement {
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
        500
      </Type>
      <Type variant="h1" style={{ marginTop: space.sm }}>
        문제가 발생했어요
      </Type>
      <Type variant="body" tone="inkMuted" style={{ marginTop: space.sm, textAlign: "center" }}>
        잠시 후 다시 시도해 주세요.
      </Type>
      <Pressable
        onPress={() => void retry()}
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
          다시 시도
        </Type>
      </Pressable>
    </View>
  );
}

export default function RootLayout(): ReactElement {
  const c = useColors();
  const scheme = useEffectiveScheme();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false },
        },
      }),
  );

  // 네이티브는 로컬 번들 폰트(G마켓 TTF · Pretendard OTF), 웹은 +html 의 woff2 @font-face 사용.
  const [fontsLoaded] = useFonts(
    Platform.OS === "web"
      ? {}
      : {
          GmarketSansTTFLight: require("../assets/fonts/GmarketSansTTFLight.ttf"),
          GmarketSansTTFMedium: require("../assets/fonts/GmarketSansTTFMedium.ttf"),
          GmarketSansTTFBold: require("../assets/fonts/GmarketSansTTFBold.ttf"),
          Pretendard: require("../assets/fonts/Pretendard-Regular.otf"),
          PretendardSemiBold: require("../assets/fonts/Pretendard-SemiBold.otf"),
        },
  );

  const notify = useSettingsStore((s) => s.notify);
  const settingsHydrated = useSettingsStore((s) => s.hasHydrated);

  // 알림 설정이 켜져 있을 때만 푸시 토큰 등록.
  useEffect(() => {
    if (settingsHydrated && notify) void registerPushToken();
  }, [settingsHydrated, notify]);

  useEffect(() => {
    // 푸시 탭 → 해당 호로 이동.
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const date = response.notification.request.content.data?.date;
      if (typeof date === "string" && /^\d{8}$/.test(date)) {
        router.push(`/daily/${date}`);
      }
    });
    return () => sub.remove();
  }, []);

  // 네이티브는 로컬 폰트 로드까지 대기(즉시). 웹은 fallback→swap 이라 대기 안 함.
  if (!fontsLoaded && Platform.OS !== "web") {
    return <View style={{ flex: 1, backgroundColor: c.paper }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {/* 설정 테마(라이트/다크/시스템)를 따라 상태바 대비 반전 */}
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
