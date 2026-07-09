import { useEffect, useState, type ReactElement } from "react";
import { View, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { isoToLabel } from "@/lib/date";
import { useColors, space } from "@/lib/theme";
import { toolByKey } from "@/lib/toolCatalog";
import { useToolsStore } from "@/store/toolsStore";
import { useToolUpdates } from "@/hooks/useDailyIssue";
import { useBackOr } from "@/hooks/useBackOr";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingView, ErrorView } from "@/components/StateViews";

function openUrl(url: string): void {
  void Linking.openURL(url);
}

/** 내 도구 피드 — 선택한 도구의 최신 소식/리소스. 선택은 설정에서. */
export function MyToolsScreen(): ReactElement {
  const c = useColors();
  const router = useRouter();
  const backOr = useBackOr();
  const selected = useToolsStore((s) => s.selected);
  const hasHydrated = useToolsStore((s) => s.hasHydrated);
  const query = useToolUpdates(selected);
  const [tab, setTab] = useState<"news" | "resource">("news");

  // 미설정 → 설정(도구 선택)으로 유도.
  useEffect(() => {
    if (hasHydrated && selected.length === 0) router.replace("/settings/tools");
  }, [hasHydrated, selected.length, router]);

  if (!hasHydrated || selected.length === 0) return <LoadingView />;

  const updates = query.data ?? [];
  const news = updates.filter((u) => u.kind === "news");
  const resources = updates.filter((u) => u.kind === "resource");
  const shown = tab === "news" ? news : resources;

  return (
    <Screen>
      <ScreenHeader
        kicker="개인화"
        title="내 도구"
        subtitle="선택한 도구의 매일 최신 업데이트"
        crumb={{ label: "오늘", onPress: () => backOr("/") }}
      />

      <View style={{ marginTop: space.md, flexDirection: "row", justifyContent: "flex-end" }}>
        <Type variant="meta" tone="accentDim" style={{ cursor: "pointer" }} onPress={() => router.push("/settings/tools")}>
          {"도구 편집 ›"}
        </Type>
      </View>

      {query.isPending ? (
        <LoadingView />
      ) : query.error ? (
        <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />
      ) : (
        <>
          <View style={{ marginTop: space.xl, flexDirection: "row", gap: space.xl }}>
            <Pressable onPress={() => setTab("news")} accessibilityRole="button">
              <Type variant="body" tone={tab === "news" ? "ink" : "inkMuted"}>{`소식 ${news.length}`}</Type>
            </Pressable>
            <Pressable onPress={() => setTab("resource")} accessibilityRole="button">
              <Type variant="body" tone={tab === "resource" ? "ink" : "inkMuted"}>{`리소스 ${resources.length}`}</Type>
            </Pressable>
          </View>

          {shown.length === 0 ? (
            <Type variant="body" tone="inkMuted" style={{ marginTop: space.lg }}>
              {tab === "news" ? "아직 소식이 없어요. 곧 채워집니다." : "아직 리소스가 없어요."}
            </Type>
          ) : (
            <View style={{ marginTop: space.sm }}>
              {shown.map((u, i) => (
                <Pressable
                  key={u.id ?? `${u.tool_key}-${i}`}
                  onPress={() => {
                    if (u.id !== null) router.push(`/tool/${u.id}`);
                    else openUrl(u.url);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={u.title}
                  style={{
                    paddingVertical: space.lg,
                    paddingHorizontal: space.sm,
                    marginHorizontal: -space.sm,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: c.rule,
                    cursor: "pointer",
                  }}
                >
                  <Type variant="label" tone="accentDim">
                    {`${toolByKey(u.tool_key)?.name ?? u.tool_key} · ${isoToLabel(u.update_date)}`}
                  </Type>
                  <Type variant="h2" style={{ marginTop: 4 }}>{u.title}</Type>
                  <Type variant="body" tone="inkSoft" numberOfLines={3} style={{ marginTop: 4 }}>
                    {u.summary}
                  </Type>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
