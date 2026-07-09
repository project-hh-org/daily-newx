import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { TodayWidget, type WidgetData } from "./TodayWidget";

const API_URL = "https://daily-newx.vercel.app/api/today";
const CACHE_KEY = "widget.brief.cache.v1";

type ApiResponse = {
  issue_date: string;
  is_today: boolean;
  items: Array<{ title: string; source_name: string }>;
};

async function readCache(): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as WidgetData;
    return parsed !== null && Array.isArray(parsed.items) ? { ...parsed, stale: true } : null;
  } catch {
    return null;
  }
}

/** 네트워크 → 실패 시 캐시 → 그것도 없으면 null. */
async function loadToday(): Promise<WidgetData> {
  try {
    const res = await fetch(API_URL, { headers: { accept: "application/json" } });
    if (!res.ok) return await readCache();
    const json = (await res.json()) as ApiResponse;
    if (!Array.isArray(json.items)) return await readCache();

    const data: WidgetData = {
      issue_date: json.issue_date,
      is_today: json.is_today,
      items: json.items.slice(0, 3),
      stale: false,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => undefined);
    return data;
  } catch {
    return await readCache();
  }
}

/** 안드로이드 위젯 갱신 진입점(헤드리스). index.js 에서 등록. */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
    case "WIDGET_CLICK": {
      const data = await loadToday();
      props.renderWidget(<TodayWidget data={data} />);
      break;
    }
    case "WIDGET_DELETED":
      break;
    default:
      break;
  }
}
