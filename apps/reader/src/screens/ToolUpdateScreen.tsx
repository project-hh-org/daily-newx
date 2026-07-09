import type { ReactElement } from "react";
import { View, Linking } from "react-native";
import { isoToLabel } from "@/lib/date";
import { space } from "@/lib/theme";
import { toolByKey } from "@/lib/toolCatalog";
import { useToolsStore } from "@/store/toolsStore";
import { useToolUpdates } from "@/hooks/useDailyIssue";
import { useBackOr } from "@/hooks/useBackOr";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { Tag } from "@/ui/Tag";
import { Button } from "@/ui/Button";
import { ArticleBlocks } from "@/components/ArticleBlocks";
import { LoadingView, ErrorView } from "@/components/StateViews";

type Props = { id: string };

/** 도구 업데이트 상세 — 전체 요약을 읽고, 원할 때만 원문으로 이동. */
export function ToolUpdateScreen({ id }: Props): ReactElement {
  const backOr = useBackOr();
  const selected = useToolsStore((s) => s.selected);
  const hasHydrated = useToolsStore((s) => s.hasHydrated);
  const query = useToolUpdates(selected);

  if (!hasHydrated || query.isPending) return <LoadingView />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const update = (query.data ?? []).find((u) => u.id === id);

  if (update === undefined) {
    return (
      <Screen>
        <Type variant="meta" tone="accentDim" style={{ cursor: "pointer" }} onPress={() => backOr("/tools")}>
          {"‹ 내 도구"}
        </Type>
        <Type variant="h1" style={{ marginTop: space.xl }}>
          업데이트를 찾을 수 없어요
        </Type>
        <Type variant="body" tone="inkMuted" style={{ marginTop: space.sm }}>
          목록에서 사라졌거나 기간이 지난 항목일 수 있어요.
        </Type>
      </Screen>
    );
  }

  const toolName = toolByKey(update.tool_key)?.name ?? update.tool_key;

  return (
    <Screen>
      <Type variant="meta" tone="accentDim" style={{ cursor: "pointer" }} onPress={() => backOr("/tools")}>
        {"‹ 내 도구"}
      </Type>

      <Type variant="label" tone="accentDim" style={{ marginTop: space.lg }}>
        {`${toolName} · ${isoToLabel(update.update_date)}`}
      </Type>

      <Type variant="display" style={{ marginTop: space.sm }}>
        {update.title}
      </Type>

      <View style={{ marginTop: space.md }}>
        <Tag label={update.kind === "resource" ? "리소스" : "소식"} tone="outline" />
      </View>

      <Type variant="body" tone="ink" style={{ marginTop: space.xl }}>
        {update.summary}
      </Type>

      {update.blocks.length > 0 && (
        <View style={{ marginTop: space.lg }}>
          <ArticleBlocks blocks={update.blocks} />
        </View>
      )}

      <View style={{ marginTop: space.xxl }}>
        <Button label="원문 열기 ↗" kind="primary" onPress={() => void Linking.openURL(update.url)} />
      </View>
    </Screen>
  );
}
