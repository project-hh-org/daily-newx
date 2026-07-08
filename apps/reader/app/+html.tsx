import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren, ReactElement } from "react";

// 웹 전용 HTML 셸 — 제목(G마켓 산스 woff2, public/fonts) + 본문(Pretendard) 주입.
// 네이티브는 _layout 의 useFonts 가 로컬 TTF 를 로드(웹에선 TTF 미사용).
const GMARKET_FONT_FACE = `
@font-face{font-family:'GmarketSansTTFLight';src:url('/fonts/GmarketSansTTFLight.woff2') format('woff2');font-display:swap}
@font-face{font-family:'GmarketSansTTFMedium';src:url('/fonts/GmarketSansTTFMedium.woff2') format('woff2');font-display:swap}
@font-face{font-family:'GmarketSansTTFBold';src:url('/fonts/GmarketSansTTFBold.woff2') format('woff2');font-display:swap}
`;

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

        {/* 네이버 서치어드바이저 사이트 소유 확인 */}
        <meta name="naver-site-verification" content="907d0db1a86bf6aa0ed8c66314ed29fcaee564a6" />

        {/* 기본 메타(SPA라 전 라우트 공통) — per-article 미리보기는 /share/{id} SSR 페이지에서 제공 */}
        <title>브리핑 LLM · 오늘의 LLM 소식</title>
        <meta name="description" content="매일 오전 9시, LLM 업데이트·연구·산업 소식" />
        <meta property="og:site_name" content="브리핑 LLM" />
        <meta property="og:title" content="브리핑 LLM" />
        <meta property="og:description" content="오늘의 LLM 소식 — 매일 오전 9시 발행" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />

        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* 제목: G마켓 산스(로컬 woff2) */}
        <style dangerouslySetInnerHTML={{ __html: GMARKET_FONT_FACE }} />
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
