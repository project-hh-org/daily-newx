import { create } from "zustand";
import type { NewsCategory } from "@/types/news.types";

type UiState = {
  // null = 전체 보기. 특정 카테고리 선택 시 해당 섹션만 노출.
  activeCategory: NewsCategory | null;
  setActiveCategory: (c: NewsCategory | null) => void;
  toggleCategory: (c: NewsCategory) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeCategory: null,
  setActiveCategory: (c) => set({ activeCategory: c }),
  toggleCategory: (c) =>
    set((s) => ({ activeCategory: s.activeCategory === c ? null : c })),
}));
