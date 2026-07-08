import type { MetadataRoute } from "next";
import { listRecentArticles } from "@/services/newsRepository";

export const runtime = "nodejs";
export const revalidate = 3600; // 1시간마다 재생성

const BASE = process.env.NEXT_PUBLIC_SELF_BASE ?? "https://daily-newx.project-hh.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Array<{ id: string; issue_date: string }> = [];
  try {
    articles = await listRecentArticles(500);
  } catch {
    articles = [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/support`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/a/${a.id}`,
    lastModified: a.issue_date,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages];
}
