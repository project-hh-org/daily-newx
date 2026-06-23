// 에디토리얼 지면 토큰 (라이트 전용). StyleSheet 에서 공유.
// 폰트: 웹은 +html.tsx 에서 로드한 나눔명조/Pretendard, 네이티브는 시스템 폴백(추후 expo-font).
// 팔레트: bone(따뜻한 종이) · 근접 블랙 잉크 · 딥 잉크네이비 스폿.
// Figma 토큰(tokens 변수 컬렉션)과 1:1.
export const colors = {
  paper: "#F2F0E9",
  surface: "#FAF8F3",
  card: "#FAF8F3", // legacy alias of surface
  ink: "#15161A",
  inkSoft: "#34353A", // body
  inkMuted: "#8B8A86", // muted
  rule: "#D8D5CC", // hairline
  accent: "#22324F", // spot (navy)
  spot: "#22324F",
  spotTint: "#E7E9EF",
  white: "#FFFFFF",
} as const;

export const fonts = {
  serif: "Nanum Myeongjo, Georgia, serif",
  sans: "Pretendard, -apple-system, system-ui, sans-serif",
} as const;

export const MAX_READING = 680;
