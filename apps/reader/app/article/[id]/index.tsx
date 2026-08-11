import type { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { ArticleDeckScreen } from "@/screens/ArticleDeckScreen";

export default function ArticleRoute(): ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ArticleDeckScreen id={typeof id === "string" ? id : ""} />;
}
