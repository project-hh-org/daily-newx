import { describe, it, expect } from "vitest";
import { toolCatalogEntryIngestSchema, toolCatalogIngestSchema } from "@/types/news.types";

const validEntry = {
  key: "kimi",
  name: "Kimi",
  vendor: "Moonshot AI",
  category: "model" as const,
  blurb: "수요 폭주로 신규 구독을 일시 중단했던 오픈소스 프론티어 모델.",
  links: [{ label: "GitHub", url: "https://github.com/MoonshotAI" }],
};

describe("toolCatalogEntryIngestSchema", () => {
  it("정상 항목을 통과시킨다", () => {
    const parsed = toolCatalogEntryIngestSchema.safeParse(validEntry);
    expect(parsed.success).toBe(true);
  });

  it("blurb/links 없이도 통과한다(기본값 적용)", () => {
    const { blurb: _blurb, links: _links, ...rest } = validEntry;
    const parsed = toolCatalogEntryIngestSchema.safeParse(rest);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.blurb).toBe("");
      expect(parsed.data.links).toEqual([]);
    }
  });

  it("key에 대문자·공백이 섞이면 거부한다(kebab-case 강제)", () => {
    const parsed = toolCatalogEntryIngestSchema.safeParse({ ...validEntry, key: "Kimi K3" });
    expect(parsed.success).toBe(false);
  });

  it("잘못된 category를 거부한다", () => {
    const parsed = toolCatalogEntryIngestSchema.safeParse({ ...validEntry, category: "agent" });
    expect(parsed.success).toBe(false);
  });

  it("links의 url이 http(s)가 아니면 거부한다", () => {
    const parsed = toolCatalogEntryIngestSchema.safeParse({
      ...validEntry,
      links: [{ label: "GitHub", url: "ftp://example.com" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("name/vendor가 비어 있으면 거부한다", () => {
    const parsed = toolCatalogEntryIngestSchema.safeParse({ ...validEntry, name: "" });
    expect(parsed.success).toBe(false);
  });
});

describe("toolCatalogIngestSchema", () => {
  it("entries가 비어도 통과한다(신규 후보 없는 날)", () => {
    const parsed = toolCatalogIngestSchema.safeParse({ entries: [] });
    expect(parsed.success).toBe(true);
  });

  it("entries 여러 건을 통과시킨다", () => {
    const parsed = toolCatalogIngestSchema.safeParse({
      entries: [validEntry, { ...validEntry, key: "glm", name: "GLM", vendor: "Zhipu/Z.ai" }],
    });
    expect(parsed.success).toBe(true);
  });
});
