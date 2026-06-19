import type { ReactElement } from "react";
import { FacetListScreen } from "@/screens/FacetListScreen";

export default function TopicsRoute(): ReactElement {
  return <FacetListScreen kind="tag" />;
}
