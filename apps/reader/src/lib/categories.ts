import type { NewsCategory } from "@/types/news.types";

export type CategoryMeta = {
  key: NewsCategory;
  label: string;
  blurb: string;
};

// 화면 노출 순서 + 일반 대중용 한국어 라벨.
// (API 는 category 알파벳순으로 주므로, 표시 순서는 여기서 강제한다.)
export const CATEGORY_ORDER: readonly CategoryMeta[] = [
  { key: "headline", label: "헤드라인", blurb: "오늘 가장 중요한 소식" },
  { key: "release", label: "릴리스 · 제품", blurb: "새 모델 · 기능 · 업데이트" },
  { key: "paper", label: "연구 · 논문", blurb: "주목할 만한 연구" },
  { key: "community", label: "커뮤니티", blurb: "개발자 · 사용자 반응" },
  { key: "business", label: "산업 · 비즈니스", blurb: "시장 · 정책 · 기업 동향" },
];

const LABELS: Record<NewsCategory, string> = {
  headline: "헤드라인",
  release: "릴리스 · 제품",
  paper: "연구 · 논문",
  community: "커뮤니티",
  business: "산업 · 비즈니스",
};

export function categoryLabel(key: NewsCategory): string {
  return LABELS[key];
}
