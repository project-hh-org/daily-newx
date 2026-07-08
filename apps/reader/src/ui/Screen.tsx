import type { ReactElement, ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors, MAX_READING, space } from "@/lib/theme";

type Props = { children: ReactNode };

/** paper 배경 스크롤 + 중앙 정렬 본문폭 컬럼. 모든 화면의 공통 셸. */
export function Screen({ children }: Props): ReactElement {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.paper }}
      contentContainerStyle={{ paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xxxl }}
    >
      <View style={{ width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", paddingHorizontal: space.xl }}>
        {children}
      </View>
    </ScrollView>
  );
}
