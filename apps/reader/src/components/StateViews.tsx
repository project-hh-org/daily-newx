import type { ReactElement, ReactNode } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

function Centered({ children }: { children: ReactNode }): ReactElement {
  return <View style={styles.centered}>{children}</View>;
}

export function LoadingView(): ReactElement {
  return (
    <Centered>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.muted}>불러오는 중…</Text>
    </Centered>
  );
}

export function NotFoundView({ label }: { label: string }): ReactElement {
  return (
    <Centered>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.sub}>이 날짜의 호가 아직 게시되지 않았습니다.</Text>
    </Centered>
  );
}

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}): ReactElement {
  return (
    <Centered>
      <Text style={styles.title}>불러오지 못했어요</Text>
      <Text style={styles.sub}>{message}</Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={styles.retry}>
        <Text style={styles.retryText}>다시 시도</Text>
      </Pressable>
    </Centered>
  );
}

export function EmptyView(): ReactElement {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>뉴스가 적은 날은 항목 수가 적을 수 있습니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper, paddingHorizontal: 32, paddingVertical: 96 },
  title: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  sub: { marginTop: 8, textAlign: "center", fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted },
  muted: { marginTop: 16, fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted },
  retry: { marginTop: 20, borderBottomWidth: 1, borderBottomColor: colors.accent },
  retryText: { paddingBottom: 2, fontFamily: fonts.sans, fontSize: 14, color: colors.accent },
  empty: { paddingVertical: 64 },
  emptyText: { textAlign: "center", fontFamily: fonts.serif, fontSize: 16, color: colors.inkMuted },
});
