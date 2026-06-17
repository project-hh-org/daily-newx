import type { ReactElement } from "react";
import { Redirect } from "expo-router";
import { todayCompact } from "@/lib/date";

// 루트 진입 시 오늘 호로 리다이렉트. URL: /daily/YYYYMMDD
export default function Index(): ReactElement {
  return <Redirect href={{ pathname: "/daily/[date]", params: { date: todayCompact() } }} />;
}
