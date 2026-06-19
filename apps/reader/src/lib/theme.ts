// 에디토리얼 지면 토큰 (라이트 전용). StyleSheet 에서 공유.
// 폰트: 웹은 +html.tsx 에서 로드한 나눔명조/Pretendard, 네이티브는 시스템 폴백(추후 expo-font).
export const colors = {
  paper: "#F7F4EC",
  card: "#FFFDF8",
  ink: "#1B1815",
  inkSoft: "#4A443B",
  inkMuted: "#8C8475",
  rule: "#E2DBCC",
  accent: "#B23A24",
  white: "#FFFFFF",
} as const;

export const fonts = {
  serif: "Nanum Myeongjo, Georgia, serif",
  sans: "Pretendard, -apple-system, system-ui, sans-serif",
} as const;

export const MAX_READING = 680;
