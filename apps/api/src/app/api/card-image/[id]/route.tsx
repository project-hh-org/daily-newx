import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getArticleById } from "@/services/newsRepository";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return corsPreflight();
}

// 인스타그램 등 세로 피드에 맞춘 4:5 카드 비율.
const size = { width: 1080, height: 1350 };

const CATEGORY_LABEL: Record<string, string> = {
  headline: "헤드라인",
  release: "릴리스 · 제품",
  paper: "연구 · 논문",
  community: "커뮤니티",
  business: "산업 · 비즈니스",
};

// satori(next/og)는 woff2 미지원 — TTF/OTF/WOFF만 가능. 리더 앱에 이미 번들된
// G마켓 산스 TTF 를 그대로 복사해 사용(apps/api/assets/fonts, 상업적 웹/앱 임베드 라이선스 확인됨).
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const path = join(process.cwd(), "assets", "fonts", "GmarketSansTTFBold.ttf");
    const buf = await readFile(path);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    return null;
  }
}

type ArticleLike = {
  title?: string;
  category?: string;
  tldr?: string | null;
  summary?: string;
  source_name?: string;
};

// GET /api/card-image/{uuid} — 일간 호 항목 카드를 1080x1350 PNG 로 렌더(공유/이미지 저장용).
// 1차 범위는 항목 요약 카드만(본문 카드 이미지화는 별도 승인 필요 — card-news-plan.md 참고).
export async function GET(
  _req: Request,
  ctx: { params: { id: string } },
): Promise<Response> {
  const a = (await getArticleById(ctx.params.id)) as ArticleLike | null;
  if (a === null) {
    return new Response("not found", { status: 404, headers: CORS_HEADERS });
  }

  const title = (a.title ?? "브리핑 LLM").slice(0, 60);
  const kicker = CATEGORY_LABEL[a.category ?? ""] ?? "오늘의 LLM 소식";
  const tldr = a.tldr ?? "";
  const dek = (tldr.trim().length > 0 ? tldr : (a.summary ?? "")).slice(0, 120);
  const font = await loadFont();

  const image = new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF9F7",
          padding: 64,
          fontFamily: "GmarketSans",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 2, color: "#57534E" }}>
          {"$ today --llm"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 1, color: "#1C1917" }}>
            {kicker}
          </div>
          <div style={{ display: "flex", fontSize: 56, lineHeight: 1.3, color: "#1C1917" }}>
            {title}
          </div>
          {dek.length > 0 && (
            <div style={{ display: "flex", fontSize: 28, lineHeight: 1.5, color: "#33302B" }}>
              {dek}
            </div>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#6E6659" }}>
          {`브리핑 LLM · ${a.source_name ?? ""}`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "GmarketSans", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );

  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    image.headers.set(k, v);
  }
  return image;
}
