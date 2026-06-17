// 오프라인 개발/미리보기용 번들 데이터. EXPO_PUBLIC_USE_FIXTURE=1 일 때만 사용.
// 실데이터 한 호(2026-06-16)를 그대로 담아 DB/API 없이도 화면을 확인할 수 있게 한다.
import raw from "./__fixtures__/2026-06-16.json";

// 키는 compact("YYYYMMDD"). 추후 fixture 추가 시 여기에 등록.
export const FIXTURES: Record<string, unknown> = {
  "20260616": raw,
};

export function getFixture(compactDate: string): unknown | undefined {
  return FIXTURES[compactDate];
}
