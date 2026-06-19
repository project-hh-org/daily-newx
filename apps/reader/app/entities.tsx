import type { ReactElement } from "react";
import { FacetListScreen } from "@/screens/FacetListScreen";

export default function EntitiesRoute(): ReactElement {
  return <FacetListScreen kind="entity" />;
}
