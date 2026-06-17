import type { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { ArticleScreen } from "@/screens/ArticleScreen";

export default function ArticleRoute(): ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ArticleScreen id={typeof id === "string" ? id : ""} />;
}
