import type { ReactElement } from "react";
import { DailyScreen } from "@/screens/DailyScreen";
import { todayCompact } from "@/lib/date";

// IA: 첫 페이지 = 오늘 호 목차. 섹션(카테고리·주제·주체·지난 호)은 마스트헤드 메뉴로.
export default function Index(): ReactElement {
  return <DailyScreen compactDate={todayCompact()} />;
}
