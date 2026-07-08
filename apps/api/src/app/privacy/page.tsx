import type { Metadata } from "next";
import type { CSSProperties, ReactElement } from "react";

export const metadata: Metadata = {
  title: "개인정보 처리방침 · 브리핑 LLM",
  description: "브리핑 LLM 개인정보 처리방침",
};

const CONTACT = "dahee@project-hh.com";
const EFFECTIVE = "2026년 7월 8일";

const wrap: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "48px 24px 80px",
  fontFamily: "Pretendard, -apple-system, system-ui, sans-serif",
  color: "#34353A",
  background: "#F2F0E9",
  minHeight: "100vh",
  lineHeight: 1.75,
};
const h1: CSSProperties = { fontSize: 30, color: "#15161A", margin: "0 0 8px" };
const h2: CSSProperties = { fontSize: 18, color: "#15161A", margin: "32px 0 8px" };
const muted: CSSProperties = { color: "#8B8A86", fontSize: 14 };
const a: CSSProperties = { color: "#22324F", fontWeight: 700 };

export default function PrivacyPage(): ReactElement {
  return (
    <main style={wrap}>
      <h1 style={h1}>개인정보 처리방침</h1>
      <p style={muted}>브리핑 LLM (daily-newx) · 시행일 {EFFECTIVE}</p>

      <h2 style={h2}>1. 수집하는 정보</h2>
      <p>
        브리핑 LLM은 회원가입·로그인이 없으며 이름·이메일 등 개인을 식별할 수 있는 정보를 수집하지
        않습니다. 다음 정보만 처리합니다.
      </p>
      <ul>
        <li>
          <strong>푸시 알림 토큰</strong>(기기 식별자): 새 소식 발행 알림을 보내기 위해서만
          사용합니다. 알림을 켠 경우에만 저장됩니다.
        </li>
        <li>
          <strong>앱 설정</strong>(예: 선택한 도구 목록, 읽음 상태): 사용자의 기기 안에만 저장되며
          서버로 전송되지 않습니다.
        </li>
      </ul>

      <h2 style={h2}>2. 이용 목적</h2>
      <p>수집한 푸시 토큰은 오직 “발행 알림 전송” 목적에만 이용합니다. 그 외 목적으로 사용하지 않습니다.</p>

      <h2 style={h2}>3. 제3자 제공·판매 및 광고</h2>
      <p>
        수집 정보를 제3자에게 판매하거나 광고·마케팅 목적으로 제공하지 않습니다. 앱 이용을 추적(트래킹)하지
        않습니다. 알림 전송은 Apple(APNs) 및 Expo 푸시 인프라를 경유합니다.
      </p>

      <h2 style={h2}>4. 보관 및 삭제</h2>
      <p>
        알림을 끄거나 앱을 삭제하면 해당 기기의 푸시 토큰은 더 이상 사용되지 않으며, 정리 시 삭제됩니다.
        본인 정보의 삭제를 원하시면 아래 연락처로 요청해 주세요.
      </p>

      <h2 style={h2}>5. 아동</h2>
      <p>본 서비스는 아동을 대상으로 하지 않으며, 아동의 개인정보를 알면서 수집하지 않습니다.</p>

      <h2 style={h2}>6. 변경 고지</h2>
      <p>본 방침이 변경되면 본 페이지를 통해 고지합니다.</p>

      <h2 style={h2}>7. 문의</h2>
      <p>
        개인정보 관련 문의: <a style={a} href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>
    </main>
  );
}
