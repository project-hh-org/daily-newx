"use client";

import type { ReactElement } from "react";

type Props = {
  deepLink: string; // dailynewx://article/{id}
  installUrl: string | null; // App Store / TestFlight
};

// 앱 설치돼 있으면 스킴으로 앱 열기, 없으면 잠시 뒤 설치 URL 로 폴백.
export function AppOpenButton({ deepLink, installUrl }: Props): ReactElement {
  const onClick = (): void => {
    const started = Date.now();
    window.location.href = deepLink;
    if (installUrl) {
      window.setTimeout(() => {
        // 앱이 열렸으면 페이지가 백그라운드로 가 타이머가 늦어짐 → 아직 여기면 미설치로 간주.
        if (Date.now() - started < 1800) window.location.href = installUrl;
      }, 1200);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-block",
        padding: "10px 18px",
        background: "#22324F",
        color: "#F2F0E9",
        border: "none",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      앱에서 보기
    </button>
  );
}
