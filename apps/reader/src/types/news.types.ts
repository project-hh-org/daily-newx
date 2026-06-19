import { z } from "zod";

// 읽기측 스키마 — API 응답 검증용. apps/api 의 계약을 미러링한다.
// NOTE: 필드 변경 시 apps/api/src/types/news.types.ts 와 동기화.

export const newsCategorySchema = z.enum([
  "headline",
  "release",
  "paper",
  "community",
  "business",
]);
export type NewsCategory = z.infer<typeof newsCategorySchema>;

export const timelineAxisSchema = z.enum(["category", "tag", "entity"]);
export type TimelineAxis = z.infer<typeof timelineAxisSchema>;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");

// 호 안의 항목. id 는 실제 API 응답엔 있으나 번들 fixture(인제스트 원본)엔 없어 nullable.
export const dailyItemSchema = z.object({
  id: z.string().nullable().default(null),
  category: newsCategorySchema,
  position: z.number().int().nonnegative().default(0),
  title: z.string().min(1),
  summary: z.string().min(1),
  key_points: z.array(z.string()).default([]),
  what_you_get: z.string().nullable().default(null),
  action: z.string().nullable().default(null),
  why_now: z.string().nullable().default(null),
  source_url: z.string().url(),
  source_name: z.string().min(1),
  score: z.number().int().nullable().default(null),
  story_slug: z.string().nullable().default(null),
  tldr: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  entities: z.array(z.string()).default([]),
  related: z.array(z.string().url()).default([]),
  follow_up_of: z.string().nullable().default(null),
  source_published_at: z.string().nullable().default(null),
});
export type DailyItem = z.infer<typeof dailyItemSchema>;

export const dailyIssueSchema = z.object({
  issue_date: isoDate,
  issue_no: z.number().int().positive().nullable().default(null),
  intro: z.string().nullable().default(null),
  outro: z.string().nullable().default(null),
  status: z.enum(["draft", "published"]).default("draft"),
});
export type DailyIssue = z.infer<typeof dailyIssueSchema>;

export const dailyPayloadSchema = z.object({
  issue: dailyIssueSchema,
  items: z.array(dailyItemSchema),
});
export type DailyPayload = z.infer<typeof dailyPayloadSchema>;

// 단건/타임라인 항목 — id 보장 + 자기 issue_date 포함.
export const articleSchema = dailyItemSchema.extend({
  id: z.string().min(1),
  issue_date: isoDate,
});
export type Article = z.infer<typeof articleSchema>;

export const timelineResponseSchema = z.object({
  axis: timelineAxisSchema,
  value: z.string(),
  items: z.array(articleSchema),
});
export type TimelineResponse = z.infer<typeof timelineResponseSchema>;

// 호 목록 (아카이브)
export const issueSummarySchema = z.object({
  issue_date: isoDate,
  issue_no: z.number().int().positive().nullable().default(null),
  intro: z.string().nullable().default(null),
});
export type IssueSummary = z.infer<typeof issueSummarySchema>;

export const issuesResponseSchema = z.object({
  issues: z.array(issueSummarySchema),
});

// facets (주제/주체 리스트)
export const facetKindSchema = z.enum(["tag", "entity"]);
export type FacetKind = z.infer<typeof facetKindSchema>;

export const facetSchema = z.object({
  value: z.string(),
  count: z.number().int().nonnegative(),
});
export type Facet = z.infer<typeof facetSchema>;

export const facetsResponseSchema = z.object({
  kind: facetKindSchema,
  facets: z.array(facetSchema),
});
export type FacetsResponse = z.infer<typeof facetsResponseSchema>;
