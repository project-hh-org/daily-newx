import type { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { timelineAxisSchema } from "@/types/news.types";
import { TimelineScreen } from "@/screens/TimelineScreen";
import { NotFoundView } from "@/components/StateViews";

export default function TimelineRoute(): ReactElement {
  const { axis, value } = useLocalSearchParams<{ axis: string; value: string }>();
  const parsed = timelineAxisSchema.safeParse(axis);
  if (!parsed.success) return <NotFoundView label="타임라인" />;
  return (
    <TimelineScreen axis={parsed.data} value={typeof value === "string" ? value : ""} />
  );
}
