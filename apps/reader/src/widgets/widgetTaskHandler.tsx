import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { TodayWidget, type WidgetData } from "./TodayWidget";

const API_URL = "https://daily-newx.vercel.app/api/today";
const CACHE_KEY = "widget.brief.cache.v1";
const ETAG_KEY = "widget.brief.etag.v1";

type ApiResponse = {
  issue_date: string;
  is_today: boolean;
  items: { title: string; source_name: string }[];
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

async function readETag(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ETAG_KEY);
  } catch {
    return null;
  }
}

/**
 * 네트워크(조건부 GET) → 304(안 바뀜) 면 캐시를 그대로 최신으로 사용
 * → 실패 시 캐시(stale) → 그것도 없으면 null.
 */
async function loadToday(): Promise<WidgetData> {
  try {
    const etag = await readETag();
    const headers: Record<string, string> = { accept: "application/json" };
    if (etag !== null) headers["if-none-match"] = etag;

    const res = await fetch(API_URL, { headers });

    if (res.status === 304) {
      // 서버가 "안 바뀜"을 확인해준 것 — 캐시가 곧 최신이므로 stale 로 표시하지 않는다.
      const cached = await readCache();
      return cached === null ? null : { ...cached, stale: false };
    }
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
    const newETag = res.headers.get("etag");
    if (newETag !== null) {
      await AsyncStorage.setItem(ETAG_KEY, newETag).catch(() => undefined);
    }
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
