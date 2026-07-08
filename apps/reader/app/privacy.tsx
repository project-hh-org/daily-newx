import type { ReactElement } from "react";
import { space } from "@/lib/theme";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";

const CONTACT = "dahee@project-hh.com";

export default function Privacy(): ReactElement {
  return (
    <Screen>
      <Type variant="label" tone="accent">
        브리핑 LLM
      </Type>
      <Type variant="display" style={{ marginTop: space.sm }}>
        개인정보 처리방침
      </Type>
      <Type variant="meta" tone="inkMuted" style={{ marginTop: space.xs }}>
        시행일 2026년 7월 8일
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        1. 수집하는 정보
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        브리핑 LLM은 회원가입·로그인이 없으며 이름·이메일 등 개인을 식별할 수 있는 정보를 수집하지
        않습니다. 다음 정보만 처리합니다.
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.xs }}>
        · 푸시 알림 토큰(기기 식별자): 새 소식 발행 알림을 보내기 위해서만 사용하며, 알림을 켠 경우에만
        저장됩니다.
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.xs }}>
        · 앱 설정(선택한 도구 목록, 읽음 상태): 기기 안에만 저장되며 서버로 전송되지 않습니다.
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        2. 이용 목적
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        수집한 푸시 토큰은 오직 “발행 알림 전송” 목적에만 이용합니다.
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        3. 제3자 제공·판매 및 광고
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        수집 정보를 제3자에게 판매하거나 광고·마케팅 목적으로 제공하지 않습니다. 앱 이용을 추적(트래킹)하지
        않습니다. 알림 전송은 Apple(APNs) 및 Expo 푸시 인프라를 경유합니다.
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        4. 보관 및 삭제
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        알림을 끄거나 앱을 삭제하면 해당 기기의 푸시 토큰은 더 이상 사용되지 않으며, 정리 시 삭제됩니다.
        삭제를 원하시면 아래 연락처로 요청해 주세요.
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        5. 아동
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        본 서비스는 아동을 대상으로 하지 않으며, 아동의 개인정보를 알면서 수집하지 않습니다.
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        6. 변경 고지
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>
        본 방침이 변경되면 본 페이지를 통해 고지합니다.
      </Type>

      <Type variant="h2" style={{ marginTop: 28 }}>
        7. 문의
      </Type>
      <Type variant="body" tone="inkSoft" style={{ marginTop: space.sm }}>{`개인정보 관련 문의: ${CONTACT}`}</Type>
    </Screen>
  );
}
