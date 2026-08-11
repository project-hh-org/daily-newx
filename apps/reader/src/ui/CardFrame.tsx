import type { ReactElement, ReactNode } from "react";
import { View, ScrollView } from "react-native";
import { useColors, space, MAX_READING } from "@/lib/theme";

type Props = {
  children: ReactNode;
  footer?: ReactNode; // 스크롤 영역 밖 고정 하단(예: CTA 버튼)
};

/**
 * 카드 1장의 셸. 세로 스크롤 가능(가로 페이징과 축이 달라 제스처 충돌 없음) +
 * 본문폭 제한(MAX_READING) + 중앙 정렬. 안전영역은 상위 DeckShell 이 처리.
 */
export function CardFrame({ children, footer }: Props): ReactElement {
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: space.xl, paddingVertical: space.xl }}
      >
        <View style={{ width: "100%", maxWidth: MAX_READING, marginHorizontal: "auto", flex: 1 }}>
          {children}
        </View>
      </ScrollView>
      {footer !== undefined && (
        <View
          style={{
            width: "100%",
            maxWidth: MAX_READING,
            marginHorizontal: "auto",
            paddingHorizontal: space.xl,
            paddingBottom: space.lg,
          }}
        >
          {footer}
        </View>
      )}
    </View>
  );
}
