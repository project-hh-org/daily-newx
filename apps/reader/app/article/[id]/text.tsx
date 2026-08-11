import type { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { ArticleScreen } from "@/screens/ArticleScreen";

// 아카이브 라우트 — 카드 덱 대신 기존 세로 스크롤 기사 뷰를 그대로 보여준다(코드 유지 결정).
export default function ArticleTextRoute(): ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ArticleScreen id={typeof id === "string" ? id : ""} />;
}
