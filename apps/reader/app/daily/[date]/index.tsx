import type { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { IssueDeckScreen } from "@/screens/IssueDeckScreen";

export default function DailyRoute(): ReactElement {
  const { date } = useLocalSearchParams<{ date: string }>();
  const compactDate = typeof date === "string" ? date : "";
  return <IssueDeckScreen compactDate={compactDate} />;
}
