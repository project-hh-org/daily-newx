import type { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { DailyScreen } from "@/screens/DailyScreen";

export default function DailyRoute(): ReactElement {
  const { date } = useLocalSearchParams<{ date: string }>();
  const compactDate = typeof date === "string" ? date : "";
  return <DailyScreen compactDate={compactDate} />;
}
