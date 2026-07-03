import type { ReactElement } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "@/lib/theme";

type Props = {
  kicker: string;
  title: string;
  subtitle?: string;
  crumb?: { label: string; onPress: () => void };
};

/** 리스트/탐색 화면 공용 마스트헤드 (선택적 뒤로가기 크럼). */
export function ScreenHeader({ kicker, title, subtitle, crumb }: Props): ReactElement {
  return (
    <View>
      {crumb !== undefined && (
        <Pressable
          onPress={crumb.onPress}
          accessibilityRole="link"
          accessibilityLabel={`${crumb.label}(으)로 돌아가기`}
          hitSlop={8}
        >
          <Text style={styles.crumb}>‹ {crumb.label}</Text>
        </Pressable>
      )}
      <View style={styles.masthead}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  crumb: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: colors.accent },
  masthead: { marginTop: 16, borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 16 },
  kicker: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkMuted },
  title: { marginTop: 8, fontFamily: fonts.serif, fontSize: 32, lineHeight: 38, color: colors.ink },
  subtitle: { marginTop: 8, fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted },
});
