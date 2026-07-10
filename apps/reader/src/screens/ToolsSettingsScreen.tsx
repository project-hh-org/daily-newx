import { useState, type ReactElement } from "react";
import { View, Pressable } from "react-native";
import { useColors, radius, space } from "@/lib/theme";
import { TOOL_CATALOG, type ToolCategory } from "@/lib/toolCatalog";
import { useToolsStore } from "@/store/toolsStore";
import { useBackOr } from "@/hooks/useBackOr";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { Button } from "@/ui/Button";
import { LoadingView } from "@/components/StateViews";

const CATEGORY_LABEL: Record<ToolCategory, string> = { model: "모델", coding: "코딩 도구" };
const CATEGORIES: ToolCategory[] = ["model", "coding"];

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((k) => s.has(k));
}

type FormProps = { initial: readonly string[] };

/** 선택 폼 — 하이드레이션 완료 후에만 마운트되므로 initial 로 1회 초기화된다. */
function ToolsSettingsForm({ initial }: FormProps): ReactElement {
  const c = useColors();
  const backOr = useBackOr();
  const setSelected = useToolsStore((s) => s.setSelected);
  const [draft, setDraft] = useState<string[]>([...initial]);

  const toggle = (key: string): void =>
    setDraft((d) => (d.includes(key) ? d.filter((k) => k !== key) : [...d, key]));

  const dirty = !sameSet(draft, initial);

  const save = (): void => {
    setSelected(draft);
    backOr("/tools");
  };

  return (
    <Screen>
      <View>
        <Type variant="meta" tone="accentDim" style={{ cursor: "pointer" }} onPress={() => backOr("/settings")}>
          {"‹ 설정"}
        </Type>
        <View style={{ marginTop: space.lg, borderBottomWidth: 2, borderBottomColor: c.accent, paddingBottom: space.lg }}>
          <Type variant="label" tone="accentDim">개인화</Type>
          <Type variant="display" style={{ marginTop: space.sm }}>자주 쓰는 도구·에이전트</Type>
          <Type variant="meta" tone="inkMuted" style={{ marginTop: space.sm }}>
            쓰는 걸 고르면 매일 최신 업데이트를 모아줘요. 저장을 눌러야 반영돼요.
          </Type>
        </View>
      </View>

      {CATEGORIES.map((cat) => (
        <View key={cat} style={{ marginTop: space.xl }}>
          <Type variant="label" tone="inkMuted">{CATEGORY_LABEL[cat]}</Type>
          <View style={{ marginTop: space.md, flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {TOOL_CATALOG.filter((t) => t.category === cat).map((t) => {
              const on = draft.includes(t.key);
              return (
                <Pressable
                  key={t.key}
                  onPress={() => toggle(t.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={t.name}
                  style={{
                    paddingHorizontal: space.md,
                    paddingVertical: 7,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    backgroundColor: on ? c.accent : c.surface,
                    borderColor: on ? c.accent : c.rule,
                    cursor: "pointer",
                  }}
                >
                  <Type variant="meta" tone={on ? "paper" : "inkSoft"}>{t.name}</Type>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ marginTop: space.xxl }}>
        <Button label={dirty ? "저장" : "저장됨"} kind="primary" onPress={save} disabled={!dirty} />
      </View>
    </Screen>
  );
}

/** 자주 쓰는 도구·에이전트 선택 — 로컬 드래프트, 저장 버튼으로 커밋. */
export function ToolsSettingsScreen(): ReactElement {
  const selected = useToolsStore((s) => s.selected);
  const hasHydrated = useToolsStore((s) => s.hasHydrated);

  if (!hasHydrated) return <LoadingView />;
  return <ToolsSettingsForm initial={selected} />;
}
