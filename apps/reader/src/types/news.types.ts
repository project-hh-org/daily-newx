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

// 자유 본문 블록 (apps/api 와 동기화). 신규 글은 이걸 사용, 옛 글은 비어 있음.
export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string() }),
  z.object({ type: z.literal("paragraph"), text: z.string() }),
  z.object({
    type: z.literal("bullets"),
    label: z.string().nullable().default(null),
    items: z.array(z.string()).default([]),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string(),
    cite: z.string().nullable().default(null),
  }),
  z.object({
    type: z.literal("stat"),
    value: z.string(),
    label: z.string().nullable().default(null),
  }),
  z.object({
    type: z.literal("callout"),
    label: z.string().nullable().default(null),
    text: z.string(),
  }),
  z.object({
    type: z.literal("image"),
    url: z.string().url(),
    alt: z.string().nullable().default(null),
    caption: z.string().nullable().default(null),
    credit: z.string().nullable().default(null),
  }),
  z.object({ type: z.literal("divider") }),
  z.object({
    type: z.literal("numbered"),
    label: z.string().nullable().default(null),
    items: z.array(z.string()).default([]),
  }),
  z.object({
    type: z.literal("table"),
    headers: z.array(z.string()).default([]),
    rows: z.array(z.array(z.string())).default([]),
  }),
  z.object({
    type: z.literal("code"),
    code: z.string(),
    lang: z.string().nullable().default(null),
  }),
  z.object({
    type: z.literal("embed"),
    url: z.string().url(),
    title: z.string().nullable().default(null),
    provider: z.string().nullable().default(null),
  }),
  z.object({
    type: z.literal("prosCons"),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
  }),
  z.object({
    type: z.literal("timeline"),
    events: z
      .array(z.object({ date: z.string().nullable().default(null), text: z.string() }))
      .default([]),
  }),
  z.object({
    type: z.literal("definition"),
    term: z.string(),
    text: z.string(),
  }),
]);
export type Block = z.infer<typeof blockSchema>;

// 호 안의 항목. id 는 실제 API 응답엔 있으나 번들 fixture(인제스트 원본)엔 없어 nullable.
export const dailyItemSchema = z.object({
  id: z.string().nullable().default(null),
  category: newsCategorySchema,
  position: z.number().int().nonnegative().default(0),
  title: z.string().min(1),
  summary: z.string().min(1),
  blocks: z.array(blockSchema).default([]),
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

// 도구별 최신 업데이트(루틴이 매일 생성) — "내 도구" 화면용.
export const toolUpdateSchema = z.object({
  id: z.string().nullable().default(null),
  tool_key: z.string().min(1),
  update_date: isoDate,
  kind: z.enum(["news", "resource"]).default("news"),
  title: z.string().min(1),
  summary: z.string().min(1), // 카드용 1~2문장
  body: z.string().nullable().default(null), // 상세용 긴 설명(문단 = 빈 줄 구분)
  url: z.string().url(),
});
export type ToolUpdate = z.infer<typeof toolUpdateSchema>;

export const toolUpdatesResponseSchema = z.object({
  updates: z.array(toolUpdateSchema),
});

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

// 스토리 스레드 (follow_up_of / story_slug 클러스터)
export const storyResponseSchema = z.object({
  slug: z.string(),
  items: z.array(articleSchema),
});
export type StoryResponse = z.infer<typeof storyResponseSchema>;
