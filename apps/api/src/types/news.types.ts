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

// 자유 본문 블록 — 기사마다 자유롭게 조합(없어도 됨). 신규 글은 이걸 사용.
export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().min(1) }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({
    type: z.literal("bullets"),
    label: z.string().nullable().default(null),
    items: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().min(1),
    cite: z.string().nullable().default(null),
  }),
  z.object({
    type: z.literal("stat"),
    value: z.string().min(1),
    label: z.string().nullable().default(null),
  }),
  z.object({
    type: z.literal("callout"),
    label: z.string().nullable().default(null),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("image"),
    url: httpUrlSchema,
    alt: z.string().nullable().default(null),
    caption: z.string().nullable().default(null),
    credit: z.string().nullable().default(null),
  }),
  z.object({ type: z.literal("divider") }),
  z.object({
    type: z.literal("numbered"),
    label: z.string().nullable().default(null),
    items: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal("table"),
    headers: z.array(z.string()).default([]),
    rows: z.array(z.array(z.string())).min(1),
  }),
  z.object({
    type: z.literal("code"),
    code: z.string().min(1),
    lang: z.string().nullable().default(null),
  }),
  z.object({
    type: z.literal("embed"),
    url: httpUrlSchema,
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
      .array(z.object({ date: z.string().nullable().default(null), text: z.string().min(1) }))
      .min(1),
  }),
  z.object({
    type: z.literal("definition"),
    term: z.string().min(1),
    text: z.string().min(1),
  }),
]);
export type Block = z.infer<typeof blockSchema>;

// 개별 항목 — source_url 필수(출처 없는 항목 거부)
export const dailyItemSchema = z.object({
  category: newsCategorySchema,
  position: z.number().int().min(0).default(0),
  title: z.string().min(1),
  summary: z.string().min(1),
  blocks: z.array(blockSchema).default([]),
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

// ── 도구 업데이트(루틴이 매일 생성) ──────────────────────────
export const toolUpdateIngestSchema = z.object({
  tool_key: z.string().min(1),
  update_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  kind: z.enum(["news", "resource"]).default("news"),
  title: z.string().min(1),
  summary: z.string().min(1), // 카드용 1~2문장
  body: z.string().nullable().default(null), // 상세용 긴 설명(문단 = 빈 줄 구분)
  url: httpUrlSchema,
});
export type ToolUpdateIngest = z.infer<typeof toolUpdateIngestSchema>;

export const toolUpdatesIngestSchema = z.object({
  updates: z.array(toolUpdateIngestSchema),
});
