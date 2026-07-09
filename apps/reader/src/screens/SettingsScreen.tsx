import type { ReactElement, ReactNode } from "react";
import { View, Switch, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useColors, space } from "@/lib/theme";
import { useSettingsStore, type ThemeMode } from "@/store/settingsStore";
import { useToolsStore } from "@/store/toolsStore";
import { useBackOr } from "@/hooks/useBackOr";
import { Screen } from "@/ui/Screen";
import { Type } from "@/ui/Type";
import { Row } from "@/ui/Row";
import { Segmented } from "@/ui/Segmented";

const APP_VERSION = "1.0.0";

const THEME_OPTIONS: ReadonlyArray<{ value: ThemeMode; label: string }> = [
  { value: "system", label: "시스템" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

function Section({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <View style={{ marginTop: space.xxl }}>
      <Type variant="label" tone="inkMuted">
        {label}
      </Type>
      <View style={{ marginTop: space.sm }}>{children}</View>
    </View>
  );
}

export function SettingsScreen(): ReactElement {
  const c = useColors();
  const router = useRouter();
  const backOr = useBackOr();

  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const notify = useSettingsStore((s) => s.notify);
  const setNotify = useSettingsStore((s) => s.setNotify);
  const selectedCount = useToolsStore((s) => s.selected.length);

  return (
    <Screen>
      <View>
        <Type variant="meta" tone="accentDim" style={{ cursor: "pointer" }} onPress={() => backOr("/")}>
          {"‹ 오늘"}
        </Type>
        <View style={{ marginTop: space.lg, borderBottomWidth: 2, borderBottomColor: c.accent, paddingBottom: space.lg }}>
          <Type variant="label" tone="accentDim">환경설정</Type>
          <Type variant="display" style={{ marginTop: space.sm }}>설정</Type>
        </View>
      </View>

      <Section label="테마">
        <Segmented value={themeMode} options={THEME_OPTIONS} onChange={setThemeMode} />
      </Section>

      <Section label="알림">
        <Row
          title="발행 알림"
          subtitle="매일 오전 9시 새 소식 푸시"
          first
          right={
            <Switch
              value={notify}
              onValueChange={setNotify}
              trackColor={{ false: c.rule, true: c.accent }}
              thumbColor={c.paper}
              accessibilityLabel="발행 알림"
            />
          }
        />
      </Section>

      <Section label="개인화">
        <Row
          title="자주 쓰는 도구·에이전트"
          subtitle={selectedCount > 0 ? `${selectedCount}개 선택됨` : "아직 선택 안 함"}
          first
          onPress={() => router.push("/settings/tools")}
        />
      </Section>

      <Section label="정보">
        <Row title="개인정보 처리방침" first onPress={() => router.push("/privacy")} />
        <Row title="지원·문의" onPress={() => router.push("/support")} />
        <Row
          title="문서·소스"
          onPress={() => void Linking.openURL("https://daily-newx.project-hh.com")}
        />
        <Row title="버전" right={<Type variant="meta" tone="inkMuted">{APP_VERSION}</Type>} />
      </Section>
    </Screen>
  );
}
