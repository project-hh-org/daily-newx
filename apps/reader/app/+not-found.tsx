import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, fonts } from "@/lib/theme";

export default function NotFound(): ReactElement {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.msg}>페이지를 찾을 수 없어요</Text>
      <Text style={styles.sub}>주소가 바뀌었거나 삭제된 페이지일 수 있어요.</Text>
      <Pressable onPress={() => router.replace("/")} accessibilityRole="button" style={styles.btn}>
        <Text style={styles.btnText}>오늘 호로 →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", padding: 24 },
  code: { fontFamily: fonts.serif, fontSize: 64, color: colors.spot },
  msg: { marginTop: 8, fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  sub: { marginTop: 8, fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted, textAlign: "center" },
  btn: { marginTop: 24, backgroundColor: colors.spot, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12, cursor: "pointer" },
  btnText: { fontFamily: fonts.sans, fontSize: 14, fontWeight: "700", color: colors.paper },
});
