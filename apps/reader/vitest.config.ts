import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// 순수 로직(도메인/스키마) 테스트용 — RN 런타임 불필요.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
