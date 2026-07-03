import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren, ReactElement } from "react";

// 웹 전용 HTML 셸 — 폰트 주입(제목: 나눔명조 / 본문: Pretendard).
// 네이티브에선 적용되지 않음(추후 expo-font 로 로드 필요).
export default function Root({ children }: PropsWithChildren): ReactElement {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* 기본 메타(SPA라 전 라우트 공통) — per-article 미리보기는 Vercel /a/{id} SSR 페이지에서 제공 */}
        <title>브리핑 LLM · 오늘의 LLM 소식</title>
        <meta name="description" content="매일 오전 9시, LLM 업데이트·연구·산업 소식" />
        <meta property="og:site_name" content="브리핑 LLM" />
        <meta property="og:title" content="브리핑 LLM" />
        <meta property="og:description" content="오늘의 LLM 소식 — 매일 오전 9시 발행" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* 제목: 나눔명조 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
        {/* 본문: Pretendard */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/pretendard.css"
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
