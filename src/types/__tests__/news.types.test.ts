import { describe, it, expect } from "vitest";
import { ingestPayloadSchema, dailyItemSchema } from "@/types/news.types";

const validIssue = {
  issue_date: "2026-06-16",
  issue_no: 56,
  intro: "도입",
  outro: "마무리",
  status: "draft" as const,
};

const validItem = {
  category: "release" as const,
  position: 1,
  title: "제목",
  summary: "요약",
  key_points: ["a", "b"],
  what_you_get: "얻는 것",
  action: "지금 할 일",
  why_now: "왜 지금",
  source_url: "https://example.com/post",
  source_name: "official-blog",
  score: 7,
  story_slug: "slug",
};

describe("ingestPayloadSchema", () => {
  it("정상 페이로드를 통과시킨다", () => {
    const parsed = ingestPayloadSchema.safeParse({ issue: validIssue, items: [validItem] });
    expect(parsed.success).toBe(true);
  });

  it("출처 URL 이 없으면 항목을 거부한다", () => {
    const noSource: Record<string, unknown> = { ...validItem };
    delete noSource.source_url;
    const parsed = dailyItemSchema.safeParse(noSource);
    expect(parsed.success).toBe(false);
  });

  it("source_url 이 http(s) 가 아니면 거부한다", () => {
    const parsed = dailyItemSchema.safeParse({ ...validItem, source_url: "ftp://x.y/z" });
    expect(parsed.success).toBe(false);
  });

  it("score 범위(0~10)를 벗어나면 거부한다", () => {
    const parsed = dailyItemSchema.safeParse({ ...validItem, score: 11 });
    expect(parsed.success).toBe(false);
  });

  it("잘못된 카테고리를 거부한다", () => {
    const parsed = dailyItemSchema.safeParse({ ...validItem, category: "rumor" });
    expect(parsed.success).toBe(false);
  });

  it("items 가 비어도(뉴스 적은 날) 통과한다", () => {
    const parsed = ingestPayloadSchema.safeParse({ issue: validIssue, items: [] });
    expect(parsed.success).toBe(true);
  });

  it("선택 필드 기본값(null/[])이 적용된다", () => {
    const minimal = {
      category: "paper" as const,
      title: "t",
      summary: "s",
      source_url: "https://a.b/c",
      source_name: "arxiv",
    };
    const parsed = dailyItemSchema.parse(minimal);
    expect(parsed.action).toBeNull();
    expect(parsed.key_points).toEqual([]);
    expect(parsed.position).toBe(0);
  });
});
