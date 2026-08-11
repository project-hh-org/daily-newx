import { useState, type ReactElement, type ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors, space } from "@/lib/theme";
import { CardDeck } from "./CardDeck";
import { PageIndicator } from "./PageIndicator";

type Props<T> = {
  data: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  top?: ReactNode; // 인디케이터 위 보조 영역(예: 뒤로가기 크럼)
};

/** 카드 덱 화면 공통 셸 — 안전영역 + 상단 보조영역 + 페이지 인디케이터 + 덱. */
export function DeckShell<T>({
  data,
  renderItem,
  keyExtractor,
  initialIndex = 0,
  onIndexChange,
  top,
}: Props<T>): ReactElement {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const maxIndex = Math.max(data.length - 1, 0);
  const [index, setIndex] = useState(Math.min(Math.max(initialIndex, 0), maxIndex));

  return (
    <View style={{ flex: 1, backgroundColor: c.paper, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {top !== undefined && <View style={{ paddingHorizontal: space.xl, paddingTop: space.md }}>{top}</View>}
      <PageIndicator index={index} total={data.length} />
      <CardDeck
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialIndex={initialIndex}
        onIndexChange={(i) => {
          setIndex(i);
          onIndexChange?.(i);
        }}
      />
    </View>
  );
}
