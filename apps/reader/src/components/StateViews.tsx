import type { ReactElement, ReactNode } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { useColors, space } from "@/lib/theme";
import { Type } from "@/ui/Type";

function Centered({ children }: { children: ReactNode }): ReactElement {
  const c = useColors();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.paper,
        paddingHorizontal: space.xxl,
        paddingVertical: 96,
      }}
    >
      {children}
    </View>
  );
}

export function LoadingView(): ReactElement {
  const c = useColors();
  return (
    <Centered>
      <ActivityIndicator color={c.accent} />
      <Type variant="meta" tone="inkMuted" style={{ marginTop: space.lg }}>
        불러오는 중…
      </Type>
    </Centered>
  );
}

export function NotFoundView({ label }: { label: string }): ReactElement {
  return (
    <Centered>
      <Type variant="h1">{label}</Type>
      <Type variant="meta" tone="inkMuted" style={{ marginTop: space.sm, textAlign: "center" }}>
        이 날짜의 브리핑이 아직 게시되지 않았습니다.
      </Type>
    </Centered>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }): ReactElement {
  return (
    <Centered>
      <Type variant="h1">불러오지 못했어요</Type>
      <Type variant="meta" tone="inkMuted" style={{ marginTop: space.sm, textAlign: "center" }}>
        {message}
      </Type>
      <Pressable onPress={onRetry} accessibilityRole="button" style={{ marginTop: space.xl, cursor: "pointer" }}>
        <Type variant="label" tone="accent">다시 시도</Type>
      </Pressable>
    </Centered>
  );
}

export function EmptyView(): ReactElement {
  return (
    <View style={{ paddingVertical: 64 }}>
      <Type variant="body" tone="inkMuted" style={{ textAlign: "center" }}>
        뉴스가 적은 날은 항목 수가 적을 수 있습니다.
      </Type>
    </View>
  );
}
