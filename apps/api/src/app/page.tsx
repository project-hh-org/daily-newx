import type { ReactElement } from "react";

export const dynamic = "force-static";

const READER_BASE = process.env.NEXT_PUBLIC_READER_BASE ?? "https://daily-newx.project-hh.com";

export default function Home(): ReactElement {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "80px 24px",
        fontFamily: "Pretendard, -apple-system, system-ui, sans-serif",
        color: "#34353A",
        background: "#F2F0E9",
        minHeight: "100vh",
      }}
    >
      <p style={{ fontSize: 13, letterSpacing: 1, color: "#22324F", fontWeight: 700, margin: 0 }}>
        브리핑 LLM
      </p>
      <h1 style={{ fontSize: 34, lineHeight: 1.3, color: "#15161A", margin: "8px 0 12px" }}>
        매일 오전 9시, 오늘의 LLM 소식
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7 }}>
        빠르게 바뀌는 LLM·AI 흐름을 출처와 함께 매일 아침 정리해 드립니다.
      </p>
      <p style={{ marginTop: 24 }}>
        <a
          href={READER_BASE}
          style={{
            display: "inline-block",
            padding: "10px 18px",
            background: "#22324F",
            color: "#F2F0E9",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          웹에서 읽기 →
        </a>
      </p>
    </main>
  );
}
