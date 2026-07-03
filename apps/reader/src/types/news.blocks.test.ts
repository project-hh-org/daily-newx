import { describe, it, expect } from "vitest";
import { blockSchema, dailyItemSchema } from "@/types/news.types";

describe("blockSchema (자유 본문 15종)", () => {
  it("heading/paragraph 통과", () => {
    expect(blockSchema.safeParse({ type: "heading", text: "제목" }).success).toBe(true);
    expect(blockSchema.safeParse({ type: "paragraph", text: "본문" }).success).toBe(true);
  });

  it("stat: value 필수, label 기본 null", () => {
    const r = blockSchema.safeParse({ type: "stat", value: "60명" });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === "stat") expect(r.data.label).toBeNull();
    expect(blockSchema.safeParse({ type: "stat" }).success).toBe(false);
  });

  it("bullets: items 기본 []", () => {
    const r = blockSchema.safeParse({ type: "bullets" });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === "bullets") expect(r.data.items).toEqual([]);
  });

  it("divider: type만으로 통과", () => {
    expect(blockSchema.safeParse({ type: "divider" }).success).toBe(true);
  });

  it("image/embed: url 검증", () => {
    expect(blockSchema.safeParse({ type: "image", url: "https://x.com/a.png" }).success).toBe(true);
    expect(blockSchema.safeParse({ type: "image", url: "not-a-url" }).success).toBe(false);
    expect(blockSchema.safeParse({ type: "embed", url: "https://x.com" }).success).toBe(true);
  });

  it("알 수 없는 type 거부", () => {
    expect(blockSchema.safeParse({ type: "zzz", text: "x" }).success).toBe(false);
  });
});

describe("dailyItemSchema", () => {
  it("필수 필드만으로 통과 + blocks 기본 []", () => {
    const r = dailyItemSchema.safeParse({
      category: "release",
      title: "제목",
      summary: "요약",
      source_url: "https://example.com",
      source_name: "출처",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.blocks).toEqual([]);
      expect(r.data.id).toBeNull();
      expect(r.data.tags).toEqual([]);
    }
  });

  it("잘못된 카테고리 거부", () => {
    const r = dailyItemSchema.safeParse({
      category: "sports",
      title: "t",
      summary: "s",
      source_url: "https://example.com",
      source_name: "출처",
    });
    expect(r.success).toBe(false);
  });
});
