// (사용 안 함) 2026-07-27부터 도구 카탈로그는 DB(tool_catalog 테이블) 조회로 대체됨.
// 화면은 이제 `useToolCatalog()`(@/hooks/useDailyIssue)로 받은 목록을 직접 쓴다.
// 타입만 news.types.ts 에서 재수출 — 남아있는 참조가 있으면 그쪽으로 옮길 것.
export type { ToolCategory, ToolLink, ToolCatalogEntry as ToolEntry } from "@/types/news.types";
