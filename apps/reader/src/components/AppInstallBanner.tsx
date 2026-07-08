import { useState, type ReactElement } from "react";
import { Platform, View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";
import { APP_INSTALL_URL } from "@/services/config";

/** 웹 진입 시 앱 설치 유도 배너(웹 전용, 닫기 가능). 설치 URL 미설정이면 렌더 안 함. */
export function AppInstallBanner(): ReactElement | null {
  const [dismissed, setDismissed] = useState(false);
  if (Platform.OS !== "web" || APP_INSTALL_URL === null || dismissed) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.text} numberOfLines={1}>
        앱으로 더 편하게 — 알림·빠른 로딩
      </Text>
      <Pressable
        onPress={() => void Linking.openURL(APP_INSTALL_URL)}
        accessibilityRole="link"
        style={styles.btn}
      >
        <Text style={styles.btnText}>앱 설치</Text>
      </Pressable>
      <Pressable onPress={() => setDismissed(true)} accessibilityRole="button" hitSlop={8}>
        <Text style={styles.close}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.spot,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: { flex: 1, fontFamily: fonts.sans, fontSize: 13, color: colors.paper },
  btn: { backgroundColor: colors.paper, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, cursor: "pointer" },
  wrapCursor: { cursor: "pointer" },
  btnText: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "700", color: colors.spot },
  close: { fontFamily: fonts.sans, fontSize: 14, color: colors.paper },
});
