import type { ReactElement } from "react";
import { Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { space } from "@/lib/theme";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";

const CONTACT = "dahee@project-hh.com";

export default function Support(): ReactElement {
  const router = useRouter();
  return (
    <Screen>
      <Type variant="label" tone="accent">
        브리핑 LLM
      </Type>
      <Type variant="display" style={{ marginTop: space.sm }}>
        지원
      </Type>
      <Type variant="meta" tone="inkMuted" style={{ marginTop: space.xs }}>
        매일 오전 9시, 오늘의 LLM 소식
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        문의
      </Type>
      <Pressable onPress={() => void Linking.openURL(`mailto:${CONTACT}`)} accessibilityRole="link">
        <Type variant="body" tone="accent" style={{ marginTop: space.sm, cursor: "pointer" }}>
          {CONTACT}
        </Type>
      </Pressable>

      <Type variant="h2" style={{ marginTop: 28 }}>
        자주 묻는 질문
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        알림이 오지 않아요 — 기기 설정 → 알림에서 브리핑 LLM 알림이 켜져 있는지 확인해 주세요. 새 소식은
        매일 오전 9시경 발행됩니다.
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        “내 도구” 업데이트가 비어 있어요 — 화면에서 사용하는 도구를 선택하면 매일 최신 업데이트가
        채워집니다.
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        저장된 정보를 지우고 싶어요 — 이 앱은 회원가입이 없어 이름·이메일 같은 개인정보를 받지 않습니다.
        알림을 켠 경우에만 기기 푸시 토큰이 저장되며, 앱을 삭제하거나 알림을 끄면 더 이상 사용되지 않습니다.
        즉시 삭제를 원하면 위 이메일로 요청해 주세요.
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        개인정보
      </Type>
      <Pressable onPress={() => router.push("/privacy")} accessibilityRole="link">
        <Type variant="body" tone="accent" style={{ marginTop: space.sm, cursor: "pointer" }}>
          개인정보 처리방침
        </Type>
      </Pressable>
    </Screen>
  );
}
