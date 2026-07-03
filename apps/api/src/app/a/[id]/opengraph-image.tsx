import { ImageResponse } from "next/og";
import { getArticleById } from "@/services/newsRepository";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "브리핑 LLM";

const CATEGORY_LABEL: Record<string, string> = {
  headline: "헤드라인",
  release: "릴리스 · 제품",
  paper: "연구 · 논문",
  community: "커뮤니티",
  business: "산업 · 비즈니스",
};

// satori(next/og)는 woff/ttf/otf 지원(woff2 미지원). 로드 실패 시 기본 폰트로 폴백(한글 tofu 가능).
// 폰트 경로가 안 맞으면 이 URL만 바꾸면 됨.
const FONT_URL = "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.woff";

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(FONT_URL);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OgImage({
  params,
}: {
  params: { id: string };
}): Promise<ImageResponse> {
  const a = (await getArticleById(params.id)) as { title?: string; category?: string } | null;
  const title = (a?.title ?? "브리핑 LLM").slice(0, 80);
  const kicker = CATEGORY_LABEL[a?.category ?? ""] ?? "오늘의 LLM 소식";
  const font = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F2F0E9",
          padding: 72,
          fontFamily: "NotoSansKR",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 2, color: "#22324F", fontWeight: 700 }}>
          {kicker}
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.25, color: "#15161A", fontWeight: 700 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8B8A86" }}>브리핑 LLM · 매일 오전 9시</div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "NotoSansKR", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
