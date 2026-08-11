import { create } from "zustand";
import type { NewsCategory } from "@/types/news.types";

type DeckPosition = { compactDate: string; index: number };

type UiState = {
  // null = 전체 보기. 특정 카테고리 선택 시 해당 섹션만 노출.
  activeCategory: NewsCategory | null;
  setActiveCategory: (c: NewsCategory | null) => void;
  toggleCategory: (c: NewsCategory) => void;
  // 일간 호 카드 덱의 마지막 위치 — 기사 카드 덱에서 뒤로 돌아올 때 같은 카드로 복귀하기 위함.
  lastDeckPosition: DeckPosition | null;
  setLastDeckPosition: (p: DeckPosition | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeCategory: null,
  setActiveCategory: (c) => set({ activeCategory: c }),
  toggleCategory: (c) =>
    set((s) => ({ activeCategory: s.activeCategory === c ? null : c })),
  lastDeckPosition: null,
  setLastDeckPosition: (p) => set({ lastDeckPosition: p }),
}));
