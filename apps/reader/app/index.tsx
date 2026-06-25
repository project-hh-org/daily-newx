import type { ReactElement } from "react";
import { TodayScreen } from "@/screens/TodayScreen";

// IA: 첫 페이지 = 오늘 호 목차(없으면 발행 예정/없음 안내 + 최신 호 폴백).
export default function Index(): ReactElement {
  return <TodayScreen />;
}
