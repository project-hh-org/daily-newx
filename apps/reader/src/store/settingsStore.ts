import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";

// 앱 설정(테마·알림). 로컬 영속.
type SettingsState = {
  themeMode: ThemeMode;
  notify: boolean;
  setThemeMode: (m: ThemeMode) => void;
  setNotify: (v: boolean) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      notify: true,
      setThemeMode: (m) => set({ themeMode: m }),
      setNotify: (v) => set({ notify: v }),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "daily-newx-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ themeMode: s.themeMode, notify: s.notify }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
