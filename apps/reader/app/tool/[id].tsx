import type { ReactElement } from "react";
import { useLocalSearchParams } from "expo-router";
import { ToolUpdateScreen } from "@/screens/ToolUpdateScreen";

export default function ToolUpdateRoute(): ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ToolUpdateScreen id={id} />;
}
