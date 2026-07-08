import type { ReactElement, ReactNode } from "react";
import { Text, type TextProps, type StyleProp, type TextStyle } from "react-native";
import { useColors, fonts, typeScale, type Palette } from "@/lib/theme";

type Variant = keyof typeof typeScale;
type Tone = "ink" | "inkSoft" | "inkMuted" | "accent" | "accentDim" | "paper";

// G마켓 산스 사용 변형(제목 계열). display 만 Bold, 나머지(h1/h2/label)는 Medium. 본문은 Pretendard.
const GMARKET: ReadonlySet<Variant> = new Set<Variant>(["display", "h1", "h2", "label"]);
const fontFor = (v: Variant): string =>
  v === "display" ? fonts.displayBold : GMARKET.has(v) ? fonts.display : fonts.sans;

const toneOf = (c: Palette, t: Tone): string =>
  ({ ink: c.ink, inkSoft: c.inkSoft, inkMuted: c.inkMuted, accent: c.accent, accentDim: c.accentDim, paper: c.paper }[t]);

type Props = Omit<TextProps, "style"> & {
  variant?: Variant;
  tone?: Tone;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

/** 타입 스케일·폰트·모드색을 캡슐화한 텍스트 프리미티브. */
export function Type({ variant = "body", tone = "ink", style, children, ...rest }: Props): ReactElement {
  const c = useColors();
  const s = typeScale[variant];
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFor(variant),
          fontSize: s.fontSize,
          lineHeight: s.lineHeight,
          color: toneOf(c, tone),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
