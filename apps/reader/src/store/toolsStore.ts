import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 사용자가 선택한 도구(모델/코딩 도구) key 목록. 로컬 영속.
type ToolsState = {
  selected: string[];
  toggle: (key: string) => void;
  setSelected: (keys: string[]) => void; // 드래프트 일괄 저장(설정 화면)
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
};

export const useToolsStore = create<ToolsState>()(
  persist(
    (set) => ({
      selected: [],
      toggle: (key) =>
        set((s) => ({
          selected: s.selected.includes(key)
            ? s.selected.filter((k) => k !== key)
            : [...s.selected, key],
        })),
      setSelected: (keys) => set({ selected: [...new Set(keys)] }),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "daily-newx-tools",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ selected: s.selected }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
