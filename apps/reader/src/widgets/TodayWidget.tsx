import type { ReactElement } from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export type WidgetItem = { title: string; source_name: string };
export type WidgetData = {
  issue_date: string;
  is_today: boolean;
  items: WidgetItem[];
  stale: boolean; // 네트워크 실패로 캐시를 보여주는 중
} | null;

// 위젯은 앱 테마를 못 읽으므로 브랜드 다크 팔레트 고정.
const PAPER = "#0A0A0A";
const INK = "#F5F5F5";
const MUTED = "#8A8A8A";

type Props = { data: WidgetData };

/** 안드로이드 홈 위젯 — 오늘 브리핑 상위 헤드라인. 탭하면 앱 실행. */
export function TodayWidget({ data }: Props): ReactElement {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: PAPER,
        borderRadius: 16,
        padding: 12,
      }}
    >
      <FlexWidget style={{ flexDirection: "row", width: "match_parent" }}>
        <TextWidget text="$ today --llm" style={{ fontSize: 10, color: MUTED }} />
        {data !== null && (data.stale || !data.is_today) && (
          <TextWidget
            text={data.stale ? "  오프라인" : "  최신"}
            style={{ fontSize: 10, color: MUTED }}
          />
        )}
      </FlexWidget>

      {data === null || data.items.length === 0 ? (
        <FlexWidget style={{ flexDirection: "column", marginTop: 8 }}>
          <TextWidget text="아직 받아온 브리핑이 없어요" style={{ fontSize: 12, color: INK }} />
          <TextWidget
            text="연결되면 자동으로 채워집니다"
            style={{ fontSize: 10, color: MUTED, marginTop: 2 }}
          />
        </FlexWidget>
      ) : (
        data.items.slice(0, 3).map((item, i) => (
          <FlexWidget
            key={`${i}`}
            style={{ flexDirection: "row", width: "match_parent", marginTop: 8 }}
          >
            <TextWidget
              text={`[${String(i + 1).padStart(2, "0")}]`}
              style={{ fontSize: 10, color: MUTED, marginRight: 6 }}
            />
            <TextWidget
              text={item.title}
              maxLines={2}
              style={{ fontSize: 13, color: INK }}
            />
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}
