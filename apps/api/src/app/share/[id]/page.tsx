import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getArticleById } from "@/services/newsRepository";
import { AppOpenButton } from "./AppOpenButton";

const APP_INSTALL_URL = process.env.NEXT_PUBLIC_APP_INSTALL_URL ?? null;
const APP_STORE_ID = process.env.NEXT_PUBLIC_APP_STORE_ID;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 공유(unfurl)용 SSR 페이지. SPA 리더는 크롤러가 메타를 못 읽으므로,
// 공유 링크는 이 Vercel 페이지로 — per-article OG/트위터 카드 + 읽을 수 있는 최소 본문.
type ArticleLike = {
  id: string;
  issue_date: string;
  category: string;
  title: string;
  summary: string;
  tldr: string | null;
  source_name: string;
  source_url: string;
};

// 공개 URL(canonical·OG·sitemap)은 사용자 접근 도메인 기준. Amplify가 이 경로를 Vercel로 프록시.
const SELF_BASE = process.env.NEXT_PUBLIC_SELF_BASE ?? "https://daily-newx.project-hh.com";
const READER_BASE = process.env.NEXT_PUBLIC_READER_BASE ?? "https://daily-newx.project-hh.com";

const CATEGORY_LABEL: Record<string, string> = {
  headline: "헤드라인",
  release: "릴리스 · 제품",
  paper: "연구 · 논문",
  community: "커뮤니티",
  business: "산업 · 비즈니스",
};

async function load(id: string): Promise<ArticleLike | null> {
  return (await getArticleById(id)) as ArticleLike | null;
}

function dek(a: ArticleLike): string {
  const t = a.tldr && a.tldr.trim().length > 0 ? a.tldr : a.summary;
  return t.length > 160 ? `${t.slice(0, 157)}…` : t;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const a = await load(params.id);
  if (!a) return { title: "브리핑 LLM" };
  const description = dek(a);
  return {
    metadataBase: new URL(SELF_BASE),
    title: `${a.title} · 브리핑 LLM`,
    description,
    openGraph: {
      type: "article",
      siteName: "브리핑 LLM",
      title: a.title,
      description,
      url: `/share/${a.id}`,
    },
    twitter: { card: "summary_large_image", title: a.title, description },
    alternates: { canonical: `/share/${a.id}` },
    // iOS Safari 스마트 앱 배너(App Store ID 설정 시). 설치 시 앱으로 딥링크.
    ...(APP_STORE_ID
      ? { itunes: { appId: APP_STORE_ID, appArgument: `dailynewx://article/${a.id}` } }
      : {}),
  };
}

export default async function SharePage({
  params,
}: {
  params: { id: string };
}): Promise<ReactElement> {
  const a = await load(params.id);
  if (!a) notFound();

  const readerUrl = `${READER_BASE}/article/${a.id}`;
  const kicker = CATEGORY_LABEL[a.category] ?? a.category;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: dek(a),
    datePublished: a.issue_date,
    author: { "@type": "Organization", name: a.source_name },
    publisher: { "@type": "Organization", name: "브리핑 LLM" },
    mainEntityOfPage: `${SELF_BASE}/share/${a.id}`,
  };

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily: "Pretendard, -apple-system, system-ui, sans-serif",
        color: "#1C1917",
        background: "#FAF9F7",
        minHeight: "100vh",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p style={{ fontSize: 12, letterSpacing: 1.2, color: "#1C1917", fontWeight: 700, margin: 0 }}>
        {kicker}
      </p>
      <h1 style={{ fontSize: 30, lineHeight: 1.3, margin: "10px 0 0", color: "#1C1917" }}>
        {a.title}
      </h1>
      {a.tldr && a.tldr.trim().length > 0 && (
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#33302B", marginTop: 12 }}>{a.tldr}</p>
      )}
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#33302B", marginTop: 16 }}>{a.summary}</p>

      <p style={{ fontSize: 13, color: "#6E6659", marginTop: 24 }}>
        출처 · {a.source_name}
      </p>

      <div style={{ borderTop: "2px solid #1C1917", marginTop: 32, paddingTop: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <AppOpenButton deepLink={`dailynewx://article/${a.id}`} installUrl={APP_INSTALL_URL} />
          <a
            href={readerUrl}
            style={{
              display: "inline-block",
              padding: "10px 18px",
              background: "transparent",
              color: "#1C1917",
              border: "1px solid #E8E4DE",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            웹에서 읽기 →
          </a>
        </div>
        <p style={{ fontSize: 12, color: "#6E6659", marginTop: 16 }}>
          daily-newx · 매일 오전 9시 발행
        </p>
      </div>
    </main>
  );
}
