/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 종이 지면 팔레트 — 파랑/회색 기본값 대신 따뜻한 잉크 톤.
        paper: "#F7F4EC",
        ink: {
          DEFAULT: "#1B1815",
          soft: "#4A443B",
          muted: "#8C8475",
        },
        rule: "#E2DBCC",
        accent: "#B23A24", // 절제된 버밀리언(러스트) — 링크·강조에만.
      },
      fontFamily: {
        // 제목: 나눔명조 / 본문: Pretendard (app/+html.tsx 에서 웹 폰트 로드).
        serif: ["Nanum Myeongjo", "Georgia", "serif"],
        sans: ["Pretendard", "-apple-system", "system-ui", "Apple SD Gothic Neo", "sans-serif"],
      },
      maxWidth: {
        reading: "680px",
      },
      fontSize: {
        body: ["16px", { lineHeight: "27px" }],
        lead: ["19px", { lineHeight: "31px" }],
      },
      letterSpacing: {
        kicker: "0.14em",
      },
    },
  },
  plugins: [],
};
