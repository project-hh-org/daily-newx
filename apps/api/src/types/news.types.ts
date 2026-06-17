import { z } from "zod";

// 카테고리 (DB enum news_category 와 일치)
export const newsCategorySchema = z.enum([
  "headline",
  "release",
  "paper",
  "community",
  "business",
]);
export type NewsCategory = z.infer<typeof newsCategorySchema>;

// 출처 링크 — http(s) 만 허용 (zod .url() 은 ftp:/mailto: 등도 통과하므로 좁힘)
export const httpUrlSchema = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), "http(s) URL 만 허용");

// 개별 항목 — source_url 필수(출처 없는 항목 거부)
export const dailyItemSchema = z.object({
  category: newsCategorySchema,
  position: z.number().int().min(0).default(0),
  title: z.string().min(1),
  summary: z.string().min(1),
  key_points: z.array(z.string().min(1)).default([]),
  what_you_get: z.string().nullable().default(null),
  action: z.string().nullable().default(null),
  why_now: z.string().nullable().default(null),
  source_url: httpUrlSchema,
  source_name: z.string().min(1),
  score: z.number().int().min(0).max(10).nullable().default(null),
  story_slug: z.string().nullable().default(null),

  // 연결·타임라인용 (선택, 없으면 비움)
  tldr: z.string().nullable().default(null),
  tags: z.array(z.string().min(1)).default([]),
  entities: z.array(z.string().min(1)).default([]),
  related: z.array(httpUrlSchema).default([]),
  follow_up_of: z.string().nullable().default(null),
  source_published_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .nullable()
    .default(null),
});
export type DailyItem = z.infer<typeof dailyItemSchema>;

// 호(issue) 메타
export const dailyIssueSchema = z.object({
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  issue_no: z.number().int().positive().nullable().default(null),
  intro: z.string().nullable().default(null),
  outro: z.string().nullable().default(null),
  status: z.enum(["draft", "published"]).default("draft"),
});
export type DailyIssue = z.infer<typeof dailyIssueSchema>;

// 인제스트 페이로드 ({ issue, items[] })
export const ingestPayloadSchema = z.object({
  issue: dailyIssueSchema,
  items: z.array(dailyItemSchema),
});
export type IngestPayload = z.infer<typeof ingestPayloadSchema>;

export type IngestResult = {
  issue_date: string;
  items_upserted: number;
};
