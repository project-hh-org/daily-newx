import { useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useColors, radius } from "@/lib/theme";
import { Type } from "./Type";

type Props<T> = {
  data: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
};

// 웹 키보드 좌우 이동용 — "dom" lib 유무와 무관하게 동작하도록 구조적 타입만 요구.
type MinimalKeyEvent = { key: string };
type MinimalEventTarget = {
  addEventListener: (type: string, listener: (e: MinimalKeyEvent) => void) => void;
  removeEventListener: (type: string, listener: (e: MinimalKeyEvent) => void) => void;
};

function getWebDocument(): MinimalEventTarget | null {
  if (Platform.OS !== "web") return null;
  const g = globalThis as unknown as { document?: unknown };
  const doc = g.document;
  if (
    doc !== undefined &&
    doc !== null &&
    typeof (doc as MinimalEventTarget).addEventListener === "function"
  ) {
    return doc as MinimalEventTarget;
  }
  return null;
}

/**
 * 가로 페이징 카드 덱.
 * FlatList 가 아니라 ScrollView(horizontal+pagingEnabled) 사용 — react-native-web 의
 * FlatList+pagingEnabled 는 아이템 수가 windowSize 를 넘으면 Chrome 에서 스크롤이 끊기는
 * 미해결 버그(necolas/react-native-web#2026)가 있어 회피. 덱 크기가 작아 가상화 이득도 없음.
 */
export function CardDeck<T>({
  data,
  renderItem,
  keyExtractor,
  initialIndex = 0,
  onIndexChange,
}: Props<T>): ReactElement {
  const c = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const maxIndex = Math.max(data.length - 1, 0);
  const clampedInitial = Math.min(Math.max(initialIndex, 0), maxIndex);
  const [index, setIndex] = useState(clampedInitial);
  const indexRef = useRef(index);
  indexRef.current = index;
  const jumpedRef = useRef(false);

  const onLayout = useCallback((e: LayoutChangeEvent): void => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const goTo = useCallback(
    (next: number): void => {
      if (width <= 0) return;
      const clamped = Math.min(Math.max(next, 0), maxIndex);
      scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    },
    [width, maxIndex],
  );

  const commitIndex = useCallback(
    (next: number): void => {
      if (next === indexRef.current) return;
      setIndex(next);
      onIndexChange?.(next);
    },
    [onIndexChange],
  );

  const onScrollSettle = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (width <= 0) return;
      const raw = Math.round(e.nativeEvent.contentOffset.x / width);
      commitIndex(Math.min(Math.max(raw, 0), maxIndex));
    },
    [width, maxIndex, commitIndex],
  );

  // 레이아웃 측정이 끝나면 초기 인덱스로 애니메이션 없이 점프(최초 1회).
  useEffect(() => {
    if (width <= 0 || jumpedRef.current) return;
    jumpedRef.current = true;
    if (clampedInitial > 0) {
      scrollRef.current?.scrollTo({ x: clampedInitial * width, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  // 웹 전용 ←/→ 키보드 이동.
  useEffect(() => {
    const doc = getWebDocument();
    if (doc === null) return;
    const onKeyDown = (e: MinimalKeyEvent): void => {
      if (e.key === "ArrowRight") goTo(indexRef.current + 1);
      else if (e.key === "ArrowLeft") goTo(indexRef.current - 1);
    };
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [goTo]);

  const isWeb = Platform.OS === "web";

  return (
    <View style={{ flex: 1, position: "relative" }} onLayout={onLayout}>
      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollSettle}
          onScrollEndDrag={onScrollSettle}
          scrollEventThrottle={32}
        >
          {data.map((item, i) => (
            <View key={keyExtractor(item, i)} style={{ width }}>
              {renderItem(item, i)}
            </View>
          ))}
        </ScrollView>
      )}
      {isWeb && width > 0 && index > 0 && (
        <NavEdgeButton side="left" onPress={() => goTo(index - 1)} bg={c.surface} fg={c.ink} />
      )}
      {isWeb && width > 0 && index < maxIndex && (
        <NavEdgeButton side="right" onPress={() => goTo(index + 1)} bg={c.surface} fg={c.ink} />
      )}
    </View>
  );
}

function NavEdgeButton({
  side,
  onPress,
  bg,
  fg,
}: {
  side: "left" | "right";
  onPress: () => void;
  bg: string;
  fg: string;
}): ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={side === "left" ? "이전 카드" : "다음 카드"}
      style={{
        position: "absolute",
        top: "50%",
        [side]: 12,
        transform: [{ translateY: -18 }],
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <Type variant="body" style={{ color: fg }}>
        {side === "left" ? "‹" : "›"}
      </Type>
    </Pressable>
  );
}
