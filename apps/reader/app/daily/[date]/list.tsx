import type { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { DailyScreen } from "@/screens/DailyScreen";

// 아카이브 라우트 — 카드 덱 대신 기존 세로 목록 뷰를 그대로 보여준다(코드 유지 결정).
export default function DailyListRoute(): ReactElement {
  const { date } = useLocalSearchParams<{ date: string }>();
  const compactDate = typeof date === "string" ? date : "";
  return <DailyScreen compactDate={compactDate} />;
}
