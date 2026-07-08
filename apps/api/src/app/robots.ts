import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SELF_BASE ?? "https://daily-newx.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
