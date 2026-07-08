import type { Metadata } from "next";
import type { CSSProperties, ReactElement } from "react";

export const metadata: Metadata = {
  title: "지원 · 브리핑 LLM",
  description: "브리핑 LLM 고객 지원",
};

const CONTACT = "dahee@project-hh.com";

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

export default function SupportPage(): ReactElement {
  return (
    <main style={wrap}>
      <h1 style={h1}>지원</h1>
      <p style={muted}>브리핑 LLM — 매일 오전 9시, 오늘의 LLM 소식</p>

      <h2 style={h2}>문의</h2>
      <p>
        문의·버그 신고·삭제 요청: <a style={a} href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>

      <h2 style={h2}>자주 묻는 질문</h2>
      <p>
        <strong>알림이 오지 않아요.</strong> 기기 설정 → 알림에서 브리핑 LLM 알림이 켜져 있는지
        확인해 주세요. 새 소식은 매일 오전 9시경 발행됩니다.
      </p>
      <p>
        <strong>“내 도구” 업데이트가 비어 있어요.</strong> 화면에서 사용하는 도구를 선택하면 매일 최신
        업데이트가 채워집니다.
      </p>
      <p>
        <strong>내 정보를 삭제하고 싶어요.</strong> 위 이메일로 요청하시면 처리해 드립니다.
      </p>

      <h2 style={h2}>개인정보</h2>
      <p>
        <a style={a} href="/privacy">
          개인정보 처리방침
        </a>
      </p>
    </main>
  );
}
