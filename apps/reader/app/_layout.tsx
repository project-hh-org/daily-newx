import { useEffect, useState, type ReactElement } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Stack, router, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { registerPushToken } from "@/services/pushRegistration";
import { useSettingsStore } from "@/store/settingsStore";
import { colors, fonts } from "@/lib/theme";

// 렌더 중 예외 시 표시(500 성격). expo-router 가 자동으로 사용.
export function ErrorBoundary({ retry }: ErrorBoundaryProps): ReactElement {
  return (
    <View style={eb.wrap}>
      <Text style={eb.code}>500</Text>
      <Text style={eb.msg}>문제가 발생했어요</Text>
      <Text style={eb.sub}>잠시 후 다시 시도해 주세요.</Text>
      <Pressable onPress={() => void retry()} accessibilityRole="button" style={eb.btn}>
        <Text style={eb.btnText}>다시 시도</Text>
      </Pressable>
    </View>
  );
}

const eb = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", padding: 24 },
  code: { fontFamily: fonts.serif, fontSize: 64, color: colors.spot },
  msg: { marginTop: 8, fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  sub: { marginTop: 8, fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted, textAlign: "center" },
  btn: { marginTop: 24, backgroundColor: colors.spot, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12, cursor: "pointer" },
  btnText: { fontFamily: fonts.sans, fontSize: 14, fontWeight: "700", color: colors.paper },
});

export default function RootLayout(): ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false },
        },
      }),
  );

  // 네이티브는 로컬 번들 TTF, 웹은 +html 의 woff2 @font-face 사용(웹은 TTF 로드 안 함).
  const [fontsLoaded] = useFonts(
    Platform.OS === "web"
      ? {}
      : {
          GmarketSansTTFLight: require("../assets/fonts/GmarketSansTTFLight.ttf"),
          GmarketSansTTFMedium: require("../assets/fonts/GmarketSansTTFMedium.ttf"),
          GmarketSansTTFBold: require("../assets/fonts/GmarketSansTTFBold.ttf"),
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
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
