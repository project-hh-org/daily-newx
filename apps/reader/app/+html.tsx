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
