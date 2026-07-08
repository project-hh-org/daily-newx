import type { ReactElement } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, MAX_READING } from "@/lib/theme";

const CONTACT = "dahee@project-hh.com";

export default function Privacy(): ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 64 }}
    >
      <View style={styles.col}>
        <Text style={styles.kicker}>브리핑 LLM</Text>
        <Text style={styles.h1}>개인정보 처리방침</Text>
        <Text style={styles.meta}>시행일 2026년 7월 8일</Text>

        <Text style={styles.h2}>1. 수집하는 정보</Text>
        <Text style={styles.p}>
          브리핑 LLM은 회원가입·로그인이 없으며 이름·이메일 등 개인을 식별할 수 있는 정보를 수집하지
          않습니다. 다음 정보만 처리합니다.
        </Text>
        <Text style={styles.li}>
          · 푸시 알림 토큰(기기 식별자): 새 소식 발행 알림을 보내기 위해서만 사용하며, 알림을 켠 경우에만
          저장됩니다.
        </Text>
        <Text style={styles.li}>
          · 앱 설정(선택한 도구 목록, 읽음 상태): 기기 안에만 저장되며 서버로 전송되지 않습니다.
        </Text>

        <Text style={styles.h2}>2. 이용 목적</Text>
        <Text style={styles.p}>
          수집한 푸시 토큰은 오직 “발행 알림 전송” 목적에만 이용합니다.
        </Text>

        <Text style={styles.h2}>3. 제3자 제공·판매 및 광고</Text>
        <Text style={styles.p}>
          수집 정보를 제3자에게 판매하거나 광고·마케팅 목적으로 제공하지 않습니다. 앱 이용을 추적(트래킹)하지
          않습니다. 알림 전송은 Apple(APNs) 및 Expo 푸시 인프라를 경유합니다.
        </Text>

        <Text style={styles.h2}>4. 보관 및 삭제</Text>
        <Text style={styles.p}>
          알림을 끄거나 앱을 삭제하면 해당 기기의 푸시 토큰은 더 이상 사용되지 않으며, 정리 시 삭제됩니다.
          삭제를 원하시면 아래 연락처로 요청해 주세요.
        </Text>

        <Text style={styles.h2}>5. 아동</Text>
        <Text style={styles.p}>본 서비스는 아동을 대상으로 하지 않으며, 아동의 개인정보를 알면서 수집하지 않습니다.</Text>

        <Text style={styles.h2}>6. 변경 고지</Text>
        <Text style={styles.p}>본 방침이 변경되면 본 페이지를 통해 고지합니다.</Text>

        <Text style={styles.h2}>7. 문의</Text>
        <Text style={styles.p}>개인정보 관련 문의: {CONTACT}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  col: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 24 },
  kicker: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1, fontWeight: "700", color: colors.spot },
  h1: { marginTop: 8, fontFamily: fonts.serif, fontSize: 30, lineHeight: 40, color: colors.ink },
  meta: { marginTop: 6, fontFamily: fonts.sans, fontSize: 13, color: colors.inkMuted },
  h2: { marginTop: 28, fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  p: { marginTop: 8, fontFamily: fonts.sans, fontSize: 15, lineHeight: 25, color: colors.inkSoft },
  li: { marginTop: 6, fontFamily: fonts.sans, fontSize: 15, lineHeight: 25, color: colors.inkSoft },
});
