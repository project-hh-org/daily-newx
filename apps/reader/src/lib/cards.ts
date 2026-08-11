import type { Article, Block, DailyIssue, DailyItem, NewsCategory } from "@/types/news.types";
import { CATEGORY_ORDER } from "@/lib/categories";

// ── Level 1: 일간 호 덱 ──────────────────────────────────────────────

export type IssueCard =
  | { kind: "cover" }
  | { kind: "item"; item: DailyItem; index: number } // index: 1-기반 순번(전체 흐름 기준)
  | { kind: "outro" };

/**
 * 카테고리별로 묶어 CATEGORY_ORDER 순서로 평탄화(DailyScreen 의 groupByCategory 와 동일 규칙).
 * activeCategory 가 있으면 해당 카테고리만.
 */
export function flattenIssueItems(
  items: readonly DailyItem[],
  activeCategory: NewsCategory | null,
): DailyItem[] {
  const groups: Record<NewsCategory, DailyItem[]> = {
    headline: [],
    release: [],
    paper: [],
    community: [],
    business: [],
  };
  for (const it of items) {
    groups[it.category].push(it);
  }
  for (const key of Object.keys(groups) as NewsCategory[]) {
    groups[key].sort((a, b) => a.position - b.position);
  }
  const cats =
    activeCategory === null ? CATEGORY_ORDER.map((cat) => cat.key) : [activeCategory];
  return cats.flatMap((key) => groups[key]);
}

/** 일간 호 카드 덱 — [커버] → 항목 N장 → [마무리](outro 있을 때만). */
export function buildIssueDeck(issue: DailyIssue, flatItems: readonly DailyItem[]): IssueCard[] {
  const cards: IssueCard[] = [{ kind: "cover" }];
  flatItems.forEach((item, i) => {
    cards.push({ kind: "item", item, index: i + 1 });
  });
  const hasOutro = issue.outro !== null && issue.outro.trim().length > 0;
  if (hasOutro) cards.push({ kind: "outro" });
  return cards;
}

// ── Level 2: 기사 덱 ─────────────────────────────────────────────────

export type ArticleCard =
  | { kind: "cover" }
  | { kind: "summary" }
  | { kind: "blocks"; blocks: readonly Block[] }
  | { kind: "legacy" }
  | { kind: "source" };

const CARD_CHAR_BUDGET = 420;

// 카드 안에서 세로 스크롤 없이도 한눈에 들어오도록 항상 단독 카드로 분리하는 블록 타입.
const SOLO_TYPES: ReadonlySet<Block["type"]> = new Set([
  "image",
  "quote",
  "stat",
  "code",
  "table",
  "prosCons",
  "timeline",
  "embed",
]);

// 누적 가능한(문단형) 블록 타입 — 무게 합이 CARD_CHAR_BUDGET 을 넘기 전까진 한 카드에 모은다.
const ACCUMULATE_TYPES: ReadonlySet<Block["type"]> = new Set([
  "paragraph",
  "bullets",
  "numbered",
  "callout",
  "definition",
]);

function blockWeight(b: Block): number {
  switch (b.type) {
    case "paragraph":
      return b.text.length;
    case "bullets":
    case "numbered":
      return (b.label?.length ?? 0) + b.items.join("").length;
    case "callout":
      return (b.label?.length ?? 0) + b.text.length;
    case "definition":
      return b.term.length + b.text.length;
    default:
      return 0;
  }
}

/** bullets/numbered 항목이 5개를 넘으면 5개 단위로 쪼갠다(라벨은 첫 조각에만). */
function splitLongList(b: Block): Block[] {
  if (b.type !== "bullets" && b.type !== "numbered") return [b];
  if (b.items.length <= 5) return [b];
  const chunks: Block[] = [];
  for (let i = 0; i < b.items.length; i += 5) {
    const slice = b.items.slice(i, i + 5);
    chunks.push(
      b.type === "bullets"
        ? { type: "bullets", label: i === 0 ? b.label : null, items: slice }
        : { type: "numbered", label: i === 0 ? b.label : null, items: slice },
    );
  }
  return chunks;
}

/**
 * 자유 본문 블록을 카드 단위로 분할하는 순수 함수.
 * 규칙: heading=새 카드 시작 / divider=강제 분리(렌더 안 함) / solo 타입=단독 카드 /
 * 누적 타입=무게 합이 CARD_CHAR_BUDGET 넘기 전까지 한 카드.
 */
export function chunkBlocks(blocks: readonly Block[]): Block[][] {
  const pre = blocks.flatMap(splitLongList);
  const cards: Block[][] = [];
  let current: Block[] = [];
  let currentWeight = 0;

  const flush = (): void => {
    if (current.length > 0) {
      cards.push(current);
      current = [];
      currentWeight = 0;
    }
  };

  for (const b of pre) {
    if (b.type === "divider") {
      flush();
      continue;
    }
    if (b.type === "heading") {
      flush();
      current = [b];
      currentWeight = 0;
      continue;
    }
    if (SOLO_TYPES.has(b.type)) {
      flush();
      cards.push([b]);
      continue;
    }
    // 누적 타입 (+ 분류 안 된 타입은 안전하게 누적으로 처리)
    void ACCUMULATE_TYPES; // 문서화 목적(위 has 체크는 필요 없음 — 나머지 전부 누적)
    const w = blockWeight(b);
    if (current.length > 0 && currentWeight + w > CARD_CHAR_BUDGET) {
      flush();
    }
    current.push(b);
    currentWeight += w;
  }
  flush();
  return cards;
}

type LegacyFields = Pick<DailyItem, "key_points" | "what_you_get" | "why_now" | "action">;

function hasLegacyContent(a: LegacyFields): boolean {
  const hasField = (v: string | null): boolean => v !== null && v.trim().length > 0;
  const kp = a.key_points.filter((p) => p.trim().length > 0);
  return kp.length > 0 || hasField(a.what_you_get) || hasField(a.why_now) || hasField(a.action);
}

type ArticleLike = Pick<
  DailyItem,
  "blocks" | "key_points" | "what_you_get" | "why_now" | "action"
>;

/**
 * 기사 카드 덱 — [표지] → [요약] → 본문 카드들(blocks 분할, 없으면 legacy 필드 1장) → [출처].
 * Article(단건 조회 결과)도 DailyItem 을 extend 하므로 그대로 통과 가능.
 */
export function paginateArticle(article: ArticleLike | Article): ArticleCard[] {
  const cards: ArticleCard[] = [{ kind: "cover" }, { kind: "summary" }];
  if (article.blocks.length > 0) {
    for (const group of chunkBlocks(article.blocks)) {
      cards.push({ kind: "blocks", blocks: group });
    }
  } else if (hasLegacyContent(article)) {
    cards.push({ kind: "legacy" });
  }
  cards.push({ kind: "source" });
  return cards;
}
