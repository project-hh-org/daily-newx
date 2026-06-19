import AsyncStorage from "@react-native-async-storage/async-storage";

// 읽은 호(compact "YYYYMMDD") 집합을 로컬에 보존. 알림 "안 읽었으면" 판정에 사용.
const KEY = "read-issues-v1";

export async function getReadSet(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === null) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export async function markRead(compactDate: string): Promise<void> {
  if (!/^\d{8}$/.test(compactDate)) return;
  const set = await getReadSet();
  if (set.has(compactDate)) return;
  set.add(compactDate);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // 저장 실패는 조용히 무시(다음 기회에 재시도)
  }
}
