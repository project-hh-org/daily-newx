// 터미널 / CLI 룩 · 모노크롬. 라이트=V2 웜 그레이 / 다크=V1 뉴트럴.
// 악센트는 별도 hue 없이 잉크색 자체 → 프롬프트($, ›)·인덱스·강조에 사용.
// 컴포넌트는 useColors() 로 모드에 맞는 팔레트를 받는다(Step 3에서 이전).
import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/store/settingsStore";

export type Palette = {
  paper: string; // 페이지 캔버스
  surface: string; // 카드/승격 표면
  card: string; // legacy alias of surface
  surfaceAlt: string; // hover/선택 베이스
  ink: string; // primary text
  inkSoft: string; // body
  inkMuted: string; // muted/meta
  rule: string; // hairline
  accent: string; // 스폿(= 잉크색, 모노)
  accentDim: string; // 보조 강조(hover·프리픽스)
  accentTint: string; // 선택/하이라이트 배경
  spot: string; // legacy alias of accent
  spotDim: string; // legacy alias of accentDim
  spotTint: string; // legacy alias of accentTint
  white: string;
};

// 라이트 = V2 웜 그레이(눈 피로 적음).
export const lightColors: Palette = {
  paper: "#FAF9F7",
  surface: "#F2F0EC",
  card: "#F2F0EC",
  surfaceAlt: "#EAE7E1",
  ink: "#1C1917",
  inkSoft: "#33302B",
  inkMuted: "#6E6659", // AA on paper·surface
  rule: "#E8E4DE",
  accent: "#1C1917",
  accentDim: "#57534E",
  accentTint: "#EFEBE4",
  spot: "#1C1917",
  spotDim: "#57534E",
  spotTint: "#EFEBE4",
  white: "#FFFFFF",
};

export const darkColors: Palette = {
  paper: "#0A0A0A",
  surface: "#161616",
  card: "#161616",
  surfaceAlt: "#1F1F1F",
  ink: "#F5F5F5",
  inkSoft: "#DCDCDC",
  inkMuted: "#8A8A8A", // AA on paper·surface
  rule: "#262626",
  accent: "#FFFFFF",
  accentDim: "#A8A8A8",
  accentTint: "#1A1A1A",
  spot: "#FFFFFF",
  spotDim: "#A8A8A8",
  spotTint: "#1A1A1A",
  white: "#FFFFFF",
};

// 설정(테마모드) + 시스템 스킴을 반영해 팔레트 반환.
export function useColors(): Palette {
  const system = useColorScheme();
  const mode = useSettingsStore((s) => s.themeMode);
  const effective = mode === "system" ? (system === "dark" ? "dark" : "light") : mode;
  return effective === "dark" ? darkColors : lightColors;
}

// 하위호환: 기존 정적 import 용 기본값(라이트). Step 3에서 useColors() 로 이전.
export const colors = lightColors;

// 제목/헤딩 = G마켓 산스(로컬 번들 TTF, 가중치별 패밀리) · 한글 본문·메타 = Pretendard.
// 네이티브는 fontWeight 로 굵기 전환이 안 되므로 굵기별 패밀리를 직접 지정.
export const fonts = {
  displayLight: "GmarketSansTTFLight, Pretendard, -apple-system, system-ui, sans-serif",
  display: "GmarketSansTTFMedium, Pretendard, -apple-system, system-ui, sans-serif",
  displayBold: "GmarketSansTTFBold, Pretendard, -apple-system, system-ui, sans-serif",
  serif: "GmarketSansTTFBold, Pretendard, -apple-system, system-ui, sans-serif", // legacy alias → bold display
  sans: "Pretendard, -apple-system, system-ui, sans-serif",
} as const;

// 타입 스케일(px). size/lineHeight. weight·letterSpacing 은 컴포넌트에서 지정.
export const typeScale = {
  display: { fontSize: 28, lineHeight: 34 },
  h1: { fontSize: 22, lineHeight: 30 },
  h2: { fontSize: 18, lineHeight: 26 },
  body: { fontSize: 15, lineHeight: 25 },
  meta: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 12, lineHeight: 16 },
  caption: { fontSize: 11, lineHeight: 15 },
} as const;

// 간격 스케일(4/8 기반) — padding·gap.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

// 모서리 반경.
export const radius = { sm: 6, md: 8, lg: 12, pill: 999 } as const;

// 사이징 — 컨트롤 높이·최소 터치타겟·아이콘·헤어라인.
export const sizing = { touch: 44, control: 44, iconSm: 16, iconMd: 20, iconLg: 24, hairline: 1 } as const;

export const MAX_READING = 680;
