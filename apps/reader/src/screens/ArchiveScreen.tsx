import type { ReactElement } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { isoToLabel, isoToCompact } from "@/lib/date";
import { colors, fonts, MAX_READING } from "@/lib/theme";
import { useIssues } from "@/hooks/useDailyIssue";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";
import { LoadingView, ErrorView } from "@/components/StateViews";

export function ArchiveScreen(): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const query = useIssues();

  if (query.isPending) return <LoadingView />;
  if (query.error)
    return <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />;

  const issues = query.data ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 56 }}
    >
      <View style={styles.column}>
        <ScreenHeader
          kicker="아카이브"
          title="지난 호"
          subtitle={`${issues.length}개 호`}
          crumb={{ label: "홈", onPress: () => router.push("/") }}
        />
        {issues.length === 0 ? (
          <Text style={styles.empty}>게시된 호가 아직 없습니다.</Text>
        ) : (
          <View style={styles.list}>
            {issues.map((issue) => {
              const compact = isoToCompact(issue.issue_date);
              return (
                <ListRow
                  key={issue.issue_date}
                  title={isoToLabel(issue.issue_date)}
                  subtitle={issue.intro ?? undefined}
                  meta={issue.issue_no !== null ? `제 ${issue.issue_no} 호` : undefined}
                  onPress={() => router.push(compact !== undefined ? `/daily/${compact}` : "/")}
                />
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.paper },
  column: { width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: 20 },
  list: { marginTop: 24 },
  empty: { marginTop: 40, textAlign: "center", fontFamily: fonts.serif, fontSize: 16, color: colors.inkMuted },
});
