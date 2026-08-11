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
// superRefine: 같은 payload 안에서 source_url이 중복되면 즉시 422로 거부.
// (2026-07-18 사고 원인 — 같은 배치 안 두 항목이 같은 source_url을 가져 daily_items
//  upsert가 "ON CONFLICT DO UPDATE command cannot affect row a second time"로 죽었음.
//  Postgres raw 에러 대신 여기서 명확한 스키마 오류로 먼저 걸러낸다.)
export const ingestPayloadSchema = z
  .object({
    issue: dailyIssueSchema,
    items: z.array(dailyItemSchema),
  })
  .superRefine((val, ctx) => {
    const seenAt = new Map<string, number>();
    val.items.forEach((item, idx) => {
      const prevIdx = seenAt.get(item.source_url);
      if (prevIdx !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `같은 payload 안에서 source_url이 항목 ${prevIdx}과(와) 중복됩니다 (DB unique(issue_date, source_url) 위반 예방)`,
          path: ["items", idx, "source_url"],
        });
      } else {
        seenAt.set(item.source_url, idx);
      }
    });
  });
export type IngestPayload = z.infer<typeof ingestPayloadSchema>;

export type IngestResult = {
  issue_date: string;
  items_upserted: number;
};

// 조회(SELECT) 응답 전용 — daily_items 행은 항상 DB가 채운 id를 갖는다.
// (인제스트 입력에는 id가 없어 dailyItemSchema/IngestPayload에는 넣지 않는다 —
//  2026-07-27: today/route.ts가 getIssue() 결과의 it.id에 접근하는데, getIssue()가
//  실제로는 id를 select하면서도 반환 타입은 IngestPayload로 캐스팅돼 있어 타입에서만
//  id가 안 보이던 기존 버그를 고치며 정리함.)
export type DailyItemWithId = DailyItem & { id: string };
export type PublishedIssuePayload = {
  issue: DailyIssue;
  items: DailyItemWithId[];
};

// ── 도구 카탈로그("내 도구" 화면의 선택 대상 목록, DB 이관) ──────────────
// 2026-07-27: apps/reader/src/lib/toolCatalog.ts 하드코딩 배열을 DB로 이관.
// 목적: 루틴이 목록에 없는 새 도구(예: Moonshot AI Kimi)를 발견하면 코드 배포 없이
// 스스로 후보(status=pending_review)로 등록할 수 있게 하기 위함.
export const toolCategorySchema = z.enum(["model", "coding"]);
export type ToolCategory = z.infer<typeof toolCategorySchema>;

export const toolLinkSchema = z.object({
  label: z.string().min(1),
  url: httpUrlSchema,
});
export type ToolLink = z.infer<typeof toolLinkSchema>;

// 루틴이 새 도구를 등록할 때 쓰는 입력 — 최소 정보만 필수(blurb/links는 비어도 됨,
// 실제 화면 노출을 위한 큐레이션은 사람이 status를 active로 바꾸며 채운다).
export const toolCatalogEntryIngestSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/, "key는 소문자·숫자·하이픈만(kebab-case)"),
  name: z.string().min(1),
  vendor: z.string().min(1),
  category: toolCategorySchema,
  blurb: z.string().default(""),
  links: z.array(toolLinkSchema).default([]),
});
export type ToolCatalogEntry = z.infer<typeof toolCatalogEntryIngestSchema>;

export const toolCatalogIngestSchema = z.object({
  entries: z.array(toolCatalogEntryIngestSchema),
});

// 공개 읽기 응답(활성 카탈로그만) — status는 내부 필드라 응답엔 포함하지 않는다.
export const toolCatalogPublicEntrySchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  vendor: z.string().min(1),
  category: toolCategorySchema,
  blurb: z.string().default(""),
  links: z.array(toolLinkSchema).default([]),
});
export type ToolCatalogPublicEntry = z.infer<typeof toolCatalogPublicEntrySchema>;

// ── 도구 업데이트(루틴이 매일 생성) ──────────────────────────
export const toolUpdateIngestSchema = z.object({
  tool_key: z.string().min(1),
  update_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  kind: z.enum(["news", "resource"]).default("news"),
  title: z.string().min(1),
  summary: z.string().min(1), // 카드용 1~2문장
  blocks: z.array(blockSchema).default([]), // 상세 본문(사용법·설치·장단점 등)
  url: httpUrlSchema,
});
export type ToolUpdateIngest = z.infer<typeof toolUpdateIngestSchema>;

export const toolUpdatesIngestSchema = z.object({
  updates: z.array(toolUpdateIngestSchema),
});
