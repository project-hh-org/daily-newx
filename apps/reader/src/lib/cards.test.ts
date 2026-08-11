import { describe, it, expect } from "vitest";
import { chunkBlocks, paginateArticle, buildIssueDeck, flattenIssueItems } from "@/lib/cards";
import type { Block, DailyItem, DailyIssue } from "@/types/news.types";

const p = (text: string): Block => ({ type: "paragraph", text });
const heading = (text: string): Block => ({ type: "heading", text });
const divider: Block = { type: "divider" };
const image = (url = "https://x.com/a.png"): Block => ({
  type: "image",
  url,
  alt: null,
  caption: null,
  credit: null,
});
const bullets = (n: number): Block => ({
  type: "bullets",
  label: "목록",
  items: Array.from({ length: n }, (_, i) => `항목${i + 1}`),
});

describe("chunkBlocks", () => {
  it("빈 배열 → 빈 카드", () => {
    expect(chunkBlocks([])).toEqual([]);
  });

  it("heading 뒤 짧은 문단은 같은 카드에 누적", () => {
    const result = chunkBlocks([heading("제목"), p("짧은 본문")]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual([heading("제목"), p("짧은 본문")]);
  });

  it("두 heading 연속 → 각각 별도 카드", () => {
    const result = chunkBlocks([heading("A"), heading("B")]);
    expect(result).toEqual([[heading("A")], [heading("B")]]);
  });

  it("divider 는 강제 분리 + 렌더 목록에서 제거", () => {
    const result = chunkBlocks([p("첫 문단"), divider, p("둘째 문단")]);
    expect(result).toEqual([[p("첫 문단")], [p("둘째 문단")]]);
  });

  it("solo 타입(image)은 앞뒤를 분리하고 단독 카드가 된다", () => {
    const result = chunkBlocks([p("앞"), image(), p("뒤")]);
    expect(result).toEqual([[p("앞")], [image()], [p("뒤")]]);
  });

  it("여러 solo 타입이 연속되면 각각 단독 카드", () => {
    const result = chunkBlocks([image("https://x.com/1.png"), image("https://x.com/2.png")]);
    expect(result).toHaveLength(2);
  });

  it("무게 임계치(420) 초과 시 새 카드로 넘어간다", () => {
    const long = p("가".repeat(400));
    const result = chunkBlocks([long, p("추가 문단")]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual([long]);
    expect(result[1]).toEqual([p("추가 문단")]);
  });

  it("무게 임계치 이내면 계속 누적", () => {
    const result = chunkBlocks([p("가".repeat(100)), p("나".repeat(100)), p("다".repeat(100))]);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
  });

  it("bullets 5개 초과는 5개 단위로 쪼갠다", () => {
    const result = chunkBlocks([bullets(12)]);
    // 12개 → 5+5+2, 각 청크가 누적 임계치 안이면 한 카드로 합쳐질 수 있으니 총 아이템 수만 검증
    const totalItems = result.flat().reduce((sum, b) => (b.type === "bullets" ? sum + b.items.length : sum), 0);
    expect(totalItems).toBe(12);
    for (const card of result) {
      for (const b of card) {
        if (b.type === "bullets") expect(b.items.length).toBeLessThanOrEqual(5);
      }
    }
  });

  it("라벨은 쪼갠 첫 조각에만 남는다", () => {
    const result = chunkBlocks([bullets(7)]);
    const allBullets = result.flat().filter((b): b is Extract<Block, { type: "bullets" }> => b.type === "bullets");
    expect(allBullets[0]?.label).toBe("목록");
    expect(allBullets.slice(1).every((b) => b.label === null)).toBe(true);
  });
});

describe("paginateArticle", () => {
  const base = {
    key_points: [] as string[],
    what_you_get: null,
    why_now: null,
    action: null,
  };

  it("blocks 있으면 legacy 카드 없이 cover→summary→본문n→source", () => {
    const cards = paginateArticle({ ...base, blocks: [p("본문")] });
    expect(cards.map((c) => c.kind)).toEqual(["cover", "summary", "blocks", "source"]);
  });

  it("blocks 없고 legacy 필드도 없으면 legacy 카드 생략", () => {
    const cards = paginateArticle({ ...base, blocks: [] });
    expect(cards.map((c) => c.kind)).toEqual(["cover", "summary", "source"]);
  });

  it("blocks 없고 key_points 있으면 legacy 카드 포함", () => {
    const cards = paginateArticle({ ...base, blocks: [], key_points: ["포인트1"] });
    expect(cards.map((c) => c.kind)).toEqual(["cover", "summary", "legacy", "source"]);
  });

  it("blocks 없고 action만 있어도 legacy 카드 포함", () => {
    const cards = paginateArticle({ ...base, blocks: [], action: "지금 해보기" });
    expect(cards.map((c) => c.kind)).toEqual(["cover", "summary", "legacy", "source"]);
  });
});

describe("flattenIssueItems / buildIssueDeck", () => {
  const item = (category: DailyItem["category"], position: number, title: string): DailyItem => ({
    id: null,
    category,
    position,
    title,
    summary: "요약",
    blocks: [],
    key_points: [],
    what_you_get: null,
    action: null,
    why_now: null,
    source_url: "https://example.com",
    source_name: "출처",
    score: null,
    story_slug: null,
    tldr: null,
    tags: [],
    entities: [],
    related: [],
    follow_up_of: null,
    source_published_at: null,
  });

  it("CATEGORY_ORDER 순서로 평탄화, position 오름차순", () => {
    const items = [item("business", 1, "B1"), item("headline", 2, "H2"), item("headline", 1, "H1")];
    const flat = flattenIssueItems(items, null);
    expect(flat.map((i) => i.title)).toEqual(["H1", "H2", "B1"]);
  });

  it("activeCategory 지정 시 해당 카테고리만", () => {
    const items = [item("business", 1, "B1"), item("headline", 1, "H1")];
    const flat = flattenIssueItems(items, "headline");
    expect(flat.map((i) => i.title)).toEqual(["H1"]);
  });

  const issue = (outro: string | null): DailyIssue => ({
    issue_date: "2026-06-16",
    issue_no: 1,
    intro: null,
    outro,
    status: "published",
  });

  it("outro 없으면 outro 카드 생략", () => {
    const deck = buildIssueDeck(issue(null), [item("headline", 1, "H1")]);
    expect(deck.map((c) => c.kind)).toEqual(["cover", "item"]);
  });

  it("outro 공백뿐이면 생략", () => {
    const deck = buildIssueDeck(issue("   "), []);
    expect(deck.map((c) => c.kind)).toEqual(["cover"]);
  });

  it("outro 있으면 포함, 항목 순서는 1-기반 index", () => {
    const items = [item("headline", 1, "H1"), item("headline", 2, "H2")];
    const deck = buildIssueDeck(issue("마무리 인사"), items);
    expect(deck.map((c) => c.kind)).toEqual(["cover", "item", "item", "outro"]);
    const itemCards = deck.filter((c): c is Extract<typeof deck[number], { kind: "item" }> => c.kind === "item");
    expect(itemCards.map((c) => c.index)).toEqual([1, 2]);
  });
});
